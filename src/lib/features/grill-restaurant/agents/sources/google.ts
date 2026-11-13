/**
 * What Google Maps reviewers say, from Gemini grounded with Google Maps.
 *
 * Gemini will not quote reviews in its own answer, but when it answers in
 * prose, Grounding with Google Maps returns each review it read as a grounding
 * chunk holding the review's text and date. The agent asks one short question
 * for pros and cons and keeps the reviews behind the answer as its sources.
 *
 * Nothing is stored (ADR 0002): results live only in memory and in whatever
 * shows them to the person who asked.
 */
import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import type { Models } from "../../providers/models";
import {
  agentCost,
  MAPS_QUERY_PRICE,
  tokenUsage,
  type TokenUsage,
} from "../../providers/pricing";
import { REVIEW_DATE_SUFFIX } from "../../regex";
import type { Agent, LatLng, PlaceInput } from "../common/agent";
import { DINER_STAKES } from "../common/voice";

/** One thing Google Maps handed Gemini: a place card or a review. */
export type MapsChunk = {
  uri?: string | null;
  title?: string | null;
  text?: string | null;
  placeId?: string | null;
};

/** What Grounding with Google Maps adds to an answer. */
export type GroundingMetadata = {
  groundingChunks?: { maps?: MapsChunk | null }[] | null;
  webSearchQueries?: string[] | null;
} & Record<string, unknown>;

/** The part of Gemini's provider metadata this agent reads. */
type GeminiMetadata = {
  groundingMetadata?: GroundingMetadata | null;
  promptFeedback?: unknown;
};

/**
 * Each round asks about the place from one of these angles: what reviews
 * praise and fault, then which dishes are worth ordering. Each answer is
 * headed lists in a fixed order, so the page can lay them out.
 */
export const QUESTION_ANGLES = [
  'What do its reviews praise and complain about? Reply in Markdown with a "### Pros" heading over at most four bullet points, then a "### Cons" heading over at most four. Only when many reviews say the opposite of many others about the food itself, such as a broth many call rich and many others thin, add a "### Divided" heading over one bullet point saying what each side says. Most places have no such split, so leave it out unless it is plain; a few dissenters, or complaints about price, waits or service, are not a split. Put the points many reviews share first and say roughly how many make each: most, many or some. Trust long, detailed reviews over one-line ones, and leave out a point only one short review makes. Be specific about taste and value: how rich, light or bland, and whether it is worth the price. If the place sells itself on a concept, such as a healthier recipe, say whether reviewers think it delivers. One short line each, with no introduction or closing.',
  'Which dishes do its reviews say are worth ordering, and which are not worth it? Reply in Markdown with a "### Worth ordering" heading over at most four bullet points, then a "### Not worth ordering" heading over at most three. Each bullet is the dish\'s name, a colon, then why in a few words and roughly how many reviews say so: most, many or some. Put the dishes most reviews mention first, and leave out a dish only one short review mentions. Leave out the "### Not worth ordering" heading when reviews warn against no dish. No introduction or closing.',
] as const;

/** A review exactly as Google Maps handed it to Gemini. */
export type GroundedReview = {
  text: string;
  /** From the "(YYYY-MM-DD)" Maps appends to the text, when present. */
  date?: string;
  uri: string;
  placeId?: string;
  /** The round that first returned it. */
  round: number;
};

/** A place card Google Maps handed to Gemini: address, rating, hours and so on. */
export type GroundedPlace = {
  placeId?: string;
  title?: string;
  uri?: string;
  details?: string;
};

export type GeminiReviewsRound = {
  round: number;
  question: string;
  /** Gemini's answer, unmodified. Grounding terms forbid altering it before display. */
  answerText: string;
  reviewsReturned: number;
  newReviews: number;
  /** Maps lookups Gemini ran; each is billed on Gemini 3 and newer. */
  mapsQueries: string[];
  usage: TokenUsage;
  finishReason?: string;
  groundingMetadata?: GroundingMetadata;
};

