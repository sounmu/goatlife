import { participantLogout } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { MemberNav } from "@/components/member-nav";
import { requireParticipant } from "@/lib/auth/participant";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MemberLayout({ children }: { children: React.ReactNode }) {
  const participant = await requireParticipant();
  return (
    <div className="min-h-screen bg-cream pb-24 md:pb-8">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/90 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Logo href="/" />
          <nav aria-label="멤버 메뉴" className="hidden items-center gap-1 md:flex">
            <Link href="/feed" className="rounded-full px-3 py-2 text-xs font-extrabold text-ink/55 transition hover:bg-white hover:text-ink">피드</Link>
            <Link href="/proof/new" className="rounded-full px-3 py-2 text-xs font-extrabold text-ink/55 transition hover:bg-white hover:text-ink">인증</Link>
            <Link href="/friends" className="rounded-full px-3 py-2 text-xs font-extrabold text-ink/55 transition hover:bg-white hover:text-ink">친구</Link>
          </nav>
          <div className="flex items-center gap-1">
            <Link href="/me" className="inline-flex h-9 items-center rounded-full px-3 text-xs font-bold text-ink/55 transition hover:bg-white hover:text-ink">
              {participant.nickname}님
            </Link>
            <form action={participantLogout} className="flex h-9 items-center">
              <button className="inline-flex h-9 items-center rounded-full px-3 text-xs font-bold text-ink/35 transition hover:bg-white hover:text-coral">로그아웃</button>
            </form>
          </div>
        </div>
      </header>
      {children}
      <MemberNav />
    </div>
  );
}
