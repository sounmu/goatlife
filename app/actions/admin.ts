"use server";

import { revalidatePath } from "next/cache";
import type { ActionState, Challenge, ParticipantStatus } from "@/lib/domain";
import { requireAdmin } from "@/lib/auth/admin";
import { appConfig } from "@/lib/config";
import { calculateLiveStats, koreaDate } from "@/lib/date";
import { createRecoveryCode, hashToken, randomToken } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function confirmPayment(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const participationId = String(formData.get("participationId") ?? "");
  if (!participationId) return { message: "참가 정보를 찾을 수 없습니다." };
  const supabase = getSupabaseAdmin();
  const { data: participation, error } = await supabase
    .from("challenge_participants")
    .select("id, participant_id, payment_status")
    .eq("id", participationId)
    .single();
  if (error || !participation) return { message: "참가 정보를 찾을 수 없습니다." };
  if (participation.payment_status === "PAID") return { message: "이미 입금 확인된 참가자입니다." };

  const linkToken = randomToken();
  const recoveryCode = createRecoveryCode();
  const expiresAt = new Date(Date.now() + appConfig.tokenDays * 86_400_000).toISOString();
  const { error: tokenError } = await supabase.from("participant_tokens").insert({
    participant_id: participation.participant_id,
    token_hash: hashToken(linkToken),
    expires_at: expiresAt,
  });
  if (tokenError) return { message: "참가 링크 생성에 실패했습니다." };

  const [{ error: participantError }, { error: statusError }] = await Promise.all([
    supabase.from("participants").update({ recovery_code_hash: hashToken(recoveryCode), recovery_code_hint: recoveryCode.slice(-2) }).eq("id", participation.participant_id),
    supabase.from("challenge_participants").update({ payment_status: "PAID", participant_status: "ACTIVE", activated_at: new Date().toISOString() }).eq("id", participationId),
  ]);
  if (participantError || statusError) return { message: "입금 상태 갱신에 실패했습니다." };
  revalidatePath("/admin");
  return {
    ok: true,
    message: "입금 확인과 참가 활성화를 완료했습니다. 아래 정보를 참가자에게 전달하세요.",
    data: { link: `${appConfig.url}/join/${linkToken}`, recoveryCode },
  };
}

export async function reissueAccess(_: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const participantId = String(formData.get("participantId") ?? "");
  if (!participantId) return { message: "참가자를 찾을 수 없습니다." };
  const supabase = getSupabaseAdmin();
  const { data: active } = await supabase
    .from("challenge_participants")
    .select("id")
    .eq("participant_id", participantId)
    .eq("payment_status", "PAID")
    .limit(1)
    .maybeSingle();
  if (!active) return { message: "활성 참가자에게만 재발급할 수 있습니다." };
  const linkToken = randomToken();
  const recoveryCode = createRecoveryCode();
  const [{ error: tokenError }, { error: participantError }] = await Promise.all([
    supabase.from("participant_tokens").insert({ participant_id: participantId, token_hash: hashToken(linkToken), expires_at: new Date(Date.now() + appConfig.tokenDays * 86_400_000).toISOString() }),
    supabase.from("participants").update({ recovery_code_hash: hashToken(recoveryCode), recovery_code_hint: recoveryCode.slice(-2) }).eq("id", participantId),
  ]);
  if (tokenError || participantError) return { message: "접속 정보 재발급에 실패했습니다." };
  revalidatePath("/admin");
  return { ok: true, message: "접속 정보를 재발급했습니다.", data: { link: `${appConfig.url}/join/${linkToken}`, recoveryCode } };
}

export async function setProofValidity(formData: FormData) {
  await requireAdmin();
  const proofId = String(formData.get("proofId") ?? "");
  const status = formData.get("status") === "VALID" ? "VALID" : "INVALID";
  if (proofId) await getSupabaseAdmin().from("proofs").update({
    status,
    invalidated_at: status === "INVALID" ? new Date().toISOString() : null,
  }).eq("id", proofId);
  revalidatePath("/admin");
  revalidatePath("/feed");
  revalidatePath("/me");
}

export async function refreshOutcomes(): Promise<void> {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const { data: rows } = await supabase
    .from("challenge_participants")
    .select("id, participant_id, participant_status, challenges!inner(*)")
    .eq("payment_status", "PAID")
    .in("participant_status", ["ACTIVE", "SUCCESS", "FAILED"]);
  for (const raw of rows ?? []) {
    const related = raw.challenges as unknown as Challenge | Challenge[];
    const challenge = Array.isArray(related) ? related[0] : related;
    const { data: proofs } = await supabase
      .from("proofs")
      .select("proof_date")
      .eq("participant_id", raw.participant_id)
      .eq("challenge_id", challenge.id)
      .eq("status", "VALID");
    const stats = calculateLiveStats(challenge, (proofs ?? []).map((proof) => proof.proof_date));
    let next: ParticipantStatus = "ACTIVE";
    if (stats.hasFailed) next = "FAILED";
    else if (koreaDate() > challenge.end_date) next = "SUCCESS";
    if (next !== raw.participant_status) await supabase.from("challenge_participants").update({ participant_status: next }).eq("id", raw.id);
  }
  revalidatePath("/admin");
  revalidatePath("/me");
}
