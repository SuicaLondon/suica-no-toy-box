/**
 * The verdict: whether to go, from what other review sites and the MICHELIN
 * Guide say about the place, written by any model the check names.
 *
 * Google Maps Content must not reach a non-Google model, and grounded Gemini
 * output must be shown unmodified and not mixed with other content. So the
 * verdict never sees the Google Maps result; the reader sees that beside it.
 */
import { generateJson } from "../../providers/generate-json";
import {
  list,
  nullable,
  oneOf,
  strictObject,
  text,
} from "../../providers/json-schema";
import { agentCost, type TokenUsage } from "../../providers/pricing";
import { LANGUAGE_NAMES, type Agent, type Language } from "../common/agent";
import type { MichelinFindings } from "../sources/michelin";
import type { OtherSourcesFindings } from "../sources/other-sources";
import { DINER_STAKES } from "../common/voice";

export type SummaryInput = {
  /** The user's own words for the place. */
  place: string;
  otherSources: OtherSourcesFindings | null;
  michelin: MichelinFindings | null;
  /** The language to write the verdict in. Defaults to English. */
  language?: Language;
};

/** Should a friend go? A decision, its reason, the good, the bad and the catch. */
export type Verdict = {
  decision: "go" | "maybe" | "skip";
  /** What a friend would text back: the call, the reason and the catch. */
  headline: string;
  /** What the evidence praises, each point with how many sources make it. */
  good: string[];
  /** What the evidence complains about, each with how many sources make it. */
  bad: string[];
  /**
   * A real split: several sources on each side saying the opposite about
   * the food itself, and what it suggests (food that varies between visits,
   * or a divisive style). Null for most places.
   */
  divided: string | null;
  /** Dishes the evidence says are worth ordering: "Dish: why, how many say so". */
  dishesToOrder: string[];
  /** Dishes the evidence says are not worth ordering, written the same way. */
  dishesToSkip: string[];
  /** Who will like it. */
  goIf: string[];
  /** Who will not. */
  skipIf: string[];
  /** Practical warnings with numbers: queues, prices, sell-outs, hours. */
  headsUp: string[];
  /** Whether the reputation comes from the food or from hype, and where sources clash. */
  hype: string;
  /** How much the evidence can carry. */
  confidence: "low" | "medium" | "high";
};

export type Summary = { model: string; verdict: Verdict; usage: TokenUsage };

export const VERDICT_SCHEMA = strictObject({
  decision: oneOf("go", "maybe", "skip"),
  headline: text,
  good: list(text, 4),
  bad: list(text, 4),
  divided: nullable("string"),
  dishesToOrder: list(text, 4),
  dishesToSkip: list(text, 3),
  goIf: list(text, 2),
  skipIf: list(text, 2),
  headsUp: list(text, 2),
  hype: text,
  confidence: oneOf("low", "medium", "high"),
});

/** Chinese is measured in characters, English in words. */
const LENGTHS: Record<
  Language,
  { headline: string; point: string; dish: string; item: string }
> = {
  en: {
    headline: "at most 35 words in all",
    point: "at most 30 words each",
    dish: "at most 14 words each",
    item: "at most 10 words each",
  },
  zh: {
    headline: "at most 70 characters in all",
    point: "at most 55 characters each",
    dish: "at most 26 characters each",
    item: "at most 14 characters each",
  },
};

/**
 * Critical, not subjective: the verdict is reasoned from what the sources
 * say, counted theme by theme and checked against each other, never from
 * the model's own taste. The style rules follow the unslop skill: plain
 * words, no AI tells.
 */
