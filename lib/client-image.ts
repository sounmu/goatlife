const TARGET_BYTES = 3 * 1024 * 1024;
const INITIAL_MAX_EDGE = 2560;
const QUALITY_STEPS = [0.9, 0.85, 0.8];

export interface CompressedImage {
  file: File;
  originalBytes: number;
  width: number;
  height: number;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("이 브라우저에서 사진을 읽을 수 없어요."));
    };
    image.src = url;
  });
}

async function encodeImage(canvas: HTMLCanvasElement, quality: number) {
  const webp = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
  if (webp?.type === "image/webp") return webp;
  const jpeg = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!jpeg) throw new Error("사진을 생성하지 못했어요. 더 작은 사진으로 다시 시도해 주세요.");
  if (jpeg.type !== "image/jpeg") throw new Error("이 브라우저에서 사진을 압축할 수 없어요.");
  return jpeg;
}

export async function compressImageForUpload(source: File): Promise<CompressedImage> {
  if (!source.type.startsWith("image/")) throw new Error("이미지 파일을 선택해 주세요.");
  if (source.type === "image/webp" && source.size <= TARGET_BYTES) {
    const image = await loadImage(source);
    if (Math.max(image.naturalWidth, image.naturalHeight) <= INITIAL_MAX_EDGE) {
      return { file: source, originalBytes: source.size, width: image.naturalWidth, height: image.naturalHeight };
    }
  }

  const image = await loadImage(source);
  if (!image.naturalWidth || !image.naturalHeight) throw new Error("사진 크기를 확인할 수 없어요.");

  const initialScale = Math.min(1, INITIAL_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight));
  let width = Math.max(1, Math.round(image.naturalWidth * initialScale));
  let height = Math.max(1, Math.round(image.naturalHeight * initialScale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("사진 압축을 시작할 수 없어요.");

  for (let resizeAttempt = 0; resizeAttempt < 7; resizeAttempt += 1) {
    canvas.width = width;
    canvas.height = height;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    for (const quality of QUALITY_STEPS) {
      const blob = await encodeImage(canvas, quality);
      if (blob.size <= TARGET_BYTES) {
        const baseName = source.name.replace(/\.[^.]+$/, "") || "proof";
        return {
          file: new File([blob], `${baseName}.${blob.type === "image/webp" ? "webp" : "jpg"}`, { type: blob.type, lastModified: Date.now() }),
          originalBytes: source.size,
          width,
          height,
        };
      }
    }

    width = Math.max(1, Math.round(width * 0.8));
    height = Math.max(1, Math.round(height * 0.8));
  }

  throw new Error("사진을 3MB 이하로 줄이지 못했어요. 다른 사진을 선택해 주세요.");
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
}
