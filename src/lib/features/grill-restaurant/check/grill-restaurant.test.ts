// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import type { Language } from "../agents/common/agent";
import {
  splitReviewsByPlace,
  type GeminiReviewsResult,
  type GroundedReview,
} from "../agents/sources/google";
import type { MichelinFindings } from "../agents/sources/michelin";
import type { Verdict } from "../agents/summary/summary";
import {
  buildMichelinTimeline,
  estimateCost,
  grillRestaurant,
  type GrillEvent,
} from "./grill-restaurant";
import {
  initialGrillState,
  reduceGrillEvent,
  timestamped,
} from "./grill-state";
import {
  jsonResponse,
  openaiResponse,
  openaiStream,
} from "../test/fake-responses";

const verdict: Verdict = {
  decision: "go",
  headline: "Go for the broth. Skip the lunch queue.",
  good: ["MICHELIN calls the broth rich."],
  bad: ["Burpple calls the bowl small."],
  divided: null,
  dishesToOrder: ["Prawn laksa: fresh prawns, praised by two blogs"],
  dishesToSkip: [],
  goIf: ["You like a lighter laksa"],
  skipIf: ["You want it cheap"],
  headsUp: [],
  hype: "Critics back the food.",
  confidence: "low",
};

function review(text: string, date?: string, placeId = "P"): GroundedReview {
  return { text, date, placeId, uri: `u-${text}`, round: 1 };
}

const michelin: MichelinFindings = {
  listed: true,
  guideUrl: null,
  currentDistinction: "Bib Gourmand",
  inspectorSummary: null,
  history: [
    { year: 2027, distinction: "Bib Gourmand", sourceUrl: null },
    { year: 2026, distinction: "Bib Gourmand", sourceUrl: null },
  ],
  notes: null,
};

describe("splitReviewsByPlace", () => {
  it("keeps reviews of the first matched place", () => {
    const google = {
      places: [{ placeId: "P" }, { placeId: "FOODCOURT" }],
      reviews: [review("a"), review("b", undefined, "FOODCOURT"), review("c")],
    } as GeminiReviewsResult;
    const { target, elsewhere } = splitReviewsByPlace(google);
    expect(target.map((r) => r.text)).toEqual(["a", "c"]);
    expect(elsewhere.map((r) => r.text)).toEqual(["b"]);
  });
});

describe("buildMichelinTimeline", () => {
  it("counts Google reviews before and from the first listed year", () => {
    expect(
      buildMichelinTimeline(michelin, [
        review("old", "2025-12-31"),
        review("new", "2026-01-01"),
        review("newer", "2027-03-01"),
        review("undated"),
      ]),
    ).toEqual({
      firstListedYear: 2026,
      googleReviewsBefore: 1,
      googleReviewsFromThen: 2,
      googleReviewsUndated: 1,
    });
  });

  it("is null when not listed", () => {
    expect(
      buildMichelinTimeline({ ...michelin, listed: false }, []),
    ).toBeNull();
    expect(buildMichelinTimeline(undefined, [])).toBeNull();
  });
});

const geminiWithReview = {
  candidates: [
    {
      content: { parts: [{ text: "Pros: broth." }] },
      groundingMetadata: {
        webSearchQueries: ["secret stall"],
        groundingChunks: [
          {
            maps: {
              title: "Secret Stall - Google Maps",
              uri: "m",
              placeId: "P",
              text: "**Address:** 1 Hidden Rd",
            },
          },
          {
            maps: {
              title: "Review of Secret Stall",
              uri: "https://www.google.com/maps/reviews/1",
              placeId: "P",
              text: "Worth the queue (2026-05-01)",
            },
          },
        ],
      },
    },
  ],
  usageMetadata: { promptTokenCount: 40, candidatesTokenCount: 2000 },
};

