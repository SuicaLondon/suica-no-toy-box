/**
 * What each source found, or is doing, in one plain line. The page talks
 * about sources and a verdict, never about agents or models.
 */
import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import type { AgentResults } from "../../check/grill-restaurant";
import type { AgentState } from "../../check/grill-state";
import type { PlatformReviews } from "../../agents/sources/other-sources";
import { hostOf, parseProgress, type Lane } from "../progress/progress";
import { PARENTHETICAL } from "@/utils/regex";
import { placeCardField, RATING_WITH_COUNT } from "../../regex";

/** The three sources, in the order the page lists them. */
export const SOURCES = ["google", "otherSources", "michelin"] as const;
export type SourceId = (typeof SOURCES)[number];

/** Reads one "**Field:** value" line from a Google Maps place card. */
export function placeDetail(details: string | undefined, field: string) {
  return details?.match(placeCardField(field))?.[1]?.trim();
}

/** "4.3 (715 reviews)" → { rating: "4.3", count: "715" }. */
export function googleRating(details: string | undefined) {
  const match = RATING_WITH_COUNT.exec(placeDetail(details, "Rating") ?? "");
  return match ? { rating: match[1], count: match[2] } : null;
}

/** 4.3 and 5 → "4.3/5"; a rating without a scale stays as it is. */
export function formatRating(rating: number, scale: number | null): string {
  if (!scale) return String(rating);
  return `${rating}/${scale}`;
}

/** "4.3/5 · 120 reviews", or "no rating". */
export function platformFigures(
  platform: Pick<PlatformReviews, "rating" | "ratingScale" | "reviewCount">,
  messages: GrillRestaurantMessages,
): string {
  const rating =
    platform.rating === null
      ? messages.noRating
      : formatRating(platform.rating, platform.ratingScale);
  if (platform.reviewCount === null) return rating;
  return `${rating} · ${messages.reviewCount(platform.reviewCount)}`;
}

/** "Bib Gourmand (2026)" → "Bib Gourmand". */
function plainDistinction(distinction: string) {
  return distinction.replace(PARENTHETICAL, "").trim();
}

/** The headline of what a finished source found. */
export function findingLine(
  source: SourceId,
  state: AgentState,
  messages: GrillRestaurantMessages,
): string {
  if (!state.result) return "";
  switch (source) {
    case "google": {
      const { gemini, reviews } = state.result as AgentResults["google"];
      const rating = googleRating(gemini.places[0]?.details);
      return rating
        ? messages.ratingLine(rating.rating, rating.count)
        : messages.reviewsRead(reviews.length);
    }
    case "otherSources": {
      const { platforms } = (state.result as AgentResults["otherSources"])
        .findings;
      const rated = platforms.find((platform) => platform.rating !== null);
      const top = rated
        ? `${rated.platform} ${formatRating(rated.rating!, rated.ratingScale)}`
        : null;
      return [messages.sitesFound(platforms.length), top]
        .filter(Boolean)
        .join(" · ");
    }
    case "michelin": {
      const { findings } = state.result as AgentResults["michelin"];
      if (!findings.listed) return messages.notListed;
      const years = findings.history.map((entry) => entry.year).sort();
      const distinction = plainDistinction(
        findings.currentDistinction ??
          findings.history.at(-1)?.distinction ??
          "",
      );
      if (!years.length) return distinction;
      return years.length === 1
        ? messages.michelinNew(distinction, years[0])
        : messages.michelinSince(distinction, years[0]);
    }
  }
}

/** What a working source is doing now, in plain words. */
export function activityLine(
  source: SourceId,
  state: AgentState,
  messages: GrillRestaurantMessages,
): string {
  if (source === "google") return messages.readingReviews;
  const last = state.progress.at(-1);
  const line = last ? parseProgress(last.text) : null;
  if (line?.kind === "open" || line?.kind === "find") {
    return messages.readingSite(hostOf(line.url));
  }
  return source === "michelin"
    ? messages.searchingGuide
    : messages.searchingWeb;
}

/** The one line a source shows for its current status. */
export function sourceLine(
  source: SourceId,
  lane: Lane,
  state: AgentState,
  messages: GrillRestaurantMessages,
): string {
  switch (lane.status) {
    case "done":
      return findingLine(source, state, messages);
    case "running":
      return activityLine(source, state, messages);
    case "failed":
      return messages.couldNotCheck;
    case "stopped":
      return messages.stopped;
    default:
      return messages.waiting;
  }
}
