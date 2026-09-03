import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { WebMcpTools } from "@/components/webmcp-tools";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "GOAT.LIFE — 21일 보증금 챌린지",
    template: "%s | GOAT.LIFE",
  },
  description: "돈을 걸고, 매일 인증하고, 21일 뒤 달라진 나를 만나는 보증금 챌린지.",
  openGraph: {
    title: "GOAT.LIFE — 돈을 걸고, 아침을 바꿔보세요.",
    description: "매일 인증하고 21일을 완주하면 보증금을 돌려받는 습관 챌린지.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "GOAT.LIFE 보증금 습관 챌린지" }],
    type: "website",
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: "GOAT.LIFE — 돈을 걸고, 아침을 바꿔보세요.",
    description: "매일 인증하고 21일을 완주하면 보증금을 돌려받는 습관 챌린지.",
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
      </body>
    </html>
  );
}
