import type { Metadata } from "next";
import { CheckCircle2, Link2, UsersRound } from "lucide-react";
import { FriendInviteLink } from "@/components/friend-invite-link";
import { requireParticipant } from "@/lib/auth/participant";
import { appConfig } from "@/lib/config";
import { getFriends } from "@/lib/data";
import { createFriendInviteToken } from "@/lib/friend-invites";

export const metadata: Metadata = { title: "친구" };

export default async function FriendsPage({ searchParams }: { searchParams: Promise<{ added?: string | string[] }> }) {
  const participant = await requireParticipant();
  const [{ added }, friends] = await Promise.all([
    searchParams,
    getFriends(participant.challengeId, participant.id),
  ]);
  const inviteToken = createFriendInviteToken({ challengeId: participant.challengeId, participantId: participant.id });
  const inviteUrl = `${appConfig.participantUrl}/friends/add/${inviteToken}`;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <p className="text-xs font-extrabold uppercase tracking-[.16em] text-coral">Together, closer</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em]">친구와 같이 해요.</h1>
      <p className="mt-3 text-sm font-medium leading-6 text-ink/50">내 링크를 보내고 같은 챌린지 참가자와 친구가 되면, 피드에서 친구 인증만 모아볼 수 있어요.</p>

      {added === "1" && (
        <p role="status" className="mt-6 flex items-center gap-2 rounded-2xl bg-lime px-4 py-3 text-sm font-extrabold text-ink">
          <CheckCircle2 className="size-4" aria-hidden="true" /> 친구 추가를 완료했어요.
        </p>
      )}

      <section className="mt-8 rounded-[2rem] border border-ink/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-ink text-lime"><Link2 className="size-5" aria-hidden="true" /></span>
          <div><h2 className="font-display text-xl font-black">내 친구 추가 링크</h2><p className="mt-1 text-xs font-semibold text-ink/40">받은 사람이 로그인하고 확인하면 서로 친구가 돼요.</p></div>
        </div>
        <div className="mt-5"><FriendInviteLink inviteUrl={inviteUrl} /></div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between"><h2 className="font-display text-xl font-black">내 친구</h2><span className="rounded-full bg-ink px-3 py-1 text-xs font-extrabold text-white">{friends.length}명</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-lime"><UsersRound className="size-4" aria-hidden="true" /></span>
              <p className="font-display text-sm font-black">{friend.nickname}</p>
            </div>
          ))}
          {!friends.length && (
            <div className="rounded-2xl border border-dashed border-ink/15 bg-white/60 px-5 py-10 text-center sm:col-span-2">
              <UsersRound className="mx-auto size-7 text-ink/20" aria-hidden="true" />
              <p className="mt-3 text-sm font-extrabold">아직 추가한 친구가 없어요.</p>
              <p className="mt-1 text-xs font-medium text-ink/40">위 링크를 친구에게 보내 보세요.</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
