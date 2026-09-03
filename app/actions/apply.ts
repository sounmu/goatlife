"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/domain";
import { getSupabaseAdmin, ConfigurationError } from "@/lib/supabase/admin";
import { applySchema, fieldErrors } from "@/lib/validation";

export async function applyForChallenge(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = applySchema.safeParse({
    challengeId: formData.get("challengeId"),
    nickname: formData.get("nickname"),
    phone: formData.get("phone"),
    depositorName: formData.get("depositorName"),
    privacy: formData.get("privacy"),
  });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  try {
    const { error } = await getSupabaseAdmin().rpc("apply_to_challenge", {
      p_challenge_id: parsed.data.challengeId,
      p_nickname: parsed.data.nickname,
      p_phone: parsed.data.phone,
      p_depositor_name: parsed.data.depositorName,
    });
    if (error) {
      if (error.message.includes("already_applied")) return { message: "이미 이 챌린지에 신청한 전화번호예요." };
      if (error.message.includes("challenge_not_open")) return { message: "현재 참가 신청을 받고 있지 않아요." };
      throw error;
    }
  } catch (error) {
    if (error instanceof ConfigurationError) return { message: "신청 접수를 열기 위해 Supabase 환경변수를 설정해 주세요." };
    console.error("applyForChallenge", error);
    return { message: "신청을 저장하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  redirect(`/apply/complete?nickname=${encodeURIComponent(parsed.data.nickname)}`);
}
