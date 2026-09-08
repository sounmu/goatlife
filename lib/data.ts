import "server-only";

import { calculateLiveStats, calculateStreak } from "@/lib/date";
import type { Challenge, DailyRandomMission, ParticipantStatus, ProofStatus, ProofType } from "@/lib/domain";
import { appConfig, isSupabaseConfigured } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const PROOF_IMAGE_URL_TTL_SECONDS = 60 * 15;

async function getSignedProofImageUrls(paths: string[]) {
  if (!paths.length) return new Map<string, string>();

  const { data } = await getSupabaseAdmin()
    .storage
    .from(appConfig.proofBucket)
    .createSignedUrls(paths, PROOF_IMAGE_URL_TTL_SECONDS);

  const urls = new Map<string, string>();
  for (const image of data ?? []) {
    if (image.path && image.signedUrl) urls.set(image.path, image.signedUrl);
  }
  return urls;
}

export const demoChallenge: Challenge = {
  id: "11111111-1111-4111-8111-111111111111",
  title: "14일 미라클 모닝",
  description: "매일 아침 5시부터 9시 사이, 일어난 뒤 한 일을 사진과 짧은 기록으로 남겨요.",
  deposit_amount: 10_000,
  application_start_date: "2026-09-04",
  application_end_date: "2026-09-13",
  duration_days: 14,
  start_date: "2026-09-06",
  end_date: "2026-09-27",
  max_failures: 2,
  failure_rule: "ABOVE",
  proof_start_time: "05:00:00",
  proof_end_time: "09:00:00",
  status: "OPEN",
};

