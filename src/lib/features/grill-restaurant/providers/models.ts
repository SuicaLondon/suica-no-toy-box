/**
 * The model clients a check shares, built on the AI SDK. They hold the API
 * keys and the fetch the check runs with, so an agent only names its model.
 * The name picks the provider: "claude-…" is Anthropic, "gemini-…" is Google
 * and anything else is OpenAI.
 *
 * Tools stay with the agents that use them (web search, Maps grounding), and
 * so does every rule about what an agent may see.
 */
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

/** The keys a check holds. Anthropic's is only needed for a Claude model. */
export type ApiKeys = { gemini: string; openai: string; anthropic?: string };

export type Provider = "openai" | "google" | "anthropic";

/** Which provider serves a model, from its name. */
export function providerOf(model: string): Provider {
  if (model.startsWith("claude-")) return "anthropic";
  if (model.startsWith("gemini-")) return "google";
  return "openai";
}

export type Models = {
  /** The model with this name. Throws when its provider has no key. */
  languageModel: (model: string) => LanguageModel;
};

export function createModels(
  keys: ApiKeys,
  fetch?: typeof globalThis.fetch,
): Models {
  const openai = createOpenAI({ apiKey: keys.openai, fetch });
  const google = createGoogleGenerativeAI({ apiKey: keys.gemini, fetch });
  const anthropic = keys.anthropic
    ? createAnthropic({ apiKey: keys.anthropic, fetch })
    : null;
  const byProvider: Record<Provider, (model: string) => LanguageModel> = {
    openai: (model) => openai.responses(model),
    google: (model) => google(model),
    anthropic: (model) => {
      if (!anthropic) throw new Error("ANTHROPIC_API_KEY is not set");
      return anthropic(model);
    },
  };
  return { languageModel: (model) => byProvider[providerOf(model)](model) };
}
