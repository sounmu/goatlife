"use client";

import { Camera, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { setProofValidity } from "@/app/actions/admin";
import type { ProofStatus, ProofType } from "@/lib/domain";
import { formatKoreaDateTime } from "@/lib/date";

interface RecentProof {
  id: string;
  imageUrl: string;
  content: string;
  created_at: string;
  status: ProofStatus;
  proof_type: ProofType;
  missionTitle?: string | null;
  participant: { nickname: string };
}

export function RecentProofs({ proofs }: { proofs: RecentProof[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest" | "name-asc" | "name-desc">("newest");
  const normalizedQuery = query.trim().toLocaleLowerCase("ko-KR");
  const visibleProofs = proofs
    .filter((proof) => proof.participant.nickname.toLocaleLowerCase("ko-KR").includes(normalizedQuery))
    .toSorted((left, right) => {
      if (sort === "oldest") return left.created_at.localeCompare(right.created_at);
      if (sort === "name-asc") return left.participant.nickname.localeCompare(right.participant.nickname, "ko-KR");
      if (sort === "name-desc") return right.participant.nickname.localeCompare(left.participant.nickname, "ko-KR");
      return right.created_at.localeCompare(left.created_at);
    });

  return (
    <section className="mt-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl font-black">최근 인증</h2>
          <p className="mt-1 text-sm font-medium text-ink/40">참가자별 인증을 찾거나 정렬하고, 부적절한 인증을 무효 처리할 수 있습니다.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative block">
            <span className="sr-only">참가자 이름 검색</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink/35" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="참가자 이름 검색" className="h-11 w-full rounded-full border border-ink/10 bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-ink focus:ring-4 focus:ring-lime/30 sm:w-56" />
          </label>
          <label>
            <span className="sr-only">인증 정렬</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} className="h-11 w-full rounded-full border border-ink/10 bg-white px-4 text-sm font-bold outline-none focus:border-ink focus:ring-4 focus:ring-lime/30 sm:w-40">
              <option value="newest">최신순</option>
              <option value="oldest">오래된순</option>
              <option value="name-asc">이름 가나다순</option>
              <option value="name-desc">이름 역순</option>
            </select>
          </label>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-ink/35">
        <span>{query.trim() ? `검색 결과 ${visibleProofs.length}건` : `최근 ${proofs.length}건`}</span>
        <Camera className="size-5 text-coral" />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProofs.map((proof) => (
          <article key={proof.id} className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
            <div className="relative aspect-[4/3] bg-ink/5"><Image src={proof.imageUrl} alt={`${proof.participant.nickname}님의 인증`} fill sizes="(max-width: 640px) 100vw, 33vw" unoptimized className="object-cover" /></div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><p className="font-extrabold">{proof.participant.nickname}</p><span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${proof.proof_type === "MORNING" ? "bg-ink text-white" : "bg-lime"}`}>{proof.proof_type === "MORNING" ? "아침" : "랜덤"}</span></div>
                  <p className="mt-1 text-[10px] font-medium text-ink/35">{formatKoreaDateTime(proof.created_at)}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${proof.status === "VALID" ? "bg-lime" : "bg-coral/10 text-coral"}`}>{proof.status === "VALID" ? "인정" : "무효"}</span>
              </div>
              {proof.missionTitle && <p className="mt-4 text-xs font-extrabold text-coral">{proof.missionTitle}</p>}
              <p className={`${proof.missionTitle ? "mt-1" : "mt-4"} line-clamp-2 text-xs font-medium leading-5 text-ink/55`}>{proof.content}</p>
              <form action={setProofValidity} className="mt-4">
                <input type="hidden" name="proofId" value={proof.id} />
                <input type="hidden" name="status" value={proof.status === "VALID" ? "INVALID" : "VALID"} />
                <button className="text-xs font-extrabold text-coral underline underline-offset-4">{proof.status === "VALID" ? "이 인증 무효 처리" : "유효로 되돌리기"}</button>
              </form>
            </div>
          </article>
        ))}
        {!visibleProofs.length && <p className="col-span-full rounded-3xl bg-white p-10 text-center text-sm font-medium text-ink/35">{proofs.length ? "검색 조건에 맞는 인증이 없습니다." : "아직 등록된 인증이 없습니다."}</p>}
      </div>
    </section>
  );
}
