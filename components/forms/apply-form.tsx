"use client";

import { useActionState, useState } from "react";
import { applyForChallenge } from "@/app/actions/apply";
import { FormField, inputClassName } from "@/components/form-field";
import { ConsentRow } from "@/components/forms/consent-row";
import { PhotoConsentFields } from "@/components/forms/photo-consent-fields";
import { SubmitButton } from "@/components/submit-button";

export function ApplyForm({ challengeId }: { challengeId: string }) {
  const [state, action] = useActionState(applyForChallenge, {});
  const [values, setValues] = useState({
    nickname: "",
    phone: "",
    depositorName: "",
    privacy: false,
  });

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="challengeId" value={challengeId} />
      <FormField label="닉네임" name="nickname" error={state.fieldErrors?.nickname} hint="피드에는 닉네임만 공개돼요.">
        <input id="nickname" name="nickname" autoComplete="nickname" maxLength={20} placeholder="길동" className={inputClassName} value={values.nickname} onChange={(event) => setValues((current) => ({ ...current, nickname: event.target.value }))} />
      </FormField>
      <FormField label="전화번호" name="phone" error={state.fieldErrors?.phone} hint="로그인 복구와 운영 연락에만 사용해요.">
        <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="010-1234-5678" className={inputClassName} value={values.phone} onChange={(event) => setValues((current) => ({ ...current, phone: event.target.value }))} />
      </FormField>
      <FormField label="입금자명" name="depositorName" error={state.fieldErrors?.depositorName} hint="은행 앱에 표시되는 이름과 같아야 해요.">
        <input id="depositorName" name="depositorName" autoComplete="name" maxLength={30} placeholder="홍길동" className={inputClassName} value={values.depositorName} onChange={(event) => setValues((current) => ({ ...current, depositorName: event.target.value }))} />
      </FormField>
      <div className="border-t border-ink/10 pt-3">
        <ConsentRow name="privacy" title="참가 정보 수집·이용" checked={values.privacy} onChange={(event) => setValues((current) => ({ ...current, privacy: event.target.checked }))}>
          참가 관리·로그인 복구·운영 연락·입금 확인을 위해 닉네임, 전화번호, 입금자명을 이용합니다. 정산 및 이의제기 처리 완료 후 30일 이내 삭제하며, 법정 보관 의무가 있는 기록은 해당 기간 보관합니다. 동의를 거부할 수 있으나 참가 신청이 어렵습니다.
        </ConsentRow>
        {!values.privacy && state.fieldErrors?.privacy?.[0] && <p role="alert" className="text-xs font-semibold text-coral">{state.fieldErrors.privacy[0]}</p>}
        <PhotoConsentFields />
      </div>
      {["photoPrivacy", "photoSharing", "photoRules"].map((name) => state.fieldErrors?.[name]?.[0] ? <p key={name} role="alert" className="text-xs text-coral">{state.fieldErrors[name][0]}</p> : null)}
      {state.message && <p role="alert" className="rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral">{state.message}</p>}
      <SubmitButton pendingText="신청을 저장하는 중...">참가 신청하기</SubmitButton>
    </form>
  );
}
