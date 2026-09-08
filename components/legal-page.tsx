import { ArrowLeft, ArrowUpRight, CheckCircle2, FileText, Mail } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  title: string;
  description: string;
  sections: LegalSection[];
}

const EFFECTIVE_DATE = "2026-09-05";

export function LegalPage({ title, description, sections }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-white/70 px-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-extrabold text-ink/55 transition hover:text-ink" aria-label="홈으로 돌아가기">
            <span className="flex size-9 items-center justify-center rounded-full border border-ink/10 bg-white">
              <ArrowLeft className="size-4" aria-hidden="true" />
            </span>
            <span className="hidden sm:inline">홈으로</span>
          </Link>
          <Logo />
          <span className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.12em] text-ink/45">Policy</span>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pb-24 sm:pt-16">
        <section className="max-w-4xl border-b border-ink/12 pb-10 sm:pb-14">
          <div className="flex items-center gap-2 text-coral">
            <FileText className="size-4" aria-hidden="true" />
            <p className="text-xs font-extrabold uppercase tracking-[.18em]">GOAT.MORNING 운영 정책</p>
          </div>
          <h1 className="mt-5 font-display text-4xl font-black tracking-[-.055em] text-ink sm:text-6xl">{title}</h1>
          <p className="mt-5 max-w-2xl text-sm font-medium leading-7 text-ink/55 sm:text-base sm:leading-8">{description}</p>

          <dl className="mt-8 grid overflow-hidden rounded-2xl border border-ink/10 bg-white sm:inline-grid sm:grid-cols-3">
            <div className="border-b border-ink/8 px-5 py-4 sm:border-b-0 sm:border-r">
              <dt className="text-[10px] font-extrabold uppercase tracking-[.12em] text-ink/35">시행일</dt>
              <dd className="mt-1 text-sm font-bold text-ink"><time dateTime={EFFECTIVE_DATE}>2026. 09. 05.</time></dd>
            </div>
            <div className="border-b border-ink/8 px-5 py-4 sm:border-b-0 sm:border-r">
              <dt className="text-[10px] font-extrabold uppercase tracking-[.12em] text-ink/35">문서 버전</dt>
              <dd className="mt-1 text-sm font-bold text-ink">Version 1.0</dd>
            </div>
            <div className="px-5 py-4">
              <dt className="text-[10px] font-extrabold uppercase tracking-[.12em] text-ink/35">현재 상태</dt>
              <dd className="mt-1 flex items-center gap-1.5 text-sm font-bold text-ink"><CheckCircle2 className="size-3.5 text-coral" aria-hidden="true" /> 시행 중</dd>
            </div>
          </dl>
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <aside className="lg:sticky lg:top-6">
            <nav aria-label={`${title} 목차`} className="rounded-2xl border border-ink/10 bg-white p-4 sm:p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-ink/35">문서 목차</p>
              <ol className="mt-3 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
                {sections.map((section, index) => (
                  <li key={section.id}>
                    <Link href={`#${section.id}`} className="flex items-start gap-2 rounded-xl px-2 py-2 text-xs font-bold leading-5 text-ink/55 transition hover:bg-cream hover:text-ink">
                      <span className="w-5 shrink-0 font-display text-ink/25">{String(index + 1).padStart(2, "0")}</span>
                      <span>{section.title}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            <div className="mt-4 rounded-2xl bg-ink p-5 text-white">
              <Mail className="size-4 text-lime" aria-hidden="true" />
              <p className="mt-4 text-xs font-extrabold">정책 관련 문의</p>
              <p className="mt-1 text-[11px] font-medium leading-5 text-white/50">내용에 관한 문의나 권리 행사는 운영팀으로 알려주세요.</p>
              <a href="mailto:sukkang_@korea.ac.kr" className="mt-3 inline-block break-all text-[11px] font-bold text-lime underline decoration-lime/30 underline-offset-4">sukkang_@korea.ac.kr</a>
            </div>
          </aside>

          <article className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_18px_60px_rgba(23,33,30,.06)]">
            <div className="border-b border-ink/8 bg-ink/[.025] px-5 py-4 sm:px-8">
              <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-ink/35">정책 전문</p>
            </div>
            <div className="divide-y divide-ink/8">
              {sections.map((section, index) => (
                <section id={section.id} key={section.id} className="scroll-mt-6 px-5 py-7 sm:px-8 sm:py-9">
                  <div className="flex items-start gap-4">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cream font-display text-xs font-black text-coral">{String(index + 1).padStart(2, "0")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-extrabold uppercase tracking-[.14em] text-ink/30">제 {index + 1} 조</p>
                      <h2 className="mt-1 font-display text-lg font-black tracking-[-.025em] text-ink sm:text-xl">{section.title}</h2>
                      <div className="mt-4 space-y-3 text-sm font-medium leading-7 text-ink/65 [&_a]:font-bold [&_a]:text-coral [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:font-extrabold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </article>
        </div>

        <nav aria-label="관련 운영 정책" className="mt-6 grid gap-3 sm:grid-cols-2 lg:ml-[260px]">
          <Link href="/privacy" aria-current={title === "개인정보 처리방침" ? "page" : undefined} className="group inline-flex min-h-16 items-center justify-between rounded-2xl border border-ink/10 bg-white px-5 text-sm font-extrabold text-ink transition hover:border-ink/20 hover:bg-lime aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-white">
            개인정보 처리방침 <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
          <Link href="/photo-rules" aria-current={title === "사진 이용규칙" ? "page" : undefined} className="group inline-flex min-h-16 items-center justify-between rounded-2xl border border-ink/10 bg-white px-5 text-sm font-extrabold text-ink transition hover:border-ink/20 hover:bg-lime aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-white">
            사진 이용규칙 <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </main>
  );
}
