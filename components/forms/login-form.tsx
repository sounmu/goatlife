"use client";

import { useActionState } from "react";
import { loginWithRecoveryCode } from "@/app/actions/auth";
import { FormField, inputClassName } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm() {
  const [state, action] = useActionState(loginWithRecoveryCode, {});
  return (
    <form action={action} className="space-y-6">
      <FormField label="전화번호" name="phone" error={state.fieldErrors?.phone}>
        <input id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="010-1234-5678" className={inputClassName} />
      </FormField>
      <FormField label="참가코드" name="code" error={state.fieldErrors?.code} hint="입금 확인 후 받은 영문·숫자 6자리 코드예요.">
        <input id="code" name="code" autoCapitalize="characters" autoComplete="one-time-code" maxLength={6} placeholder="M7K4Q2" className={`${inputClassName} uppercase tracking-[.25em]`} />
      </FormField>
      {state.message && <p role="alert" className="rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral">{state.message}</p>}
      <SubmitButton pendingText="확인하는 중...">로그인</SubmitButton>
    </form>
  );
}
