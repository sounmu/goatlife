"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type ConsentRowProps = Pick<InputHTMLAttributes<HTMLInputElement>, "name" | "checked" | "onChange"> & {
  title: string;
  children: ReactNode;
};

export function ConsentRow({ name, title, children, checked, onChange }: ConsentRowProps) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  return (
    <div>
      <div className="flex min-h-11 items-center gap-1">
        <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 py-2">
          <input name={name} type="checkbox" required checked={checked} onChange={onChange} className="size-4 shrink-0 accent-coral focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral" />
          <span className="text-xs font-semibold leading-5 text-ink"><span className="mr-1 text-ink/45">[필수]</span>{title}</span>
        </label>
        <button type="button" aria-label={`${title} 상세 ${open ? "닫기" : "보기"}`} aria-expanded={open} aria-controls={detailsId} onClick={() => setOpen((current) => !current)} className="flex min-h-11 shrink-0 items-center gap-0.5 rounded-lg px-1.5 text-[11px] font-semibold text-ink/50 transition hover:text-ink focus-visible:outline-2 focus-visible:outline-coral">
          {open ? "닫기" : "보기"}<ChevronDown aria-hidden="true" className={`size-3 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      <div id={detailsId} hidden={!open} className="mb-2 rounded-xl bg-cream/75 px-3 py-3 text-xs font-medium leading-6 text-ink/60">
        {children}
      </div>
    </div>
  );
}
