import { compressionSettingsSchema } from "@/schemas/image-compress";
import { tryCatch } from "@/utils/try-catch";
import {
  REMOTE_MAX_BYTES,
  type CompressionSettings,
  type EncodedImage,
} from "../compression/compression";
import { compressOnServer, ImageRequestError } from "./server-compression";

const UPLOAD_TOO_LARGE =
  "Remote uploads are limited to 4 MB. Use local mode for larger images.";

/** The settings the page sends in the X-Image-Settings header. */
function readSettings(request: Request): CompressionSettings {
  const raw = request.headers.get("x-image-settings");
  if (!raw || raw.length > 1024)
    throw new ImageRequestError("Image settings are required.");
  const parsed = tryCatch(() =>
    compressionSettingsSchema.parse(JSON.parse(raw)),
  );
  if (parsed.error) throw new ImageRequestError("Invalid image settings.");
  return parsed.data;
}

/** The uploaded image, read no further than the remote size limit. */
async function readUpload(request: Request): Promise<Buffer> {
  if (Number(request.headers.get("content-length")) > REMOTE_MAX_BYTES)
    throw new ImageRequestError(UPLOAD_TOO_LARGE, 413);
  const reader = request.body?.getReader();
  if (!reader) throw new ImageRequestError("Choose a non-empty image.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > REMOTE_MAX_BYTES) {
        await reader.cancel();
        throw new ImageRequestError(UPLOAD_TOO_LARGE, 413);
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (!size) throw new ImageRequestError("Choose a non-empty image.");
  return Buffer.concat(chunks);
}

/**
 * Converts the image in a POST to /api/image-compress. Rejects with an
 * ImageRequestError, carrying its HTTP status, when the request is at fault.
 */
export async function convertUpload(request: Request): Promise<EncodedImage> {
  const settings = readSettings(request);
  const input = await readUpload(request);
  const result = await compressOnServer(input, settings, request.signal);
  if (result.blob.size > REMOTE_MAX_BYTES)
    throw new ImageRequestError(
      "The converted file exceeds the 4 MB remote download limit. Choose a smaller size, lower quality, or local mode.",
      413,
    );
  return result;
}

/** The converted image, with its size and the time it took in headers. */
export function imageResponse(result: EncodedImage, seconds: number) {
  return new Response(result.blob, {
    headers: {
      "Content-Type": result.blob.type,
      "Content-Length": String(result.blob.size),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Image-Width": String(result.width),
      "X-Image-Height": String(result.height),
      "X-Image-Quality": String(result.quality),
      "X-Processing-Seconds": String(seconds),
    },
  });
}
