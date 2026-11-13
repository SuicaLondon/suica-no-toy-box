import { describe, expect, it } from "vitest";
import { buildQuestion, QUESTION_ANGLES } from "../sources/google";
import { buildMichelinPrompt } from "../sources/michelin";
import { buildOtherSourcesPrompt } from "../sources/other-sources";
import { buildVerdictPrompt } from "../summary/summary";
import { DINER_STAKES } from "./voice";

describe("DINER_STAKES", () => {
  it("is in every agent's prompt", () => {
    const prompts = [
      buildQuestion("Secret Stall", QUESTION_ANGLES[0]),
      buildOtherSourcesPrompt("Secret Stall"),
      buildMichelinPrompt("Secret Stall"),
      buildVerdictPrompt({
        place: "Secret Stall",
        otherSources: null,
        michelin: null,
      }),
    ];
    for (const prompt of prompts) expect(prompt).toContain(DINER_STAKES);
    expect(DINER_STAKES).toContain("I feel ill");
    expect(DINER_STAKES).toContain("Never invent");
  });

  it("weighs points by how many reviewers make them and how much they say", () => {
    expect(DINER_STAKES).toContain("how many reviewers make it");
    expect(DINER_STAKES).toContain("long, detailed reviews");
    expect(DINER_STAKES).toContain("A one-line complaint or a single rave");
    expect(DINER_STAKES).not.toContain("do not go easy");
    // A split is reported, not averaged away.
    expect(DINER_STAKES).toContain("When reviewers contradict each other");
    expect(DINER_STAKES).toContain("Do not average it away.");
  });

  it("asks the review sites for what most reviewers say, not the worst", () => {
    const prompt = buildOtherSourcesPrompt("Secret Stall");
    expect(prompt).toContain("what most of that site's reviewers say");
    expect(prompt).toContain("the most common first");
    expect(prompt).not.toContain("Look hard for the bad reviews");
  });

  it("gives the verdict what it needs to think critically", () => {
    const sites = buildOtherSourcesPrompt("Secret Stall");
    expect(sites).toContain("how rich, deep, creamy, light, salty or");
    expect(sites).toContain("If the\nplace sells itself on a concept");
    expect(sites).toContain("reviewers contradict each other");
    expect(sites).toContain("sponsored, invited or a media tasting");
    // MICHELIN's specific claims are kept, so diners can be checked against them.
    expect(buildMichelinPrompt("Secret Stall")).toContain(
      "so it can be checked against\nwhat diners say",
    );
  });
});