export function buildVerdictPrompt(input: SummaryInput): string {
  const language = input.language ?? "en";
  const length = LENGTHS[language];
  return [
    `A friend is deciding whether to go to this restaurant: ${input.place}`,
    "Grill it: test what it is praised for against what diners report, and",
    "tell them whether to go. Use only the evidence below, found by web",
    "searches of review sites and the MICHELIN Guide. They read the Google",
    "Maps reviews separately; you have not seen those,",
    "so never mention or guess at them.",
    "",
    "## Review sites",
    input.otherSources
      ? JSON.stringify(input.otherSources, null, 2)
      : "Unavailable.",
    "",
    "## MICHELIN Guide",
    input.michelin ? JSON.stringify(input.michelin, null, 2) : "Unavailable.",
    "",
    "## How to think",
    "Work through the evidence like an editor checking a story, before you",
    "write a word.",
    "1. Find what the place is known for or sells itself on: a concept such",
    "   as a lighter or healthier recipe, a signature dish, an award. Check",
    "   whether diners think it delivers, and at what price.",
    "2. Group what the sources say into themes: taste and depth, price and",
    "   value, portion, wait and service, consistency. Count the sources that",
    "   raise each theme, for and against. A theme several sources raise must",
    "   appear in the verdict, and the theme most sources raise leads it.",
    "3. Test each claim from the MICHELIN Guide or a critic against the",
    "   diners. When the Guide praises something several reviewers say is",
    "   missing, such as a rich, layered broth that diners call mild or flat,",
    "   name both sides and say which side has more sources.",
    "4. Check for a real split, which is rare: at least two sources say the",
    "   opposite of at least two others about the food itself, and neither",
    "   side is a clear majority. One or two dissenters against a majority",
    "   are an outlier, not a split. Differences over price, waits or service,",
    "   or a style some like and others do not, are not a split either: they",
    "   belong in bad, goIf and skipIf.",
    "5. Weigh the evidence. A single blog post, a platform with under about",
    "   20 reviews, or a sponsored or invited tasting counts for less than",
    "   many independent diners. Price is part of the food: when several",
    "   sources say it costs more than it is worth, that is a complaint about",
    "   value, not a grumble.",
    "6. Note the dishes the sources name: which they say are worth ordering,",
    "   which they say are not, and how many sources say so.",
    "",
    "## What to return",
    '- decision: "go", "maybe" or "skip", from what you counted. "go" when',
    "  most sources are happy with the food and say it is worth the price,",
    '  and the complaints are about waits or service. "skip" when most',
    '  sources say the food disappoints or is not worth the price. "maybe"',
    "  when praise and complaints about the food or its value are both",
    "  common, when the sources are divided, or when it suits one kind of",
    "  diner and not another, such as a lighter style that fans of the rich",
    "  original find flat.",
    '- headline: what you would tell a friend who asked "is it worth it?".',
    `  Two or three short sentences, ${length.headline}, ending in full`,
    "  stops. Lead with the call and the main reason, the theme most sources",
    "  raise, then the catch. When the main selling point does not hold up,",
    "  or MICHELIN and the diners disagree, and that is the biggest story,",
    "  lead with the clash. Name concrete things from the evidence: a dish, a",
    '  price, a wait, how many sources said it. No hedging: no "may",',
    '  "might", "possible" or "can be".',
    "- good: what the evidence praises. At most 4 points, the most common",
    `  first, of ${length.point}. Each says how many sources make it and`,
    '  which ones, such as "four of nine reviews" or "MICHELIN and two',
    '  blogs", gives the fact, then what it means for someone deciding.',
    "- bad: what the evidence complains about, written the same way. At most",
    `  4 points, the most common first, of ${length.point}. Cover every`,
    "  complaint several sources share, including the main selling point",
    "  when diners say it falls short. Leave out a complaint only one source",
    "  makes, unless it is about safety, such as food poisoning or dirt.",
    "  When a source contradicts another, put the clash here and",
    "  say which side the evidence favours and why.",
    "  Together, good and bad cover most of what the evidence says. Do not",
    "  repeat the headline word for word.",
    "- divided: null for most places. Fill it only for a real split as step",
    "  4 defines it: one sentence naming the split and the sources on each",
    "  side, then what it suggests, food that varies between visits or a",
    "  style that divides people. When in doubt, leave it null.",
    "- dishesToOrder: the dishes the evidence says are worth ordering, at",
    `  most 4, the most praised first, of ${length.dish}. Each is the dish's`,
    "  name, a colon, then why and how many sources say so, such as",
    '  "Prawn laksa: fresh prawns, praised in four reviews". That colon is',
    "  the one allowed. Empty when the evidence names none.",
    "- dishesToSkip: the dishes the evidence says are not worth ordering, at",
    "  most 3, written the same way. Empty when it names none.",
    "  Never name a dish the evidence does not, and leave out a dish only one",
    "  source mentions unless the place serves little else.",
    `- goIf: who will like it. At most 2 items of ${length.item}.`,
    `- skipIf: who will not. At most 2 items of ${length.item}.`,
    "- headsUp: at most 2 practical warnings such as queues, slow service,",
    "  prices or dishes selling out, with a number whenever the evidence has",
    "  one. Leave it empty only when the evidence mentions none.",
    "- hype: one or two sentences on whether the reputation, such as an",
    "  award, a concept or social media buzz, holds up against what diners",
    "  report. Name the claim and the evidence for and against it.",
    '- confidence: "low" when the evidence is a few blog posts or platforms',
    '  with under about 20 reviews, "high" when several independent sources',
    '  agree, otherwise "medium".',
    `- Write every text field in ${LANGUAGE_NAMES[language]}.`,
    "",
    "## How to write",
    DINER_STAKES,
    "Be critical, not subjective. Every judgement comes from what you",
    "counted and checked above, never from your own taste, and you say how",
    "strong the evidence is. Do not play it safe: when most sources say the",
    "food is bland and overpriced, say exactly that, in the headline if it is",
    "the main story. When most say it is great, say so with the same force.",
    "A place most people enjoy is not a skip because a few were let down.",
    "Every criticism must come from the evidence above; never invent a",
    "fault. Aim at the restaurant,",
    "never at its staff, owners or reviewers.",
    "",
    "Be specific: use the prices, waits, dishes and years in the evidence,",
    "and give no adjective without a fact behind it. Use plain words and",
    "short sentences, one idea each, in the active voice. Separate sentences",
    "with full stops. Never use semicolons, colons inside a sentence, em",
    'dashes or en dashes. Do not write "not just X, but Y", lists of three',
    'for effect, stacked hedges, filler such as "it\'s worth noting" or',
    '"overall", exclamation marks or emoji. Do not use stock food words such',
    "as hidden gem, must-try, culinary, delectable, nestled, vibrant, elevate,",
    "boasts or tantalising. Blunt means a clear call with the evidence behind",
    "it and the catch named plainly. It never means puns, sarcasm or invented",
    "facts.",
  ].join("\n");
}

