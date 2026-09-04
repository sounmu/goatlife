"use client";

import { Check, Copy, KeyRound, MessageSquareText, WalletCards } from "lucide-react";
import { useActionState, useState } from "react";
import { confirmPayment, reissueAccess } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { formatPhone } from "@/lib/utils";

interface ParticipantContact {
  nickname: string;
  phone: string;
}

function createParticipantMessage(nickname: string, link: string, recoveryCode: string) {
  return `${nickname}님, GOAT.MORNING 참가 안내드립니다.

아래 링크를 누르면 바로 로그인할 수 있어요.
${link}

링크로 접속이 어려우면 로그인 화면에서 전화번호와 참가코드를 입력해 주세요.
참가코드: ${recoveryCode}`;
}

function IssuedAccessDetails({ link, recoveryCode, nickname, phone }: ParticipantContact & { link: string; recoveryCode: string }) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState(() => createParticipantMessage(nickname, link, recoveryCode));
  const smsRecipient = phone.replace(/\D/g, "");
  const messageId = `access-message-${recoveryCode}`;

  async function copyMessage() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
  }

  return (
    <div className="mt-3 min-w-0 rounded-2xl bg-lime/35 p-3 text-xs text-ink">
      <p className="font-extrabold">참가자에게 전달할 정보</p>
      <p className="mt-1 font-semibold text-ink/50">받는 사람 {formatPhone(phone)}</p>
      <label htmlFor={messageId} className="mt-3 block font-bold text-ink/55">전달 문구 편집</label>
      <textarea
        id={messageId}
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          setCopied(false);
        }}
        rows={9}
        className="mt-1.5 w-full resize-y rounded-xl border border-ink/10 bg-white/85 px-3 py-2 text-[11px] font-medium leading-5 outline-none focus:border-ink focus:ring-4 focus:ring-white/60"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <button type="button" onClick={copyMessage} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-3 font-extrabold text-white hover:bg-coral">
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "복사됨" : "한 번에 복사"}
        </button>
        <a href={`sms:${smsRecipient}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 font-extrabold text-ink hover:bg-cream">
          <MessageSquareText className="size-3.5" /> 번호로 문자 열기
        </a>
      </div>
      <p className="mt-2 text-[10px] font-semibold leading-4 text-ink/40">복사한 뒤 문자로 열면 받는 사람 번호가 자동으로 입력됩니다.</p>
    </div>
  );
}

function IssuedAccess({ data, nickname, phone }: ParticipantContact & { data?: Record<string, string> }) {
  if (!data?.link || !data.recoveryCode) return null;
  return <IssuedAccessDetails key={`${data.link}:${data.recoveryCode}`} link={data.link} recoveryCode={data.recoveryCode} nickname={nickname} phone={phone} />;
}

export function ConfirmPaymentForm({ participationId, nickname, phone }: ParticipantContact & { participationId: string }) {
  const [state, action] = useActionState(confirmPayment, {});
  return (
    <form action={action} className="min-w-0">
      <input type="hidden" name="participationId" value={participationId} />
      {!state.ok && <SubmitButton className="h-10 rounded-full px-4 text-xs" pendingText="처리 중..."><WalletCards className="size-3.5" /> 입금 확인</SubmitButton>}
      {state.message && <p className={`mt-2 text-xs font-semibold leading-5 ${state.ok ? "text-ink/60" : "text-coral"}`}>{state.message}</p>}
      <IssuedAccess data={state.data} nickname={nickname} phone={phone} />
    </form>
  );
}

export function ReissueAccessForm({ participantId, nickname, phone }: ParticipantContact & { participantId: string }) {
  const [state, action] = useActionState(reissueAccess, {});
  return (
    <form action={action} className="min-w-0">
      <input type="hidden" name="participantId" value={participantId} />
      <SubmitButton className="h-10 rounded-full border border-ink/10 bg-white px-4 text-xs text-ink hover:bg-cream" pendingText="재발급 중..."><KeyRound className="size-3.5" /> 접속 정보 재발급</SubmitButton>
      {state.message && <p className={`mt-2 text-xs font-semibold leading-5 ${state.ok ? "text-ink/60" : "text-coral"}`}>{state.message}</p>}
      <IssuedAccess data={state.data} nickname={nickname} phone={phone} />
    </form>
  );
}