export async function getActiveChallenge(): Promise<Challenge | null> {
  if (!isSupabaseConfigured()) return demoChallenge;
  const { data, error } = await getSupabaseAdmin()
    .from("challenges")
    .select("id, title, description, deposit_amount, application_start_date, application_end_date, duration_days, start_date, end_date, max_failures, failure_rule, proof_start_time, proof_end_time, status")
    .in("status", ["OPEN", "ACTIVE"])
    .order("start_date", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Challenge | null;
}

interface FeedProofRow {
  id: string;
  participant_id: string;
  image_path: string;
  proof_date: string;
  content: string;
  created_at: string;
  proof_type: ProofType;
  participants: { nickname: string } | { nickname: string }[];
  daily_random_missions: { title: string } | { title: string }[] | null;
}

async function getFriendIds(challengeId: string, participantId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("friendships")
    .select("participant_one_id, participant_two_id")
    .eq("challenge_id", challengeId)
    .or(`participant_one_id.eq.${participantId},participant_two_id.eq.${participantId}`);
  if (error) throw error;
  return (data ?? []).map((friendship) => friendship.participant_one_id === participantId
    ? friendship.participant_two_id
    : friendship.participant_one_id);
}

export async function getFeed(challengeId: string, participantId: string, friendsOnly = false) {
  const supabase = getSupabaseAdmin();
  const friendIds = friendsOnly ? await getFriendIds(challengeId, participantId) : [];
  if (friendsOnly && !friendIds.length) return [];

  let query = supabase
    .from("proofs")
    .select("id, participant_id, image_path, proof_date, content, created_at, proof_type, participants!inner(nickname), daily_random_missions(title)")
    .eq("challenge_id", challengeId)
    .eq("status", "VALID")
    .order("created_at", { ascending: false });
  if (friendsOnly) query = query.in("participant_id", friendIds);
  const { data: proofs, error } = await query;
  if (error) throw error;

  const proofRows = (proofs ?? []) as unknown as FeedProofRow[];
  const datesByParticipant = new Map<string, string[]>();
  for (const row of proofRows) {
    if (row.proof_type !== "MORNING") continue;
    datesByParticipant.set(row.participant_id, [...(datesByParticipant.get(row.participant_id) ?? []), row.proof_date]);
  }
  const displayedProofs = proofRows.slice(0, 40);
  const imageUrls = await getSignedProofImageUrls(displayedProofs.map((proof) => proof.image_path));

  return displayedProofs.map((proof) => ({
    id: proof.id,
    nickname: Array.isArray(proof.participants) ? proof.participants[0]?.nickname : proof.participants.nickname,
    proofDate: proof.proof_date,
    content: proof.content,
    createdAt: proof.created_at,
    proofType: proof.proof_type,
    missionTitle: proof.daily_random_missions
      ? (Array.isArray(proof.daily_random_missions) ? proof.daily_random_missions[0]?.title : proof.daily_random_missions.title)
      : null,
    imageUrl: imageUrls.get(proof.image_path) ?? `/api/proofs/${proof.id}/image`,
    streak: proof.proof_type === "MORNING"
      ? calculateStreak(datesByParticipant.get(proof.participant_id) ?? [], proof.proof_date)
      : null,
  }));
}

export async function getFriends(challengeId: string, participantId: string) {
  const friendIds = await getFriendIds(challengeId, participantId);
  if (!friendIds.length) return [];
  const { data, error } = await getSupabaseAdmin()
    .from("participants")
    .select("id, nickname")
    .in("id", friendIds)
    .order("nickname");
  if (error) throw error;
  return data ?? [];
}

export async function getFriendInvitePreview(challengeId: string, inviterId: string, viewerId: string) {
  const supabase = getSupabaseAdmin();
  const [{ data: inviter }, { data: friendship }] = await Promise.all([
    supabase
      .from("challenge_participants")
      .select("participants!inner(id, nickname)")
      .eq("challenge_id", challengeId)
      .eq("participant_id", inviterId)
      .in("participant_status", ["ACTIVE", "SUCCESS", "FAILED", "REFUNDED"])
      .maybeSingle(),
    viewerId === inviterId
      ? Promise.resolve({ data: null })
      : supabase
        .from("friendships")
        .select("challenge_id")
        .eq("challenge_id", challengeId)
        .eq("participant_one_id", [viewerId, inviterId].sort()[0])
        .eq("participant_two_id", [viewerId, inviterId].sort()[1])
        .maybeSingle(),
  ]);
  if (!inviter) return null;
  const participant = Array.isArray(inviter.participants) ? inviter.participants[0] : inviter.participants;
  return { participant, alreadyFriends: Boolean(friendship), isSelf: inviterId === viewerId };
}

export async function getProofReceipt(participantId: string, challengeId: string, proofId: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("proofs")
    .select("id, proof_date, content, created_at, proof_type, status, participants!inner(nickname), challenges!inner(title), daily_random_missions(title)")
    .eq("id", proofId)
    .eq("participant_id", participantId)
    .eq("challenge_id", challengeId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const participant = Array.isArray(data.participants) ? data.participants[0] : data.participants;
  const challenge = Array.isArray(data.challenges) ? data.challenges[0] : data.challenges;
  const mission = data.daily_random_missions
    ? (Array.isArray(data.daily_random_missions) ? data.daily_random_missions[0] : data.daily_random_missions)
    : null;
  return {
    id: data.id,
    nickname: participant.nickname,
    challengeTitle: challenge.title,
    proofDate: data.proof_date,
    content: data.content,
    createdAt: data.created_at,
    proofType: data.proof_type as ProofType,
    missionTitle: mission?.title ?? null,
    imageUrl: `/api/proofs/${data.id}/image`,
  };
}

interface ParticipationRow {
  id: string;
  payment_status: "WAITING" | "PAID";
  participant_status: ParticipantStatus;
  start_date: string;
  end_date: string;
  joined_at: string;
  participants: { id: string; nickname: string; phone: string; depositor_name: string; recovery_code_hint: string | null } | Array<{ id: string; nickname: string; phone: string; depositor_name: string; recovery_code_hint: string | null }>;
  challenges: Challenge | Challenge[];
}

interface AdminProofRow {
  id: string;
  image_path: string;
  content: string;
  created_at: string;
  proof_date: string;
  status: ProofStatus;
  proof_type: ProofType;
  participants: { nickname: string } | { nickname: string }[];
  challenges: { title: string } | { title: string }[];
  daily_random_missions: { title: string } | { title: string }[] | null;
}

export async function getMyDashboard(participantId: string, challengeId: string) {
  const supabase = getSupabaseAdmin();
  const [{ data: challenge, error: challengeError }, { data: participation, error: participationError }, { data: proofs, error: proofsError }] = await Promise.all([
    supabase.from("challenges").select("*").eq("id", challengeId).single(),
    supabase.from("challenge_participants").select("participant_status, start_date, end_date").eq("participant_id", participantId).eq("challenge_id", challengeId).single(),
    supabase.from("proofs").select("id, proof_date, content, created_at, status, proof_type, daily_random_missions(title)").eq("participant_id", participantId).eq("challenge_id", challengeId).order("proof_date", { ascending: false }),
  ]);
  if (challengeError) throw challengeError;
  if (participationError) throw participationError;
  if (proofsError) throw proofsError;
  const typedChallenge = {
    ...(challenge as Challenge),
    start_date: participation.start_date,
    end_date: participation.end_date,
  };
  const validDates = (proofs ?? [])
    .filter((proof) => proof.status === "VALID" && proof.proof_type === "MORNING")
    .map((proof) => proof.proof_date);
  return {
    challenge: typedChallenge,
    participantStatus: participation.participant_status as ParticipantStatus,
    stats: calculateLiveStats(typedChallenge, validDates),
    proofs: proofs ?? [],
    randomMissionSuccessCount: (proofs ?? []).filter((proof) => proof.status === "VALID" && proof.proof_type === "RANDOM").length,
  };
}

export async function getDailyRandomMission(challengeId: string, missionDate: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("daily_random_missions")
    .select("id, challenge_id, mission_date, title, description")
    .eq("challenge_id", challengeId)
    .eq("mission_date", missionDate)
    .maybeSingle();
  if (error) throw error;
  return data as DailyRandomMission | null;
}

export async function getAdminDashboard() {
  const supabase = getSupabaseAdmin();
  const [{ data: participations, error: participantsError }, { data: proofs, error: proofsError }] = await Promise.all([
    supabase
      .from("challenge_participants")
      .select("id, payment_status, participant_status, start_date, end_date, joined_at, participants!inner(id, nickname, phone, depositor_name, recovery_code_hint), challenges!inner(*)")
      .order("joined_at", { ascending: false }),
    supabase
      .from("proofs")
      .select("id, image_path, content, created_at, proof_date, status, proof_type, participants!inner(nickname), challenges!inner(title), daily_random_missions(title)")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);
  if (participantsError) throw participantsError;
  if (proofsError) throw proofsError;

  const participantRows = ((participations ?? []) as unknown as ParticipationRow[]).map((row) => {
    const participant = Array.isArray(row.participants) ? row.participants[0] : row.participants;
    const challenge = (Array.isArray(row.challenges) ? row.challenges[0] : row.challenges) as Challenge;
    return { ...row, participant, challenge };
  });
  const participantIds = participantRows.map((row) => row.participant.id);
  const challengeIds = participantRows.map((row) => row.challenge.id);
  const { data: validProofs } = participantIds.length
    ? await supabase.from("proofs").select("participant_id, challenge_id, proof_date").in("participant_id", participantIds).in("challenge_id", challengeIds).eq("proof_type", "MORNING").eq("status", "VALID")
    : { data: [] };

  const proofRows = (proofs ?? []) as unknown as AdminProofRow[];
  const imageUrls = await getSignedProofImageUrls(proofRows.map((proof) => proof.image_path));

  return {
    participants: participantRows.map((row) => {
      const dates = (validProofs ?? [])
        .filter((proof) => proof.participant_id === row.participant.id && proof.challenge_id === row.challenge.id)
        .map((proof) => proof.proof_date);
      const participantChallenge = { ...row.challenge, start_date: row.start_date, end_date: row.end_date };
      return { ...row, stats: calculateLiveStats(participantChallenge, dates) };
    }),
    proofs: proofRows.map((proof) => ({
      id: proof.id,
      content: proof.content,
      created_at: proof.created_at,
      proofDate: proof.proof_date,
      status: proof.status,
      proof_type: proof.proof_type,
      participant: Array.isArray(proof.participants) ? proof.participants[0] : proof.participants,
      missionTitle: proof.daily_random_missions
        ? (Array.isArray(proof.daily_random_missions) ? proof.daily_random_missions[0]?.title : proof.daily_random_missions.title)
        : null,
      imageUrl: imageUrls.get(proof.image_path) ?? `/api/proofs/${proof.id}/image`,
    })),
  };
}
