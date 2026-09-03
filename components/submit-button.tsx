"use client";

import { LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";

export function SubmitButton({ children, className, pendingText = "처리 중...", disabled = false }: { children: React.ReactNode; className?: string; pendingText?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={cn("inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-5 text-sm font-extrabold text-white transition hover:bg-coral disabled:cursor-not-allowed disabled:opacity-55", className)}
    >
      {pending && <LoaderCircle className="size-4 animate-spin" />}
      {pending ? pendingText : children}
    </button>
  );
}
