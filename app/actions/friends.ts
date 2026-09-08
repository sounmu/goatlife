"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionState } from "@/lib/domain";
import { requireParticipant } from "@/lib/auth/participant";
import { readFriendInviteToken } from "@/lib/friend-invites";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function acceptFriendInvite(_: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireParticipant();
  const token = String(formData.get("token") ?? "");
  const invite = readFriendInviteToken(token);

  if (!invite || invite.challengeId !== session.challengeId) {
    return { message: "이 친구 링크는 올바르지 않거나 현재 챌린지에서 사용할 수 없어요." };
  }
  if (invite.participantId === session.id) {
    return { message: "내 친구 링크로는 나 자신을 추가할 수 없어요." };
  }

  const supabase = getSupabaseAdmin();
  const { data: inviter, error: inviterError } = await supabase
    .from("challenge_participants")
    .select("participant_id")
    .eq("challenge_id", session.challengeId)
    .eq("participant_id", invite.participantId)
    .in("participant_status", ["ACTIVE", "SUCCESS", "FAILED", "REFUNDED"])
    .maybeSingle();

  if (inviterError || !inviter) {
    return { message: "친구를 찾을 수 없어요. 링크를 다시 확인해 주세요." };
  }

  const [participantOneId, participantTwoId] = [session.id, invite.participantId].sort();
  const { error } = await supabase.from("friendships").upsert({
    challenge_id: session.challengeId,
    participant_one_id: participantOneId,
    participant_two_id: participantTwoId,
  }, { onConflict: "challenge_id,participant_one_id,participant_two_id", ignoreDuplicates: true });

  if (error) {
    console.error("acceptFriendInvite", error);
    return { message: "친구를 추가하지 못했어요. 잠시 후 다시 시도해 주세요." };
  }

  revalidatePath("/friends");
  revalidatePath("/feed");
  redirect("/friends?added=1");
}
