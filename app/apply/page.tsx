import type { Metadata } from "next";
import { ArrowLeft, CalendarDays, Clock3, Coffee, TicketPercent, WalletCards } from "lucide-react";
import Link from "next/link";
import { ApplyForm } from "@/components/forms/apply-form";
import { Logo } from "@/components/logo";
import { formatKoreaDate, isDateWithin, koreaDate } from "@/lib/date";
import { getActiveChallenge } from "@/lib/data";
import { formatWon } from "@/lib/utils";

export const metadata: Metadata = { title: "참가 신청" };
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const challenge = await getActiveChallenge();
  const today = koreaDate();
  const canApply = challenge ? isDateWithin(today, challenge.application_start_date, challenge.application_end_date) : false;
  return (
    <main className="min-h-screen bg-cream px-5 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-xl">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="홈으로" className="flex size-10 items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink"><ArrowLeft className="size-4" /></Link>
          <Logo />
          <div className="size-10" />
        </div>
        <div className="py-12 text-center sm:py-16">
          <span className="inline-flex rounded-full bg-lime px-3 py-1.5 text-xs font-extrabold text-ink">STEP 1 · 참가 신청</span>
          <h1 className="mt-5 font-display text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">이번엔, 진짜 해내요.</h1>
          <p className="mt-4 text-sm font-medium leading-6 text-ink/55">신청에는 1분이면 충분해요.<br />입금 확인 후 개인 참가 링크를 보내드릴게요.</p>
        </div>

        {challenge ? (
          <>
            <section className="mb-5 rounded-3xl bg-ink p-6 text-white shadow-xl shadow-ink/10">
              <p className="text-xs font-bold text-lime">{canApply ? "모집 중" : today < challenge.application_start_date ? "모집 예정" : "모집 마감"}</p>
              <h2 className="mt-2 font-display text-2xl font-black">{challenge.title}</h2>
              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-center">
                <div><CalendarDays className="mx-auto size-4 text-coral" /><p className="mt-2 text-[10px] text-white/45">신청 기간</p><p className="mt-1 text-xs font-bold">{formatKoreaDate(challenge.application_start_date)}–{formatKoreaDate(challenge.application_end_date)}</p></div>
                <div><Clock3 className="mx-auto size-4 text-coral" /><p className="mt-2 text-[10px] text-white/45">인증</p><p className="mt-1 text-xs font-bold">{challenge.proof_start_time.slice(0, 5)}–{challenge.proof_end_time.slice(0, 5)}</p></div>
                <div><WalletCards className="mx-auto size-4 text-coral" /><p className="mt-2 text-[10px] text-white/45">개인 일정</p><p className="mt-1 text-xs font-bold">{formatKoreaDate(challenge.start_date)}부터 {challenge.duration_days}일</p></div>
              </div>
              <p className="mt-4 text-center text-xs font-semibold text-white/55">{formatKoreaDate(challenge.start_date)} 이전 신청자는 {formatKoreaDate(challenge.start_date)} 시작 · 이후 신청자는 신청 다음 날 시작</p>
              <p className="mt-5 border-t border-white/10 pt-4 text-center text-xs font-semibold text-white/55">보증금 {formatWon(challenge.deposit_amount)}</p>
            </section>
            <section className="mb-5 rounded-3xl border border-ink/10 bg-lime/70 p-5">
              <p className="text-xs font-extrabold uppercase text-ink/45">완주 혜택</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4"><TicketPercent className="size-5 shrink-0 text-coral" /><p className="text-sm font-extrabold">완주자 전원 로테이션 소개팅 참여 1만원 할인 쿠폰</p></div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4"><Coffee className="size-5 shrink-0 text-coral" /><p className="text-sm font-extrabold">완주자 중 추첨 5명에게 커피 선물</p></div>
              </div>
              <p className="mt-4 text-center text-xs font-bold text-ink/55">랜덤 미션을 완료할수록 커피 추첨 당첨 확률이 올라가요.</p>
            </section>
            <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
              {canApply ? <ApplyForm challengeId={challenge.id} /> : (
                <div className="py-5 text-center">
                  <p className="font-display text-xl font-black">{today < challenge.application_start_date ? `${formatKoreaDate(challenge.application_start_date)}에 신청이 열려요.` : "이번 신청은 마감됐어요."}</p>
                  <p className="mt-2 text-sm font-medium text-ink/45">신청 기간은 {formatKoreaDate(challenge.application_start_date)}부터 {formatKoreaDate(challenge.application_end_date)}까지입니다.</p>
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="rounded-3xl border border-ink/10 bg-white p-8 text-center">
            <p className="font-display text-xl font-black">현재 모집 중인 챌린지가 없어요.</p>
            <p className="mt-2 text-sm text-ink/50">다음 모집 소식을 기다려 주세요.</p>
          </section>
        )}
        <p className="py-8 text-center text-xs font-medium text-ink/35">신청 정보는 챌린지 운영 목적으로만 사용합니다.</p>
      </div>
    </main>
  );
}
