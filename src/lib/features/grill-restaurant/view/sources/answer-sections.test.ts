import { describe, expect, it } from "vitest";
import { answerSections } from "./answer-sections";

describe("answerSections", () => {
  it("splits headed lists, keeping every word as written", () => {
    expect(
      answerSections(
        "### Pros\n\n* **Rich** broth\n* Fair price\n\n### Cons\n\n- Long queue",
      ),
    ).toEqual([
      { title: "Pros", items: ["**Rich** broth", "Fair price"] },
      { title: "Cons", items: ["Long queue"] },
    ]);
  });

  it("reads bold headings and translated ones alike", () => {
    expect(
      answerSections("**優點：**\n1. 湯頭濃\n**Cons:**\n2. 排隊久"),
    ).toEqual([
      { title: "優點：", items: ["湯頭濃"] },
      { title: "Cons", items: ["排隊久"] },
    ]);
  });

  it("gives up on anything but headed lists", () => {
    expect(
      answerSections("The broth is rich.\n\n### Cons\n* Queue"),
    ).toBeNull();
    expect(answerSections("* No heading")).toBeNull();
    expect(answerSections("### Pros\n\n### Cons\n* Queue")).toBeNull();
    expect(answerSections("")).toBeNull();
  });
});
