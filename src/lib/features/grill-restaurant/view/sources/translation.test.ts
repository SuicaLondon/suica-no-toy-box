import { describe, expect, it } from "vitest";
import type { AgentResults } from "../../check/grill-restaurant";
import type { AgentState } from "../../check/grill-state";
import { shownState, textStatus } from "./translation";

const michelin = {
  findings: {
    listed: true,
    guideUrl: null,
    currentDistinction: "Bib Gourmand",
    inspectorSummary: "A careful bowl.",
    history: [],
    notes: null,
  },
  model: "gpt-6-luna",
  searches: [],
  searchCalls: 0,
  usage: { inputTokens: 0, outputTokens: 0 },
} satisfies AgentResults["michelin"];

const translated = {
  ...michelin,
  findings: { ...michelin.findings, inspectorSummary: "用心的一碗。" },
};

function source(partial: Partial<AgentState<"michelin">> = {}) {
  return {
    status: "done",
    progress: [],
    result: michelin,
    ...partial,
  } as AgentState;
}

const translation = {
  language: "zh" as const,
  model: "gpt-6-luna",
  usage: { inputTokens: 0, outputTokens: 0 },
  result: translated,
};

describe("textStatus", () => {
  it("never waits on an English page", () => {
    expect(textStatus("en", source(), true)).toBe("original");
  });

  it("waits while the check runs, then shows the translation", () => {
    expect(textStatus("zh", source(), true)).toBe("translating");
    expect(textStatus("zh", source({ translation }), false)).toBe("translated");
  });

  it("falls back to the original when it fails or the check stops first", () => {
    expect(textStatus("zh", source({ translationError: "no" }), true)).toBe(
      "untranslated",
    );
    expect(textStatus("zh", source(), false)).toBe("untranslated");
  });
});

describe("shownState", () => {
  it("shows the translation, or the original when asked", () => {
    const state = source({ translation });
    const summary = (shown: AgentState) =>
      (shown.result as AgentResults["michelin"]).findings.inspectorSummary;
    expect(summary(shownState(state))).toBe("用心的一碗。");
    expect(summary(shownState(state, true))).toBe("A careful bowl.");
    expect(shownState(source())).toEqual(source());
  });
});
