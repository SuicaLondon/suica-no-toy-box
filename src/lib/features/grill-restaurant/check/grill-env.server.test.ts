import { describe, expect, it } from "vitest";
import { readGrillEnv } from "./grill-env.server";

const keys = { GEMINI_API_KEY: "gemini-key", OPENAI_API_KEY: "openai-key" };

describe("readGrillEnv", () => {
  it("reads the keys and leaves unset options to their defaults", () => {
    expect(readGrillEnv(keys)).toEqual({
      ok: true,
      env: {
        providers: {
          geminiApiKey: "gemini-key",
          openaiApiKey: "openai-key",
          anthropicApiKey: undefined,
          geminiModel: undefined,
          openaiModel: undefined,
          summaryModel: undefined,
        },
        accessCode: undefined,
      },
    });
  });

  it("treats empty and blank variables as not provided", () => {
    const result = readGrillEnv({
      ...keys,
      GEMINI_MODEL: "",
      SUMMARY_MODEL: "   ",
      GRILL_RESTAURANT_ACCESS_CODE: "",
    });
    expect(result.ok && result.env.providers.geminiModel).toBeUndefined();
    expect(result.ok && result.env.providers.summaryModel).toBeUndefined();
    expect(result.ok && result.env.accessCode).toBeUndefined();
  });

  it("names each missing key, without any values", () => {
    expect(
      readGrillEnv({ GEMINI_API_KEY: " ", OPENAI_API_KEY: undefined }),
    ).toEqual({
      ok: false,
      problems: ["GEMINI_API_KEY is not set", "OPENAI_API_KEY is not set"],
    });
  });

  it("needs the Anthropic key only for a Claude verdict model", () => {
    expect(readGrillEnv({ ...keys, SUMMARY_MODEL: "claude-opus-5-5" })).toEqual(
      {
        ok: false,
        problems: ["ANTHROPIC_API_KEY is needed for a Claude SUMMARY_MODEL"],
      },
    );
    expect(
      readGrillEnv({
        ...keys,
        SUMMARY_MODEL: "claude-opus-5-5",
        ANTHROPIC_API_KEY: "anthropic-key",
      }).ok,
    ).toBe(true);
    expect(readGrillEnv({ ...keys, SUMMARY_MODEL: "gpt-6-luna" }).ok).toBe(
      true,
    );
  });
});
