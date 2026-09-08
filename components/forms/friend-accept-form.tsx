"use client";

import { UserRoundPlus } from "lucide-react";
import { useActionState } from "react";
import { acceptFriendInvite } from "@/app/actions/friends";
import { SubmitButton } from "@/components/submit-button";

export function FriendAcceptForm({ token, nickname }: { token: string; nickname: string }) {
  const [state, action] = useActionState(acceptFriendInvite, {});
  return (
    <form action={action}>
      <input type="hidden" name="token" value={token} />
      {state.message && <p role="alert" className="mb-4 rounded-2xl bg-coral/10 p-4 text-sm font-bold leading-6 text-coral">{state.message}</p>}
      <SubmitButton pendingText="친구로 추가하는 중...">
        <UserRoundPlus className="size-4" aria-hidden="true" /> {nickname}님 친구 추가
      </SubmitButton>
    </form>
  );
}