export type GeminiReviewsResult = {
  model: string;
  place: string;
  rounds: GeminiReviewsRound[];
  places: GroundedPlace[];
  reviews: GroundedReview[];
  totalMapsQueries: number;
  /** Reasons to distrust the result. */
  warnings: string[];
};

export type GoogleResult = {
  gemini: GeminiReviewsResult;
  /** Reviews of the restaurant itself, the most detailed first. */
  reviews: GroundedReview[];
  /** Reviews Maps returned for other places, such as the food court around a stall. */
  elsewhere: GroundedReview[];
};

export function buildQuestion(place: string, angle: string): string {
  return `About this place on Google Maps: ${place}\n\n${angle}\n\n${DINER_STAKES}`;
}

/** Where Maps should look, when the link said. */
export function mapsOptions(latLng?: LatLng) {
  return latLng ? { google: { retrievalConfig: { latLng } } } : undefined;
}

export function isReviewChunk(chunk: MapsChunk): boolean {
  return (
    (chunk.uri?.includes("/maps/reviews/") ?? false) ||
    (chunk.title?.startsWith("Review of ") ?? false)
  );
}

export function splitReviewDate(text: string): { text: string; date?: string } {
  const match = REVIEW_DATE_SUFFIX.exec(text);
  if (!match) return { text: text.trim() };
  return { text: text.slice(0, match.index).trim(), date: match[1] };
}

export function readChunks(
  groundingMetadata: GroundingMetadata | undefined,
  round: number,
): { places: GroundedPlace[]; reviews: GroundedReview[] } {
  const places: GroundedPlace[] = [];
  const reviews: GroundedReview[] = [];
  for (const { maps } of groundingMetadata?.groundingChunks ?? []) {
    if (!maps) continue;
    if (isReviewChunk(maps)) {
      if (!maps.uri || !maps.text) continue;
      reviews.push({
        ...splitReviewDate(maps.text),
        uri: maps.uri,
        placeId: maps.placeId ?? undefined,
        round,
      });
    } else {
      places.push({
        placeId: maps.placeId ?? undefined,
        title: maps.title ?? undefined,
        uri: maps.uri ?? undefined,
        details: maps.text ?? undefined,
      });
    }
  }
  return { places, reviews };
}

/**
 * The most detailed reviews first: a long review says more about the place
 * than a one-liner. Reviews of the same length keep Google's order.
 */
export function mostDetailedFirst(reviews: GroundedReview[]): GroundedReview[] {
  return [...reviews].sort((a, b) => b.text.length - a.text.length);
}

/** Splits off reviews of places other than the first one Maps matched. */
export function splitReviewsByPlace(google: GeminiReviewsResult): {
  target: GroundedReview[];
  elsewhere: GroundedReview[];
} {
  const targetId = google.places[0]?.placeId;
  if (!targetId) return { target: google.reviews, elsewhere: [] };
  return {
    target: google.reviews.filter((r) => !r.placeId || r.placeId === targetId),
    elsewhere: google.reviews.filter(
      (r) => r.placeId && r.placeId !== targetId,
    ),
  };
}

function warningsFor(
  places: GroundedPlace[],
  reviews: GroundedReview[],
): string[] {
  const warnings: string[] = [];
  if (places.length === 0 && reviews.length === 0) {
    warnings.push("Google Maps returned nothing: Gemini answered unaided.");
  } else if (reviews.length === 0) {
    warnings.push("Google Maps returned the Place but no reviews.");
  }
  const placeIds = new Set(
    [...places, ...reviews].map((item) => item.placeId).filter(Boolean),
  );
  if (placeIds.size > 1) {
    warnings.push(
      `Google Maps returned ${placeIds.size} different places; reviews may mix branches or neighbours.`,
    );
  }
  return warnings;
}

