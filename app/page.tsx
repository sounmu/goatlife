import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Clock3,
  Flame,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { formatKoreaDate, inclusiveDays, koreaDate } from "@/lib/date";
import { demoChallenge, getActiveChallenge } from "@/lib/data";
import { formatWon } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function Home() {
  const challenge = (await getActiveChallenge()) ?? demoChallenge;
  const totalDays = inclusiveDays(challenge.start_date, challenge.end_date);
  const countdown = Math.max(0, inclusiveDays(koreaDate(), challenge.start_date) - 1);
  const steps = [
    { number: "01", title: "보증금을 걸어요", body: `참가 신청 후 안내된 계좌로 ${formatWon(challenge.deposit_amount)}을 입금해요.` },
    { number: "02", title: "매일 인증해요", body: "정해진 시간 안에 사진과 짧은 기록을 하루 한 번 남겨요." },
    { number: "03", title: "끝까지 해내요", body: `${totalDays}일을 완주하면 보증금을 그대로 돌려받아요.` },
  ];
  return (
    <main className="overflow-hidden">
      <section className="relative isolate min-h-[760px] border-b border-ink/10 bg-cream px-5 pb-16 pt-5 sm:px-8 lg:min-h-[820px]">
        <div className="noise" aria-hidden="true" />
        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="font-display text-lg font-black tracking-[-0.04em] text-ink">
            GOAT<span className="text-coral">.</span>LIFE
          </Link>
          <Link href="/login" className="text-sm font-bold text-ink/65 transition hover:text-ink">
            참가자 로그인
          </Link>
        </nav>

        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 pb-4 pt-20 lg:grid-cols-[1.04fr_.96fr] lg:pt-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white/65 px-3 py-2 text-xs font-bold text-ink/70 shadow-sm backdrop-blur">
              <span className="size-2 rounded-full bg-coral shadow-[0_0_0_5px_rgba(255,106,82,.14)]" />
              {challenge.title} · {formatKoreaDate(challenge.start_date)} 시작
            </div>
            <h1 className="font-display text-[clamp(3.5rem,11vw,7.6rem)] font-black leading-[.84] tracking-[-0.075em] text-ink">
              돈을 걸고,
              <br />
              <span className="text-coral">아침을</span>
              <br />
              바꿔보세요.
            </h1>
            <p className="mt-8 max-w-md text-base font-medium leading-7 text-ink/62 sm:text-lg">
              의지가 흔들릴 때는 약속에 무게를 더하세요. 매일 아침 인증하고,
              끝까지 해내면 보증금은 다시 당신에게 돌아갑니다.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/apply" className="group inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 text-base font-extrabold text-white shadow-[0_10px_30px_rgba(25,34,31,.2)] transition hover:-translate-y-0.5 hover:bg-coral">
                {formatWon(challenge.deposit_amount)} 걸고 참여하기
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </Link>
              <span className="text-center text-xs font-semibold text-ink/45 sm:text-left">{countdown > 0 ? `시작까지 ${countdown}일` : "지금 참여할 수 있어요"}</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[430px] lg:mr-0">
            <div className="absolute -left-12 top-16 hidden rotate-[-9deg] rounded-full bg-lime px-5 py-3 font-display text-sm font-black text-ink shadow-lg sm:block">
              9일 연속 성공 🔥
            </div>
            <div className="absolute -right-8 bottom-24 z-20 hidden rotate-[7deg] rounded-2xl border border-ink/10 bg-white px-4 py-3 shadow-xl sm:block">
              <p className="text-[10px] font-bold text-ink/40">오늘의 인증</p>
              <p className="mt-1 font-display text-lg font-black text-ink">AM 06:37</p>
            </div>
            <div className="phone-card rotate-[2.5deg]">
              <div className="flex items-center justify-between border-b border-white/15 px-6 py-5 text-white">
                <span className="font-display text-sm font-black">GOAT.LIFE</span>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold">DAY 09</span>
              </div>
              <div className="p-5">
                <div className="proof-scene flex min-h-[360px] flex-col justify-between rounded-[1.7rem] p-5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-black/25 px-3 py-1.5 text-[10px] font-bold backdrop-blur">오늘 06:37</span>
                    <BadgeCheck className="size-5 text-lime" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white/70">길동님의 아홉 번째 아침</p>
                    <p className="mt-2 font-display text-3xl font-black leading-tight">핑계보다 먼저<br />일어났어요.</p>
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-between px-1 text-white">
                  <div>
                    <p className="text-[10px] font-semibold text-white/45">연속 인증</p>
                    <p className="mt-0.5 font-display text-xl font-black">9 days</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-full bg-coral text-white">
                    <Flame className="size-5" fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-20 text-white sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-extrabold uppercase tracking-[.18em] text-lime">How it works</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-[-.045em] sm:text-6xl">
            단순한 규칙이<br />꾸준한 사람을 만듭니다.
          </h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="bg-ink p-7 sm:p-9">
                <span className="font-display text-sm font-black text-coral">{step.number}</span>
                <h3 className="mt-8 font-display text-2xl font-black tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-white/55">{step.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-[.18em] text-coral">The rule</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-[1.06] tracking-[-.045em] text-ink sm:text-6xl">
                딱 3번까지.<br />그래서 달라져요.
              </h2>
            </div>
            <p className="max-w-xl text-base font-medium leading-7 text-ink/55 lg:justify-self-end">
              챌린지 기간 동안 인증에 {challenge.max_failures}회 {challenge.failure_rule === "AT_OR_ABOVE" ? "이상" : "초과"} 실패하면 보증금을 돌려받을 수 없어요.
              성공 기준과 인증 시간은 시작 전에 명확히 안내합니다.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Camera, label: "하루 한 번", value: "사진 인증" },
              { icon: Clock3, label: "매일 아침", value: `${challenge.proof_start_time.slice(0, 5)} – ${challenge.proof_end_time.slice(0, 5)}` },
              { icon: ShieldCheck, label: "완주하면", value: "보증금 반환" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-3xl border border-ink/10 bg-cream/60 p-6">
                <Icon className="size-5 text-coral" />
                <p className="mt-8 text-xs font-bold text-ink/45">{label}</p>
                <p className="mt-1 font-display text-xl font-black text-ink">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-14 flex flex-col items-center rounded-[2rem] bg-lime px-6 py-12 text-center sm:py-16">
            <p className="text-sm font-extrabold text-ink/55">이번에는 정말 끝까지</p>
            <h2 className="mt-3 font-display text-4xl font-black tracking-[-.05em] text-ink sm:text-6xl">{totalDays}일 뒤, 달라진 나.</h2>
            <Link href="/apply" className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-ink px-7 text-base font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-coral">
              지금 참여하기 <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 bg-white px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-xs font-semibold text-ink/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 GOAT.LIFE</p>
          <p>작심삼일을, 완주하는 습관으로.</p>
        </div>
      </footer>
    </main>
  );
}
