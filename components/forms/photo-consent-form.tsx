"use client";

import { useActionState } from "react";
import { acceptPhotoConsent } from "@/app/actions/photo-consent";
import { PhotoConsentFields } from "@/components/forms/photo-consent-fields";
import { SubmitButton } from "@/components/submit-button";

export function PhotoConsentForm() {
  const [state, action] = useActionState(acceptPhotoConsent, {});
  return <form action={action} className="mt-6 space-y-5">
    <PhotoConsentFields />
    {state.message && <p role="alert" className="text-sm text-coral">{state.message}</p>}
    <SubmitButton pendingText="동의를 저장하는 중...">동의하고 인증 시작하기</SubmitButton>
  </form>;
}
