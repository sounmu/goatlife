import type { Metadata } from "next";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProofReceipt } from "@/components/proof-receipt";
import { requireParticipant } from "@/lib/auth/participant";
import { getProofReceipt } from "@/lib/data";

export const metadata: Metadata = { title: "인증 완료" };

export default async function ProofCompletePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, participant] = await Promise.all([params, requireParticipant()]);
  const proof = await getProofReceipt(participant.id, participant.challengeId, id);
  if (!proof) notFound();

  return (
    <main className="mx-auto max-w-lg px-5 py-8 sm:px-8 sm:py-12">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-8 text-coral" aria-hidden="true" />
        <p className="mt-3 text-xs font-extrabold uppercase tracking-[.16em] text-coral">Proof complete</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em]">오늘도 해냈어요!</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-ink/50">아래 인증 화면을 이미지로 저장해 간직하거나 친구에게 공유해 보세요.</p>
      </div>
      <div className="mt-8"><ProofReceipt proof={proof} /></div>
      <Link href="/feed" className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white text-sm font-extrabold text-ink transition hover:border-ink/25">피드에서 확인하기 <ArrowRight className="size-4" aria-hidden="true" /></Link>
    </main>
  );
}
