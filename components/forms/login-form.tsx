"use client";

import { useActionState, useState } from "react";
import { loginWithRecoveryCode } from "@/app/actions/auth";
import { FormField, inputClassName } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";

export function LoginForm() {
  const [state, action] = useActionState(loginWithRecoveryCode, {});
  const [phone, setPhone] = useState("");
  return (
    <form action={action} className="space-y-6">
      <FormField label="전화번호" name="phone" error={state.fieldErrors?.phone} hint="하이픈(-) 없이 숫자만 입력해 주세요.">
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          pattern="[0-9]*"
          maxLength={11}
          placeholder="01012345678"
          className={inputClassName}
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))}
        />
      </FormField>
      <FormField label="참가코드" name="code" error={state.fieldErrors?.code} hint="입금 확인 후 받은 영문·숫자 6자리 코드예요.">
        <input id="code" name="code" autoCapitalize="characters" autoComplete="one-time-code" maxLength={6} placeholder="M7K4Q2" className={`${inputClassName} uppercase tracking-[.25em]`} />
      </FormField>
      {state.message && <p role="alert" className="rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral">{state.message}</p>}
      <SubmitButton pendingText="확인하는 중...">로그인</SubmitButton>
    </form>
  );
}
