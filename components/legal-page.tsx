import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="mx-auto w-full max-w-2xl px-5 py-12 text-sm leading-7 text-ink/80">
    <Link href="/" className="font-bold text-coral">GOAT.MORNING 홈</Link>
    <h1 className="mb-3 mt-6 text-3xl font-black text-ink">{title}</h1>
    <p className="mb-8 text-xs text-ink/60">2026년 9월 챌린지 · 적용일: 2026년 9월 5일</p>
    <div className="space-y-7">{children}</div>
    <nav aria-label="운영 정책" className="mt-10 flex gap-5 border-t border-ink/10 pt-5">
      <Link href="/privacy" className="underline">개인정보 처리방침</Link>
      <Link href="/photo-rules" className="underline">사진 이용규칙</Link>
    </nav>
  </main>;
}
