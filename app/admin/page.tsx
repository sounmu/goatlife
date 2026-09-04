import type { Metadata } from "next";
import { BadgeCheck, CircleDollarSign, LogOut, RefreshCw, UsersRound } from "lucide-react";
import { refreshOutcomes } from "@/app/actions/admin";
import { adminLogout } from "@/app/actions/auth";
import { ConfirmPaymentForm, ReissueAccessForm } from "@/components/admin/access-actions";
import { ParticipantManagement } from "@/components/admin/participant-management";
import { RecentProofs } from "@/components/admin/recent-proofs";
import { Logo } from "@/components/logo";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminDashboard } from "@/lib/data";
import { formatKoreaDate, koreaDate } from "@/lib/date";
import { formatPhone, formatWon } from "@/lib/utils";

export const metadata: Metadata = { title: "관리자" };
export const dynamic = "force-dynamic";

const statusLabels = { APPLIED: "신청", ACTIVE: "진행 중", SUCCESS: "성공", FAILED: "실패", REFUNDED: "환급 완료" } as const;

export default async function AdminPage() {
  await requireAdmin();
  const { participants, proofs } = await getAdminDashboard();
  const waiting = participants.filter((row) => row.payment_status === "WAITING");
  const active = participants.filter((row) => row.participant_status === "ACTIVE");
  const paidAmount = participants.filter((row) => row.payment_status === "PAID").reduce((sum, row) => sum + row.challenge.deposit_amount, 0);
  return (
    <main className="min-h-screen bg-[#f5f6f3] pb-16">
      <header className="border-b border-ink/10 bg-white px-5 py-4 sm:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Logo href="/admin" /><div className="flex items-center gap-5"><span className="text-xs font-bold text-ink/40">운영자 모드</span><form action={adminLogout}><button className="flex items-center gap-1.5 text-xs font-bold text-ink/45 hover:text-coral"><LogOut className="size-3.5" /> 로그아웃</button></form></div></div></header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.16em] text-coral">Operations</p><h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em]">챌린지 운영</h1><p className="mt-2 text-sm font-medium text-ink/45">신청, 입금, 인증과 성공 여부를 한 곳에서 관리합니다.</p></div><form action={refreshOutcomes}><button className="inline-flex h-11 items-center gap-2 rounded-full border border-ink/10 bg-white px-5 text-xs font-extrabold shadow-sm hover:bg-lime"><RefreshCw className="size-3.5" /> 상태 판정 갱신</button></form></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[{ icon: UsersRound, label: "전체 신청", value: `${participants.length}명`, tone: "bg-white" }, { icon: BadgeCheck, label: "진행 중", value: `${active.length}명`, tone: "bg-lime" }, { icon: CircleDollarSign, label: "확인된 보증금", value: formatWon(paidAmount), tone: "bg-ink text-white" }].map(({ icon: Icon, label, value, tone }) => <div key={label} className={`rounded-3xl p-6 shadow-sm ${tone}`}><Icon className="size-5 text-coral" /><p className="mt-7 text-xs font-bold opacity-45">{label}</p><p className="mt-1 font-display text-3xl font-black">{value}</p></div>)}
        </div>

        <section className="mt-12"><div className="flex items-center justify-between"><div><h2 className="font-display text-2xl font-black">입금 대기</h2><p className="mt-1 text-sm font-medium text-ink/40">은행 앱에서 입금자명을 확인한 뒤 활성화하세요.</p></div><span className="rounded-full bg-coral/10 px-3 py-1 text-xs font-extrabold text-coral">{waiting.length}건</span></div>
          <div className="mt-5 overflow-hidden rounded-3xl border border-ink/10 bg-white">
            {waiting.length ? waiting.map((row, index) => <div key={row.id} className={`grid gap-5 p-5 lg:grid-cols-[1fr_1fr_.8fr_1fr] lg:items-center ${index ? "border-t border-ink/8" : ""}`}><div><p className="font-display text-lg font-black">{row.participant.nickname}</p><p className="mt-1 text-xs font-medium text-ink/40">{formatPhone(row.participant.phone)}</p></div><div><p className="text-[10px] font-bold text-ink/35">입금자명</p><p className="mt-1 text-sm font-extrabold">{row.participant.depositor_name}</p></div><div><p className="text-[10px] font-bold text-ink/35">금액</p><p className="mt-1 text-sm font-extrabold">{formatWon(row.challenge.deposit_amount)}</p></div><ConfirmPaymentForm participationId={row.id} nickname={row.participant.nickname} phone={row.participant.phone} /></div>) : <p className="p-10 text-center text-sm font-medium text-ink/35">대기 중인 입금이 없습니다.</p>}
          </div>
        </section>

        <section className="mt-12"><h2 className="font-display text-2xl font-black">참가자 현황</h2><div className="mt-5 overflow-x-auto rounded-3xl border border-ink/10 bg-white"><table className="w-full min-w-[1180px] table-fixed text-left text-sm"><colgroup><col className="w-[14%]" /><col className="w-[18%]" /><col className="w-[8%]" /><col className="w-[7%]" /><col className="w-[9%]" /><col className="w-[27%]" /><col className="w-[17%]" /></colgroup><thead className="bg-cream/70 text-[11px] font-extrabold text-ink/45"><tr><th className="px-5 py-4">참가자</th><th className="px-5 py-4">개인 진행 기간</th><th className="px-5 py-4">아침 인증</th><th className="px-5 py-4">실패</th><th className="px-5 py-4">상태</th><th className="px-5 py-4">접속 정보</th><th className="px-5 py-4">관리</th></tr></thead><tbody>{participants.map((row) => <tr key={row.id} className="border-t border-ink/8 align-top"><td className="px-5 py-5"><p className="font-extrabold">{row.participant.nickname}</p><p className="mt-1 text-xs text-ink/40">{formatPhone(row.participant.phone)}</p><p className="mt-1 text-[10px] text-ink/30">코드 끝자리 {row.participant.recovery_code_hint ?? "—"}</p></td><td className="px-5 py-5"><p className="text-xs font-semibold">{formatKoreaDate(row.start_date)}–{formatKoreaDate(row.end_date)}</p><p className="mt-1 text-[10px] text-ink/35">{row.challenge.title}</p></td><td className="px-5 py-5 font-extrabold">{row.stats.successCount}회</td><td className="px-5 py-5 font-extrabold text-coral">{row.stats.failureCount}회</td><td className="px-5 py-5"><span className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${row.participant_status === "ACTIVE" ? "bg-lime" : row.participant_status === "FAILED" ? "bg-coral/10 text-coral" : "bg-ink/5"}`}>{statusLabels[row.participant_status]}</span></td><td className="min-w-0 px-5 py-5">{row.payment_status === "PAID" ? <ReissueAccessForm participantId={row.participant.id} nickname={row.participant.nickname} phone={row.participant.phone} /> : <span className="text-xs text-ink/30">입금 확인 전</span>}</td><td className="px-5 py-5"><ParticipantManagement key={row.participant.nickname} participantId={row.participant.id} nickname={row.participant.nickname} /></td></tr>)}</tbody></table></div></section>

        <RecentProofs proofs={proofs} today={koreaDate()} />
      </div>
    </main>
  );
}
