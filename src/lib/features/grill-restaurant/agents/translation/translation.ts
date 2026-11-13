/**
 * A source's result in the reader's language, translated as soon as that
 * source finishes. The agents write in English, and Gemini answers in
 * English; the original stays beside the translation, one tap away.
 *
 * Only the text a reader reads is sent: answers, reviews, summaries, pros
 * and cons, notes and distinctions. Names, links, ratings and numbers stay
 * as they came. Google Maps content is translated by Gemini, its own
 * provider, and never reaches another model.
 */
import { generateJson } from "../../providers/generate-json";
import { list, strictObject, text } from "../../providers/json-schema";
import { providerOf, type Models } from "../../providers/models";
import {
  agentCost,
  type AgentCost,
  type TokenUsage,
} from "../../providers/pricing";
import { LANGUAGE_NAMES, type Language } from "../common/agent";
import type { GoogleResult } from "../sources/google";
import type { MichelinFindings } from "../sources/michelin";
import type { OtherSourcesFindings } from "../sources/other-sources";
import type { WebSearchResult } from "../sources/web-search";

/** A source's result, its text in `language`. */
export type Translation<R> = {
  language: Language;
  model: string;
  result: R;
  usage: TokenUsage;
};

/** Rebuilds a result with every text a reader reads passed through `each`. */
export type TextMap<R> = (result: R, each: (text: string) => string) => R;

const maybe = (value: string | null, each: (text: string) => string) =>
  value === null ? null : each(value);

export const googleTexts: TextMap<GoogleResult> = (result, each) => ({
  ...result,
  gemini: {
    ...result.gemini,
    rounds: result.gemini.rounds.map((round) => ({
      ...round,
      answerText: each(round.answerText),
    })),
  },
  reviews: result.reviews.map((review) => ({
    ...review,
    text: each(review.text),
  })),
  elsewhere: result.elsewhere.map((review) => ({
    ...review,
    text: each(review.text),
  })),
});

export const otherSourcesTexts: TextMap<
  WebSearchResult<OtherSourcesFindings>
> = (result, each) => ({
  ...result,
  findings: {
    platforms: result.findings.platforms.map((platform) => ({
      ...platform,
      summary: each(platform.summary),
      pros: platform.pros.map(each),
      cons: platform.cons.map(each),
      dishesToOrder: platform.dishesToOrder.map(each),
      dishesToSkip: platform.dishesToSkip.map(each),
    })),
    notes: maybe(result.findings.notes, each),
  },
});

export const michelinTexts: TextMap<WebSearchResult<MichelinFindings>> = (
  result,
  each,
) => {
  const { findings } = result;
  return {
    ...result,
    findings: {
      ...findings,
      currentDistinction: maybe(findings.currentDistinction, each),
      inspectorSummary: maybe(findings.inspectorSummary, each),
      history: findings.history.map((entry) => ({
        ...entry,
        distinction: each(entry.distinction),
      })),
      notes: maybe(findings.notes, each),
    },
  };
};

const SCHEMA = strictObject({ translations: list(text) });

/** How the MICHELIN Guide's own edition writes its distinctions, by language. */
const DISTINCTION_NAMES: Partial<Record<Language, string>> = {
  zh: "Three Stars 米其林三星, Two Stars 米其林二星, One Star 米其林一星, Bib Gourmand 必比登推介, Selected 米其林入選",
};

export function buildTranslationPrompt(
  texts: string[],
  language: Language,
): string {
  const distinctions = DISTINCTION_NAMES[language];
  return [
    `Translate each text in this JSON array into ${LANGUAGE_NAMES[language]}.`,
    "They are what reviewers, review sites and the MICHELIN Guide say about a",
    "restaurant.",
    "",
    `- Return exactly ${texts.length} translations, in the same order.`,
    "- Translate the meaning, not word by word, as a local food writer would",
    "  write it. Add nothing and drop nothing.",
    "- Keep the bite: a harsh line stays just as harsh, a rave just as warm.",
    ...(language === "zh"
      ? [
          "- Write natural Taiwanese Mandarin with full-width punctuation (，。：).",
          "  Use the names Taiwanese diners use for dishes, such as 叻沙 for",
          "  laksa, and keep English only for names people write in English.",
        ]
      : []),
    "- Keep Markdown as it is: headings, lists and bold.",
    "- Keep the names of restaurants, review sites, people and places, and",
    "  every number, price, year and unit, as they are.",
    ...(distinctions
      ? [`- Write MICHELIN distinctions as the Guide does: ${distinctions}.`]
      : []),
    "",
    JSON.stringify(texts, null, 2),
  ].join("\n");
}

export type TranslateRequest = {
  models: Models;
  model: string;
  language: Language;
  /** Google Maps content: only a Google model may translate it. */
  googleContent?: boolean;
};

/** Translates every text `map` visits, and puts each back in its place. */
export async function translateResult<R>(
  result: R,
  map: TextMap<R>,
  { models, model, language, googleContent }: TranslateRequest,
): Promise<Translation<R>> {
  if (googleContent && providerOf(model) !== "google") {
    throw new Error(`Google Maps content can't go to ${model}`);
  }
  const texts: string[] = [];
  map(result, (text) => {
    texts.push(text);
    return text;
  });
  if (texts.length === 0) {
    return {
      language,
      model,
      result,
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }
  const reply = await generateJson<{ translations: string[] }>({
    models,
    model,
    prompt: buildTranslationPrompt(texts, language),
    name: "translations",
    schema: SCHEMA,
  });
  const { translations } = reply.value;
  if (translations.length !== texts.length) {
    throw new Error(
      `The translation returned ${translations.length} texts for ${texts.length}`,
    );
  }
  let next = 0;
  return {
    language,
    model,
    result: map(result, () => translations[next++]),
    usage: reply.usage,
  };
}

export function translationCost(translation: Translation<unknown>): AgentCost {
  return agentCost(translation.model, [translation.usage], 0, 0);
}