/** OpenAI and Gemini as a check calls them. Errors use statuses the SDK does not retry. */
function fakeApis(options: { otherSourcesFails?: boolean } = {}) {
  return vi.fn(async (url: string, init: RequestInit) => {
    const body = JSON.parse(String(init.body));
    if (url.includes("openai.com")) {
      const name = body.text.format.name;
      if (name === "verdict") return openaiResponse(JSON.stringify(verdict));
      if (name === "translations") {
        const prompt: string = body.input[0].content[0].text;
        const texts = JSON.parse(prompt.slice(prompt.indexOf("[")));
        return openaiResponse(
          JSON.stringify({
            translations: texts.map((text: string) => `譯:${text}`),
          }),
        );
      }
      if (name === "michelin_guide") {
        return openaiStream(JSON.stringify(michelin), [
          { type: "search", query: "m" },
        ]);
      }
      if (options.otherSourcesFails) {
        return new Response("bad request", { status: 400 });
      }
      return openaiStream(JSON.stringify({ platforms: [], notes: null }));
    }
    // Gemini: a Maps question, or a translation of what Maps returned.
    const question: string = body.contents[0].parts[0].text;
    if (question.startsWith("Translate each text")) {
      const texts = JSON.parse(question.slice(question.indexOf("[")));
      return jsonResponse({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    translations: texts.map((text: string) => `譯:${text}`),
                  }),
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
      });
    }
    return jsonResponse(geminiWithReview);
  });
}

async function runWith(
  fetchMock: ReturnType<typeof fakeApis>,
  language?: Language,
) {
  const events: GrillEvent[] = [];
  await grillRestaurant({
    place: { name: "Secret Stall", latLng: { latitude: 1, longitude: 2 } },
    geminiApiKey: "g",
    openaiApiKey: "o",
    language,
    fetch: fetchMock as typeof fetch,
    emit: timestamped((event) => events.push(event)),
  });
  return events;
}

const formatOf = (init: RequestInit) =>
  JSON.parse(String(init.body)).text?.format?.name;

