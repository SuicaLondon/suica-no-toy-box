import { describe, expect, it, vi } from "vitest";
import type { GrillEvent } from "./grill-restaurant";
import { looksLikeLink, startGrillRun } from "./grill-run";
import { encodeSse, readSse } from "../stream/sse";

function streamOf(...chunks: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

async function collect<T>(iterable: AsyncIterable<T>) {
  const items: T[] = [];
  for await (const item of iterable) items.push(item);
  return items;
}

describe("readSse", () => {
  it("joins messages split across chunks and skips comments", async () => {
    const messages = await collect(
      readSse(
        streamOf(
          ": ping\n\n",
          'event: x\ndata: {"a"',
          ":1}\n\ndata: b\r\n\r\n",
          "data: tail",
        ),
      ),
    );
    expect(messages).toEqual([
      { event: "x", data: '{"a":1}' },
      { event: undefined, data: "b" },
      { event: undefined, data: "tail" },
    ]);
  });

  it("round-trips encodeSse", async () => {
    const [message] = await collect(readSse(streamOf(encodeSse({ n: 1 }))));
    expect(JSON.parse(message.data)).toEqual({ n: 1 });
  });
});

describe("startGrillRun", () => {
  const keys = { geminiApiKey: "g", openaiApiKey: "o" };

  it("reports a bad link as run.failed without calling any agent", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchMock = vi.fn();
    const events: GrillEvent[] = [];
    await startGrillRun({
      ...keys,
      input: "https://example.com/place",
      fetch: fetchMock,
      onEvent: (e) => events.push(e),
    });
    expect(events).toEqual([
      expect.objectContaining({
        type: "run.failed",
        error: "That is not a Google Maps link.",
      }),
    ]);
    expect(fetchMock).not.toHaveBeenCalled();
    // The server log keeps the reason, without the link itself.
    expect(warn).toHaveBeenCalledWith(
      "Grill Restaurant could not open the link (unsupported): That is not a Google Maps link.",
    );
    warn.mockRestore();
  });

  it("only accepts typed names when allowed", async () => {
    const events: GrillEvent[] = [];
    await startGrillRun({
      ...keys,
      input: "King of Laksa",
      fetch: vi.fn(),
      onEvent: (e) => events.push(e),
    });
    expect(events[0]).toMatchObject({ type: "run.failed" });
    expect(looksLikeLink("King of Laksa")).toBe(false);
    expect(looksLikeLink(" https://maps.app.goo.gl/x")).toBe(true);
  });
});
