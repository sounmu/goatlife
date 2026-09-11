import sharp from "sharp";

export async function normalizeProofImage(input: Buffer, maxBytes: number): Promise<Buffer> {
  // Inspect actual bytes: client MIME labels do not guarantee the encoded format.
  const source = sharp(input, { limitInputPixels: 40_000_000 });
  const metadata = await source.metadata();
  if (!["jpeg", "webp"].includes(metadata.format ?? "")) throw new Error("Unsupported image format");
  for (const quality of [85, 75, 60]) {
    const output = await source.clone().rotate()
      .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
      .webp({ quality }).toBuffer();
    if (output.length <= maxBytes) return output;
  }
  throw new Error("Image exceeds upload limit");
}
