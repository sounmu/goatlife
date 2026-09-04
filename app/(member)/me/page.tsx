import type { Metadata } from "next";
import { BadgeCheck, CalendarDays, CircleDollarSign, Clock3, Coffee, Sparkles, TicketPercent, XCircle } from "lucide-react";
import { requireParticipant } from "@/lib/auth/participant";
import { formatKoreaDate, inclusiveDays } from "@/lib/date";
import { getMyDashboard } from "@/lib/data";
import { formatWon } from "@/lib/utils";

export const metadata: Metadata = { title: "마이페이지" };

const statusLabel = { APPLIED: "신청", ACTIVE: "진행 중", SUCCESS: "성공", FAILED: "실패", REFUNDED: "환급 완료" } as const;

export default async function MePage() {
  const participant = await requireParticipant();
  const { challenge, participantStatus, stats, proofs, randomMissionSuccessCount } = await getMyDashboard(participant.id, participant.challengeId);
  const totalDays = inclusiveDays(challenge.start_date, challenge.end_date);
  const progress = totalDays ? Math.min(100, Math.round((stats.successCount / totalDays) * 100)) : 0;
  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-12">
      <div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-coral">My challenge</p><h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em]">{participant.nickname}님의 기록</h1></div>
      <section className="mt-8 overflow-hidden rounded-[2rem] bg-ink p-6 text-white shadow-xl shadow-ink/15 sm:p-8">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold text-lime">{statusLabel[participantStatus]}</p><h2 className="mt-2 font-display text-2xl font-black">{challenge.title}</h2><p className="mt-2 text-xs font-semibold text-white/45">{formatKoreaDate(challenge.start_date)} – {formatKoreaDate(challenge.end_date)}</p></div><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold">{stats.successCount} / {totalDays}일</span></div>
        <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-lime" style={{ width: `${progress}%` }} /></div>
        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-center"><div><BadgeCheck className="mx-auto size-4 text-lime" /><p className="mt-2 text-[10px] text-white/40">성공 인증</p><p className="mt-1 font-display text-xl font-black">{stats.successCount}회</p></div><div><XCircle className="mx-auto size-4 text-coral" /><p className="mt-2 text-[10px] text-white/40">실패</p><p className="mt-1 font-display text-xl font-black">{stats.failureCount}회</p></div><div><Clock3 className="mx-auto size-4 text-white/50" /><p className="mt-2 text-[10px] text-white/40">남은 기회</p><p className="mt-1 font-display text-xl font-black">{stats.remainingFailures}회</p></div></div>
      </section>
      <div className="mt-5 grid grid-cols-3 gap-3"><div className="rounded-3xl border border-ink/10 bg-white p-5"><CircleDollarSign className="size-5 text-coral" /><p className="mt-5 text-xs font-bold text-ink/40">보증금</p><p className="mt-1 font-display text-lg font-black">{formatWon(challenge.deposit_amount)}</p></div><div className="rounded-3xl border border-ink/10 bg-white p-5"><CalendarDays className="size-5 text-coral" /><p className="mt-5 text-xs font-bold text-ink/40">오늘 상태</p><p className="mt-1 font-display text-lg font-black">{stats.hasFailed ? "실패 확정" : "도전 중"}</p></div><div className="rounded-3xl border border-ink/10 bg-lime p-5"><Sparkles className="size-5 text-coral" /><p className="mt-5 text-xs font-bold text-ink/40">랜덤 미션</p><p className="mt-1 font-display text-lg font-black">{randomMissionSuccessCount}회</p></div></div>
      <section className="mt-5 rounded-3xl border border-ink/10 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2"><Sparkles className="size-5 text-coral" /><h2 className="font-display text-lg font-black">완주 혜택</h2></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-2xl bg-cream p-4"><TicketPercent className="size-5 shrink-0 text-coral" /><p className="text-xs font-extrabold leading-5">로테이션 소개팅 참여<br />1만원 할인 쿠폰</p></div>
          <div className="flex items-center gap-3 rounded-2xl bg-cream p-4"><Coffee className="size-5 shrink-0 text-coral" /><p className="text-xs font-extrabold leading-5">완주자 중 추첨 5명<br />커피 선물</p></div>
        </div>
        <p className="mt-4 rounded-2xl bg-lime/70 px-4 py-3 text-center text-xs font-extrabold">랜덤 미션 {randomMissionSuccessCount}회 완료 · 커피 추첨 당첨 확률 UP</p>
      </section>
      <section className="mt-10"><h2 className="font-display text-xl font-black">최근 인증</h2><div className="mt-4 space-y-3">{proofs.slice(0, 10).map((proof) => <div key={proof.id} className="flex items-center justify-between rounded-2xl border border-ink/10 bg-white px-5 py-4"><div><div className="flex items-center gap-2"><p className="text-sm font-extrabold">{formatKoreaDate(proof.proof_date)}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${proof.proof_type === "MORNING" ? "bg-ink text-white" : "bg-lime"}`}>{proof.proof_type === "MORNING" ? "아침" : "랜덤"}</span></div><p className="mt-1 line-clamp-1 text-xs font-medium text-ink/45">{proof.content}</p></div><span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${proof.status === "VALID" ? "bg-lime text-ink" : "bg-coral/10 text-coral"}`}>{proof.status === "VALID" ? "인정" : "무효"}</span></div>)}{!proofs.length && <p className="rounded-2xl bg-white p-6 text-center text-sm font-medium text-ink/40">아직 인증 기록이 없어요.</p>}</div></section>
    </main>
  );
}
