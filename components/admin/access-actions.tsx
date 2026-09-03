"use client";

import { Check, Copy, KeyRound, WalletCards } from "lucide-react";
import { useActionState, useState } from "react";
import { confirmPayment, reissueAccess } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";

function IssuedAccess({ data }: { data?: Record<string, string> }) {
  const [copied, setCopied] = useState(false);
  if (!data?.link || !data.recoveryCode) return null;
  const value = `참가 링크: ${data.link}\n참가코드: ${data.recoveryCode}`;
  return (
    <div className="mt-3 rounded-2xl bg-lime/35 p-3 text-xs text-ink">
      <p className="font-extrabold">참가자에게 전달할 정보</p>
      <p className="mt-2 break-all font-medium leading-5">{data.link}</p>
      <p className="mt-1 font-display text-lg font-black tracking-[.15em]">{data.recoveryCode}</p>
      <button type="button" onClick={async () => { await navigator.clipboard.writeText(value); setCopied(true); }} className="mt-2 inline-flex items-center gap-1.5 font-extrabold text-ink/60">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? "복사됨" : "한 번에 복사"}</button>
    </div>
  );
}

export function ConfirmPaymentForm({ participationId }: { participationId: string }) {
  const [state, action] = useActionState(confirmPayment, {});
  return (
    <form action={action} className="min-w-48">
      <input type="hidden" name="participationId" value={participationId} />
      {!state.ok && <SubmitButton className="h-10 rounded-full px-4 text-xs" pendingText="처리 중..."><WalletCards className="size-3.5" /> 입금 확인</SubmitButton>}
      {state.message && <p className={`mt-2 text-xs font-semibold leading-5 ${state.ok ? "text-ink/60" : "text-coral"}`}>{state.message}</p>}
      <IssuedAccess data={state.data} />
    </form>
  );
}

export function ReissueAccessForm({ participantId }: { participantId: string }) {
  const [state, action] = useActionState(reissueAccess, {});
  return (
    <form action={action} className="min-w-48">
      <input type="hidden" name="participantId" value={participantId} />
      <SubmitButton className="h-10 rounded-full border border-ink/10 bg-white px-4 text-xs text-ink hover:bg-cream" pendingText="재발급 중..."><KeyRound className="size-3.5" /> 접속 정보 재발급</SubmitButton>
      {state.message && <p className={`mt-2 text-xs font-semibold leading-5 ${state.ok ? "text-ink/60" : "text-coral"}`}>{state.message}</p>}
      <IssuedAccess data={state.data} />
    </form>
  );
}
