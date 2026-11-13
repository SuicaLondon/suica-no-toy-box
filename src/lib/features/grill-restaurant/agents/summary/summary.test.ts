// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { createModels } from "../../providers/models";
import { claudeMessage, openaiResponse } from "../../test/fake-responses";
import type { AgentContext } from "../common/agent";
import {
  buildVerdictPrompt,
  parseVerdict,
  summaryAgent,
  type Verdict,
} from "./summary";

const input = {
  place: "Secret Stall",
  otherSources: { platforms: [], notes: "Only one blog" },
  michelin: null,
};

const verdict: Verdict = {
  decision: "maybe",
  headline:
    "Maybe. The lighter laksa is the pitch, and four of nine reviews call it flat.",
  good: ["MICHELIN and two blogs praise the clean, less oily broth."],
  bad: ["Four of nine reviews call the S$8 bowl pricey for a hawker stall."],
  divided:
    "Two blogs call the broth too creamy, three call it mild. Bowls may vary.",
  dishesToOrder: ["Prawn laksa: fresh, sweet prawns, praised in four reviews"],
  dishesToSkip: ["Otah: dry and small, say two blogs"],
  goIf: ["You like a lighter laksa"],
  skipIf: ["You want it cheap"],
  headsUp: ["Lunch queues of about 60 minutes"],
  hype: "Critics back the food. MICHELIN calls the broth rich, Burpple calls it thin.",
  confidence: "medium",
};

function context(
  fetch: typeof globalThis.fetch,
  overrides: Partial<AgentContext> = {},
  anthropic?: string,
): AgentContext {
  return {
    model: summaryAgent.defaultModel,
    models: createModels({ gemini: "g", openai: "o", anthropic }, fetch),
    progress: () => {},
    ...overrides,
  };
}

describe("buildVerdictPrompt", () => {
  it("includes the web findings and keeps Google Maps out", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain("Only one blog");
    expect(prompt).toContain("## MICHELIN Guide\nUnavailable.");
    expect(prompt).toContain("never mention or guess at them");
    expect(prompt).toContain("Write every text field in English.");
    expect(prompt).toContain("at most 35 words");
  });

  it("writes Chinese in Taiwan's script, measured in characters", () => {
    const prompt = buildVerdictPrompt({ ...input, language: "zh" });
    expect(prompt).toContain("Traditional Chinese as written in Taiwan");
    expect(prompt).toContain("at most 70 characters");
  });

  it("grills the place against the evidence, never against people", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain(
      "test what it is praised for against what diners report",
    );
    expect(prompt).toContain("never invent a");
    expect(prompt).toContain("never at its staff, owners or reviewers");
  });

  it("thinks critically before it writes: concept, themes, claims, splits, weight", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain("## How to think");
    // What the place sells itself on, and whether it delivers.
    expect(prompt).toContain(
      "Find what the place is known for or sells itself on",
    );
    expect(prompt).toContain(
      "whether diners think it delivers, and at what price",
    );
    // Themes counted across sources; the common ones must surface.
    expect(prompt).toContain("Count the sources that\n   raise each theme");
    expect(prompt).toContain(
      "A theme several sources raise must\n   appear in the verdict",
    );
    // MICHELIN's claims checked against the diners.
    expect(prompt).toContain(
      "Test each claim from the MICHELIN Guide or a critic",
    );
    // Real splits checked for, and weak evidence weighed down.
    expect(prompt).toContain("Check for a real split");
    expect(prompt).toContain("sponsored or invited tasting counts for less");
    expect(prompt).toContain(
      "that is a complaint about\n   value, not a grumble",
    );
  });

  it("decides from what it counted, with maybe for mixed or divided evidence", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain('"skip", from what you counted');
    expect(prompt).toContain(
      "most sources are happy with the food and say it is worth the price",
    );
    expect(prompt).toContain(
      '"skip" when most\n  sources say the food disappoints',
    );
    expect(prompt).toContain("when the sources are divided");
    expect(prompt).toContain("not a skip because a few were let down");
  });

  it("is critical, not subjective, and does not play it safe", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain("Be critical, not subjective");
    expect(prompt).toContain("never from your own taste");
    expect(prompt).toContain("Do not play it safe");
    expect(prompt).not.toContain("Have opinions");
  });

  it("says how many sources back each point, good and bad", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain("- good: what the evidence praises. At most 4");
    expect(prompt).toContain("Each says how many sources make it");
    expect(prompt).toContain("- bad: what the evidence complains about");
    expect(prompt).toContain("including the main selling point");
    expect(prompt).toContain("Leave out a complaint only one source");
    expect(prompt).toContain("cover most of what the evidence says");
  });

  it("calls out sources that contradict each other, and splits among diners", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain("When a source contradicts another");
    expect(prompt).toContain("say which side the evidence favours and why");
    expect(prompt).toContain("lead with the clash");
  });

  it("keeps the split warning for real, rare splits about the food", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain("Check for a real split, which is rare");
    expect(prompt).toContain(
      "at least two sources say the\n   opposite of at least two others about the food itself",
    );
    expect(prompt).toContain("neither\n   side is a clear majority");
    expect(prompt).toContain("are an outlier, not a split");
    expect(prompt).toContain("Differences over price, waits or service");
    expect(prompt).toContain("- divided: null for most places");
    expect(prompt).toContain("When in doubt, leave it null.");
    expect(prompt).not.toContain("Look for splits");
  });

  it("names the dishes worth and not worth ordering, from the evidence only", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain("Note the dishes the sources name");
    expect(prompt).toContain(
      "- dishesToOrder: the dishes the evidence says are worth ordering",
    );
    expect(prompt).toContain("at most 14 words each");
    expect(prompt).toContain(
      "- dishesToSkip: the dishes the evidence says are not worth ordering",
    );
    expect(prompt).toContain("Never name a dish the evidence does not");
    expect(buildVerdictPrompt({ ...input, language: "zh" })).toContain(
      "at most 26 characters each",
    );
  });

  it("carries the unslop rules", () => {
    const prompt = buildVerdictPrompt(input);
    expect(prompt).toContain("Never use semicolons");
    expect(prompt).toContain('"not just X, but Y"');
    expect(prompt).toContain("never means puns");
  });
});

