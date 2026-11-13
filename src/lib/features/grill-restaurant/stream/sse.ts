/**
 * Minimal Server-Sent Events helpers, shared by the server (reading OpenAI's
 * stream, writing ours) and the browser (reading ours from a POST, which
 * EventSource cannot send).
 */
import { tryCatch } from "@/utils/try-catch";
import { BLANK_LINE, LEADING_BLANK_LINE, LINE_BREAK } from "@/utils/regex";

export type SseMessage = { event?: string; data: string };

/** Yields each message in an SSE byte stream. */
export async function* readSse(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<SseMessage> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });
      let boundary: number;
      while ((boundary = buffer.search(BLANK_LINE)) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary).replace(LEADING_BLANK_LINE, "");
        const message = parseBlock(block);
        if (message) yield message;
      }
      if (done) {
        const message = parseBlock(buffer);
        if (message) yield message;
        return;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

function parseBlock(block: string): SseMessage | null {
  let event: string | undefined;
  const data: string[] = [];
  for (const line of block.split(LINE_BREAK)) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trimStart());
  }
  return data.length ? { event, data: data.join("\n") } : null;
}

/** Encodes one SSE message carrying a JSON payload. */
export function encodeSse(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

/**
 * A response that streams each payload `write` sends as an SSE message, then
 * closes when `write` settles. Nothing is sent once `signal` aborts, because
 * the reader has gone. With `heartbeatMs`, a comment line keeps proxies from
 * closing a quiet connection.
 */
export function sseResponse(
  write: (send: (payload: unknown) => void) => Promise<void>,
  { signal, heartbeatMs }: { signal: AbortSignal; heartbeatMs?: number },
): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (chunk: string) => {
        if (signal.aborted) return;
        // The reader may close between the check and the write.
        tryCatch(() => controller.enqueue(encoder.encode(chunk)));
      };
      const heartbeat = heartbeatMs
        ? setInterval(() => push(": ping\n\n"), heartbeatMs)
        : undefined;
      try {
        await write((payload) => push(encodeSse(payload)));
      } finally {
        clearInterval(heartbeat);
        // An aborted reader may have closed it already.
        tryCatch(() => controller.close());
      }
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "private, no-store, no-transform",
      // Stops nginx from buffering the stream.
      "X-Accel-Buffering": "no",
    },
  });
}
