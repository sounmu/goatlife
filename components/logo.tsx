import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("font-display text-lg font-black tracking-[-0.04em] text-ink", className)}>
      GOAT<span className="text-coral">.</span>LIFE
    </Link>
  );
}
