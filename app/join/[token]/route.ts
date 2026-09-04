import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { issueParticipantSession } from "@/lib/auth/participant";
import { hashToken } from "@/lib/security";
import { ConfigurationError, getSupabaseAdmin } from "@/lib/supabase/admin";

type JoinFailure = "invalid" | "pending" | "configuration";

function redirectTo(request: NextRequest, pathname: string, access?: JoinFailure) {
  const target = new URL(pathname, request.url);
  if (access) target.searchParams.set("access", access);
  return NextResponse.redirect(target, 303);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (token.length < 32 || token.length > 128) return redirectTo(request, "/login", "invalid");

  try {
    const supabase = getSupabaseAdmin();
    const { data: participantToken } = await supabase
      .from("participant_tokens")
      .select("id, participant_id")
      .eq("token_hash", hashToken(token))
      .gt("expires_at", new Date().toISOString())
      .is("revoked_at", null)
      .maybeSingle();

    if (!participantToken) return redirectTo(request, "/login", "invalid");

    const { data: active } = await supabase
      .from("challenge_participants")
      .select("id")
      .eq("participant_id", participantToken.participant_id)
      .in("participant_status", ["ACTIVE", "SUCCESS", "FAILED", "REFUNDED"])
      .limit(1)
      .maybeSingle();

    if (!active) return redirectTo(request, "/login", "pending");

    await issueParticipantSession(participantToken.participant_id);
    const { error: tokenUpdateError } = await supabase
      .from("participant_tokens")
      .update({ used_at: new Date().toISOString() })
      .eq("id", participantToken.id);
    if (tokenUpdateError) console.error("JoinRoute token usage update", tokenUpdateError);

    return redirectTo(request, "/feed");
  } catch (error) {
    if (error instanceof ConfigurationError) return redirectTo(request, "/login", "configuration");
    console.error("JoinRoute", error);
    return redirectTo(request, "/login", "invalid");
  }
}
