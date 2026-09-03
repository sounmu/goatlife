import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: "관리자 로그인" };

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-5 py-10">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-2xl sm:p-9">
        <div className="flex items-center justify-between"><Logo /><div className="flex size-10 items-center justify-center rounded-full bg-ink text-lime"><LockKeyhole className="size-4" /></div></div>
        <h1 className="mt-10 font-display text-3xl font-black tracking-[-.04em]">운영자 로그인</h1>
        <p className="mt-2 text-sm font-medium text-ink/50">신청·입금·인증 현황을 관리합니다.</p>
        <div className="mt-8"><AdminLoginForm /></div>
      </div>
    </main>
  );
}
