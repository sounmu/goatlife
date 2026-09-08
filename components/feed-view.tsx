"use client";

import { Camera, Flame, Grid2X2, Rows3, UsersRound } from "lucide-react";
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

export function FeedView({ proofs, friendsOnly = false }: { proofs: FeedProof[]; friendsOnly?: boolean }) {
  const [compact, setCompact] = useState(false);

  return (
    <section className="mt-7" aria-label="인증 피드">
      <div className="flex min-w-0 items-center justify-between gap-2" aria-label="피드 보기 설정">
        <nav aria-label="피드 범위" className="inline-flex min-w-0 rounded-full bg-ink/5 p-1">
          <Link href="/feed" aria-label="모든 게시물 보기" aria-current={!friendsOnly ? "page" : undefined} className={`inline-flex h-10 items-center justify-center rounded-full px-3 text-xs font-extrabold transition sm:px-4 ${!friendsOnly ? "bg-white text-ink shadow-sm" : "text-ink/45 hover:text-ink"}`}>
            <span className="sm:hidden">모두</span><span className="hidden sm:inline">모두 보기</span>
          </Link>
          <Link href="/feed?scope=friends" aria-label="친구 게시물만 보기" aria-current={friendsOnly ? "page" : undefined} className={`inline-flex h-10 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-extrabold transition sm:px-4 ${friendsOnly ? "bg-white text-ink shadow-sm" : "text-ink/45 hover:text-ink"}`}>
            <UsersRound className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="sm:hidden">친구만</span><span className="hidden sm:inline">친구 게시물만</span>
          </Link>
        </nav>
        <button
          type="button"
          onClick={() => setCompact((current) => !current)}
          aria-pressed={compact}
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-ink/10 bg-white px-3 text-xs font-extrabold text-ink/65 shadow-sm transition hover:border-ink/20 hover:text-ink sm:px-4"
        >
          {compact ? <Rows3 className="size-4" aria-hidden="true" /> : <Grid2X2 className="size-4" aria-hidden="true" />}
          {compact ? "크게 보기" : "모아보기"}
        </button>
      </div>

      {!proofs.length ? (
        <div className="mt-5 rounded-[2rem] border border-dashed border-ink/15 bg-white/60 px-6 py-16 text-center">
          <Camera className="mx-auto size-8 text-ink/25" />
          <h2 className="mt-4 font-display text-xl font-black">{friendsOnly ? "아직 친구 게시물이 없어요." : "아직 첫 인증을 기다리고 있어요."}</h2>
          <p className="mt-2 text-sm font-medium text-ink/45">{friendsOnly ? "친구를 추가하거나 친구의 다음 인증을 기다려 주세요." : "오늘의 첫 번째 GOAT가 되어보세요."}</p>
          <Link href={friendsOnly ? "/friends" : "/proof/new"} className="mt-6 inline-flex h-12 items-center rounded-full bg-coral px-6 text-sm font-extrabold text-white">
            {friendsOnly ? "친구 추가하기" : "첫 인증 남기기"}
          </Link>
        </div>
      ) : <div className={compact ? "mt-3 grid grid-cols-2 gap-3 sm:gap-4" : "mt-3 space-y-6"}>
        {proofs.map((proof) => (
          <article
            key={proof.id}
            className={`overflow-hidden border border-ink/10 bg-white text-ink shadow-[0_14px_40px_rgba(23,33,30,.08)] ${compact ? "rounded-[1.6rem]" : "rounded-[2.2rem]"}`}
          >
            <header className={`flex items-center gap-2 border-b border-ink/8 ${compact ? "px-3.5 py-3" : "px-6 py-4"}`}>
              <span className={`shrink-0 rounded-full ${proof.proofType === "MORNING" ? "bg-lime ring-1 ring-ink/10" : "bg-coral"} ${compact ? "size-1.5" : "size-2"}`} aria-hidden="true" />
              <p className={`truncate font-display font-black tracking-[-.025em] ${compact ? "text-xs" : "text-sm"}`}>{proof.nickname}</p>
            </header>
            <div className={compact ? "px-2.5 pt-2.5" : "px-4 pt-4 sm:px-5 sm:pt-5"}>
              <div className={`relative overflow-hidden bg-ink/5 ${compact ? "aspect-square rounded-[1.1rem]" : "aspect-square rounded-[1.7rem] sm:aspect-[4/3]"}`}>
                <Image
                  src={proof.imageUrl}
                  alt={`${proof.nickname}님의 ${proof.proofDate} 인증 사진`}
                  fill
                  sizes={compact ? "(max-width: 768px) 45vw, 324px" : "(max-width: 768px) 92vw, 664px"}
                  unoptimized
                  className="object-cover"
                />
              </div>
            </div>
            <div className={compact ? "px-3.5 pb-4 pt-3" : "px-6 pb-6 pt-4"}>
              {proof.proofType === "MORNING" ? (
                <p className={`mb-2 flex min-w-0 items-center font-extrabold ${compact ? "gap-1 text-[10px]" : "gap-1.5 text-xs"}`}>
                  <Flame className={`text-coral ${compact ? "size-3" : "size-3.5"}`} fill="currentColor" aria-hidden="true" />
                  <span>아침 인증</span>
                  <span className="text-ink/20" aria-hidden="true">·</span>
                  <span className="text-ink/50">{proof.streak}일 연속</span>
                </p>
              ) : proof.missionTitle ? (
                <p className={`mb-2 flex min-w-0 items-center font-extrabold ${compact ? "gap-1 text-[10px]" : "gap-1.5 text-xs"}`}>
                  <span className="shrink-0 text-coral">랜덤 미션</span>
                  <span className="text-ink/20" aria-hidden="true">·</span>
                  <span className="truncate text-ink/60">{proof.missionTitle}</span>
                </p>
              ) : null}
              {proof.content && <p className={`text-ink/70 ${compact ? "line-clamp-2 text-[11px] leading-4" : "text-sm leading-6"}`}><span className="mr-1.5 font-extrabold text-ink">{proof.nickname}</span><span className="font-medium">{proof.content}</span></p>}
              <p className={`font-semibold uppercase tracking-[.04em] text-ink/30 ${compact ? "mt-2 text-[8px]" : "mt-3 text-[10px]"}`}>{formatKoreaDateTime(proof.createdAt)}</p>
            </div>
          </article>
        ))}
      </div>}
    </section>
  );
}
