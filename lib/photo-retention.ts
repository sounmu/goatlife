import type { SupabaseClient } from "@supabase/supabase-js";

export const photoCampaignId = "11111111-1111-4111-8111-111111111111";
export const photoDeleteAt = Date.parse("2026-10-04T00:00:00+09:00");
export function photoRetentionEnded(challengeId: string, now = Date.now()) {
  return challengeId === photoCampaignId && now >= photoDeleteAt;
}

export async function deleteCampaignPhotos(client: SupabaseClient, now = Date.now()) {
  if (!photoRetentionEnded(photoCampaignId, now)) return { skipped: true, deleted: 0 };
  const bucket = client.storage.from("proof-images");
  async function listFiles(prefix: string): Promise<string[]> {
    const paths: string[] = [];
    for (let offset = 0; ; offset += 100) {
      const { data, error } = await bucket.list(prefix, { limit: 100, offset, sortBy: { column: "name", order: "asc" } });
      if (error || !data) throw new Error("Photo listing failed");
      for (const entry of data) {
        const path = `${prefix}/${entry.name}`;
        if (entry.id) paths.push(path);
        else paths.push(...await listFiles(path));
      }
      if (data.length < 100) break;
    }
    return paths;
  }
  // Enumerate before deleting so pagination cannot skip files as offsets shift.
  // Storage enumeration also includes orphaned uploads without a proofs row.
  const paths = await listFiles(photoCampaignId);
  for (let i = 0; i < paths.length; i += 100) {
    const { error } = await bucket.remove(paths.slice(i, i + 100));
    if (error) throw new Error("Photo deletion failed; retry required");
  }
  if ((await listFiles(photoCampaignId)).length) throw new Error("Photos remain; retry required");
  return { skipped: false, deleted: paths.length };
}
