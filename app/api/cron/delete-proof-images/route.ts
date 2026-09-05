import { timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { deleteCampaignPhotos } from "@/lib/photo-retention";

export const runtime = "nodejs";
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("Cron is not configured", { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const supplied = Buffer.from(request.headers.get("authorization") ?? "");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return new Response("Unauthorized", { status: 401 });
  try {
    const result = await deleteCampaignPhotos(getSupabaseAdmin());
    console.info("campaign-photo-cleanup", result);
    return Response.json(result);
  } catch {
    console.error("campaign-photo-cleanup failed; retry required");
    return Response.json({ error: "Photo cleanup failed; retry required" }, { status: 500 });
  }
}
