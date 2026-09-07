import type { Metadata } from "next";
import { Camera } from "lucide-react";
import Link from "next/link";
import { FeedView } from "@/components/feed-view";
import { requireParticipant } from "@/lib/auth/participant";
import { getFeed } from "@/lib/data";

export const metadata: Metadata = { title: "인증 피드" };

export default async function FeedPage() {
  const participant = await requireParticipant();
  const proofs = await getFeed(participant.challengeId);
  return (
    <main className="mx-auto max-w-3xl px-5 pb-8 pt-5 sm:px-8 sm:pb-12 sm:pt-8">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-coral">Together</p><h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em]">함께 해낸 오늘</h1><p className="mt-2 text-sm font-medium text-ink/50">서로의 꾸준함이 다음 날의 힘이 됩니다.</p></div>
        <Link href="/proof/new" className="hidden h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm font-extrabold text-white transition hover:bg-coral md:inline-flex"><Camera className="size-4" /> 인증하기</Link>
      </div>

      <FeedView proofs={proofs} />
    </main>
  );
}
