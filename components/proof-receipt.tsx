"use client";

import { Download, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { formatKoreaDate, formatKoreaDateTime } from "@/lib/date";
import type { ProofType } from "@/lib/domain";

interface ProofReceiptProps {
  proof: {
    id: string;
    nickname: string;
    challengeTitle: string;
    proofDate: string;
    content: string;
    createdAt: string;
    proofType: ProofType;
    missionTitle: string | null;
    imageUrl: string;
  };
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
}

function drawCover(context: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number) {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const characters = [...text];
  const lines: string[] = [];
  let line = "";
  for (const character of characters) {
    const candidate = line + character;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = character;
      if (lines.length === maxLines - 1) break;
    } else {
      line = candidate;
    }
  }
  const consumed = lines.join("").length;
  const remaining = characters.slice(consumed).join("");
  if (remaining) {
    let finalLine = remaining;
    while (context.measureText(finalLine + (finalLine.length < remaining.length ? "…" : "")).width > maxWidth) {
      finalLine = finalLine.slice(0, -1);
    }
    lines.push(finalLine.length < remaining.length ? `${finalLine}…` : finalLine);
  }
  return lines.slice(0, maxLines);
}

async function loadImage(src: string) {
  const response = await fetch(src, { credentials: "same-origin" });
  if (!response.ok) throw new Error("인증 사진을 불러오지 못했어요.");
  const objectUrl = URL.createObjectURL(await response.blob());
  const image = new window.Image();
  image.src = objectUrl;
  await image.decode();
  return { image, objectUrl };
}

export function ProofReceipt({ proof }: ProofReceiptProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string>();
  const label = proof.proofType === "MORNING" ? "MIRACLE MORNING" : "RANDOM MISSION";
  const title = proof.proofType === "MORNING" ? "오늘 아침도 해냈어요." : proof.missionTitle ?? "오늘의 랜덤 미션";

  async function createReceiptFile() {
    const { image, objectUrl } = await loadImage(proof.imageUrl);
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("인증 카드를 만들지 못했어요.");

    context.fillStyle = "#f6f2e8";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#17211e";
    context.fillRect(0, 0, canvas.width, 230);
    context.fillStyle = "#d9ff57";
    context.font = "900 56px system-ui, sans-serif";
    context.fillText("GOAT.MORNING", 60, 105);
    context.fillStyle = "rgba(255,255,255,.58)";
    context.font = "700 25px system-ui, sans-serif";
    context.fillText(proof.challengeTitle, 60, 158);
    context.textAlign = "right";
    context.fillStyle = "#ff735d";
    context.font = "900 22px system-ui, sans-serif";
    context.fillText(label, 1020, 105);
    context.fillStyle = "rgba(255,255,255,.62)";
    context.font = "700 22px system-ui, sans-serif";
    context.fillText(formatKoreaDate(proof.proofDate), 1020, 158);
    context.textAlign = "left";

    context.save();
    roundedRect(context, 60, 270, 960, 700, 48);
    context.clip();
    drawCover(context, image, 60, 270, 960, 700);
    context.restore();
    URL.revokeObjectURL(objectUrl);

    context.fillStyle = "#17211e";
    context.font = "900 48px system-ui, sans-serif";
    const titleLines = wrapText(context, title, 960, 2);
    titleLines.forEach((line, index) => context.fillText(line, 60, 1050 + index * 62));

    if (proof.content) {
      context.fillStyle = "rgba(23,33,30,.68)";
      context.font = "600 29px system-ui, sans-serif";
      const contentLines = wrapText(context, proof.content, 960, 2);
      contentLines.forEach((line, index) => context.fillText(line, 60, 1170 + index * 42));
    }

    context.fillStyle = "rgba(23,33,30,.42)";
    context.font = "700 22px system-ui, sans-serif";
    context.fillText(`${proof.nickname} · ${formatKoreaDateTime(proof.createdAt)}`, 60, 1300);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("인증 카드를 저장하지 못했어요.");
    return new File([blob], `goat-morning-${proof.proofDate}-${proof.proofType.toLowerCase()}.png`, { type: "image/png" });
  }

  async function run(mode: "download" | "share") {
    setIsCreating(true);
    setMessage(undefined);
    try {
      const file = await createReceiptFile();
      if (mode === "share" && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "GOAT.MORNING 인증", text: title });
      } else {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMessage(mode === "share" ? "공유 기능을 지원하지 않아 이미지로 저장했어요." : "인증 카드를 이미지로 저장했어요.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage(error instanceof Error ? error.message : "인증 카드를 만들지 못했어요.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      <article className="overflow-hidden rounded-[2.2rem] border border-ink/10 bg-white shadow-[0_20px_60px_rgba(23,33,30,.12)]">
        <header className="flex items-start justify-between gap-3 bg-ink px-6 py-5 text-white">
          <div><p className="font-display text-lg font-black text-lime">GOAT.MORNING</p><p className="mt-1 text-[10px] font-bold text-white/45">{proof.challengeTitle}</p></div>
          <div className="text-right"><p className="text-[10px] font-extrabold uppercase tracking-[.12em] text-coral">{label}</p><p className="mt-1 text-[10px] font-semibold text-white/50">{formatKoreaDate(proof.proofDate)}</p></div>
        </header>
        <div className="p-4 sm:p-5">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.6rem] bg-ink/5"><Image src={proof.imageUrl} alt={`${proof.nickname}님의 인증 사진`} fill unoptimized sizes="(max-width: 640px) 90vw, 430px" className="object-cover" /></div>
          <div className="px-2 pb-2 pt-5"><h2 className="font-display text-2xl font-black tracking-[-.04em]">{title}</h2>{proof.content && <p className="mt-3 text-sm font-semibold leading-6 text-ink/60">{proof.content}</p>}<p className="mt-4 text-[10px] font-bold text-ink/35">{proof.nickname} · {formatKoreaDateTime(proof.createdAt)}</p></div>
        </div>
      </article>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" disabled={isCreating} onClick={() => void run("download")} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-ink text-sm font-extrabold text-white disabled:opacity-50"><Download className="size-4" aria-hidden="true" /> 이미지 저장</button>
        <button type="button" disabled={isCreating} onClick={() => void run("share")} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-lime text-sm font-extrabold text-ink disabled:opacity-50"><Share2 className="size-4" aria-hidden="true" /> 공유하기</button>
      </div>
      {isCreating && <p role="status" className="mt-3 text-center text-xs font-bold text-ink/45">인증 카드를 만드는 중...</p>}
      {message && <p role="status" className="mt-3 text-center text-xs font-bold text-ink/55">{message}</p>}
    </div>
  );
}
