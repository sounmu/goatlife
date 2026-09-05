import { PhotoConsentForm } from "@/components/forms/photo-consent-form";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { hasPhotoConsent } from "@/lib/photo-consent";
import type { Metadata } from "next";
import { Clock3, ShieldCheck, Sparkles } from "lucide-react";
import { ProofForm } from "@/components/forms/proof-form";
import { requireParticipant } from "@/lib/auth/participant";
import { formatKoreaDate, isWithinProofWindow, koreaDate, proofDateForWindow } from "@/lib/date";
import { getDailyRandomMission, getMyDashboard } from "@/lib/data";

export const metadata: Metadata = { title: "오늘 인증" };

export default async function NewProofPage() {
  const participant = await requireParticipant();
  const { data: consent, error: consentError } = await getSupabaseAdmin()
    .from("challenge_participants")
    .select("photo_consent_version, photo_consent_at")
    .eq("id", participant.challengeParticipantId)
    .eq("participant_id", participant.id)
    .single();
  if (consentError) throw new Error("사진 동의 정보를 확인하지 못했습니다.");
  if (!hasPhotoConsent(consent)) return <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8 sm:py-12">
    <div className="text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ink text-lime"><ShieldCheck className="size-6" aria-hidden="true" /></div>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[.16em] text-coral">One-time consent</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em] text-ink">인증 전에, 한 번만 확인해 주세요.</h1>
      <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-6 text-ink/50">이번 챌린지의 사진 이용과 공개에 동의하면 다음 인증부터는 다시 묻지 않아요. 기존 사진에 대한 동의를 소급해서 받는 것은 아니에요.</p>
    </div>
    <section className="mt-8 rounded-[2rem] border border-ink/10 bg-white p-5 shadow-sm sm:p-7">
      <PhotoConsentForm />
    </section>
  </main>;
  const randomMissionDate = koreaDate();
  const [dashboard, randomMission] = await Promise.all([
    getMyDashboard(participant.id, participant.challengeId),
    getDailyRandomMission(participant.challengeId, randomMissionDate),
  ]);
  const morningProofDate = proofDateForWindow(dashboard.challenge.proof_start_time, dashboard.challenge.proof_end_time);
  const morningProof = dashboard.proofs.find((proof) => proof.proof_date === morningProofDate && proof.proof_type === "MORNING");
  const randomProof = dashboard.proofs.find((proof) => proof.proof_date === randomMissionDate && proof.proof_type === "RANDOM");
  const outsideMorningPeriod = morningProofDate < dashboard.challenge.start_date || morningProofDate > dashboard.challenge.end_date;
  const outsideRandomPeriod = randomMissionDate < dashboard.challenge.start_date || randomMissionDate > dashboard.challenge.end_date;
  const outsideWindow = !isWithinProofWindow(dashboard.challenge.proof_start_time, dashboard.challenge.proof_end_time);
  const inactiveReason = participant.participantStatus !== "ACTIVE" ? "현재 진행 중인 참가자만 인증할 수 있어요." : undefined;
  const morningDisabledReason = morningProof
    ? "오늘 아침 인증은 이미 완료했어요. 내일 다시 만나요!"
    : inactiveReason
      ?? (outsideMorningPeriod
        ? `나의 챌린지 기간은 ${formatKoreaDate(dashboard.challenge.start_date)}부터 ${formatKoreaDate(dashboard.challenge.end_date)}까지예요.`
        : outsideWindow
          ? `아침 인증은 ${dashboard.challenge.proof_start_time.slice(0, 5)}–${dashboard.challenge.proof_end_time.slice(0, 5)} 사이에 할 수 있어요.`
          : undefined);
  const randomDisabledReason = randomProof
    ? "오늘의 랜덤 미션은 이미 완료했어요!"
    : inactiveReason
      ?? (outsideRandomPeriod
        ? `랜덤 미션은 나의 챌린지 기간인 ${formatKoreaDate(dashboard.challenge.start_date)}부터 시작돼요.`
        : !randomMission
          ? "오늘의 랜덤 미션이 아직 준비되지 않았어요."
          : undefined);

  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-12">
      <p className="text-xs font-extrabold uppercase tracking-[.16em] text-coral">Today&apos;s missions</p>
      <h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em]">오늘의 두 가지 도전</h1>
      <p className="mt-3 text-sm font-medium leading-6 text-ink/50">아침 루틴을 인증하고, 하루 동안 랜덤 미션에도 도전해 보세요.</p>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
        <div className="border-b border-ink/8 bg-ink px-5 py-5 text-white sm:px-7">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-lime">Required · Miracle morning</p><h2 className="mt-1 font-display text-2xl font-black">미라클 모닝 미션</h2></div>
            <Clock3 className="size-6 text-coral" />
          </div>
          <p className="mt-3 text-xs font-semibold text-white/55">{dashboard.challenge.proof_start_time.slice(0, 5)}–{dashboard.challenge.proof_end_time.slice(0, 5)} · 카메라 즉시 촬영만 가능</p>
        </div>
        <div className="p-5 sm:p-7"><ProofForm proofType="MORNING" disabledReason={morningDisabledReason} /></div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
        <div className="border-b border-ink/8 bg-lime px-5 py-5 sm:px-7">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-ink/45">Bonus · Daily random</p><h2 className="mt-1 font-display text-2xl font-black">{randomMission?.title ?? "오늘의 랜덤 미션"}</h2></div>
            <Sparkles className="size-6 text-coral" />
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-ink/65">{randomMission?.description ?? "매일 새로운 미션이 공개돼요."}</p>
          <p className="mt-2 text-[11px] font-bold text-ink/40">하루 종일 · 카메라 촬영 또는 앨범 업로드 가능</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[11px] font-extrabold text-white"><Sparkles className="size-3.5 text-coral" /> 완료할수록 커피 추첨 당첨 확률 UP</p>
        </div>
        <div className="p-5 sm:p-7"><ProofForm proofType="RANDOM" missionId={randomMission?.id} disabledReason={randomDisabledReason} /></div>
      </section>

      <p className="mt-5 text-center text-[11px] font-medium leading-5 text-ink/35">사진에는 다른 사람의 개인정보가 노출되지 않도록 확인해 주세요.</p>
    </main>
  );
}
