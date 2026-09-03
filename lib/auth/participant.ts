import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { appConfig } from "@/lib/config";
import type { ParticipantSession, ParticipantStatus } from "@/lib/domain";
import { hashToken, randomToken } from "@/lib/security";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const PARTICIPANT_COOKIE = "goat_session";

export async function issueParticipantSession(participantId: string) {
  const rawToken = randomToken();
  const expiresAt = new Date(Date.now() + appConfig.sessionDays * 86_400_000);
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("participant_sessions").insert({
    participant_id: participantId,
    token_hash: hashToken(rawToken),
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw error;

  (await cookies()).set(PARTICIPANT_COOKIE, rawToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function getParticipantSession(): Promise<ParticipantSession | null> {
  const token = (await cookies()).get(PARTICIPANT_COOKIE)?.value;
  if (!token) return null;
  const supabase = getSupabaseAdmin();
  const { data: session } = await supabase
    .from("participant_sessions")
    .select("participant_id, expires_at, revoked_at")
    .eq("token_hash", hashToken(token))
    .gt("expires_at", new Date().toISOString())
    .is("revoked_at", null)
    .maybeSingle();
  if (!session) return null;

  const [{ data: participant }, { data: participation }] = await Promise.all([
    supabase.from("participants").select("id, nickname").eq("id", session.participant_id).maybeSingle(),
    supabase
      .from("challenge_participants")
      .select("id, challenge_id, participant_status")
      .eq("participant_id", session.participant_id)
      .in("participant_status", ["ACTIVE", "SUCCESS", "FAILED", "REFUNDED"])
      .order("joined_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  if (!participant || !participation) return null;
  return {
    id: participant.id,
    nickname: participant.nickname,
    challengeParticipantId: participation.id,
    challengeId: participation.challenge_id,
    participantStatus: participation.participant_status as ParticipantStatus,
  };
}

export async function requireParticipant() {
  const session = await getParticipantSession();
  if (!session) redirect("/login");
  return session;
}

export async function revokeCurrentParticipantSession() {
  const store = await cookies();
  const token = store.get(PARTICIPANT_COOKIE)?.value;
  if (token) {
    await getSupabaseAdmin().from("participant_sessions").update({ revoked_at: new Date().toISOString() }).eq("token_hash", hashToken(token));
  }
  store.delete(PARTICIPANT_COOKIE);
}