describe("grillRestaurant", () => {
  it("reports every agent's progress and result, keeping Google Maps content away from OpenAI", async () => {
    const fetchMock = fakeApis({ otherSourcesFails: true });
    const events = await runWith(fetchMock);

    for (const [url, init] of fetchMock.mock.calls) {
      if (!String(url).includes("openai.com")) continue;
      expect(String(init.body)).not.toContain("Hidden Rd");
      expect(String(init.body)).not.toContain("Worth the queue");
    }

    expect(events[0]).toMatchObject({
      type: "run.started",
      place: { name: "Secret Stall" },
      models: { google: "gemini-3.8-flash", summary: "gpt-6-luna" },
      language: "en",
    });
    expect(events.at(-1)?.type).toBe("run.completed");

    const state = events.reduce(reduceGrillEvent, initialGrillState());
    expect(state.status).toBe("done");
    expect(state.agents.google.status).toBe("done");
    expect(state.agents.google.result?.reviews.map((r) => r.text)).toEqual([
      "Worth the queue",
    ]);
    expect(state.agents.google.progress.map((p) => p.text)[0]).toMatch(
      /^Asking: /,
    );
    expect(state.agents.otherSources).toMatchObject({
      status: "failed",
      error: expect.stringContaining("bad request"),
    });
    expect(state.agents.michelin.progress.map((p) => p.text)).toEqual([
      "search: m",
    ]);
    expect(state.agents.summary.result?.verdict).toEqual(verdict);
    expect(state.michelinTimeline).toMatchObject({
      firstListedYear: 2026,
      googleReviewsFromThen: 1,
    });

    // The summary only starts once both web searches have ended.
    const index = (type: string, agent: string) =>
      events.findIndex(
        (e) => e.type === type && "agent" in e && e.agent === agent,
      );
    expect(index("agent.started", "summary")).toBeGreaterThan(
      Math.max(
        index("agent.failed", "otherSources"),
        index("agent.completed", "michelin"),
      ),
    );

    const summaryCall = fetchMock.mock.calls.find(
      ([url, init]) =>
        String(url).includes("openai.com") && formatOf(init) === "verdict",
    )!;
    expect(String(summaryCall[1].body)).toContain("Bib Gourmand");

    // An English page needs no translation.
    expect(
      fetchMock.mock.calls.some(([, init]) =>
        String(init.body).includes("Translate each text"),
      ),
    ).toBe(false);
    expect(state.agents.michelin.translation).toBeUndefined();
  });

  it("translates each source as soon as it finishes on a Chinese page", async () => {
    const fetchMock = fakeApis();
    const events = await runWith(fetchMock, "zh");
    expect(events[0]).toMatchObject({ type: "run.started", language: "zh" });

    const state = events.reduce(reduceGrillEvent, initialGrillState());
    expect(state.language).toBe("zh");
    const { google, michelin: guide } = state.agents;
    expect(guide.translation?.result.findings.currentDistinction).toBe(
      "譯:Bib Gourmand",
    );
    expect(google.translation?.result.reviews[0].text).toBe(
      "譯:Worth the queue",
    );
    // The originals stay as the agents found them.
    expect(guide.result?.findings.currentDistinction).toBe("Bib Gourmand");
    expect(google.result?.reviews[0].text).toBe("Worth the queue");

    // Each translation follows its own source, not the others.
    const index = (type: string, agent: string) =>
      events.findIndex(
        (e) => e.type === type && "agent" in e && e.agent === agent,
      );
    expect(index("translation.completed", "michelin")).toBeGreaterThan(
      index("agent.completed", "michelin"),
    );

    // Google Maps content is only ever sent to Gemini.
    for (const [url, init] of fetchMock.mock.calls) {
      if (String(url).includes("generativelanguage")) continue;
      expect(String(init.body)).not.toContain("Worth the queue");
      expect(String(init.body)).not.toContain("Hidden Rd");
    }

    const done = events.at(-1);
    if (done?.type !== "run.completed") throw new Error("not completed");
    expect(done.cost.translations.michelin?.model).toBe("gpt-6-luna");
    expect(done.cost.translations.google?.model).toBe("gemini-3.8-flash");
  });

  it("passes the link's position to Gemini", async () => {
    const fetchMock = fakeApis();
    await runWith(fetchMock);
    const geminiCall = fetchMock.mock.calls.find(([url]) =>
      String(url).includes("generativelanguage"),
    )!;
    expect(JSON.parse(String(geminiCall[1].body)).toolConfig).toEqual({
      retrievalConfig: { latLng: { latitude: 1, longitude: 2 } },
    });
  });

  it("estimates cost from tokens and tool calls", async () => {
    const events = await runWith(fakeApis());
    const done = events.at(-1);
    if (done?.type !== "run.completed") throw new Error("not completed");
    const { agents, total } = done.cost;
    // Two Gemini questions, each (40 × $0.75 + 2000 × $3.75) / 1M, plus a
    // Maps query each.
    expect(agents.google?.tokens).toBeCloseTo(0.01506, 5);
    expect(agents.google?.toolCalls).toBeCloseTo(0.028, 5);
    expect(agents.michelin?.toolCalls).toBeCloseTo(0.01, 5);
    expect(agents.summary?.toolCalls).toBe(0);
    expect(total).toBeCloseTo(
      Object.values(agents).reduce((sum, a) => sum + (a.total ?? 0), 0),
      8,
    );
  });

  it("skips the summary when both web searches failed", async () => {
    const events: GrillEvent[] = [];
    await grillRestaurant({
      place: { name: "X" },
      geminiApiKey: "g",
      openaiApiKey: "o",
      language: "zh",
      fetch: vi.fn(async (url: string) =>
        String(url).includes("openai.com")
          ? new Response("down", { status: 400 })
          : jsonResponse(geminiWithReview),
      ) as typeof fetch,
      emit: timestamped((event) => events.push(event)),
    });
    const state = events.reduce(reduceGrillEvent, initialGrillState());
    expect(state.agents.google.status).toBe("done");
    expect(state.agents.summary).toMatchObject({
      status: "failed",
      error: "No web findings to summarise",
    });
    // Failed sources have nothing to translate.
    expect(state.agents.michelin.translation).toBeUndefined();
    expect(state.agents.michelin.translationError).toBeUndefined();
  });
});

describe("estimateCost", () => {
  it("is unknown when a model has no listed price", () => {
    expect(
      estimateCost({
        summary: {
          model: "mystery-model",
          verdict,
          usage: { inputTokens: 1, outputTokens: 1 },
        },
      }).total,
    ).toBeNull();
  });
});
