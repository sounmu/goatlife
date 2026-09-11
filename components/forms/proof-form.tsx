"use client";

import Image from "next/image";
import { Camera, Download, ImagePlus, X } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { createProof } from "@/app/actions/proof";
import { SubmitButton } from "@/components/submit-button";
import { compressImageForUpload } from "@/lib/client-image";
import { cameraErrorMessage, openCamera } from "@/lib/client-camera";
import type { ProofType } from "@/lib/domain";

interface ProofFormProps {
  proofType: ProofType;
  disabledReason?: string;
  missionId?: string;
}

export function ProofForm({ proofType, disabledReason, missionId }: ProofFormProps) {
  const [state, action] = useActionState(createProof, {});
  const [preview, setPreview] = useState<string>();
  const [count, setCount] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [imageSource, setImageSource] = useState<"CAMERA" | "UPLOAD">("CAMERA");
  const [imageError, setImageError] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraRequestRef = useRef(0);
  const cameraPendingRef = useRef(false);
  const isMorning = proofType === "MORNING";

  useEffect(() => () => {
    cameraRequestRef.current += 1;
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    if (!cameraOpen || !videoRef.current || !streamRef.current) return;
    videoRef.current.srcObject = streamRef.current;
    const video = videoRef.current;
    let active = true;
    void video.play().catch(() => {
      if (!active) return;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCameraOpen(false);
      setImageError("카메라 미리보기를 재생하지 못했어요. 다시 촬영 버튼을 눌러 주세요.");
    });
    return () => { active = false; };
  }, [cameraOpen]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  function clearImage() {
    stopCamera();
    if (preview) URL.revokeObjectURL(preview);
    if (fileRef.current) fileRef.current.value = "";
    if (uploadRef.current) uploadRef.current.value = "";
    setPreview(undefined);
    setImageError(undefined);
  }

  function downloadImage() {
    if (!preview) return;
    const link = document.createElement("a");
    link.href = preview;
    const extension = fileRef.current?.files?.[0]?.type === "image/jpeg" ? "jpg" : "webp";
    link.download = `goat-morning-${proofType.toLowerCase()}-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function prepareImage(source: File, sourceType: "CAMERA" | "UPLOAD") {
    setIsCompressing(true);
    setImageError(undefined);
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(undefined);
    }
    try {
      const compressed = await compressImageForUpload(source);
      const transfer = new DataTransfer();
      transfer.items.add(compressed.file);
      if (fileRef.current) fileRef.current.files = transfer.files;
      setImageSource(sourceType);
      setPreview(URL.createObjectURL(compressed.file));
    } catch (error) {
      if (fileRef.current) fileRef.current.value = "";
      setImageError(error instanceof Error ? error.message : "사진 처리에 실패했어요.");
    } finally {
      setIsCompressing(false);
    }
  }

  async function startCamera() {
    if (cameraPendingRef.current || streamRef.current) return;
    setImageError(undefined);
    if (!window.isSecureContext) {
      setImageError("카메라는 보안 연결에서만 사용할 수 있어요. HTTPS 주소로 접속해 주세요.");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setImageError("이 브라우저에서는 바로 촬영 기능을 사용할 수 없어요. 카메라를 지원하는 최신 브라우저에서 다시 시도해 주세요.");
      return;
    }
    cameraPendingRef.current = true;
    setCameraStarting(true);
    const request = ++cameraRequestRef.current;
    try {
      const stream = await openCamera(navigator.mediaDevices);
      if (request !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCameraOpen(true);
    } catch (error) {
      if (request === cameraRequestRef.current) {
        setImageError(cameraErrorMessage(error, /Macintosh|Mac OS X/.test(navigator.userAgent)));
      }
    } finally {
      if (request === cameraRequestRef.current) {
        cameraPendingRef.current = false;
        setCameraStarting(false);
      }
    }
  }

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video?.videoWidth || !video.videoHeight) {
      setImageError("카메라 화면이 준비되지 않았어요. 잠시 후 다시 촬영해 주세요.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) {
      setImageError("사진을 촬영하지 못했어요.");
      return;
    }
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    stopCamera();
    if (!blob) {
      setImageError("촬영한 사진을 변환하지 못했어요.");
      return;
    }
    await prepareImage(new File([blob], `camera-${Date.now()}.${blob.type === "image/jpeg" ? "jpg" : "png"}`, { type: blob.type }), "CAMERA");
  }

  return (
    <form action={action} className="space-y-5" onSubmit={(event) => { if (isCompressing || cameraStarting || cameraOpen) event.preventDefault(); }}>
      <input type="hidden" name="proofType" value={proofType} />
      <input type="hidden" name="imageSource" value={imageSource} />
      {missionId && <input type="hidden" name="missionId" value={missionId} />}
      <input ref={fileRef} name="image" type="file" accept="image/webp,image/jpeg" className="sr-only" tabIndex={-1} />

      <div>
        <p className="mb-2 text-sm font-extrabold">{isMorning ? "지금 촬영한 아침 사진" : "랜덤 미션 인증 사진"}</p>
        {cameraOpen ? (
          <div className="overflow-hidden rounded-3xl bg-ink p-3">
            <video ref={videoRef} autoPlay muted playsInline className="aspect-[4/3] w-full rounded-2xl bg-black object-cover" />
            <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
              <button type="button" onClick={() => void capturePhoto()} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-coral px-5 text-sm font-extrabold text-white"><Camera className="size-4" /> 지금 촬영하기</button>
              <button type="button" onClick={stopCamera} aria-label="카메라 닫기" className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-white"><X className="size-4" /></button>
            </div>
          </div>
        ) : preview ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink/5">
            <Image src={preview} alt="선택한 인증 사진 미리보기" fill unoptimized className="object-cover" />
            <button type="button" onClick={clearImage} aria-label="선택한 사진 지우기" className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur"><X className="size-4" /></button>
            <span className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1.5 text-[10px] font-extrabold text-white backdrop-blur">{imageSource === "CAMERA" ? "방금 촬영" : "앨범에서 선택"}</span>
            <button type="button" onClick={downloadImage} className="absolute bottom-3 right-3 inline-flex h-9 items-center gap-1.5 rounded-full bg-white/90 px-3 text-[10px] font-extrabold text-ink shadow-sm backdrop-blur transition hover:bg-white" aria-label="인증 사진을 기기에 저장">
              <Download className="size-3.5" aria-hidden="true" /> 사진 저장
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => void startCamera()} disabled={Boolean(disabledReason) || isCompressing || cameraStarting} className={`flex min-h-40 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink/15 bg-cream/55 text-center transition hover:border-coral hover:bg-coral/5 disabled:cursor-not-allowed disabled:opacity-50 ${isMorning ? "sm:col-span-2" : ""}`}>
              <span className="flex size-14 items-center justify-center rounded-full bg-white text-coral shadow-sm"><Camera className="size-6" /></span>
              <span className="mt-4 text-sm font-extrabold">{cameraStarting ? "카메라 연결 중..." : "카메라로 바로 촬영"}</span>
              <span className="mt-1 text-xs font-medium text-ink/40">{isMorning ? "아침 인증은 즉시 촬영만 가능해요" : "지금 미션 모습을 촬영해요"}</span>
            </button>
            {!isMorning && (
              <label htmlFor="random-upload" className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-ink/15 bg-cream/55 text-center transition hover:border-coral hover:bg-coral/5">
                <span className="flex size-14 items-center justify-center rounded-full bg-white text-coral shadow-sm"><ImagePlus className="size-6" /></span>
                <span className="mt-4 text-sm font-extrabold">앨범에서 선택</span>
                <span className="mt-1 text-xs font-medium text-ink/40">기존 사진도 올릴 수 있어요</span>
                <input ref={uploadRef} id="random-upload" type="file" accept="image/*" disabled={Boolean(disabledReason) || isCompressing || cameraStarting} className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) void prepareImage(file, "UPLOAD"); }} />
              </label>
            )}
          </div>
        )}
        {imageError && <p role="alert" className="mt-2 text-xs font-semibold text-coral">{imageError}</p>}
        {state.fieldErrors?.image?.[0] && <p className="mt-2 text-xs font-semibold text-coral">{state.fieldErrors.image[0]}</p>}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between"><label htmlFor={`${proofType}-content`} className="text-sm font-extrabold">{isMorning ? "일어난 뒤 무엇을 했나요?" : "미션 기록 (선택)"}</label><span className="text-xs font-semibold text-ink/35">{count}/140</span></div>
        <textarea id={`${proofType}-content`} name="content" maxLength={140} required={isMorning} disabled={Boolean(disabledReason)} onChange={(event) => setCount(event.target.value.length)} placeholder={isMorning ? "예: 공원에서 30분 러닝을 했어요." : "사진만 올려도 완료할 수 있어요."} className="min-h-28 w-full resize-none rounded-2xl border border-ink/12 bg-white p-4 text-base font-semibold outline-none transition placeholder:text-ink/25 focus:border-ink focus:ring-4 focus:ring-lime/35" />
        {state.fieldErrors?.content?.[0] && <p className="mt-2 text-xs font-semibold text-coral">{state.fieldErrors.content[0]}</p>}
      </div>
      {(disabledReason || state.message) && <p role="alert" className="rounded-2xl bg-coral/10 p-4 text-sm font-bold leading-6 text-coral">{disabledReason ?? state.message}</p>}
      <p className="text-xs leading-6 text-ink/60">사진과 기록은 같은 챌린지 참가자에게 공개되며, 사진 파일은 2026년 10월 4일에 삭제됩니다. 다른 사람의 얼굴·개인정보가 노출되지 않았는지 확인해 주세요. <a href="/photo-rules" target="_blank" rel="noreferrer" className="underline">사진 이용규칙 (새 창)</a></p>
      <SubmitButton pendingText="사진을 올리는 중..." disabled={Boolean(disabledReason) || isCompressing || cameraStarting || cameraOpen || !preview} className={disabledReason ? "pointer-events-none opacity-40" : ""}><Camera className="size-4" /> {isMorning ? "아침 인증 완료하기" : "랜덤 미션 완료하기"}</SubmitButton>
    </form>
  );
}
