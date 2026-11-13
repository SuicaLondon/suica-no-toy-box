import {
  compressionSettingsSchema,
  type CompressionSettings,
} from "@/schemas/image-compress";
export { MAX_IMAGE_DIMENSION } from "@/schemas/image-compress";
export type {
  CompressionSettings,
  CompressionMode,
  ImageFormat,
} from "@/schemas/image-compress";

export type ProcessingLocation = "local" | "remote";

export interface EncodedImage {
  blob: Blob;
  width: number;
  height: number;
  quality: number;
}

export type EncodeImage = (
  width: number,
  height: number,
  quality: number,
) => Promise<Blob>;

export const MAX_PIXELS = 50_000_000;
export const MAX_FILE_BYTES = 50_000_000;
// Leave headroom beneath Vercel's 4.5 MB request/response limit.
export const REMOTE_MAX_BYTES = 4_000_000;
export const REMOTE_MAX_PIXELS = 20_000_000;

export function dimensionsAtWidth(
  width: number,
  originalWidth: number,
  originalHeight: number,
) {
  const bounded = Math.max(1, Math.min(originalWidth, Math.round(width)));
  return {
    width: bounded,
    height: Math.max(1, Math.round((originalHeight * bounded) / originalWidth)),
  };
}

export function validateSettings(settings: CompressionSettings) {
  if (!compressionSettingsSchema.safeParse(settings).success) {
    throw new Error("Enter a valid format, size, quality and image width.");
  }
}

// Search actual encoded bytes, since quality values do not predict file size.
// Preserve dimensions first; only allow resizing when output size is not fixed.
// Keep the smallest candidate when the bounded search cannot meet the limit.
export async function compressImage(
  originalWidth: number,
  originalHeight: number,
  settings: CompressionSettings,
  encode: EncodeImage,
): Promise<EncodedImage> {
  validateSettings(settings);
  const initial =
    settings.output ??
    dimensionsAtWidth(
      settings.mode === "manual" ? settings.width : originalWidth,
      originalWidth,
      originalHeight,
    );
  const attempt = async (width: number, height: number, quality: number) => ({
    blob: await encode(width, height, quality),
    width,
    height,
    quality,
  });
  if (settings.mode === "manual") {
    return attempt(
      initial.width,
      initial.height,
      settings.format === "png" ? 100 : settings.quality,
    );
  }

  let width = initial.width;
  let best: EncodedImage | undefined;
  for (let resize = 0; resize < (settings.output ? 1 : 12); resize++) {
    const dimensions =
      settings.output ??
      dimensionsAtWidth(width, originalWidth, originalHeight);
    const high = await attempt(dimensions.width, dimensions.height, 100);
    if (!best || high.blob.size < best.blob.size) best = high;
    if (high.blob.size <= settings.targetBytes) return high;

    let small = high;
    if (settings.format !== "png") {
      const minimumQuality = settings.output ? 1 : 35;
      small = await attempt(
        dimensions.width,
        dimensions.height,
        minimumQuality,
      );
      if (small.blob.size < best.blob.size) best = small;
      if (small.blob.size <= settings.targetBytes) {
        let fit = small;
        let lowQuality = minimumQuality;
        let highQuality = 100;
        for (let step = 0; step < 7 && highQuality - lowQuality > 1; step++) {
          const quality = Math.floor((lowQuality + highQuality) / 2);
          const candidate = await attempt(
            dimensions.width,
            dimensions.height,
            quality,
          );
          if (candidate.blob.size <= settings.targetBytes) {
            fit = candidate;
            lowQuality = quality;
          } else {
            highQuality = quality;
          }
        }
        return fit;
      }
    }
    if (width === 1) break;
    const ratio = Math.max(
      0.25,
      Math.min(0.8, Math.sqrt(settings.targetBytes / small.blob.size) * 0.9),
    );
    width = Math.max(1, Math.floor(width * ratio));
  }
  return best!;
}

export function formatBytes(bytes: number) {
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(2)} MB`
    : `${(bytes / 1_000).toFixed(1)} KB`;
}