describe("parseVerdict", () => {
  it("keeps a valid verdict and trims its lists", () => {
    expect(
      parseVerdict({
        ...verdict,
        goIf: ["a", "b", "c"],
        bad: ["1", "2", "3", "4", "5"],
        dishesToOrder: ["a", "b", "c", "d", "e"],
        dishesToSkip: ["a", "b", "c", "d"],
        extra: true,
      }),
    ).toEqual({
      ...verdict,
      goIf: ["a", "b"],
      bad: ["1", "2", "3", "4"],
      dishesToOrder: ["a", "b", "c", "d"],
      dishesToSkip: ["a", "b", "c"],
    });
  });

  it("reads a verdict without dishes as empty dish lists", () => {
    const parsed = parseVerdict({
      ...verdict,
      dishesToOrder: undefined,
      dishesToSkip: "Otah",
    });
    expect(parsed.dishesToOrder).toEqual([]);
    expect(parsed.dishesToSkip).toEqual([]);
  });

  it("reads a verdict with no good or bad points as empty lists", () => {
    const parsed = parseVerdict({
      ...verdict,
      good: undefined,
      bad: undefined,
    });
    expect(parsed.good).toEqual([]);
    expect(parsed.bad).toEqual([]);
  });

  it("keeps a split when there is one, and no warning when there is not", () => {
    expect(
      parseVerdict({ ...verdict, divided: "  Bowls vary.  " }).divided,
    ).toBe("Bowls vary.");
    expect(parseVerdict({ ...verdict, divided: null }).divided).toBeNull();
    expect(parseVerdict({ ...verdict, divided: " " }).divided).toBeNull();
    expect(parseVerdict({ ...verdict, divided: undefined }).divided).toBeNull();
  });

  it("rejects a verdict without a decision or headline", () => {
    expect(() => parseVerdict({ ...verdict, decision: "yes" })).toThrow(
      "missing its decision",
    );
    expect(() => parseVerdict({ ...verdict, headline: " " })).toThrow(
      "missing its decision",
    );
    expect(() => parseVerdict(null)).toThrow("missing its decision");
  });

  it("treats an unknown confidence as low", () => {
    expect(parseVerdict({ ...verdict, confidence: "sure" }).confidence).toBe(
      "low",
    );
  });
});

describe("summaryAgent", () => {
  it("asks OpenAI for a strict JSON verdict, without tools", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(openaiResponse(JSON.stringify(verdict)));
    const progress = vi.fn();
    const summary = await summaryAgent.run(
      { ...input, language: "zh" },
      context(fetchMock, { progress }),
    );
    expect(summary).toMatchObject({ model: "gpt-6-luna", verdict });
    expect(progress).toHaveBeenCalledWith(
      "Reading the other platforms and MICHELIN findings",
    );
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.openai.com/v1/responses");
    const body = JSON.parse(init.body);
    expect(body.model).toBe("gpt-6-luna");
    expect(body.tools).toBeUndefined();
    expect(body.text.format).toMatchObject({
      type: "json_schema",
      name: "verdict",
      strict: true,
    });
    expect(JSON.stringify(body.input)).toContain("Traditional Chinese");
  });

  it("asks Claude for the same JSON, with server-side fallbacks", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(claudeMessage(JSON.stringify(verdict)));
    const summary = await summaryAgent.run(
      input,
      context(fetchMock, { model: "claude-opus-5-5" }, "a"),
    );
    expect(summary.verdict).toEqual(verdict);
    expect(summary.usage).toEqual({
      inputTokens: 1,
      cachedInputTokens: 0,
      outputTokens: 1,
    });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain("api.anthropic.com/v1/messages");
    expect(JSON.parse(init.body)).toMatchObject({
      model: "claude-opus-5-5",
      fallbacks: "default",
      output_config: { format: { type: "json_schema" } },
    });
    expect(new Headers(init.headers).get("anthropic-beta")).toContain(
      "server-side-fallback-2026-07-01",
    );
  });

  it("fails clearly without the needed key, findings or an answer", async () => {
    await expect(
      summaryAgent.run(input, context(vi.fn(), { model: "claude-opus-5-5" })),
    ).rejects.toThrow("ANTHROPIC_API_KEY is not set");
    await expect(
      summaryAgent.run({ ...input, otherSources: null }, context(vi.fn())),
    ).rejects.toThrow("No web findings");
    await expect(
      summaryAgent.run(
        input,
        context(vi.fn().mockResolvedValue(openaiResponse(""))),
      ),
    ).rejects.toThrow("gpt-6-luna gave no answer");
  });

  it("prices its tokens and nothing else", () => {
    const cost = summaryAgent.cost({
      model: "gpt-6-luna",
      verdict,
      usage: { inputTokens: 1_000_000, outputTokens: 1_000_000 },
    });
    expect(cost).toEqual({
      model: "gpt-6-luna",
      tokens: 0.6,
      toolCalls: 0,
      total: 0.6,
    });
  });
});
