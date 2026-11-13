import { describe, expect, it } from "vitest";
import type { AgentState, GrillRunState } from "../../check/grill-state";
import {
  buildLane,
  buildLanes,
  estimateRun,
  formatClock,
  hostOf,
  parseProgress,
  secondsLeft,
} from "./progress";

function agent(partial: Partial<AgentState>): AgentState {
  return { status: "waiting", progress: [], ...partial };
}

/** Agents with no results: the estimates only read status and timing. */
function agents(
  partial: Partial<Record<keyof GrillRunState["agents"], AgentState>>,
): GrillRunState["agents"] {
  return {
    google: agent({}),
    otherSources: agent({}),
    michelin: agent({}),
    summary: agent({}),
    ...partial,
  } as GrillRunState["agents"];
}

function estimate(
  state: GrillRunState["agents"],
  now: number,
  translates = false,
) {
  return estimateRun(buildLanes(state, null), state, now, translates);
}

describe("estimateRun", () => {
  const running = { status: "running" as const, startedAt: 0 };

  it("expects each agent to take its usual time, and the summary to follow the web searches", () => {
    const result = estimate(
      agents({
        google: agent(running),
        otherSources: agent(running),
        michelin: agent(running),
      }),
      10,
    );
    // Google Maps asks two questions in turn.
    expect(result.lanes.google).toEqual({ start: 0, end: 45, overdue: false });
    expect(result.lanes.otherSources?.end).toBe(50);
    expect(result.lanes.michelin?.end).toBe(30);
    expect(result.lanes.summary).toEqual({
      start: 50,
      end: 59,
      overdue: false,
    });
    expect(result.end).toBe(59);
    expect(result.overdue).toBe(false);
  });

  it("starts the summary from when the web searches really ended", () => {
    const result = estimate(
      agents({
        google: agent({ status: "done", startedAt: 0, endedAt: 24000 }),
        otherSources: agent({ status: "done", startedAt: 0, endedAt: 20000 }),
        michelin: agent({ status: "done", startedAt: 0, endedAt: 25000 }),
      }),
      26,
    );
    expect(result.lanes.otherSources).toBeUndefined();
    expect(result.lanes.summary).toEqual({
      start: 26,
      end: 35,
      overdue: false,
    });
    // The summary, 9 s from 26 s, is all that is left.
    expect(result.end).toBe(35);
  });

  it("times Google Maps' second question by its first, then expects nothing more", () => {
    const first = {
      t: 15000,
      text: "Answered with 2 reviews (2 new) from 2 Maps searches: q",
    };
    const second = {
      t: 27000,
      text: "Answered with 2 reviews (0 new) from 1 Maps searches: q",
    };
    expect(
      estimate(agents({ google: agent({ ...running, progress: [first] }) }), 16)
        .lanes.google,
    ).toEqual({ start: 0, end: 30, overdue: false });
    expect(
      estimate(
        agents({ google: agent({ ...running, progress: [first, second] }) }),
        28,
      ).lanes.google,
    ).toEqual({ start: 0, end: 28, overdue: false });
  });

  it("says an agent is running long once it passes its usual time", () => {
    const result = estimate(
      agents({
        otherSources: agent(running),
        michelin: agent({ status: "done", startedAt: 0, endedAt: 28000 }),
        google: agent({ status: "done", startedAt: 0, endedAt: 40000 }),
      }),
      70,
    );
    expect(result.lanes.otherSources).toEqual({
      start: 0,
      end: 70,
      overdue: true,
    });
    // The summary still needs its own time once the search ends.
    expect(result.lanes.summary?.end).toBe(79);
    expect(result.overdue).toBe(false);
  });

  it("adds each source's translation after it, on a page that needs one", () => {
    const sources = {
      google: agent({ status: "done", startedAt: 0, endedAt: 20_000 }),
      otherSources: agent(running),
      michelin: agent({ status: "done", startedAt: 0, endedAt: 28_000 }),
      summary: agent({ status: "done", startedAt: 50_000, endedAt: 59_000 }),
    };
    // Review sites should end at 50 s, then take 8 s to translate.
    expect(estimate(agents(sources), 30, true).end).toBe(58);
    expect(estimate(agents(sources), 30).end).toBe(50);

    // Once translated, a source adds nothing.
    const translated = {
      language: "zh" as const,
      model: "m",
      usage: { inputTokens: 0, outputTokens: 0 },
      result: undefined as never,
    };
    const allDone = agents({
      ...sources,
      otherSources: agent({
        status: "done",
        startedAt: 0,
        endedAt: 50_000,
        translation: translated,
      }),
      google: agent({ ...sources.google, translation: translated }),
      michelin: agent({ ...sources.michelin, translationError: "no" }),
    });
    expect(estimate(allDone, 60, true).end).toBe(60);
  });

  it("expects no translation of a source that failed", () => {
    const failed = agent({ status: "failed", startedAt: 0, endedAt: 5000 });
    const done = agent({ status: "done", startedAt: 0, endedAt: 5000 });
    const result = estimate(
      agents({
        google: failed,
        otherSources: failed,
        michelin: failed,
        summary: done,
      }),
      10,
      true,
    );
    expect(result.end).toBe(10);
  });

  it("expects nothing from finished or stopped agents", () => {
    const state = agents({
      google: agent({ status: "done", startedAt: 0, endedAt: 1000 }),
      otherSources: agent({ status: "done", startedAt: 0, endedAt: 1000 }),
      michelin: agent({ status: "done", startedAt: 0, endedAt: 1000 }),
      summary: agent({ status: "done", startedAt: 1000, endedAt: 2000 }),
    });
    expect(estimate(state, 3)).toEqual({ lanes: {}, end: 3, overdue: false });

    const stopped = agents({ google: agent(running) });
    expect(estimateRun(buildLanes(stopped, 5000), stopped, 5).lanes).toEqual(
      {},
    );
  });
});

