import {
  convertUpload,
  imageResponse,
} from "@/lib/features/image-compress/remote/convert-upload";
import { ImageRequestError } from "@/lib/features/image-compress/remote/server-compression";
import { errorResponse, isSameOrigin } from "@/utils/http";
import { tryCatchAsync } from "@/utils/try-catch";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const start = performance.now();
  if (!isSameOrigin(request))
    return errorResponse("Cross-origin image uploads are not allowed.", 403);
  const { data, error } = await tryCatchAsync(() => convertUpload(request));
  if (!error) return imageResponse(data, (performance.now() - start) / 1000);
  if (error instanceof ImageRequestError)
    return errorResponse(error.message, error.status);
  if (request.signal.aborted)
    return errorResponse("The request was cancelled.", 499);
  return errorResponse(
    "Remote conversion failed. Retry or switch to local mode.",
    500,
  );
}
