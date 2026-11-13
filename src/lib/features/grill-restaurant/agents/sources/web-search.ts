/**
 * The shape both web search agents share: one question about the place,
 * answered from OpenAI's web search as JSON that fits a schema. Each search
 * and page the model opens is reported as it finishes.
 *
 * Only ever given the user's own words for the place. Google Maps Content
 * (names, addresses, reviews) must not reach a non-Google model, so nothing
 * from the Google Maps agent is passed in here.
 */
import { tryCatchAsync } from "@/utils/try-catch";
import { openai } from "@ai-sdk/openai";
import { jsonSchema, Output, streamText, type JSONSchema7 } from "ai";
import { noOutputError } from "../../providers/errors";
import {
  agentCost,
  tokenUsage,
  WEB_SEARCH_CALL_PRICE,
  type TokenUsage,
} from "../../providers/pricing";
import type { Agent, PlaceInput } from "../common/agent";

export type WebSearchResult<T> = {
  findings: T;
  model: string;
  /** Every query and page the model searched or opened, in order. */
  searches: string[];
  /** Billed web search calls. One call can run several queries. */
  searchCalls: number;
  usage: TokenUsage;
};

/** One web search action, as the AI SDK reports it. */
export type WebSearchAction =
  | { type: "search"; query?: string; queries?: string[] }
  | { type: "openPage"; url?: string | null }
  | { type: "findInPage"; url?: string | null; pattern?: string | null };

/** Progress lines name page actions the way OpenAI does. */
const PAGE_ACTIONS = { openPage: "open_page", findInPage: "find_in_page" };

/** "search: <query>" or "open_page: <url>" for one web search action. */
export function describeAction(action: WebSearchAction | undefined): string[] {
  if (!action) return [];
  if (action.type === "search") {
    if (action.queries?.length) {
      return action.queries.map((query) => `search: ${query}`);
    }
    return action.query ? [`search: ${action.query}`] : [];
  }
  return action.url ? [`${PAGE_ACTIONS[action.type]}: ${action.url}`] : [];
}

export function webSearchAgent<T>({
  schemaName,
  schema,
  prompt,
}: {
  schemaName: string;
  schema: JSONSchema7;
  prompt: (place: string) => string;
}): Agent<PlaceInput, WebSearchResult<T>> {
  return {
    defaultModel: "gpt-6-luna",
    async run(place, { model, models, progress }) {
      const result = streamText({
        model: models.languageModel(model),
        prompt: prompt(place.name),
        tools: { web_search: openai.tools.webSearch() },
        output: Output.object({
          schema: jsonSchema<T>(schema),
          name: schemaName,
        }),
        // Failures arrive as error parts below and fail the agent.
        onError: () => {},
      });
      const searches: string[] = [];
      let searchCalls = 0;
      for await (const part of result.fullStream) {
        if (part.type === "error") throw part.error;
        if (part.type === "tool-call" && part.toolName === "web_search") {
          searchCalls++;
        }
        if (part.type === "tool-result" && part.toolName === "web_search") {
          const output = part.output as { action?: WebSearchAction };
          for (const search of describeAction(output.action)) {
            searches.push(search);
            progress(search);
          }
        }
      }
      const findings = await tryCatchAsync(async () => result.output);
      if (findings.error) throw noOutputError(findings.error, model);
      return {
        findings: findings.data,
        model,
        searches,
        searchCalls,
        usage: tokenUsage(await result.totalUsage),
      };
    },
    cost: (result) =>
      agentCost(
        result.model,
        [result.usage],
        result.searchCalls,
        WEB_SEARCH_CALL_PRICE,
      ),
  };
}
