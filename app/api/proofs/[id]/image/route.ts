import { photoRetentionEnded } from "@/lib/photo-retention";
import { isAdmin } from "@/lib/auth/admin";
import { getParticipantSession } from "@/lib/auth/participant";
import { appConfig } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const [{ id }, admin, participant] = await Promise.all([params, isAdmin(), getParticipantSession()]);
  if (!admin && !participant) return new Response("Unauthorized", { status: 401 });
  const supabase = getSupabaseAdmin();
  const { data: proof } = await supabase.from("proofs").select("image_path, challenge_id, status").eq("id", id).maybeSingle();
  if (proof && photoRetentionEnded(proof.challenge_id)) return new Response("Photo retention ended", { status: 410 });
  if (!proof) return new Response("Not found", { status: 404 });
  if (!admin && participant?.challengeId !== proof.challenge_id) return new Response("Forbidden", { status: 403 });
  if (!admin && proof.status !== "VALID") return new Response("Not found", { status: 404 });
  const { data, error } = await supabase.storage.from(appConfig.proofBucket).download(proof.image_path);
  if (error || !data) return new Response("Not found", { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": data.type || "application/octet-stream",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
