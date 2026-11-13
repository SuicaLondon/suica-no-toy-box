// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { readSse, sseResponse } from "./sse";

async function payloads(response: Response) {
  const received: unknown[] = [];
  for await (const message of readSse(response.body!)) {
    received.push(JSON.parse(message.data));
  }
  return received;
}

afterEach(() => vi.useRealTimers());

describe("sseResponse", () => {
  it("streams each payload as an uncached event stream, then closes", async () => {
    const response = sseResponse(
      async (send) => {
        send({ step: 1 });
        send({ step: 2 });
      },
      { signal: new AbortController().signal },
    );
    expect(response.headers.get("content-type")).toBe(
      "text/event-stream; charset=utf-8",
    );
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(await payloads(response)).toEqual([{ step: 1 }, { step: 2 }]);
  });

  it("stops sending once the reader has gone", async () => {
    const reader = new AbortController();
    const response = sseResponse(
      async (send) => {
        send({ step: 1 });
        reader.abort();
        send({ step: 2 });
      },
      { signal: reader.signal },
    );
    expect(await payloads(response)).toEqual([{ step: 1 }]);
  });

  it("sends a heartbeat while the writer is quiet", async () => {
    vi.useFakeTimers();
    let finish = () => {};
    const response = sseResponse(
      () => new Promise<void>((resolve) => (finish = resolve)),
      { signal: new AbortController().signal, heartbeatMs: 1000 },
    );
    const text = response.text();
    await vi.advanceTimersByTimeAsync(2500);
    finish();
    expect(await text).toBe(": ping\n\n: ping\n\n");
  });
});
