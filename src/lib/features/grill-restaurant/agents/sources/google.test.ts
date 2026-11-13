// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createModels } from "../../providers/models";
import {
  fetchGeminiReviews,
  mapsOptions,
  mostDetailedFirst,
  QUESTION_ANGLES,
  readChunks,
  splitReviewDate,
} from "./google";

/** The shared model clients, calling `fetch` instead of Google. */
const models = (fetch: typeof globalThis.fetch) =>
  createModels({ gemini: "test-key", openai: "o" }, fetch);

const PLACE_ID = "ChIJplace";

const placeChunk = {
  maps: {
    uri: "https://maps.google.com/maps?cid=1",
    title: "Ramen Ichi - Google Maps",
    text: "**Address:** 1 Main St\n**Rating:** 4.3 (715 reviews)",
    placeId: PLACE_ID,
  },
};

function reviewChunk(id: string, text: string, placeId = PLACE_ID) {
  return {
    maps: {
      uri: `https://www.google.com/maps/reviews/data=${id}`,
      title: "Review of Ramen Ichi - Google Maps",
      text,
      placeId,
    },
  };
}

function geminiResponse(chunks: unknown[], queries = ["ramen ichi"]) {
  return new Response(
    JSON.stringify({
      candidates: [
        {
          content: { parts: [{ text: "Reviewers say..." }] },
          finishReason: "STOP",
          groundingMetadata: {
            groundingChunks: chunks,
            webSearchQueries: queries,
          },
        },
      ],
      usageMetadata: { totalTokenCount: 42 },
    }),
    { status: 200 },
  );
}

describe("splitReviewDate", () => {
  it("splits the date Maps appends", () => {
    expect(splitReviewDate("Great broth! (2025-08-17)")).toEqual({
      text: "Great broth!",
      date: "2025-08-17",
    });
  });

  it("leaves text without a date alone", () => {
    expect(splitReviewDate(" Great (really) ")).toEqual({
      text: "Great (really)",
    });
  });
});

describe("readChunks", () => {
  it("separates the Place card from its reviews", () => {
    const result = readChunks(
      {
        groundingChunks: [
          placeChunk,
          reviewChunk("a", "Long queue (2025-12-09)"),
          { maps: { title: "Review of X", uri: "u" } },
          {},
        ],
      },
      3,
    );
    expect(result.places).toEqual([
      expect.objectContaining({
        placeId: PLACE_ID,
        details: expect.any(String),
      }),
    ]);
    expect(result.reviews).toEqual([
      {
        text: "Long queue",
        date: "2025-12-09",
        uri: "https://www.google.com/maps/reviews/data=a",
        placeId: PLACE_ID,
        round: 3,
      },
    ]);
  });

  it("copes with missing metadata", () => {
    expect(readChunks(undefined, 1)).toEqual({ places: [], reviews: [] });
  });
});

describe("mostDetailedFirst", () => {
  it("puts the longest reviews first, keeping Google's order for ties", () => {
    const review = (text: string, uri: string) => ({ text, uri, round: 1 });
    expect(
      mostDetailedFirst([
        review("Good.", "a"),
        review("Thick broth, fresh cockles, worth the 20 minute queue.", "b"),
        review("Too salty", "c"),
        review("Fine.", "d"),
      ]).map((r) => r.uri),
    ).toEqual(["b", "c", "a", "d"]);
  });
});

describe("mapsOptions", () => {
  it("only sends a location when given a point", () => {
    expect(mapsOptions()).toBeUndefined();
    expect(mapsOptions({ latitude: 1, longitude: 2 })).toEqual({
      google: { retrievalConfig: { latLng: { latitude: 1, longitude: 2 } } },
    });
  });
});

