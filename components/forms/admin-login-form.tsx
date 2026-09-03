"use client";

import { useActionState } from "react";
import { adminLogin } from "@/app/actions/auth";
import { FormField, inputClassName } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";

export function AdminLoginForm() {
  const [state, action] = useActionState(adminLogin, {});
  return (
    <form action={action} className="space-y-5">
      <FormField label="관리자 이메일" name="email" error={state.fieldErrors?.email}>
        <input id="email" name="email" type="email" autoComplete="username" className={inputClassName} />
      </FormField>
      <FormField label="비밀번호" name="password" error={state.fieldErrors?.password}>
        <input id="password" name="password" type="password" autoComplete="current-password" className={inputClassName} />
      </FormField>
      {state.message && <p role="alert" className="rounded-2xl bg-coral/10 p-4 text-sm font-bold text-coral">{state.message}</p>}
      <SubmitButton pendingText="로그인 중...">관리자 로그인</SubmitButton>
    </form>
  );
}
