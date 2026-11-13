import { readGrillEnv } from "@/lib/features/grill-restaurant/check/grill-env.server";
import { startGrillRun } from "@/lib/features/grill-restaurant/check/grill-run";
import {
  classifyMapsLink,
  MapsLinkError,
} from "@/lib/features/grill-restaurant/check/maps-link";
import { sseResponse } from "@/lib/features/grill-restaurant/stream/sse";
import { grillRequestSchema } from "@/schemas/grill-restaurant";
import { errorResponse, isSameOrigin } from "@/utils/http";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";

export const runtime = "nodejs";
// A check takes one to two minutes.
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return errorResponse("Cross-origin requests are not allowed.", 403);
  }
  const settings = readGrillEnv();
  if (!settings.ok) {
    console.error(
      `Grill Restaurant is not configured: ${settings.problems.join("; ")}`,
    );
    return errorResponse("Grill Restaurant is not configured.", 503);
  }
  const { env } = settings;
  if (
    env.accessCode &&
    request.headers.get("x-access-code") !== env.accessCode
  ) {
    return errorResponse("An access code is required.", 401);
  }

  const { data: json } = await tryCatchAsync(() => request.json());
  const parsed = grillRequestSchema.safeParse(json);
  if (!parsed.success) return errorResponse("Paste a Google Maps link.", 400);
  const body = parsed.data;
  const link = tryCatch(() => classifyMapsLink(body.url));
  if (link.error) {
    return errorResponse(
      link.error instanceof MapsLinkError
        ? link.error.message
        : "Paste a Google Maps link.",
      400,
    );
  }

  const { signal } = request;
  // Stop paying for the searches when the reader goes away.
  const fetchWithSignal: typeof fetch = (input, init) =>
    fetch(input, { ...init, signal });

  return sseResponse(
    (send) =>
      startGrillRun({
        ...env.providers,
        input: body.url,
        language: body.locale,
        fetch: fetchWithSignal,
        onEvent: send,
      }),
    { signal, heartbeatMs: 15_000 },
  );
}
