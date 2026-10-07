import { compressionSettingsSchema } from "@/schemas/image-compress";
import { REMOTE_MAX_BYTES } from "@/lib/features/image-compress/compression";
import {
  compressOnServer,
  ImageRequestError,
} from "@/lib/features/image-compress/server-compression";

export const runtime = "nodejs";
export const maxDuration = 60;

function failure(message: string, status: number) {
  return Response.json(
    { error: message },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}

export async function POST(request: Request) {
  const start = performance.now();
  try {
    const origin = request.headers.get("origin");
    if (origin) {
      // Next.js can normalize request.url to localhost behind a proxy. The
      // incoming Host retains the public address used by the browser.
      const host = request.headers.get("host") ?? new URL(request.url).host;
      try {
        if (new URL(origin).host !== host)
          return failure("Cross-origin image uploads are not allowed.", 403);
      } catch {
        return failure("Invalid request origin.", 403);
      }
    }
    const rawSettings = request.headers.get("x-image-settings");
    if (!rawSettings || rawSettings.length > 1024)
      return failure("Image settings are required.", 400);
    let settings;
    try {
      settings = compressionSettingsSchema.parse(JSON.parse(rawSettings));
    } catch {
      return failure("Invalid image settings.", 400);
    }
    if (Number(request.headers.get("content-length")) > REMOTE_MAX_BYTES)
      return failure(
        "Remote uploads are limited to 4 MB. Use local mode for larger images.",
        413,
      );
    const reader = request.body?.getReader();
    if (!reader) return failure("Choose a non-empty image.", 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > REMOTE_MAX_BYTES) {
          await reader.cancel();
          return failure(
            "Remote uploads are limited to 4 MB. Use local mode for larger images.",
            413,
          );
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    if (!size) return failure("Choose a non-empty image.", 400);
    const result = await compressOnServer(
      Buffer.concat(chunks),
      settings,
      request.signal,
    );
    if (result.blob.size > REMOTE_MAX_BYTES)
      return failure(
        "The converted file exceeds the 4 MB remote download limit. Choose a smaller size, lower quality, or local mode.",
        413,
      );
    return new Response(result.blob, {
      headers: {
        "Content-Type": result.blob.type,
        "Content-Length": String(result.blob.size),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Image-Width": String(result.width),
        "X-Image-Height": String(result.height),
        "X-Image-Quality": String(result.quality),
        "X-Processing-Seconds": String((performance.now() - start) / 1000),
      },
    });
  } catch (error) {
    if (error instanceof ImageRequestError)
      return failure(error.message, error.status);
    if (request.signal.aborted)
      return failure("The request was cancelled.", 499);
    return failure(
      "Remote conversion failed. Retry or switch to local mode.",
      500,
    );
  }
}
