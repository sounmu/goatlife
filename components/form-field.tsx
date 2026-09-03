import { cn } from "@/lib/utils";

export function FormField({ label, name, error, hint, children }: { label: string; name: string; error?: string[]; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-extrabold text-ink">{label}</label>
      {children}
      {error?.[0] ? <p className="mt-2 text-xs font-semibold text-coral">{error[0]}</p> : hint ? <p className="mt-2 text-xs font-medium text-ink/45">{hint}</p> : null}
    </div>
  );
}

export const inputClassName = cn(
  "h-14 w-full rounded-2xl border border-ink/12 bg-white px-4 text-base font-semibold text-ink outline-none transition placeholder:text-ink/25",
  "focus:border-ink focus:ring-4 focus:ring-lime/35",
);
