import type { Metadata } from "next";
import Image from "next/image";
import { Camera, Flame } from "lucide-react";
import Link from "next/link";
import { requireParticipant } from "@/lib/auth/participant";
import { formatKoreaDateTime } from "@/lib/date";
import { getFeed } from "@/lib/data";

export const metadata: Metadata = { title: "인증 피드" };

export default async function FeedPage() {
  const participant = await requireParticipant();
  const proofs = await getFeed(participant.challengeId);
  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <div className="flex items-end justify-between gap-4">
        <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-coral">Together</p><h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em]">함께 해낸 오늘</h1><p className="mt-2 text-sm font-medium text-ink/50">서로의 꾸준함이 다음 날의 힘이 됩니다.</p></div>
        <Link href="/proof/new" className="hidden h-12 items-center gap-2 rounded-full bg-ink px-5 text-sm font-extrabold text-white transition hover:bg-coral md:inline-flex"><Camera className="size-4" /> 인증하기</Link>
      </div>

      <div className="mt-9 space-y-6">
        {proofs.length ? proofs.map((proof) => (
          <article key={proof.id} className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div><p className="font-display text-base font-black">{proof.nickname}</p><p className="mt-0.5 text-[11px] font-semibold text-ink/40">{formatKoreaDateTime(proof.createdAt)}</p></div>
              <div className="flex items-center gap-1.5 rounded-full bg-lime px-3 py-1.5 text-[11px] font-extrabold"><Flame className="size-3.5" fill="currentColor" /> {proof.streak}일 연속</div>
            </div>
            <div className="relative aspect-square w-full bg-ink/5 sm:aspect-[4/3]">
              <Image src={`/api/proofs/${proof.id}/image`} alt={`${proof.nickname}님의 ${proof.proofDate} 인증 사진`} fill sizes="(max-width: 768px) 100vw, 704px" unoptimized className="object-cover" />
            </div>
            <p className="px-5 py-5 text-sm font-semibold leading-6 text-ink/75">{proof.content}</p>
          </article>
        )) : (
          <div className="rounded-[2rem] border border-dashed border-ink/15 bg-white/60 px-6 py-16 text-center"><Camera className="mx-auto size-8 text-ink/25" /><h2 className="mt-4 font-display text-xl font-black">아직 첫 인증을 기다리고 있어요.</h2><p className="mt-2 text-sm font-medium text-ink/45">오늘의 첫 번째 GOAT가 되어보세요.</p><Link href="/proof/new" className="mt-6 inline-flex h-12 items-center rounded-full bg-coral px-6 text-sm font-extrabold text-white">첫 인증 남기기</Link></div>
        )}
      </div>
    </main>
  );
}
