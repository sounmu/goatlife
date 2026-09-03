"use client";

import { useActionState } from "react";
import { applyForChallenge } from "@/app/actions/apply";
import { FormField, inputClassName } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";

export function ApplyForm({ challengeId }: { challengeId: string }) {
  const [state, action] = useActionState(applyForChallenge, {});
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="challengeId" value={challengeId} />
      <FormField label="닉네임" name="nickname" error={state.fieldErrors?.nickname} hint="피드에는 닉네임만 공개돼요.">
        <input id="nickname" name="nickname" autoComplete="nickname" maxLength={20} placeholder="예: 문수" className={inputClassName} />
      </FormField>
      <FormField label="전화번호" name="phone" error={state.fieldErrors?.phone} hint="로그인 복구와 운영 연락에만 사용해요.">
        <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="010-1234-5678" className={inputClassName} />
      </FormField>
      <FormField label="입금자명" name="depositorName" error={state.fieldErrors?.depositorName} hint="은행 앱에 표시되는 이름과 같아야 해요.">
        <input id="depositorName" name="depositorName" autoComplete="name" maxLength={30} placeholder="예: 강문수" className={inputClassName} />
      </FormField>
      <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-cream/80 p-4">
        <input name="privacy" type="checkbox" className="mt-0.5 size-4 accent-coral" />
        <span className="text-xs font-semibold leading-5 text-ink/60">참가 운영을 위한 개인정보(닉네임, 전화번호, 입금자명) 수집 및 이용에 동의합니다.</span>
      </label>
      {state.fieldErrors?.privacy?.[0] && <p className="-mt-3 text-xs font-semibold text-coral">{state.fieldErrors.privacy[0]}</p>}
      {state.message && <p role="alert" className="rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral">{state.message}</p>}
      <SubmitButton pendingText="신청을 저장하는 중...">참가 신청하기</SubmitButton>
    </form>
  );
}
