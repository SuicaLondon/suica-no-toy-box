/**
 * One check: what Google Maps reviewers, other review sites and the MICHELIN
 * Guide each say about a restaurant, then a verdict. Every agent's result is
 * kept and shown as it came back.
 *
 *  - Google Maps (agents/sources/google.ts) and the two web searches
 *    (agents/sources/other-sources.ts, agents/sources/michelin.ts) run at
 *    the same time.
 *  - The verdict (agents/summary/summary.ts) starts once both web searches
 *    end.
 *  - On a page in another language, each source's result is translated
 *    (agents/translation/translation.ts) as soon as that source finishes.
 *    Google Maps is translated by Gemini only.
 *
 * Progress is reported as GrillEvents, which stream to the browser.
 *
 * Google Maps Content goes to Gemini only and is shown as Gemini returned or
 * translated it, beside the verdict rather than in it. The web agents only see the place name the user
 * gave, typed or read from the link they pasted. Nothing is stored (ADR 0002).
 */
import { tryCatchAsync } from "@/utils/try-catch";
import type {
  Agent,
  Language,
  LatLng,
  PlaceInput,
} from "../agents/common/agent";
import { googleAgent, type GoogleResult } from "../agents/sources/google";
import {
  michelinAgent,
  type MichelinFindings,
} from "../agents/sources/michelin";
import {
  otherSourcesAgent,
  type OtherSourcesFindings,
} from "../agents/sources/other-sources";
import {
  summaryAgent,
  type Summary,
  type SummaryInput,
} from "../agents/summary/summary";
import {
  googleTexts,
  michelinTexts,
  otherSourcesTexts,
  translateResult,
  translationCost,
  type TextMap,
  type Translation,
} from "../agents/translation/translation";
import type { WebSearchResult } from "../agents/sources/web-search";
import type { GroundedReview } from "../agents/sources/google";
import { describeError } from "../providers/errors";
import { createModels } from "../providers/models";
import type { AgentCost } from "../providers/pricing";

export type AgentResults = {
  google: GoogleResult;
  otherSources: WebSearchResult<OtherSourcesFindings>;
  michelin: WebSearchResult<MichelinFindings>;
  summary: Summary;
};
export type AgentId = keyof AgentResults;

/** The sources a page in another language reads translated. */
export type TranslatedId = "google" | "otherSources" | "michelin";

/** How to reach each source's text. */
const TEXT_MAPS: { [A in TranslatedId]: TextMap<AgentResults[A]> } = {
  google: googleTexts,
  otherSources: otherSourcesTexts,
  michelin: michelinTexts,
};

const TRANSLATED: readonly string[] = Object.keys(TEXT_MAPS);
const isTranslated = (id: AgentId): id is TranslatedId =>
  TRANSLATED.includes(id);

/** The model that translates the web sources unless the verdict's is named. */
const TRANSLATION_MODEL = "gpt-6-luna";

type AgentInputs = {
  google: PlaceInput;
  otherSources: PlaceInput;
  michelin: PlaceInput;
  summary: SummaryInput;
};

/** Every agent a check runs, by id. */
const AGENTS: { [A in AgentId]: Agent<AgentInputs[A], AgentResults[A]> } = {
  google: googleAgent,
  otherSources: otherSourcesAgent,
  michelin: michelinAgent,
  summary: summaryAgent,
};

export type MichelinTimeline = {
  firstListedYear: number;
  googleReviewsBefore: number;
  googleReviewsFromThen: number;
  googleReviewsUndated: number;
};

export type RunCost = {
  agents: Partial<Record<AgentId, AgentCost>>;
  translations: Partial<Record<TranslatedId, AgentCost>>;
  /** Null when a model's price is unknown. */
  total: number | null;
};

export type GrillPlace = {
  name: string;
  latLng?: LatLng;
  mapsUrl?: string;
};

/** Everything a check reports, in order. `t` is milliseconds since it began. */
export type GrillEvent = { t: number } & (
  | {
      type: "run.started";
      place: GrillPlace;
      models: Record<AgentId, string>;
      /** The reader's language: the verdict's, and the translations' when not English. */
      language: Language;
    }
  | { type: "agent.started"; agent: AgentId }
  | { type: "agent.progress"; agent: AgentId; text: string }
  | {
      [A in AgentId]: {
        type: "agent.completed";
        agent: A;
        result: AgentResults[A];
      };
    }[AgentId]
  | { type: "agent.failed"; agent: AgentId; error: string }
  | {
      [A in TranslatedId]: {
        type: "translation.completed";
        agent: A;
        translation: Translation<AgentResults[A]>;
      };
    }[TranslatedId]
  | { type: "translation.failed"; agent: TranslatedId; error: string }
  | {
      type: "run.completed";
      michelinTimeline: MichelinTimeline | null;
      cost: RunCost;
    }
  | {
      type: "run.failed";
      error: string;
      /** Why the link could not be used, when that is the reason. */
      code?: "invalid" | "unsupported" | "no-name" | "unreachable";
    }
);

/** A GrillEvent before its timestamp is added. */
export type GrillEventBody = GrillEvent extends infer E
  ? E extends GrillEvent
    ? Omit<E, "t">
    : never
  : never;

export type GrillRestaurantRequest = {
  place: GrillPlace;
  geminiApiKey: string;
  openaiApiKey: string;
  /** Only needed when summaryModel is a Claude model. */
  anthropicApiKey?: string;
  geminiModel?: string;
  /** Model for the two web searches. */
  openaiModel?: string;
  /** Model for the verdict and the web sources' translation: OpenAI, Gemini ("gemini-…") or Claude ("claude-…"). */
  summaryModel?: string;
  /** The reader's language. Defaults to English. */
  language?: Language;
  fetch?: typeof fetch;
  emit: (event: GrillEventBody) => void;
};

