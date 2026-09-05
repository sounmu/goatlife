import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deleteCampaignPhotos, photoCampaignId, photoDeleteAt, photoRetentionEnded } from "./photo-retention";

function storageMock(count = 205, failRemove = false) {
  const files = new Set(Array.from({ length: count }, (_, i) => `${photoCampaignId}/member/${String(i).padStart(4, "0")}.webp`));
  const list = vi.fn(async (prefix: string, { offset, limit }: { offset: number; limit: number }) => {
    if (prefix === photoCampaignId) return { data: offset === 0 && files.size ? [{ id: null, name: "member" }] : [], error: null };
    if (prefix !== `${photoCampaignId}/member`) throw new Error("Out-of-scope listing");
    return { data: [...files].sort().slice(offset, offset + limit).map((path) => ({ id: path, name: path.split("/").at(-1) })), error: null };
  });
  const remove = vi.fn(async (paths: string[]) => {
    if (failRemove) return { error: new Error("Storage unavailable") };
    paths.forEach((path) => files.delete(path));
    return { error: null };
  });
  const from = vi.fn(() => ({ list, remove }));
  return { client: { storage: { from } } as unknown as SupabaseClient, files, from, list, remove };
}

describe("campaign photo retention", () => {
  it("uses the Korean midnight boundary and limits the campaign", () => {
    expect(photoRetentionEnded(photoCampaignId, photoDeleteAt - 1)).toBe(false);
    expect(photoRetentionEnded(photoCampaignId, photoDeleteAt)).toBe(true);
    expect(photoRetentionEnded("another-campaign", photoDeleteAt)).toBe(false);
  });
  it("never touches storage before the deletion date", async () => {
    const mock = storageMock();
    expect(await deleteCampaignPhotos(mock.client, photoDeleteAt - 1)).toEqual({ skipped: true, deleted: 0 });
    expect(mock.from).not.toHaveBeenCalled();
  });
  it("deletes all pages and safely reruns after completion", async () => {
    const mock = storageMock();
    expect(await deleteCampaignPhotos(mock.client, photoDeleteAt)).toEqual({ skipped: false, deleted: 205 });
    expect(mock.files.size).toBe(0);
    expect(mock.remove).toHaveBeenCalledTimes(3);
    expect(await deleteCampaignPhotos(mock.client, photoDeleteAt)).toEqual({ skipped: false, deleted: 0 });
  });
  it("reports removal failure instead of success", async () => {
    const mock = storageMock(2, true);
    await expect(deleteCampaignPhotos(mock.client, photoDeleteAt)).rejects.toThrow("Photo deletion failed");
    expect(mock.files.size).toBe(2);
  });
  it("does not delete after listing fails", async () => {
    const mock = storageMock();
    mock.list.mockRejectedValueOnce(new Error("Listing failed"));
    await expect(deleteCampaignPhotos(mock.client, photoDeleteAt)).rejects.toThrow();
    expect(mock.remove).not.toHaveBeenCalled();
  });
});
