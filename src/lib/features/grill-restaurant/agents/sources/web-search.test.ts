// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createModels } from "../../providers/models";
import { openaiStream, sseResponse } from "../../test/fake-responses";
import type { AgentContext } from "../common/agent";
import { michelinAgent } from "./michelin";
import { otherSourcesAgent } from "./other-sources";
import { describeAction } from "./web-search";

const michelinFindings = {
  listed: true,
  guideUrl: "https://guide.michelin.com/x",
  currentDistinction: "Bib Gourmand",
  inspectorSummary: "Fresh laksa",
  history: [{ year: 2026, distinction: "Bib Gourmand", sourceUrl: null }],
  notes: null,
};

function context(
  fetch: typeof globalThis.fetch,
  overrides: Partial<AgentContext> = {},
): AgentContext {
  return {
    model: "gpt-6-luna",
    models: createModels({ gemini: "g", openai: "sk-test" }, fetch),
    progress: () => {},
    ...overrides,
  };
}

describe("michelinAgent", () => {
  it("streams a strict JSON-schema web search and reports each search live", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      openaiStream(JSON.stringify(michelinFindings), [
        { type: "search", queries: ["a", "b"] },
        { type: "open_page", url: "https://m" },
      ]),
    );
    const seen: string[] = [];

    const result = await michelinAgent.run(
      { name: "King of Laksa, Singapore" },
      context(fetchMock, { progress: (search) => seen.push(search) }),
    );

    expect(result.findings).toEqual(michelinFindings);
    expect(result.model).toBe("gpt-6-luna");
    expect(result.searchCalls).toBe(2);
    expect(result.searches).toEqual([
      "search: a",
      "search: b",
      "open_page: https://m",
    ]);
    expect(result.usage).toEqual({
      inputTokens: 1000,
      cachedInputTokens: 0,
      outputTokens: 100,
    });
    expect(seen).toEqual(result.searches);
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.openai.com/v1/responses");
    expect(new Headers(init.headers).get("authorization")).toBe(
      "Bearer sk-test",
    );
    const body = JSON.parse(init.body);
    expect(body.stream).toBe(true);
    expect(body.tools).toEqual([
      expect.objectContaining({ type: "web_search" }),
    ]);
    expect(body.text.format).toMatchObject({
      type: "json_schema",
      strict: true,
      name: "michelin_guide",
    });
    expect(body.text.format.schema.required).toContain("history");
    expect(JSON.stringify(body.input)).toContain("King of Laksa, Singapore");
  });

  it("prices its tokens and each search call", () => {
    const cost = michelinAgent.cost({
      findings: michelinFindings,
      model: "gpt-6-luna",
      searches: [],
      searchCalls: 2,
      usage: { inputTokens: 1_000_000, outputTokens: 0 },
    });
    expect(cost.toolCalls).toBeCloseTo(0.02);
    expect(cost.total).toBeCloseTo(0.12);
  });
});

describe("otherSourcesAgent", () => {
  it("passes the model through and only the user's words", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        openaiStream(JSON.stringify({ platforms: [], notes: "none" })),
      );
    const result = await otherSourcesAgent.run(
      { name: "Ramen Ichi" },
      context(fetchMock, { model: "gpt-5.5" }),
    );
    expect(result.findings.notes).toBe("none");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.model).toBe("gpt-5.5");
    expect(JSON.stringify(body.input)).toContain(
      "other than Google Maps: Ramen Ichi",
    );
  });

  it("throws on HTTP errors, failed streams and empty answers", async () => {
    const run = (response: Response) =>
      otherSourcesAgent.run(
        { name: "X" },
        context(vi.fn().mockResolvedValue(response)),
      );

    await expect(
      run(new Response("nope", { status: 401 })),
    ).rejects.toMatchObject({ statusCode: 401, responseBody: "nope" });
    await expect(
      run(
        sseResponse([
          {
            type: "response.failed",
            sequence_number: 1,
            response: { error: { code: "invalid_prompt", message: "Boom" } },
          },
        ]),
      ),
    ).rejects.toThrow("Boom");
    await expect(run(openaiStream(""))).rejects.toThrow(
      "gpt-6-luna gave no answer",
    );
  });
});

describe("describeAction", () => {
  it("names searches and pages the way OpenAI does", () => {
    expect(describeAction({ type: "search", query: "q" })).toEqual([
      "search: q",
    ]);
    expect(
      describeAction({ type: "search", query: "q", queries: ["a", "b"] }),
    ).toEqual(["search: a", "search: b"]);
    expect(
      describeAction({ type: "findInPage", url: "https://m", pattern: "x" }),
    ).toEqual(["find_in_page: https://m"]);
    expect(describeAction({ type: "openPage", url: null })).toEqual([]);
    expect(describeAction(undefined)).toEqual([]);
  });
});
