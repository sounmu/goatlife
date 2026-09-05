import Link from "next/link";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { WebMcpTools } from "@/components/webmcp-tools";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "GOAT.MORNING — 14일 보증금 챌린지",
    template: "%s | GOAT.MORNING",
  },
  description: "아침 루틴과 날짜별 랜덤 미션을 사진과 한 줄 기록으로 남기는 14일 보증금 챌린지.",
  openGraph: {
    title: "GOAT.MORNING — 돈을 걸고, 아침을 바꿔보세요.",
    description: "아침 루틴과 날짜별 랜덤 미션을 기록하며 14일을 완주하는 습관 챌린지.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "GOAT.MORNING 보증금 습관 챌린지" }],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOAT.MORNING — 돈을 걸고, 아침을 바꿔보세요.",
    description: "아침 루틴과 날짜별 랜덤 미션을 기록하며 14일을 완주하는 습관 챌린지.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <nav aria-label="정책 안내" className="flex justify-center gap-5 border-t border-ink/10 bg-white px-5 py-5 text-[11px] font-bold text-ink/45"><Link href="/privacy" className="transition hover:text-coral hover:underline hover:underline-offset-4">개인정보 처리방침</Link><Link href="/photo-rules" className="transition hover:text-coral hover:underline hover:underline-offset-4">사진 이용규칙</Link></nav>
        <WebMcpTools />
        <Analytics />
      </body>
    </html>
  );
}