/** The model each agent runs on: the request's choice, else its default. */
function modelsFor(request: GrillRestaurantRequest): Record<AgentId, string> {
  return {
    google: request.geminiModel ?? AGENTS.google.defaultModel,
    otherSources: request.openaiModel ?? AGENTS.otherSources.defaultModel,
    michelin: request.openaiModel ?? AGENTS.michelin.defaultModel,
    summary: request.summaryModel ?? AGENTS.summary.defaultModel,
  };
}

export function buildMichelinTimeline(
  michelin: MichelinFindings | undefined,
  reviews: GroundedReview[],
): MichelinTimeline | null {
  if (!michelin?.listed || michelin.history.length === 0) return null;
  const firstListedYear = Math.min(...michelin.history.map((h) => h.year));
  let before = 0;
  let fromThen = 0;
  let undated = 0;
  for (const review of reviews) {
    const year = review.date ? Number(review.date.slice(0, 4)) : NaN;
    if (Number.isNaN(year)) undated++;
    else if (year < firstListedYear) before++;
    else fromThen++;
  }
  return {
    firstListedYear,
    googleReviewsBefore: before,
    googleReviewsFromThen: fromThen,
    googleReviewsUndated: undated,
  };
}

function costOf<A extends AgentId>(id: A, result: AgentResults[A]): AgentCost {
  return AGENTS[id].cost(result);
}

/** What each finished agent and translation cost, and the total when every price is known. */
export function estimateCost(
  results: Partial<AgentResults>,
  translations: Partial<Record<TranslatedId, Translation<unknown>>> = {},
): RunCost {
  const agents: RunCost["agents"] = {};
  for (const id of Object.keys(results) as AgentId[]) {
    const result = results[id];
    if (result) agents[id] = costOf(id, result);
  }
  const translated: RunCost["translations"] = {};
  for (const id of Object.keys(translations) as TranslatedId[]) {
    const translation = translations[id];
    if (translation) translated[id] = translationCost(translation);
  }
  const totals = [...Object.values(agents), ...Object.values(translated)].map(
    (cost) => cost.total,
  );
  return {
    agents,
    translations: translated,
    total: totals.some((total) => total === null)
      ? null
      : totals.reduce<number>((sum, total) => sum + (total ?? 0), 0),
  };
}

/**
 * Runs every agent, reporting progress through `emit`. Google Maps and the two
 * web searches run in parallel; the verdict starts once both web searches
 * end. When the reader's language is not English, each source is translated
 * as soon as it finishes.
 * Never throws: failures are reported as events.
 */
export async function grillRestaurant(
  request: GrillRestaurantRequest,
): Promise<Partial<AgentResults>> {
  const { emit, place } = request;
  const language = request.language ?? "en";
  const modelIds = modelsFor(request);
  const models = createModels(
    {
      gemini: request.geminiApiKey,
      openai: request.openaiApiKey,
      anthropic: request.anthropicApiKey,
    },
    request.fetch,
  );
  const results: Partial<AgentResults> = {};
  const translations: Partial<Record<TranslatedId, Translation<unknown>>> = {};
  const translating: Promise<void>[] = [];

  /** Starts translating a finished source; the check waits for it at the end. */
  function translate<A extends TranslatedId>(id: A, result: AgentResults[A]) {
    const model =
      id === "google"
        ? modelIds.google
        : (request.summaryModel ?? TRANSLATION_MODEL);
    const job = tryCatchAsync(() =>
      translateResult(result, TEXT_MAPS[id], {
        models,
        model,
        language,
        googleContent: id === "google",
      }),
    ).then((outcome) => {
      if (outcome.error) {
        emit({
          type: "translation.failed",
          agent: id,
          error: describeError(outcome.error),
        });
        return;
      }
      translations[id] = outcome.data;
      emit({
        type: "translation.completed",
        agent: id,
        translation: outcome.data,
      } as GrillEventBody);
    });
    translating.push(job);
  }

  emit({ type: "run.started", place, models: modelIds, language });

  async function run<A extends AgentId>(
    id: A,
    input: AgentInputs[A],
  ): Promise<AgentResults[A] | null> {
    emit({ type: "agent.started", agent: id });
    const outcome = await tryCatchAsync(() =>
      AGENTS[id].run(input, {
        model: modelIds[id],
        models,
        progress: (text) => emit({ type: "agent.progress", agent: id, text }),
      }),
    );
    if (outcome.error) {
      emit({
        type: "agent.failed",
        agent: id,
        error: describeError(outcome.error),
      });
      return null;
    }
    results[id] = outcome.data;
    emit({
      type: "agent.completed",
      agent: id,
      result: outcome.data,
    } as GrillEventBody);
    if (language !== "en" && isTranslated(id)) {
      translate(id, outcome.data as AgentResults[typeof id]);
    }
    return outcome.data;
  }

  const web = Promise.all([
    run("otherSources", place),
    run("michelin", place),
  ]).then(([otherSources, michelin]) =>
    run("summary", {
      place: place.name,
      otherSources: otherSources?.findings ?? null,
      michelin: michelin?.findings ?? null,
      language,
    }),
  );

  await Promise.all([run("google", place), web]);
  await Promise.all(translating);

  emit({
    type: "run.completed",
    michelinTimeline: buildMichelinTimeline(
      results.michelin?.findings,
      results.google?.reviews ?? [],
    ),
    cost: estimateCost(results, translations),
  });
  return results;
}
