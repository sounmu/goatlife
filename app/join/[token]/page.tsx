import type { Metadata } from "next";
import Link from "next/link";
import { issueParticipantSession } from "@/lib/auth/participant";
import { hashToken } from "@/lib/security";
import { ConfigurationError, getSupabaseAdmin } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "참가 링크 확인" };
export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  let message = "참가 링크가 올바르지 않거나 만료되었어요.";
  if (token.length >= 32 && token.length <= 128) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: participantToken } = await supabase
        .from("participant_tokens")
        .select("id, participant_id, expires_at, revoked_at")
        .eq("token_hash", hashToken(token))
        .gt("expires_at", new Date().toISOString())
        .is("revoked_at", null)
        .maybeSingle();
      if (participantToken) {
        const { data: active } = await supabase
          .from("challenge_participants")
          .select("id")
          .eq("participant_id", participantToken.participant_id)
          .in("participant_status", ["ACTIVE", "SUCCESS", "FAILED", "REFUNDED"])
          .limit(1)
          .maybeSingle();
        if (active) {
          await Promise.all([
            issueParticipantSession(participantToken.participant_id),
            supabase.from("participant_tokens").update({ used_at: new Date().toISOString() }).eq("id", participantToken.id),
          ]);
          redirect("/feed");
        }
        message = "아직 입금 확인이 완료되지 않았어요.";
      }
    } catch (error) {
      if (error && typeof error === "object" && "digest" in error) throw error;
      if (error instanceof ConfigurationError) message = "서비스 연결이 준비 중이에요. 운영자에게 문의해 주세요.";
      else console.error("JoinPage", error);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="max-w-md rounded-[2rem] border border-ink/10 bg-white p-8 text-center shadow-xl shadow-ink/5">
        <p className="text-sm font-extrabold text-coral">링크 확인 실패</p>
        <h1 className="mt-3 font-display text-3xl font-black tracking-[-.04em]">다시 확인해 주세요.</h1>
        <p className="mt-4 text-sm font-medium leading-6 text-ink/50">{message}</p>
        <Link href="/login" className="mt-7 inline-flex h-12 items-center rounded-full bg-ink px-6 text-sm font-extrabold text-white">참가코드로 로그인</Link>
      </div>
    </main>
  );
}
