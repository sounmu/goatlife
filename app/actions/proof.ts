"use server";

import { normalizeProofImage } from "@/lib/server-image";
import { hasPhotoConsent } from "@/lib/photo-consent";
import { photoRetentionEnded } from "@/lib/photo-retention";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { appConfig } from "@/lib/config";
import { koreaDate, proofDateForWindow, isWithinProofWindow } from "@/lib/date";
import type { ActionState, Challenge } from "@/lib/domain";
import { requireParticipant } from "@/lib/auth/participant";
import { randomToken } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fieldErrors, proofSchema } from "@/lib/validation";

const allowedTypes = new Set(["image/webp", "image/jpeg"]);

export async function createProof(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireParticipant();
  if (photoRetentionEnded(session.challengeId)) return { message: "이번 챌린지 사진 보관기간이 종료되어 업로드할 수 없어요." };
  const image = formData.get("image");
  const parsed = proofSchema.safeParse({
    content: formData.get("content"),
    proofType: formData.get("proofType"),
    imageSource: formData.get("imageSource"),
    missionId: formData.get("missionId") || undefined,
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  if (!(image instanceof File) || image.size === 0) return { fieldErrors: { image: ["인증 사진을 선택해 주세요."] } };
  if (!allowedTypes.has(image.type)) return { fieldErrors: { image: ["JPEG 또는 WebP 사진을 올려 주세요."] } };
  if (image.size > appConfig.maxUploadBytes) return { fieldErrors: { image: ["압축된 사진은 3MB 이하여야 해요."] } };
  if (session.participantStatus !== "ACTIVE") return { message: "현재 진행 중인 참가자만 인증할 수 있어요." };
  if (parsed.data.proofType === "MORNING" && parsed.data.imageSource !== "CAMERA") {
    return { message: "미라클 모닝 인증은 지금 카메라로 촬영한 사진만 제출할 수 있어요." };
  }

  const supabase = getSupabaseAdmin();
  const [{ data: challenge, error: challengeError }, { data: participation, error: participationError }] = await Promise.all([
    supabase.from("challenges").select("*").eq("id", session.challengeId).single(),
    supabase.from("challenge_participants").select("start_date, end_date, photo_consent_version, photo_consent_at").eq("id", session.challengeParticipantId).single(),
  ]);
  if (challengeError || participationError) return { message: "챌린지 정보를 확인하지 못했어요." };
  if (!hasPhotoConsent(participation)) return { message: "사진 이용 동의가 필요해요. 인증 페이지를 새로고침하고 한 번만 동의해 주세요." };
  const typedChallenge = challenge as Challenge;
  const proofType = parsed.data.proofType;
  const today = proofType === "MORNING"
    ? proofDateForWindow(typedChallenge.proof_start_time, typedChallenge.proof_end_time)
    : koreaDate();

  if (proofType === "MORNING" && !isWithinProofWindow(typedChallenge.proof_start_time, typedChallenge.proof_end_time)) {
    return { message: `아침 인증 가능 시간은 ${typedChallenge.proof_start_time.slice(0, 5)}–${typedChallenge.proof_end_time.slice(0, 5)}예요.` };
  }
  if (today < participation.start_date || today > participation.end_date) return { message: "지금은 나의 챌린지 기간이 아니에요." };

  let dailyMissionId: string | null = null;
  if (proofType === "RANDOM") {
    if (!parsed.data.missionId) return { message: "오늘의 랜덤 미션을 찾지 못했어요." };
    const { data: mission } = await supabase
      .from("daily_random_missions")
      .select("id")
      .eq("id", parsed.data.missionId)
      .eq("challenge_id", session.challengeId)
      .eq("mission_date", today)
      .maybeSingle();
    if (!mission) return { message: "오늘의 랜덤 미션 정보를 다시 확인해 주세요." };
    dailyMissionId = mission.id;
  }

  const { data: existing } = await supabase
    .from("proofs")
    .select("id")
    .eq("participant_id", session.id)
    .eq("challenge_id", session.challengeId)
    .eq("proof_date", today)
    .eq("proof_type", proofType)
    .maybeSingle();
  if (existing) return { message: proofType === "MORNING" ? "오늘 아침 인증은 이미 완료했어요." : "오늘 랜덤 미션은 이미 완료했어요." };

  let bytes: Buffer;
  try {
    bytes = await normalizeProofImage(Buffer.from(await image.arrayBuffer()), appConfig.maxUploadBytes);
  } catch {
    return { fieldErrors: { image: ["사진을 처리하지 못했어요. 다른 사진으로 다시 시도해 주세요."] } };
  }
  const storagePath = `${session.challengeId}/${session.id}/${today}-${proofType.toLowerCase()}-${randomToken(8)}.webp`;
  const { error: uploadError } = await supabase.storage.from(appConfig.proofBucket).upload(storagePath, bytes, {
    contentType: "image/webp",
    upsert: false,
  });
  if (uploadError) return { message: "사진 업로드에 실패했어요. 잠시 후 다시 시도해 주세요." };

  const { data: insertedProof, error: insertError } = await supabase.from("proofs").insert({
    participant_id: session.id,
    challenge_id: session.challengeId,
    proof_date: today,
    proof_type: proofType,
    capture_source: parsed.data.imageSource,
    daily_random_mission_id: dailyMissionId,
    image_path: storagePath,
    photo_consent_version: participation.photo_consent_version,
    photo_consent_at: participation.photo_consent_at,
    content: parsed.data.content,
    status: "VALID",
  }).select("id").single();
  if (insertError) {
    await supabase.storage.from(appConfig.proofBucket).remove([storagePath]);
    if (insertError.code === "23505") return { message: proofType === "MORNING" ? "오늘 아침 인증은 이미 완료했어요." : "오늘 랜덤 미션은 이미 완료했어요." };
    console.error("createProof", insertError);
    return { message: "인증을 저장하지 못했어요. 다시 시도해 주세요." };
  }
  revalidatePath("/feed");
  revalidatePath("/me");
  revalidatePath("/admin");
  redirect(`/proof/${insertedProof.id}/complete`);
}
