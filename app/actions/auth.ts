"use server";

import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/domain";
import { clearAdminSession, createAdminSession } from "@/lib/auth/admin";
import { issueParticipantSession, revokeCurrentParticipantSession } from "@/lib/auth/participant";
import { hashToken } from "@/lib/security";
import { ConfigurationError, getSupabaseAdmin } from "@/lib/supabase/admin";
import { adminLoginSchema, fieldErrors, recoveryLoginSchema } from "@/lib/validation";

export async function loginWithRecoveryCode(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = recoveryLoginSchema.safeParse({ phone: formData.get("phone"), code: formData.get("code") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  try {
    const supabase = getSupabaseAdmin();
    const { data: participant } = await supabase
      .from("participants")
      .select("id, recovery_code_hash")
      .eq("phone", parsed.data.phone)
      .eq("recovery_code_hash", hashToken(parsed.data.code))
      .maybeSingle();
    if (!participant) return { message: "전화번호 또는 참가코드를 확인해 주세요." };
    const { data: participation } = await supabase
      .from("challenge_participants")
      .select("id")
      .eq("participant_id", participant.id)
      .in("participant_status", ["ACTIVE", "SUCCESS", "FAILED", "REFUNDED"])
      .limit(1)
      .maybeSingle();
    if (!participation) return { message: "아직 활성화된 참가 내역이 없어요." };
    await issueParticipantSession(participant.id);
  } catch (error) {
    if (error instanceof ConfigurationError) return { message: "로그인을 사용하려면 Supabase 연결이 필요해요." };
    console.error("loginWithRecoveryCode", error);
    return { message: "로그인 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요." };
  }
  const requestedPath = String(formData.get("next") ?? "");
  const redirectPath = /^\/friends\/add\/[A-Za-z0-9._-]+$/.test(requestedPath) ? requestedPath : "/feed";
  redirect(redirectPath);
}

export async function participantLogout() {
  await revokeCurrentParticipantSession();
  redirect("/");
}

export async function adminLogin(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = adminLoginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return { message: "관리자 환경변수가 아직 설정되지 않았습니다." };
  }
  if (parsed.data.email !== process.env.ADMIN_EMAIL || parsed.data.password !== process.env.ADMIN_PASSWORD) {
    return { message: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin/login");
}
