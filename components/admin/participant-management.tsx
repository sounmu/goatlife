"use client";

import { Pencil, Trash2, X } from "lucide-react";
import { useActionState, useState } from "react";
import { deleteParticipantData, renameParticipant } from "@/app/actions/admin";
import { SubmitButton } from "@/components/submit-button";

export function ParticipantManagement({ participantId, nickname }: { participantId: string; nickname: string }) {
  const [mode, setMode] = useState<"idle" | "rename" | "delete">("idle");
  const [nicknameValue, setNicknameValue] = useState(nickname);
  const [confirmation, setConfirmation] = useState("");
  const [renameState, renameAction] = useActionState(renameParticipant, {});
  const [deleteState, deleteAction] = useActionState(deleteParticipantData, {});

  if (mode === "rename") {
    return (
      <form action={renameAction} className="min-w-56 space-y-2">
        <input type="hidden" name="participantId" value={participantId} />
        <label htmlFor={`nickname-${participantId}`} className="sr-only">변경할 참가자 이름</label>
        <input
          id={`nickname-${participantId}`}
          name="nickname"
          value={nicknameValue}
          onChange={(event) => setNicknameValue(event.target.value)}
          maxLength={20}
          autoComplete="off"
          className="h-10 w-full rounded-xl border border-ink/15 bg-white px-3 text-xs font-bold outline-none focus:border-ink focus:ring-4 focus:ring-lime/30"
        />
        {renameState.fieldErrors?.nickname?.[0] && <p role="alert" className="text-[10px] font-semibold text-coral">{renameState.fieldErrors.nickname[0]}</p>}
        {renameState.message && <p role="status" className={`text-[10px] font-semibold ${renameState.ok ? "text-ink/50" : "text-coral"}`}>{renameState.message}</p>}
        <div className="flex gap-2">
          <SubmitButton className="h-9 rounded-xl px-3 text-xs" pendingText="저장 중...">저장</SubmitButton>
          <button type="button" onClick={() => setMode("idle")} className="inline-flex h-9 items-center justify-center rounded-xl border border-ink/10 px-3 text-xs font-bold text-ink/55"><X className="mr-1 size-3" />취소</button>
        </div>
      </form>
    );
  }

  if (mode === "delete") {
    const canDelete = confirmation.trim() === nickname;
    return (
      <form action={deleteAction} className="min-w-64 rounded-2xl bg-coral/8 p-3">
        <input type="hidden" name="participantId" value={participantId} />
        <p className="text-[10px] font-bold leading-4 text-coral">인증 사진과 참가 기록을 모두 삭제하며 복구할 수 없습니다.</p>
        <label htmlFor={`delete-${participantId}`} className="mt-2 block text-[10px] font-semibold text-ink/45">확인을 위해 <strong className="text-ink">{nickname}</strong> 입력</label>
        <input
          id={`delete-${participantId}`}
          name="confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
          className="mt-1 h-9 w-full rounded-xl border border-coral/20 bg-white px-3 text-xs font-bold outline-none focus:border-coral focus:ring-4 focus:ring-coral/10"
        />
        {deleteState.fieldErrors?.confirmation?.[0] && <p role="alert" className="mt-1 text-[10px] font-semibold text-coral">{deleteState.fieldErrors.confirmation[0]}</p>}
        {deleteState.message && !deleteState.ok && <p role="alert" className="mt-1 text-[10px] font-semibold text-coral">{deleteState.message}</p>}
        <div className="mt-2 flex gap-2">
          <SubmitButton disabled={!canDelete} className="h-9 rounded-xl bg-coral px-3 text-xs hover:bg-coral/85" pendingText="삭제 중..."><Trash2 className="size-3" />영구 삭제</SubmitButton>
          <button type="button" onClick={() => { setMode("idle"); setConfirmation(""); }} className="inline-flex h-9 items-center justify-center rounded-xl border border-ink/10 bg-white px-3 text-xs font-bold text-ink/55">취소</button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex min-w-44 flex-col gap-2">
      <button type="button" onClick={() => setMode("rename")} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white px-3 text-xs font-extrabold hover:bg-lime"><Pencil className="size-3" />이름 변경</button>
      <button type="button" onClick={() => setMode("delete")} className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-extrabold text-coral hover:bg-coral/8"><Trash2 className="size-3" />데이터 삭제</button>
    </div>
  );
}
