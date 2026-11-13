/**
 * Rough cost of a check, from the token counts and tool calls each provider
 * reports. List prices as published on 2026-11-11; update them here when they
 * change. Free allowances (such as Google's 5,000 Maps queries a month) are
 * ignored, so this is the cost once they run out.
 */
import type { LanguageModelUsage } from "ai";

/** Tokens one request used, in the same shape for every provider. */
export type TokenUsage = {
  inputTokens: number;
  cachedInputTokens?: number;
  /** Including any reasoning or thinking tokens. */
  outputTokens: number;
};

/**
 * The SDK's token counts in the shape pricing takes. Reasoning tokens are
 * already part of the output, and cache reads part of the input.
 */
export function tokenUsage(usage: LanguageModelUsage): TokenUsage {
  return {
    inputTokens: usage.inputTokens ?? 0,
    cachedInputTokens: usage.inputTokenDetails.cacheReadTokens ?? 0,
    outputTokens: usage.outputTokens ?? 0,
  };
}

/** US dollars per 1M tokens. */
type TokenPrice = { input: number; cachedInput?: number; output: number };

const TOKEN_PRICES: Record<string, TokenPrice> = {
  // Gemini 3.8 Flash doubles on 2027-01-01, to $1.50 / $7.50.
  "gemini-3.8-flash": { input: 0.75, output: 3.75 },
  "gemini-3.5-flash-lite": { input: 0.3, output: 2.5 },
  "gpt-6-luna": { input: 0.1, cachedInput: 0.01, output: 0.5 },
  "gpt-6-sol": { input: 2, cachedInput: 0.2, output: 10 },
  "gpt-5.5": { input: 5, cachedInput: 0.5, output: 30 },
  "claude-opus-5-5": { input: 4, output: 20 },
  "claude-sonnet-5-5": { input: 2, output: 10 },
  "claude-haiku-5-5": { input: 0.1, output: 0.5 },
};

/** Grounding with Google Maps on Gemini 3 and newer, per query. */
export const MAPS_QUERY_PRICE = 14 / 1000;
/** OpenAI web search on reasoning models, per call. */
export const WEB_SEARCH_CALL_PRICE = 10 / 1000;

export type AgentCost = {
  model: string;
  /** Null when the model's price is unknown. */
  tokens: number | null;
  toolCalls: number;
  total: number | null;
};

function tokenCost(model: string, usage: TokenUsage): number | null {
  const price = TOKEN_PRICES[model];
  if (!price) return null;
  const cached = usage.cachedInputTokens ?? 0;
  const uncached = usage.inputTokens - cached;
  return (
    (uncached * price.input +
      cached * (price.cachedInput ?? price.input) +
      usage.outputTokens * price.output) /
    1_000_000
  );
}

/** What one agent's requests and tool calls cost. */
export function agentCost(
  model: string,
  usage: TokenUsage[],
  toolCalls: number,
  toolCallPrice: number,
): AgentCost {
  const parts = usage.map((u) => tokenCost(model, u));
  const tokens = parts.some((p) => p === null)
    ? null
    : parts.reduce<number>((sum, p) => sum + (p ?? 0), 0);
  const tools = toolCalls * toolCallPrice;
  return {
    model,
    tokens,
    toolCalls: tools,
    total: tokens === null ? null : tokens + tools,
  };
}

export function formatDollars(amount: number | null): string {
  if (amount === null) return "unknown";
  if (amount === 0) return "$0.00";
  if (amount < 0.01) return "<$0.01";
  return `$${amount.toFixed(2)}`;
}
