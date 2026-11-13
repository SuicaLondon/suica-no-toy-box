import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { streamGrillRun } from "../stream/grill-client";
import type { GrillEvent } from "../check/grill-restaurant";
import { sseResponse } from "../test/fake-responses";
import {
  CONNECTION_LOST,
  grillViewReducer,
  initialGrillView,
  useGrillRun,
} from "./use-grill-run";

const started: GrillEvent = {
  t: 0,
  type: "run.started",
  place: { name: "Secret Stall" },
  models: {
    google: "g",
    otherSources: "o",
    michelin: "o",
    summary: "s",
  },
  language: "en",
};
const completed: GrillEvent = {
  t: 10,
  type: "run.completed",
  michelinTimeline: null,
  cost: { agents: {}, translations: {}, total: 0 },
};

afterEach(() => vi.unstubAllGlobals());

describe("streamGrillRun", () => {
  it("POSTs the link and yields each event", async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([started]));
    vi.stubGlobal("fetch", fetchMock);
    const events: GrillEvent[] = [];
    await streamGrillRun(
      { url: "https://maps.app.goo.gl/x", accessCode: "c" },
      (e) => events.push(e),
    );
    expect(events).toEqual([started]);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/grill-restaurant");
    expect(init.method).toBe("POST");
    expect(init.headers["x-access-code"]).toBe("c");
    expect(JSON.parse(init.body)).toEqual({ url: "https://maps.app.goo.gl/x" });
  });

  it("throws the server's message when refused", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ error: "Not a Maps link." }, { status: 400 }),
        ),
    );
    await expect(streamGrillRun({ url: "x" }, () => {})).rejects.toMatchObject({
      status: 400,
      message: "Not a Maps link.",
    });
  });
});

describe("grillViewReducer", () => {
  it("marks a stream that closes mid-run as a lost connection", () => {
    let state = grillViewReducer(initialGrillView(), { type: "start" });
    state = grillViewReducer(state, { type: "event", event: started });
    state = grillViewReducer(state, { type: "ended" });
    expect(state).toMatchObject({
      status: "failed",
      error: CONNECTION_LOST,
      streaming: false,
    });
  });

  it("keeps a completed run as done when the stream ends", () => {
    let state = grillViewReducer(initialGrillView(), { type: "start" });
    state = grillViewReducer(state, { type: "event", event: started });
    state = grillViewReducer(state, { type: "event", event: completed });
    state = grillViewReducer(state, { type: "ended" });
    expect(state).toMatchObject({ status: "done", streaming: false });
  });
});

describe("useGrillRun", () => {
  it("streams a run into state", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(sseResponse([started, completed])),
    );
    const { result } = renderHook(() => useGrillRun());
    await act(() => result.current.start({ url: "https://maps.app.goo.gl/x" }));
    expect(result.current.state).toMatchObject({
      status: "done",
      streaming: false,
      place: { name: "Secret Stall" },
    });
  });

  it("reports a refused request", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json({ error: "Code needed." }, { status: 401 }),
        ),
    );
    const { result } = renderHook(() => useGrillRun());
    await act(() => result.current.start({ url: "x" }));
    expect(result.current.state.requestError).toEqual({
      message: "Code needed.",
      status: 401,
    });
  });

  it("can be cancelled mid-stream", async () => {
    let close!: () => void;
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(started)}\n\n`),
        );
        close = () => controller.close();
      },
    });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
    const { result } = renderHook(() => useGrillRun());
    let running!: Promise<void>;
    act(() => {
      running = result.current.start({ url: "https://maps.app.goo.gl/x" });
    });
    await waitFor(() => expect(result.current.state.status).toBe("running"));
    act(() => result.current.cancel());
    close();
    await act(() => running);
    expect(result.current.state).toMatchObject({
      cancelled: true,
      streaming: false,
      status: "running",
    });
  });
});
