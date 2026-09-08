import type { Metadata } from "next";
import { ArrowLeft, CheckCircle2, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FriendAcceptForm } from "@/components/forms/friend-accept-form";
import { getParticipantSession } from "@/lib/auth/participant";
import { getFriendInvitePreview } from "@/lib/data";
import { readFriendInviteToken } from "@/lib/friend-invites";

export const metadata: Metadata = { title: "친구 추가" };

export default async function AddFriendPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = readFriendInviteToken(token);
  if (!invite) return <InvalidInvite />;

  const participant = await getParticipantSession();
  if (!participant) redirect(`/login?next=${encodeURIComponent(`/friends/add/${token}`)}`);
  if (participant.challengeId !== invite.challengeId) return <InvalidInvite message="현재 참여 중인 챌린지의 친구 링크가 아니에요." />;

  const preview = await getFriendInvitePreview(invite.challengeId, invite.participantId, participant.id);
  if (!preview) return <InvalidInvite />;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-10 sm:px-8">
      <section className="w-full rounded-[2rem] border border-ink/10 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-lime text-ink"><UserRoundPlus className="size-7" aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[.16em] text-coral">Friend invitation</p>
        <h1 className="mt-2 font-display text-3xl font-black tracking-[-.04em]">{preview.participant.nickname}님과<br />친구가 될까요?</h1>
        <p className="mt-4 text-sm font-medium leading-6 text-ink/50">친구가 되면 서로의 인증을 친구 피드에서 쉽게 모아볼 수 있어요.</p>
        <div className="mt-7">
          {preview.isSelf ? (
            <p className="rounded-2xl bg-cream p-4 text-sm font-bold text-ink/55">내가 만든 친구 링크예요.</p>
          ) : preview.alreadyFriends ? (
            <p className="flex items-center justify-center gap-2 rounded-2xl bg-lime p-4 text-sm font-extrabold"><CheckCircle2 className="size-4" aria-hidden="true" /> 이미 친구예요.</p>
          ) : (
            <FriendAcceptForm token={token} nickname={preview.participant.nickname} />
          )}
        </div>
        <Link href="/friends" className="mt-4 inline-flex h-11 items-center gap-2 px-4 text-sm font-extrabold text-ink/45 transition hover:text-ink"><ArrowLeft className="size-4" aria-hidden="true" /> 친구 목록으로</Link>
      </section>
    </main>
  );
}

function InvalidInvite({ message = "친구 링크가 올바르지 않거나 더 이상 사용할 수 없어요." }: { message?: string }) {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-md items-center px-5 py-10">
      <section className="w-full rounded-[2rem] border border-ink/10 bg-white p-7 text-center">
        <h1 className="font-display text-2xl font-black">친구를 찾지 못했어요.</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-ink/50">{message}</p>
        <Link href="/friends" className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-extrabold text-white">친구 목록으로</Link>
      </section>
    </main>
  );
}
