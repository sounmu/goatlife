"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appConfig } from "@/lib/config";
import { proofDateForWindow, isWithinProofWindow } from "@/lib/date";
import type { ActionState, Challenge } from "@/lib/domain";
import { requireParticipant } from "@/lib/auth/participant";
import { randomToken } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fieldErrors, proofSchema } from "@/lib/validation";

const allowedTypes = new Map([["image/webp", "webp"]]);

export async function createProof(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireParticipant();
  const image = formData.get("image");
  const parsed = proofSchema.safeParse({ content: formData.get("content") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  if (!(image instanceof File) || image.size === 0) return { fieldErrors: { image: ["인증 사진을 선택해 주세요."] } };
  if (!allowedTypes.has(image.type)) return { fieldErrors: { image: ["사진을 WebP로 변환한 뒤 올려 주세요."] } };
  if (image.size > appConfig.maxUploadBytes) return { fieldErrors: { image: ["압축된 사진은 1MB 이하여야 해요."] } };
  if (session.participantStatus !== "ACTIVE") return { message: "현재 진행 중인 참가자만 인증할 수 있어요." };

  const supabase = getSupabaseAdmin();
  const { data: challenge, error: challengeError } = await supabase.from("challenges").select("*").eq("id", session.challengeId).single();
  if (challengeError) return { message: "챌린지 정보를 확인하지 못했어요." };
  const typedChallenge = challenge as Challenge;
  if (!isWithinProofWindow(typedChallenge.proof_start_time, typedChallenge.proof_end_time)) {
    return { message: `인증 가능 시간은 ${typedChallenge.proof_start_time.slice(0, 5)}–${typedChallenge.proof_end_time.slice(0, 5)}예요.` };
  }
  const today = proofDateForWindow(typedChallenge.proof_start_time, typedChallenge.proof_end_time);
  if (today < typedChallenge.start_date || today > typedChallenge.end_date) return { message: "지금은 챌린지 기간이 아니에요." };
  const { data: existing } = await supabase
    .from("proofs")
    .select("id")
    .eq("participant_id", session.id)
    .eq("challenge_id", session.challengeId)
    .eq("proof_date", today)
    .maybeSingle();
  if (existing) return { message: "오늘 인증은 이미 완료했어요." };

  const extension = allowedTypes.get(image.type);
  const storagePath = `${session.challengeId}/${session.id}/${today}-${randomToken(8)}.${extension}`;
  const bytes = await image.arrayBuffer();
  const { error: uploadError } = await supabase.storage.from(appConfig.proofBucket).upload(storagePath, bytes, {
    contentType: image.type,
    upsert: false,
  });
  if (uploadError) return { message: "사진 업로드에 실패했어요. 잠시 후 다시 시도해 주세요." };

  const { error: insertError } = await supabase.from("proofs").insert({
    participant_id: session.id,
    challenge_id: session.challengeId,
    proof_date: today,
    image_path: storagePath,
    content: parsed.data.content,
    status: "VALID",
  });
  if (insertError) {
    await supabase.storage.from(appConfig.proofBucket).remove([storagePath]);
    if (insertError.code === "23505") return { message: "오늘 인증은 이미 완료했어요." };
    console.error("createProof", insertError);
    return { message: "인증을 저장하지 못했어요. 다시 시도해 주세요." };
  }
  revalidatePath("/feed");
  revalidatePath("/me");
  revalidatePath("/admin");
  redirect("/feed");
}
