// @vitest-environment node
import { describe, expect, it } from "vitest";
import { createModels, providerOf } from "./models";

describe("providerOf", () => {
  it("picks the provider from the model's name", () => {
    expect(providerOf("claude-opus-5-5")).toBe("anthropic");
    expect(providerOf("gemini-3.8-flash")).toBe("google");
    expect(providerOf("gpt-6-luna")).toBe("openai");
  });
});

describe("createModels", () => {
  it("serves each model from its own provider", () => {
    const models = createModels({ gemini: "g", openai: "o", anthropic: "a" });
    const provider = (name: string) => {
      const model = models.languageModel(name);
      return typeof model === "string" ? model : model.provider;
    };
    expect(provider("gpt-6-luna")).toContain("openai");
    expect(provider("gemini-3.8-flash")).toContain("google");
    expect(provider("claude-opus-5-5")).toContain("anthropic");
  });

  it("refuses a Claude model without Anthropic's key", () => {
    const models = createModels({ gemini: "g", openai: "o" });
    expect(() => models.languageModel("claude-opus-5-5")).toThrow(
      "ANTHROPIC_API_KEY is not set",
    );
  });
});
