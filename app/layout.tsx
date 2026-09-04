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
        <WebMcpTools />
        <Analytics />
      </body>
    </html>
  );
}
