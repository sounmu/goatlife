"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-center"><div><p className="text-sm font-extrabold text-coral">잠시 멈춤</p><h1 className="mt-3 font-display text-3xl font-black">페이지를 불러오지 못했어요.</h1><p className="mt-3 text-sm font-medium text-ink/45">잠시 후 다시 시도해 주세요.</p><button onClick={reset} className="mt-7 h-12 rounded-full bg-ink px-6 text-sm font-extrabold text-white">다시 시도</button></div></main>;
}