const DECISIONS: readonly string[] = ["go", "maybe", "skip"];
const CONFIDENCES: readonly string[] = ["low", "medium", "high"];

const textList = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];

/** Sanity-checks the model's JSON. Throws when it is unusable. */
export function parseVerdict(value: unknown): Verdict {
  const raw = (value ?? {}) as Partial<Verdict>;
  if (
    !DECISIONS.includes(raw.decision ?? "") ||
    typeof raw.headline !== "string" ||
    !raw.headline.trim()
  ) {
    throw new Error("The verdict was missing its decision or headline");
  }
  const confidence = CONFIDENCES.includes(raw.confidence ?? "")
    ? (raw.confidence as Verdict["confidence"])
    : "low";
  return {
    decision: raw.decision as Verdict["decision"],
    headline: raw.headline.trim(),
    good: textList(raw.good).slice(0, 4),
    bad: textList(raw.bad).slice(0, 4),
    divided:
      typeof raw.divided === "string" && raw.divided.trim()
        ? raw.divided.trim()
        : null,
    dishesToOrder: textList(raw.dishesToOrder).slice(0, 4),
    dishesToSkip: textList(raw.dishesToSkip).slice(0, 3),
    goIf: textList(raw.goIf).slice(0, 2),
    skipIf: textList(raw.skipIf).slice(0, 2),
    headsUp: textList(raw.headsUp).slice(0, 2),
    hype: typeof raw.hype === "string" ? raw.hype.trim() : "",
    confidence,
  };
}

export const summaryAgent: Agent<SummaryInput, Summary> = {
  defaultModel: "gpt-6-luna",
  async run(input, { model, models, progress }) {
    if (!input.otherSources && !input.michelin) {
      throw new Error("No web findings to summarise");
    }
    progress("Reading the other platforms and MICHELIN findings");
    const reply = await generateJson<unknown>({
      models,
      model,
      prompt: buildVerdictPrompt(input),
      name: "verdict",
      schema: VERDICT_SCHEMA,
    });
    return { model, verdict: parseVerdict(reply.value), usage: reply.usage };
  },
  cost: (result) => agentCost(result.model, [result.usage], 0, 0),
};
