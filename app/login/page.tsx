import type { Metadata } from "next";
import { ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "참가자 로그인" };

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-cream px-5 py-5 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between"><Link href="/" aria-label="홈으로" className="flex size-10 items-center justify-center rounded-full border border-ink/10 bg-white/70"><ArrowLeft className="size-4" /></Link><Logo /><div className="size-10" /></div>
        <div className="pb-10 pt-16 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ink text-lime"><KeyRound className="size-6" /></div>
          <h1 className="mt-6 font-display text-4xl font-black tracking-[-.05em]">다시 만났네요.</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-ink/50">개인 참가 링크가 있다면 링크만 눌러도 로그인돼요.<br />링크를 잃어버렸다면 아래 정보로 들어오세요.</p>
        </div>
        <section className="rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8"><LoginForm /></section>
        <p className="mt-7 text-center text-xs font-medium text-ink/40">참가코드를 잃어버렸나요? 운영자에게 문의해 주세요.</p>
      </div>
    </main>
  );
}