export type GeminiReviewsRequest = {
  place: PlaceInput;
  models: Models;
  model: string;
  /** How many questions to ask, at most QUESTION_ANGLES.length. Defaults to all of them. */
  rounds?: number;
  /** Stop after this many rounds in a row bring no new review. Defaults to 2. */
  stopAfterDryRounds?: number;
  /** Called before each question and after each answer. */
  onProgress?: (text: string) => void;
};

/** Asks each question in turn and keeps every distinct review it hears back. */
export async function fetchGeminiReviews(
  request: GeminiReviewsRequest,
): Promise<GeminiReviewsResult> {
  const totalRounds = Math.min(
    QUESTION_ANGLES.length,
    Math.max(1, request.rounds ?? QUESTION_ANGLES.length),
  );
  const stopAfterDry = Math.max(1, request.stopAfterDryRounds ?? 2);
  const rounds: GeminiReviewsRound[] = [];
  const reviews = new Map<string, GroundedReview>();
  const places = new Map<string, GroundedPlace>();
  const warnings: string[] = [];
  let dryRounds = 0;

  for (let round = 1; round <= totalRounds; round++) {
    const angle = QUESTION_ANGLES[round - 1];
    const question = buildQuestion(request.place.name, angle);
    request.onProgress?.(`Asking: ${angle}`);
    const answer = await generateText({
      model: request.models.languageModel(request.model),
      prompt: question,
      tools: { google_maps: google.tools.googleMaps({}) },
      providerOptions: mapsOptions(request.place.latLng),
    });
    const gemini = answer.providerMetadata?.google as
      | GeminiMetadata
      | undefined;
    const groundingMetadata = gemini?.groundingMetadata ?? undefined;
    if (!answer.text.trim() && !groundingMetadata?.groundingChunks?.length) {
      warnings.push(
        `Round ${round}: no answer (promptFeedback: ${JSON.stringify(gemini?.promptFeedback ?? null)})`,
      );
      break;
    }

    const chunks = readChunks(groundingMetadata, round);
    for (const place of chunks.places) {
      const key = place.placeId ?? place.uri ?? place.title ?? "";
      if (!places.has(key)) places.set(key, place);
    }
    let newReviews = 0;
    for (const review of chunks.reviews) {
      if (reviews.has(review.uri)) continue;
      reviews.set(review.uri, review);
      newReviews++;
    }

    const queries = groundingMetadata?.webSearchQueries ?? [];
    rounds.push({
      round,
      question,
      answerText: answer.text,
      reviewsReturned: chunks.reviews.length,
      newReviews,
      mapsQueries: queries,
      usage: tokenUsage(answer.totalUsage),
      finishReason: answer.rawFinishReason ?? answer.finishReason,
      groundingMetadata,
    });
    request.onProgress?.(
      `Answered with ${chunks.reviews.length} reviews (${newReviews} new) from ${queries.length} Maps searches` +
        (queries.length ? `: ${queries.join(" · ")}` : ""),
    );
    dryRounds = newReviews === 0 ? dryRounds + 1 : 0;
    if (dryRounds >= stopAfterDry) break;
  }

  const allPlaces = [...places.values()];
  const allReviews = [...reviews.values()];
  return {
    model: request.model,
    place: request.place.name,
    rounds,
    places: allPlaces,
    reviews: allReviews,
    totalMapsQueries: rounds.reduce((n, r) => n + r.mapsQueries.length, 0),
    warnings: [...warnings, ...warningsFor(allPlaces, allReviews)],
  };
}

export const googleAgent: Agent<PlaceInput, GoogleResult> = {
  defaultModel: "gemini-3.8-flash",
  async run(place, { model, models, progress }) {
    const gemini = await fetchGeminiReviews({
      place,
      models,
      model,
      onProgress: progress,
    });
    const { target, elsewhere } = splitReviewsByPlace(gemini);
    return { gemini, reviews: mostDetailedFirst(target), elsewhere };
  },
  cost: ({ gemini }) =>
    agentCost(
      gemini.model,
      gemini.rounds.map((round) => round.usage),
      gemini.totalMapsQueries,
      MAPS_QUERY_PRICE,
    ),
};
