import { ArrowUpRight, Camera, ShieldCheck, UsersRound } from "lucide-react";
import Link from "next/link";

export function PhotoConsentFields() {
  return (
    <fieldset className="rounded-3xl border border-ink/10 bg-cream/55 p-4 sm:p-5">
      <legend className="sr-only">사진 이용 및 공개 동의</legend>
      <div className="flex items-start gap-3 px-1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-ink text-lime">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-lg font-black tracking-[-0.03em] text-ink">사진 이용 및 공개 동의</p>
          <p className="mt-1 text-xs font-medium leading-5 text-ink/50">이번 챌린지에서 앞으로 제출할 사진과 기록에 대해 한 번만 동의해요.</p>
        </div>
      </div>

      <p className="mt-4 rounded-2xl bg-lime/55 px-4 py-3 text-xs font-bold leading-5 text-ink/70">
        사진 파일은 2026년 10월 4일(한국시간)에 삭제됩니다. 동의를 거부할 수 있으나 사진 인증은 제출할 수 없어요.
      </p>

      <div className="mt-3 space-y-2.5">
        <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/8 bg-white p-4 transition hover:border-ink/20">
          <input type="checkbox" name="photoPrivacy" required className="mt-0.5 size-5 shrink-0 accent-coral" />
          <span className="text-xs font-semibold leading-5 text-ink/65">
            <span className="mb-1 flex items-center gap-1.5 font-extrabold text-ink"><Camera className="size-3.5 text-coral" aria-hidden="true" />[필수] 사진·인증 기록 수집 및 이용</span>
            인증 확인을 위해 사진·한 줄 기록·인증 날짜 및 촬영 방식을 이용합니다. 사진 외 인증 기록은 정산 및 이의제기 처리 완료 후 30일 이내 삭제하며, 법정 보관 의무가 있는 기록은 해당 기간 보관합니다.
          </span>
        </label>
        <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/8 bg-white p-4 transition hover:border-ink/20">
          <input type="checkbox" name="photoSharing" required className="mt-0.5 size-5 shrink-0 accent-coral" />
          <span className="text-xs font-semibold leading-5 text-ink/65">
            <span className="mb-1 flex items-center gap-1.5 font-extrabold text-ink"><UsersRound className="size-3.5 text-coral" aria-hidden="true" />[필수] 같은 챌린지 참가자에게 공개</span>
            공동 인증 확인과 응원을 위해 사진·닉네임·한 줄 기록·인증 날짜를 제공합니다. 사진은 2026년 10월 4일 삭제 전까지, 다른 인증 기록은 정산 및 이의제기 처리 완료 후 30일 이내까지 이용됩니다.
          </span>
        </label>
        <label className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-ink/8 bg-white p-4 transition hover:border-ink/20">
          <input type="checkbox" name="photoRules" required className="mt-0.5 size-5 shrink-0 accent-coral" />
          <span className="text-xs font-semibold leading-5 text-ink/65">
            <span className="mb-1 flex items-center gap-1.5 font-extrabold text-ink"><ShieldCheck className="size-3.5 text-coral" aria-hidden="true" />[필수] 사진 이용규칙 준수</span>
            제출·공유할 권한이 있는 사진만 올리고 타인의 권리를 침해하지 않겠습니다.
          </span>
        </label>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <Link href="/privacy" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 text-xs font-extrabold text-ink transition hover:bg-ink hover:text-white">
          개인정보 처리방침 <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
        <Link href="/photo-rules" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-between rounded-2xl border border-ink/10 bg-white px-4 text-xs font-extrabold text-ink transition hover:bg-ink hover:text-white">
          사진 이용규칙 <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </Link>
      </div>
    </fieldset>
  );
}
