import type { Metadata } from "next";
import { Clock3 } from "lucide-react";
import { ProofForm } from "@/components/forms/proof-form";
import { requireParticipant } from "@/lib/auth/participant";
import { isWithinProofWindow, proofDateForWindow } from "@/lib/date";
import { getMyDashboard } from "@/lib/data";

export const metadata: Metadata = { title: "오늘 인증" };

export default async function NewProofPage() {
  const participant = await requireParticipant();
  const dashboard = await getMyDashboard(participant.id, participant.challengeId);
  const proofDate = proofDateForWindow(dashboard.challenge.proof_start_time, dashboard.challenge.proof_end_time);
  const todayProof = dashboard.proofs.find((proof) => proof.proof_date === proofDate);
  const outsidePeriod = proofDate < dashboard.challenge.start_date || proofDate > dashboard.challenge.end_date;
  const outsideWindow = !isWithinProofWindow(dashboard.challenge.proof_start_time, dashboard.challenge.proof_end_time);
  const disabledReason = todayProof
    ? "오늘 인증은 이미 완료했어요. 내일 다시 만나요!"
    : participant.participantStatus !== "ACTIVE"
      ? "현재 진행 중인 참가자만 인증할 수 있어요."
      : outsidePeriod
        ? "지금은 챌린지 기간이 아니에요."
        : outsideWindow
          ? `인증은 ${dashboard.challenge.proof_start_time.slice(0, 5)}–${dashboard.challenge.proof_end_time.slice(0, 5)} 사이에 할 수 있어요.`
          : undefined;
  return (
    <main className="mx-auto max-w-xl px-5 py-8 sm:px-8 sm:py-12">
      <p className="text-xs font-extrabold uppercase tracking-[.16em] text-coral">Today&apos;s proof</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em]">오늘도 약속 완료.</h1>
      <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-ink/55"><Clock3 className="size-3.5 text-coral" /> 인증 시간 {dashboard.challenge.proof_start_time.slice(0, 5)}–{dashboard.challenge.proof_end_time.slice(0, 5)}</div>
      <section className="mt-7 rounded-[2rem] border border-ink/10 bg-white p-5 shadow-sm sm:p-7"><ProofForm disabledReason={disabledReason} /></section>
      <p className="mt-5 text-center text-[11px] font-medium leading-5 text-ink/35">사진에는 다른 사람의 개인정보가 노출되지 않도록 확인해 주세요.</p>
    </main>
  );
}
