/**
 * Browser client for the Grill Restaurant API: starts a check (POST, one
 * request) and reads its events as they stream back.
 */
import type { GrillRequest } from "@/schemas/grill-restaurant";
import { tryCatchAsync } from "@/utils/try-catch";
import type { GrillEvent } from "../check/grill-restaurant";
import { readSse } from "./sse";

export const GRILL_API = "/api/grill-restaurant";

/** What a check is started with: the link, the page's language, and any access code. */
export type GrillSource = GrillRequest & { accessCode?: string };

export class GrillRequestError extends Error {
  constructor(
    message: string,
    /** 400 bad link, 401 access code needed, 403 cross-origin, 503 not configured. */
    readonly status: number,
  ) {
    super(message);
    this.name = "GrillRequestError";
  }
}

function request(source: GrillSource, signal?: AbortSignal) {
  return fetch(GRILL_API, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(source.accessCode ? { "x-access-code": source.accessCode } : {}),
    },
    body: JSON.stringify({
      url: source.url,
      locale: source.locale,
    } satisfies GrillRequest),
    signal,
  });
}

/**
 * Calls onEvent for each event until the run ends. Throws GrillRequestError
 * when the request is refused before the run starts. Resolves quietly when
 * aborted.
 */
export async function streamGrillRun(
  source: GrillSource,
  onEvent: (event: GrillEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const sent = await tryCatchAsync(() => request(source, signal));
  if (sent.error) {
    if (signal?.aborted) return;
    throw new GrillRequestError(
      sent.error instanceof Error ? sent.error.message : "Network error",
      0,
    );
  }
  const response = sent.data;
  const stream = response.body;
  if (!response.ok || !stream) {
    const { data: refusal } = await tryCatchAsync<{ error?: string }>(() =>
      response.json(),
    );
    throw new GrillRequestError(
      refusal?.error ?? `Request failed (${response.status})`,
      response.status,
    );
  }
  const read = await tryCatchAsync(async () => {
    for await (const message of readSse(stream)) {
      onEvent(JSON.parse(message.data) as GrillEvent);
    }
  });
  if (read.error && !signal?.aborted) throw read.error;
}