describe("fetchGeminiReviews", () => {
  it("asks its two questions in turn and keeps the distinct reviews behind them", async () => {
    // A fresh response each time: a body can be read only once.
    const fetchMock = vi
      .fn()
      .mockImplementation(async () =>
        geminiResponse(
          [
            placeChunk,
            reviewChunk("a", "A"),
            reviewChunk("b", "B"),
            reviewChunk("a", "A again"),
          ],
          ["q1", "q2"],
        ),
      );

    const result = await fetchGeminiReviews({
      place: {
        name: "Ramen Ichi, Tokyo",
        latLng: { latitude: 1, longitude: 2 },
      },
      model: "gemini-3.8-flash",
      models: models(fetchMock),
      rounds: 10,
    });

    expect(QUESTION_ANGLES).toHaveLength(2);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    // The second answer brought the same reviews back: none are counted twice.
    expect(result.reviews.map((r) => [r.text, r.round])).toEqual([
      ["A", 1],
      ["B", 1],
    ]);
    expect(result.rounds.map((r) => r.newReviews)).toEqual([2, 0]);
    expect(result.places).toHaveLength(1);
    expect(result.totalMapsQueries).toBe(4);
    expect(result.warnings).toEqual([]);

    // The second question asks which dishes are worth ordering.
    const dishes = JSON.parse(fetchMock.mock.calls[1][1].body).contents[0]
      .parts[0].text;
    expect(dishes).toContain(QUESTION_ANGLES[1]);
    expect(dishes).toContain('a "### Worth ordering" heading');
    expect(dishes).toContain('a "### Not worth ordering" heading');
    expect(dishes).toContain("leave out a dish only one short review mentions");

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("models/gemini-3.8-flash:generateContent");
    expect(new Headers(init.headers).get("x-goog-api-key")).toBe("test-key");
    const body = JSON.parse(init.body);
    expect(body.tools).toEqual([{ googleMaps: {} }]);
    expect(body.toolConfig.retrievalConfig).toEqual({
      latLng: { latitude: 1, longitude: 2 },
    });
    const question = body.contents[0].parts[0].text;
    expect(question).toContain("Ramen Ichi, Tokyo");
    expect(question).toContain(QUESTION_ANGLES[0]);
    expect(question).toContain('a "### Pros" heading');
    // The points many reviews share lead; one short review is not a pattern.
    expect(question).toContain("Put the points many reviews share first");
    expect(question).toContain("say roughly how many make each");
    expect(question).toContain("Trust long, detailed reviews");
    // A real split gets its own list, which most places never need.
    expect(question).toContain(
      "Only when many reviews say the opposite of many others about the food itself",
    );
    expect(question).toContain('add a "### Divided" heading');
    expect(question).toContain("Most places have no such split");
    expect(question).toContain(
      "a few dissenters, or complaints about price, waits or service, are not a split",
    );
    // The concept is checked against the reviews.
    expect(question).toContain("say whether reviewers think it delivers");
  });

  it("stops once enough rounds in a row bring nothing new", async () => {
    const fetchMock = vi.fn().mockResolvedValue(geminiResponse([placeChunk]));
    const result = await fetchGeminiReviews({
      place: { name: "X" },
      model: "gemini-3.8-flash",
      models: models(fetchMock),
      stopAfterDryRounds: 1,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result.rounds).toHaveLength(1);
  });

  it("warns when Maps returned nothing, no reviews, or several places", async () => {
    const run = (chunks: unknown[]) =>
      fetchGeminiReviews({
        place: { name: "X" },
        model: "gemini-3.8-flash",
        models: models(vi.fn().mockResolvedValue(geminiResponse(chunks))),
        rounds: 1,
      });

    expect((await run([])).warnings).toEqual([
      expect.stringMatching(/returned nothing/),
    ]);
    expect((await run([placeChunk])).warnings).toEqual([
      expect.stringMatching(/no reviews/),
    ]);
    expect(
      (await run([placeChunk, reviewChunk("a", "A", "ChIJother")])).warnings,
    ).toEqual([expect.stringMatching(/2 different places/)]);
  });

  it("stops and warns when Gemini gives no answer", async () => {
    const result = await fetchGeminiReviews({
      place: { name: "X" },
      model: "gemini-3.8-flash",
      models: models(
        vi
          .fn()
          .mockResolvedValue(
            new Response(
              JSON.stringify({ promptFeedback: { blockReason: "SAFETY" } }),
            ),
          ),
      ),
    });
    expect(result.rounds).toEqual([]);
    expect(result.warnings[0]).toMatch(/Round 1: no answer.*SAFETY/);
  });

  it("throws with the response body on HTTP errors", async () => {
    const promise = fetchGeminiReviews({
      place: { name: "X" },
      model: "gemini-3.8-flash",
      models: models(
        vi.fn().mockResolvedValue(new Response("Bad key", { status: 400 })),
      ),
    });
    await expect(promise).rejects.toMatchObject({
      statusCode: 400,
      responseBody: "Bad key",
    });
  });
});
