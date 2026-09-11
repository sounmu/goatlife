import { afterEach, expect, it, vi } from "vitest";
import { compressImageForUpload } from "./client-image";

afterEach(() => vi.unstubAllGlobals());

it("falls back to a correctly labeled JPEG when WebP encoding returns PNG", async () => {
  vi.stubGlobal("Image", class {
    naturalWidth = 100;
    naturalHeight = 100;
    onload?: () => void;
    set src(_: string) { this.onload?.(); }
  });
  const toBlob = vi.fn((callback: (blob: Blob) => void, type: string) => {
    callback(new Blob(["encoded"], { type: type === "image/webp" ? "image/png" : type }));
  });
  vi.stubGlobal("document", {
    createElement: () => ({
      getContext: () => ({ fillRect() {}, drawImage() {} }),
      toBlob,
    }),
  });
  const result = await compressImageForUpload(new File(["source"], "photo.png", { type: "image/png" }));
  expect(result.file.type).toBe("image/jpeg");
  expect(result.file.name).toBe("photo.jpg");
  expect(toBlob.mock.calls.map((call) => call[1])).toEqual(["image/webp", "image/jpeg"]);
});
