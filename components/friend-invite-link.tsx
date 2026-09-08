"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

export function FriendInviteLink({ inviteUrl }: { inviteUrl: string }) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState<string>();

  async function copyLink() {
    try {
      if (!navigator.clipboard) throw new Error("clipboard_unavailable");
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setMessage(undefined);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setMessage("링크를 길게 눌러 직접 복사해 주세요.");
    }
  }

  async function shareLink() {
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({
        title: "GOAT.MORNING 친구 추가",
        text: "같이 아침 챌린지 해요! 링크를 열어 친구로 추가해 주세요.",
        url: inviteUrl,
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setMessage("공유하지 못했어요. 링크 복사를 이용해 주세요.");
    }
  }

  return (
    <div>
      <div className="rounded-2xl border border-ink/10 bg-cream px-4 py-3 text-xs font-semibold leading-5 text-ink/55 break-all">
        {inviteUrl}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => void copyLink()} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-extrabold text-white transition hover:bg-coral">
          {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
          {copied ? "복사했어요" : "링크 복사"}
        </button>
        <button type="button" onClick={() => void shareLink()} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-lime text-sm font-extrabold text-ink transition hover:bg-lime/75">
          <Share2 className="size-4" aria-hidden="true" /> 공유하기
        </button>
      </div>
      {message && <p role="status" className="mt-3 text-center text-xs font-bold text-coral">{message}</p>}
    </div>
  );
}
