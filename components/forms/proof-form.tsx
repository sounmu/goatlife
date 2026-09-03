"use client";

import Image from "next/image";
import { Camera, ImagePlus, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { createProof } from "@/app/actions/proof";
import { SubmitButton } from "@/components/submit-button";
import { compressImageToWebp } from "@/lib/client-image";

export function ProofForm({ disabledReason }: { disabledReason?: string }) {
  const [state, action] = useActionState(createProof, {});
  const [preview, setPreview] = useState<string>();
  const [count, setCount] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionError, setCompressionError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function clearImage() {
    if (preview) URL.revokeObjectURL(preview);
    if (fileRef.current) fileRef.current.value = "";
    setPreview(undefined);
    setCompressionError(undefined);
  }

  async function selectImage(source?: File) {
    if (!source) return clearImage();
    setIsCompressing(true);
    setCompressionError(undefined);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(undefined);
    }
    try {
      const compressed = await compressImageToWebp(source);
      const transfer = new DataTransfer();
      transfer.items.add(compressed.file);
      if (fileRef.current) fileRef.current.files = transfer.files;
      setPreview(URL.createObjectURL(compressed.file));
    } catch (error) {
      if (fileRef.current) fileRef.current.value = "";
      setCompressionError(error instanceof Error ? error.message : "사진 압축에 실패했어요.");
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <form action={action} className="space-y-5" onSubmit={(event) => { if (isCompressing) event.preventDefault(); }}>
      <div>
        <p className="mb-2 text-sm font-extrabold">인증 사진</p>
        <input
          ref={fileRef}
          id="image"
          name="image"
          type="file"
          accept="image/*"
          capture="environment"
          disabled={Boolean(disabledReason) || isCompressing}
          className="sr-only"
          onChange={(event) => void selectImage(event.target.files?.[0])}
        />
        {preview ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink/5">
            <Image src={preview} alt="선택한 인증 사진 미리보기" fill unoptimized className="object-cover" />
            <button type="button" onClick={clearImage} aria-label="선택한 사진 지우기" className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"><X className="size-4" /></button>
          </div>
        ) : (
          <label htmlFor="image" className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink/15 bg-cream/55 text-center transition hover:border-coral hover:bg-coral/5">
            <span className="flex size-14 items-center justify-center rounded-full bg-white text-coral shadow-sm"><ImagePlus className="size-6" /></span>
            <span className="mt-4 text-sm font-extrabold">사진 선택 또는 촬영</span>
            <span className="mt-1 text-xs font-medium text-ink/40">선택 후 1MB 이하 WebP로 자동 압축</span>
          </label>
        )}
        {compressionError && <p className="mt-2 text-xs font-semibold text-coral">{compressionError}</p>}
        {state.fieldErrors?.image?.[0] && <p className="mt-2 text-xs font-semibold text-coral">{state.fieldErrors.image[0]}</p>}
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between"><label htmlFor="content" className="text-sm font-extrabold">오늘의 한마디</label><span className="text-xs font-semibold text-ink/35">{count}/140</span></div>
        <textarea id="content" name="content" maxLength={140} disabled={Boolean(disabledReason)} onChange={(event) => setCount(event.target.value.length)} placeholder="오늘 아침, 어떤 마음으로 시작했나요?" className="min-h-32 w-full resize-none rounded-2xl border border-ink/12 bg-white p-4 text-base font-semibold outline-none transition placeholder:text-ink/25 focus:border-ink focus:ring-4 focus:ring-lime/35" />
        {state.fieldErrors?.content?.[0] && <p className="mt-2 text-xs font-semibold text-coral">{state.fieldErrors.content[0]}</p>}
      </div>
      {(disabledReason || state.message) && <p role="alert" className="rounded-2xl bg-coral/10 p-4 text-sm font-bold leading-6 text-coral">{disabledReason ?? state.message}</p>}
      <SubmitButton pendingText="사진을 올리는 중..." disabled={Boolean(disabledReason) || isCompressing} className={disabledReason ? "pointer-events-none opacity-40" : ""}><Camera className="size-4" /> 오늘 인증 완료하기</SubmitButton>
    </form>
  );
}
