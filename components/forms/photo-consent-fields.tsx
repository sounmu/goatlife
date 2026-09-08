"use client";

import { useState } from "react";
import Link from "next/link";
import { ConsentRow } from "@/components/forms/consent-row";

export function PhotoConsentFields() {
  const [accepted, setAccepted] = useState(false);

  return (
    <fieldset className="min-w-0">
      <legend className="sr-only">사진 이용 및 공개 동의</legend>
      <input type="hidden" name="photoSharing" value="on" disabled={!accepted} />
      <input type="hidden" name="photoRules" value="on" disabled={!accepted} />
      <ConsentRow name="photoPrivacy" title="사진 수집·공개 및 이용규칙" checked={accepted} onChange={(event) => setAccepted(event.target.checked)}>
        <p className="mb-1 font-bold text-ink">사진·인증 기록 수집·이용</p>
        인증 확인을 위해 사진·선택적으로 입력한 한 줄 기록·인증 날짜 및 촬영 방식을 이용합니다. 사진 외 인증 기록은 정산 및 이의제기 처리 완료 후 30일 이내 삭제하며, 법정 보관 의무가 있는 기록은 해당 기간 보관합니다.
        <p className="mt-2">이번 챌린지에서 앞으로 제출할 사진과 기록에 대해 한 번만 동의해요. 사진 파일은 2026년 10월 4일(한국시간)에 삭제됩니다. 동의를 거부할 수 있으나 사진 인증은 제출할 수 없어요.</p>
        <p className="mb-1 mt-3 font-bold text-ink">같은 챌린지 참가자에게 공개</p>
        공동 인증 확인과 응원을 위해 사진·닉네임·선택적으로 입력한 한 줄 기록·인증 날짜를 제공합니다. 사진은 2026년 10월 4일 삭제 전까지, 다른 인증 기록은 정산 및 이의제기 처리 완료 후 30일 이내까지 이용됩니다.
        <p className="mb-1 mt-3 font-bold text-ink">사진 이용규칙 준수</p>
        제출·공유할 권한이 있는 사진만 올리고 타인의 권리를 침해하지 않겠습니다.
      </ConsentRow>
      <div className="mt-2 flex flex-wrap items-center gap-x-4 border-t border-ink/8 pt-1">
        <Link href="/privacy" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-[11px] font-medium text-ink/45 underline decoration-ink/20 underline-offset-4 hover:text-ink">
          개인정보 처리방침<span className="sr-only"> (새 탭)</span>
        </Link>
        <Link href="/photo-rules" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center text-[11px] font-medium text-ink/45 underline decoration-ink/20 underline-offset-4 hover:text-ink">
          사진 이용규칙<span className="sr-only"> (새 탭)</span>
        </Link>
      </div>
    </fieldset>
  );
}
