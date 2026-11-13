/** What review sites other than Google Maps say about the place. */
import {
  list,
  nullable,
  strictObject,
  text,
} from "../../providers/json-schema";
import { DINER_STAKES } from "../common/voice";
import { webSearchAgent } from "./web-search";

export type PlatformReviews = {
  platform: string;
  url: string | null;
  rating: number | null;
  ratingScale: number | null;
  reviewCount: number | null;
  summary: string;
  pros: string[];
  cons: string[];
  /** Dishes its reviewers say are worth ordering: "Dish: why". */
  dishesToOrder: string[];
  /** Dishes its reviewers say are not worth ordering: "Dish: why". */
  dishesToSkip: string[];
};

export type OtherSourcesFindings = {
  platforms: PlatformReviews[];
  notes: string | null;
};

const SCHEMA = strictObject({
  platforms: list(
    strictObject({
      platform: text,
      url: nullable("string"),
      rating: nullable("number"),
      ratingScale: nullable("number"),
      reviewCount: nullable("integer"),
      summary: text,
      pros: list(text),
      cons: list(text),
      dishesToOrder: list(text),
      dishesToSkip: list(text),
    }),
  ),
  notes: nullable("string"),
});

export function buildOtherSourcesPrompt(place: string): string {
  return [
    `Find reviews of this restaurant on review platforms other than Google Maps: ${place}`,
    "",
    "Look at whatever covers it: for example Tripadvisor, Yelp, Tabelog,",
    "Dianping, Naver, Burpple, OpenRice, food blogs and newspaper reviews.",
    "Only include a platform when you found this exact restaurant there, not a",
    "namesake or another branch. For each, give the page URL, the rating and",
    "its scale, the review count, a blunt one-sentence verdict that sums up",
    "what most of that site's reviewers say, and the pros and cons they raise",
    "most, the most common first, in your own words. Do not quote reviews.",
    "Read past the top reviews: the long, detailed ones, good and bad, say the",
    "most. Leave out a point only one short review makes.",
    "",
    "Be specific about the food: how rich, deep, creamy, light, salty or",
    "bland reviewers found it, and whether it is worth the price. If the",
    "place sells itself on a concept, such as a lighter or healthier recipe,",
    "say what its reviewers think of it. In the verdict, say when the site's",
    "reviewers contradict each other, and when a review says it was",
    "sponsored, invited or a media tasting.",
    "",
    "List the dishes its reviewers say are worth ordering, and the ones they",
    "say are not worth it, the most mentioned first. Each is the dish's name,",
    'a colon, then why in a few words, such as "Prawn laksa: fresh, sweet',
    'prawns". Leave a list empty when its reviewers name no such dish.',
    "Leave out the MICHELIN Guide; it is checked separately.",
    "If you find none, return an empty platforms list and say why in notes.",
    "",
    DINER_STAKES,
  ].join("\n");
}

export const otherSourcesAgent = webSearchAgent<OtherSourcesFindings>({
  schemaName: "other_review_sources",
  schema: SCHEMA,
  prompt: buildOtherSourcesPrompt,
});
