/** Whether and when the MICHELIN Guide listed the place, year by year. */
import {
  boolean,
  integer,
  list,
  nullable,
  strictObject,
  text,
} from "../../providers/json-schema";
import { DINER_STAKES } from "../common/voice";
import { webSearchAgent } from "./web-search";

export type MichelinYear = {
  year: number;
  distinction: string;
  sourceUrl: string | null;
};

export type MichelinFindings = {
  listed: boolean;
  guideUrl: string | null;
  currentDistinction: string | null;
  /** The inspector's view, in the model's own words. */
  inspectorSummary: string | null;
  history: MichelinYear[];
  notes: string | null;
};

const SCHEMA = strictObject({
  listed: boolean,
  guideUrl: nullable("string"),
  currentDistinction: nullable("string"),
  inspectorSummary: nullable("string"),
  history: list(
    strictObject({
      year: integer,
      distinction: text,
      sourceUrl: nullable("string"),
    }),
  ),
  notes: nullable("string"),
});

export function buildMichelinPrompt(place: string): string {
  return [
    `Is this restaurant in the MICHELIN Guide? ${place}`,
    "",
    "Check guide.michelin.com and Michelin's yearly announcements and full",
    "lists. For every year it was listed, give the distinction (for example",
    "3 Stars, 1 Star, Bib Gourmand or Selected) and a source URL. Include years",
    "it lost or changed a distinction. Give its Guide page URL, its current",
    "distinction, and a short summary of the inspector's write-up in your own",
    "words, including any reservation the inspectors voice. Keep each",
    "specific claim it makes about the food, such as how rich or layered the",
    "broth is, the concept or a signature dish, so it can be checked against",
    "what diners say. Name every dish the inspectors single out. Say plainly",
    "if it",
    "lost a star or a Bib Gourmand. Make sure it is this exact restaurant, not",
    "a namesake. If it is not listed, say so with listed false.",
    "",
    DINER_STAKES,
  ].join("\n");
}

export const michelinAgent = webSearchAgent<MichelinFindings>({
  schemaName: "michelin_guide",
  schema: SCHEMA,
  prompt: buildMichelinPrompt,
});
