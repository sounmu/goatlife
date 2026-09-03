"use client";

import { Camera, Home, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/feed", label: "피드", icon: Home },
  { href: "/proof/new", label: "인증", icon: Camera, primary: true },
  { href: "/me", label: "마이", icon: UserRound },
];

export function MemberNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-ink/10 bg-white/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur md:hidden" aria-label="주요 메뉴">
      <div className="mx-auto flex max-w-md items-end justify-around">
        {links.map(({ href, label, icon: Icon, primary }) => {
          const active = pathname === href || (href !== "/feed" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} className={cn("flex min-w-16 flex-col items-center gap-1 text-[10px] font-bold", active ? "text-ink" : "text-ink/35", primary && "-mt-7")}>
              <span className={cn("flex size-9 items-center justify-center rounded-full", primary && "size-14 bg-coral text-white shadow-lg shadow-coral/25", !primary && active && "bg-lime")}><Icon className={cn(primary ? "size-5" : "size-4")} /></span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
