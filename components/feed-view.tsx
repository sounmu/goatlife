"use client";

import { Camera, Flame, Grid2X2, Rows3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatKoreaDateTime } from "@/lib/date";
import type { ProofType } from "@/lib/domain";

interface FeedProof {
  id: string;
  nickname?: string;
  proofDate: string;
  content: string;
  createdAt: string;
  proofType: ProofType;
  missionTitle?: string | null;
  imageUrl: string;
  streak: number | null;
}

export function FeedView({ proofs }: { proofs: FeedProof[] }) {
  const [compact, setCompact] = useState(false);

  if (!proofs.length) {
    return (
      <div className="mt-9 rounded-[2rem] border border-dashed border-ink/15 bg-white/60 px-6 py-16 text-center">
        <Camera className="mx-auto size-8 text-ink/25" />
        <h2 className="mt-4 font-display text-xl font-black">아직 첫 인증을 기다리고 있어요.</h2>
        <p className="mt-2 text-sm font-medium text-ink/45">오늘의 첫 번째 GOAT가 되어보세요.</p>
        <Link href="/proof/new" className="mt-6 inline-flex h-12 items-center rounded-full bg-coral px-6 text-sm font-extrabold text-white">
          첫 인증 남기기
        </Link>
      </div>
    );
  }

  return (
    <section className="mt-6" aria-label="참가자 인증 목록">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setCompact((current) => !current)}
          aria-pressed={compact}
          className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/10 bg-white px-4 text-xs font-extrabold text-ink/65 shadow-sm transition hover:border-ink/20 hover:text-ink"
        >
          {compact ? <Rows3 className="size-4" aria-hidden="true" /> : <Grid2X2 className="size-4" aria-hidden="true" />}
          {compact ? "크게 보기" : "모아보기"}
        </button>
      </div>

      <div className={compact ? "mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4" : "mt-3 space-y-6"}>
        {proofs.map((proof) => (
          <article
            key={proof.id}
            className={`overflow-hidden border border-ink/10 bg-white shadow-sm ${compact ? "rounded-2xl" : "rounded-[2rem]"}`}
          >
            <div className={`flex items-center justify-between gap-2 ${compact ? "px-3 py-2.5" : "px-5 py-4"}`}>
              <div className="min-w-0">
                <p className={`truncate font-display font-black ${compact ? "text-xs" : "text-base"}`}>{proof.nickname}</p>
                <p className={`mt-0.5 truncate font-semibold text-ink/40 ${compact ? "text-[9px]" : "text-[11px]"}`}>{formatKoreaDateTime(proof.createdAt)}</p>
              </div>
              {proof.proofType === "MORNING" ? (
                <div className={`flex shrink-0 items-center rounded-full bg-lime font-extrabold ${compact ? "gap-1 px-2 py-1 text-[9px]" : "gap-1.5 px-3 py-1.5 text-[11px]"}`}>
                  <Flame className={compact ? "size-3" : "size-3.5"} fill="currentColor" aria-hidden="true" />
                  {proof.streak}일{compact ? "" : " 연속"}
                </div>
              ) : (
                <div className={`shrink-0 rounded-full bg-coral/10 font-extrabold text-coral ${compact ? "px-2 py-1 text-[9px]" : "px-3 py-1.5 text-[11px]"}`}>
                  랜덤 미션
                </div>
              )}
            </div>
            <div className={`relative w-full bg-ink/5 ${compact ? "aspect-square" : "aspect-square sm:aspect-[4/3]"}`}>
              <Image
                src={proof.imageUrl}
                alt={`${proof.nickname}님의 ${proof.proofDate} 인증 사진`}
                fill
                sizes={compact ? "(max-width: 640px) 50vw, 176px" : "(max-width: 768px) 100vw, 704px"}
                unoptimized
                className="object-cover"
              />
            </div>
            <div className={compact ? "px-3 py-3" : "px-5 py-5"}>
              {proof.missionTitle ? <p className={`font-extrabold text-coral ${compact ? "line-clamp-1 text-[9px]" : "mb-1 text-xs"}`}>{proof.missionTitle}</p> : null}
              <p className={`font-semibold text-ink/75 ${compact ? "mt-0.5 line-clamp-2 text-[11px] leading-4" : "text-sm leading-6"}`}>{proof.content}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