describe("secondsLeft", () => {
  it("counts in seconds near the end and in 5 s steps before that", () => {
    expect(secondsLeft(10, 3.2)).toBe(7);
    expect(secondsLeft(10, 12)).toBe(0);
    expect(secondsLeft(59, 10)).toBe(50);
    expect(secondsLeft(59, 7)).toBe(55);
  });
});

describe("parseProgress", () => {
  it("reads each kind of line the agents emit", () => {
    expect(parseProgress('search: "King of Laksa" reviews')).toEqual({
      kind: "search",
      query: '"King of Laksa" reviews',
    });
    expect(parseProgress("open_page: https://example.com/a")).toEqual({
      kind: "open",
      url: "https://example.com/a",
    });
    expect(parseProgress("find_in_page: https://example.com/a")).toEqual({
      kind: "find",
      url: "https://example.com/a",
    });
    expect(parseProgress("Asking: What do reviews say?")).toEqual({
      kind: "ask",
      question: "What do reviews say?",
    });
    expect(
      parseProgress(
        "Answered with 3 reviews (1 new) from 2 Maps searches: a · b",
      ),
    ).toEqual({
      kind: "answered",
      reviews: 3,
      fresh: 1,
      searches: 2,
      queries: ["a", "b"],
    });
    expect(
      parseProgress("Answered with 0 reviews (0 new) from 0 Maps searches"),
    ).toMatchObject({ kind: "answered", queries: [] });
    expect(
      parseProgress("Reading the other platforms and MICHELIN findings"),
    ).toEqual({ kind: "reading" });
    expect(parseProgress("Something new")).toEqual({
      kind: "note",
      text: "Something new",
    });
  });
});

describe("hostOf", () => {
  it("keeps only the host, without www", () => {
    expect(hostOf("https://www.tripadvisor.com.sg/x")).toBe(
      "tripadvisor.com.sg",
    );
    expect(hostOf("nope")).toBe("nope");
  });
});

describe("buildLane", () => {
  it("follows the source's own status while the check runs", () => {
    expect(buildLane("summary", agent({}), null)).toEqual({
      agent: "summary",
      status: "waiting",
    });
    expect(
      buildLane("google", agent({ status: "running", startedAt: 0 }), null)
        .status,
    ).toBe("running");
  });

  it("stops working and waiting sources when the check stops", () => {
    expect(
      buildLane("google", agent({ status: "running", startedAt: 0 }), 31000)
        .status,
    ).toBe("stopped");
    expect(buildLane("summary", agent({}), 31000).status).toBe("stopped");
    expect(
      buildLane(
        "michelin",
        agent({ status: "done", startedAt: 0, endedAt: 28000 }),
        31000,
      ).status,
    ).toBe("done");
  });
});

describe("formatClock", () => {
  it("formats minutes and padded seconds", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(31400)).toBe("0:31");
    expect(formatClock(135000)).toBe("2:15");
  });
});
