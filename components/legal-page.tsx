import { ArrowLeft, ArrowUpRight, FileText } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return <main className="min-h-screen bg-cream px-5 py-5 sm:px-8 sm:py-8">
    <div className="mx-auto max-w-3xl">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="홈으로" className="flex size-10 items-center justify-center rounded-full border border-ink/10 bg-white/70 text-ink transition hover:bg-white"><ArrowLeft className="size-4" aria-hidden="true" /></Link>
        <Logo />
        <div className="size-10" aria-hidden="true" />
      </header>

      <div className="py-12 text-center sm:py-16">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ink text-lime"><FileText className="size-6" aria-hidden="true" /></div>
        <p className="mt-6 text-xs font-extrabold uppercase tracking-[.16em] text-coral">GOAT.MORNING · Policy</p>
        <h1 className="mt-2 font-display text-4xl font-black tracking-[-.05em] text-ink sm:text-5xl">{title}</h1>
        <p className="mt-3 text-xs font-semibold text-ink/45">2026년 9월 챌린지 · 적용일 2026. 09. 05.</p>
      </div>

      <article className="overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
        <div className="[&_a]:font-bold [&_a]:text-coral [&_a]:underline [&_a]:underline-offset-4 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-black [&_h2]:tracking-[-0.025em] [&_p]:mt-3 [&_p]:text-sm [&_p]:font-medium [&_p]:leading-7 [&_p]:text-ink/65 [&_section+section]:border-t [&_section+section]:border-ink/8 [&_section]:p-5 sm:[&_section]:p-8">
          {children}
        </div>
      </article>

      <nav aria-label="운영 정책" className="mt-5 grid gap-3 sm:grid-cols-2">
        <Link href="/privacy" className="inline-flex h-14 items-center justify-between rounded-2xl border border-ink/10 bg-white px-5 text-sm font-extrabold text-ink transition hover:bg-lime">
          개인정보 처리방침 <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
        <Link href="/photo-rules" className="inline-flex h-14 items-center justify-between rounded-2xl border border-ink/10 bg-white px-5 text-sm font-extrabold text-ink transition hover:bg-lime">
          사진 이용규칙 <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </nav>
      <p className="py-8 text-center text-xs font-medium text-ink/35">궁금한 점은 운영팀으로 문의해 주세요.</p>
    </div>
  </main>;
}
