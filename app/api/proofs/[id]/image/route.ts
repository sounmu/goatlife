import sharp from "sharp";
import { photoRetentionEnded } from "@/lib/photo-retention";
import { isAdmin } from "@/lib/auth/admin";
import { getParticipantSession } from "@/lib/auth/participant";
import { appConfig } from "@/lib/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
  let body: Blob = data;
  if (new URL(request.url).searchParams.get("thumbnail") === "1") {
    try {
      const thumbnail = await sharp(Buffer.from(await data.arrayBuffer()))
        .rotate()
        .resize({ width: 960, height: 960, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      body = new Blob([new Uint8Array(thumbnail)], { type: "image/webp" });
    } catch {
      // Older uploads must remain viewable if thumbnail conversion fails.
      body = data;
    }
  }
  return new Response(body, {
    headers: {
      "Content-Type": body.type || "application/octet-stream",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
