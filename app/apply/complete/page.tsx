import type { Metadata } from "next";
import { BadgeCheck, Building2, Copy, WalletCards } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { appConfig } from "@/lib/config";
import { getActiveChallenge } from "@/lib/data";
import { formatWon } from "@/lib/utils";

export const metadata: Metadata = { title: "신청 완료" };
export const dynamic = "force-dynamic";

export default async function ApplyCompletePage({ searchParams }: { searchParams: Promise<{ nickname?: string }> }) {
  const [{ nickname }, challenge] = await Promise.all([searchParams, getActiveChallenge()]);
  const amount = challenge?.deposit_amount ?? 10_000;
  return (
    <main className="min-h-screen bg-cream px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-lg">
        <div className="text-center"><Logo /></div>
        <div className="mt-12 rounded-[2rem] border border-ink/10 bg-white p-6 text-center shadow-xl shadow-ink/5 sm:p-9">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-lime text-ink"><BadgeCheck className="size-8" /></div>
          <p className="mt-6 text-sm font-bold text-coral">신청 완료</p>
          <h1 className="mt-2 font-display text-3xl font-black tracking-[-.04em] text-ink">{nickname ? `${nickname}님, 반가워요!` : "참가 신청을 받았어요!"}</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-ink/50">아래 계좌로 보증금을 입금해 주세요.<br />운영자가 확인하면 참가 링크와 코드를 안내해 드려요.</p>

          <div className="mt-8 rounded-3xl bg-ink p-6 text-left text-white">
            <div className="flex items-center gap-2 text-xs font-bold text-white/45"><WalletCards className="size-4 text-coral" /> 입금할 금액</div>
            <p className="mt-2 font-display text-3xl font-black text-lime">{formatWon(amount)}</p>
            <div className="my-5 h-px bg-white/10" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold text-white/45"><Building2 className="size-4 text-coral" /> 입금 계좌</p>
                <p className="mt-2 text-sm font-bold">{appConfig.bank.name}</p>
                <p className="mt-1 font-display text-xl font-black tracking-tight">{appConfig.bank.account}</p>
                <p className="mt-1 text-xs font-semibold text-white/50">예금주 {appConfig.bank.holder}</p>
              </div>
              <Copy className="mt-7 size-4 text-white/30" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-5 rounded-2xl bg-coral/10 px-4 py-3 text-xs font-bold leading-5 text-coral">신청서의 입금자명과 실제 입금자명이 같아야 빠르게 확인할 수 있어요.</div>
          <Link href="/" className="mt-7 inline-flex text-sm font-extrabold text-ink underline decoration-ink/20 underline-offset-4">홈으로 돌아가기</Link>
        </div>
      </div>
    </main>
  );
}
