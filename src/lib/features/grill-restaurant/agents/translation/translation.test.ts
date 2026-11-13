// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createModels } from "../../providers/models";
import { jsonResponse, openaiResponse } from "../../test/fake-responses";
import type { GoogleResult } from "../sources/google";
import type { MichelinFindings } from "../sources/michelin";
import type { OtherSourcesFindings } from "../sources/other-sources";
import {
  buildTranslationPrompt,
  googleTexts,
  michelinTexts,
  otherSourcesTexts,
  translateResult,
} from "./translation";
import type { WebSearchResult } from "../sources/web-search";

const web = <T>(findings: T): WebSearchResult<T> => ({
  findings,
  model: "gpt-6-luna",
  searches: [],
  searchCalls: 0,
  usage: { inputTokens: 0, outputTokens: 0 },
});

const otherSources = web<OtherSourcesFindings>({
  platforms: [
    {
      platform: "Burpple",
      url: "https://www.burpple.com/x",
      rating: 4.5,
      ratingScale: 5,
      reviewCount: 12,
      summary: "Light broth",
      pros: ["Fresh prawns"],
      cons: ["Small bowl", "Slow queue"],
      dishesToOrder: ["Prawn laksa: sweet prawns"],
      dishesToSkip: [],
    },
  ],
  notes: null,
});

const michelin = web<MichelinFindings>({
  listed: true,
  guideUrl: "https://guide.michelin.com/x",
  currentDistinction: "Bib Gourmand",
  inspectorSummary: "A rich broth",
  history: [
    { year: 2026, distinction: "Bib Gourmand", sourceUrl: "https://m/2026" },
  ],
  notes: null,
});

const google: GoogleResult = {
  gemini: {
    model: "gemini-3.8-flash",
    place: "Secret Stall",
    places: [{ placeId: "P", details: "**Address:** 1 Hidden Rd" }],
    reviews: [],
    totalMapsQueries: 1,
    warnings: [],
    rounds: [
      {
        round: 1,
        question: "q",
        answerText: "### Pros\n\n* Fresh broth",
        reviewsReturned: 1,
        newReviews: 1,
        mapsQueries: [],
        usage: { inputTokens: 0, outputTokens: 0 },
      },
    ],
  },
  reviews: [{ text: "Worth the queue", uri: "u1", round: 1 }],
  elsewhere: [{ text: "Noisy food court", uri: "u2", round: 1 }],
};

/** Every text `map` visits, in order. */
function textsOf<R>(result: R, map: (r: R, each: (t: string) => string) => R) {
  const texts: string[] = [];
  map(result, (text) => {
    texts.push(text);
    return text;
  });
  return texts;
}

const models = (fetch: typeof globalThis.fetch) =>
  createModels({ gemini: "g", openai: "o" }, fetch);

describe("text maps", () => {
  it("visit only the text a reader reads, in a fixed order", () => {
    expect(textsOf(otherSources, otherSourcesTexts)).toEqual([
      "Light broth",
      "Fresh prawns",
      "Small bowl",
      "Slow queue",
      "Prawn laksa: sweet prawns",
    ]);
    expect(textsOf(michelin, michelinTexts)).toEqual([
      "Bib Gourmand",
      "A rich broth",
      "Bib Gourmand",
    ]);
    expect(textsOf(google, googleTexts)).toEqual([
      "### Pros\n\n* Fresh broth",
      "Worth the queue",
      "Noisy food court",
    ]);
    // Leaving every text as it is gives back the same result.
    expect(michelinTexts(michelin, (text) => text)).toEqual(michelin);
  });
});

describe("buildTranslationPrompt", () => {
  it("asks for Taiwan's script, Markdown kept, and the Guide's own names", () => {
    const prompt = buildTranslationPrompt(["Slow queue"], "zh");
    expect(prompt).toContain("Traditional Chinese as written in Taiwan");
    expect(prompt).toContain("exactly 1 translations, in the same order");
    expect(prompt).toContain("Keep Markdown as it is");
    expect(prompt).toContain("Bib Gourmand 必比登推介");
  });
});

describe("translateResult", () => {
  it("puts each translation back where its text was, and nothing else", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      openaiResponse(
        JSON.stringify({
          translations: [
            "清淡湯頭",
            "蝦子新鮮",
            "份量小",
            "排隊慢",
            "蝦叻沙：蝦子鮮甜",
          ],
        }),
      ),
    );
    const translation = await translateResult(otherSources, otherSourcesTexts, {
      models: models(fetchMock),
      model: "gpt-6-luna",
      language: "zh",
    });
    expect(translation.result.findings.platforms[0]).toEqual({
      ...otherSources.findings.platforms[0],
      summary: "清淡湯頭",
      pros: ["蝦子新鮮"],
      cons: ["份量小", "排隊慢"],
      dishesToOrder: ["蝦叻沙：蝦子鮮甜"],
      dishesToSkip: [],
    });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.text.format).toMatchObject({ name: "translations" });
    // Names, links and figures are never sent.
    expect(JSON.stringify(body.input)).not.toContain("burpple.com");
  });

  it("has Gemini translate Google Maps, and refuses any other model", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    translations: [
                      "### 優點\n\n* 湯頭新鮮",
                      "值得排隊",
                      "美食街很吵",
                    ],
                  }),
                },
              ],
            },
            finishReason: "STOP",
          },
        ],
        usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 20 },
      }),
    );
    const translation = await translateResult(google, googleTexts, {
      models: models(fetchMock),
      model: "gemini-3.8-flash",
      language: "zh",
      googleContent: true,
    });
    expect(translation.result.reviews[0].text).toBe("值得排隊");
    expect(translation.result.gemini.rounds[0].answerText).toContain("優點");
    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "generativelanguage.googleapis.com",
    );

    await expect(
      translateResult(google, googleTexts, {
        models: models(fetchMock),
        model: "gpt-6-luna",
        language: "zh",
        googleContent: true,
      }),
    ).rejects.toThrow("Google Maps content can't go to gpt-6-luna");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("fails when the translations do not line up with the texts", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        openaiResponse(JSON.stringify({ translations: ["只有一個"] })),
      );
    await expect(
      translateResult(michelin, michelinTexts, {
        models: models(fetchMock),
        model: "gpt-6-luna",
        language: "zh",
      }),
    ).rejects.toThrow("returned 1 texts for 3");
  });

  it("asks nothing when there is nothing to translate", async () => {
    const fetchMock = vi.fn();
    const empty = web<OtherSourcesFindings>({ platforms: [], notes: null });
    const translation = await translateResult(empty, otherSourcesTexts, {
      models: models(fetchMock),
      model: "gpt-6-luna",
      language: "zh",
    });
    expect(fetchMock).not.toHaveBeenCalled();
    expect(translation.result).toEqual(empty);
  });
});
