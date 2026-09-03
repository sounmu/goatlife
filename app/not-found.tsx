import Link from "next/link";

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-cream px-5 text-center"><div><p className="font-display text-7xl font-black text-coral">404</p><h1 className="mt-4 font-display text-3xl font-black">길을 조금 벗어났어요.</h1><p className="mt-3 text-sm font-medium text-ink/45">찾으시는 페이지가 없거나 이동되었습니다.</p><Link href="/" className="mt-7 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-extrabold text-white">홈으로 돌아가기</Link></div></main>;
}
