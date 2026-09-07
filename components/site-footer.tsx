import { Mail, Phone } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-white px-5 py-8 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 text-xs font-semibold text-ink/45 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p>© 2026 GOAT.MORNING</p>
          <p>작심삼일을, 완주하는 습관으로.</p>
        </div>
        <div className="flex flex-col gap-3 sm:items-end">
          <nav aria-label="정책 안내" className="flex gap-4">
            <Link href="/privacy" className="transition hover:text-coral hover:underline hover:underline-offset-4">
              개인정보 처리방침
            </Link>
            <Link href="/photo-rules" className="transition hover:text-coral hover:underline hover:underline-offset-4">
              사진 이용규칙
            </Link>
          </nav>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <span className="font-extrabold text-ink/65">문의</span>
            <a
              href="mailto:sukkang_@korea.ac.kr"
              className="inline-flex w-fit items-center gap-1.5 transition hover:text-coral hover:underline hover:underline-offset-4 focus-visible:text-coral focus-visible:underline focus-visible:underline-offset-4"
              aria-label="이메일로 문의하기: sukkang_@korea.ac.kr"
            >
              <Mail className="size-3.5" aria-hidden="true" />
              sukkang_@korea.ac.kr
            </a>
            <a
              href="tel:010-2623-0146"
              className="inline-flex w-fit items-center gap-1.5 transition hover:text-coral hover:underline hover:underline-offset-4 focus-visible:text-coral focus-visible:underline focus-visible:underline-offset-4"
              aria-label="전화로 문의하기: 010-2623-0146"
            >
              <Phone className="size-3.5" aria-hidden="true" />
              010-2623-0146
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
