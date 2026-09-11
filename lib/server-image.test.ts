import { describe, expect, it } from "vitest";
import sharp from "sharp";
import { normalizeProofImage } from "./server-image";

describe("normalizeProofImage", () => {
  it.each(["jpeg", "webp"] as const)("stores %s as genuine WebP within the size limit", async (format) => {
    const input = await sharp({ create: { width: 2800, height: 100, channels: 3, background: "red" } })
      .toFormat(format).toBuffer();
    const output = await normalizeProofImage(input, 3 * 1024 * 1024);
    const metadata = await sharp(output).metadata();
    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(2560);
    expect(output.length).toBeLessThanOrEqual(3 * 1024 * 1024);
  });

  it("rejects invalid bytes and PNG disguised with a supported MIME label", async () => {
    await expect(normalizeProofImage(Buffer.from("invalid"), 1000)).rejects.toThrow();
    const png = await sharp({ create: { width: 1, height: 1, channels: 3, background: "red" } }).png().toBuffer();
    await expect(normalizeProofImage(png, 1000)).rejects.toThrow("Unsupported image format");
  });
});
