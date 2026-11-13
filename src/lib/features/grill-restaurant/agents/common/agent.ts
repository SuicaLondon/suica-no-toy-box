/**
 * What every agent in a check shares. An agent is a plain object: the model
 * it uses unless the check names another, its job, and what a result cost.
 * The check (check/grill-restaurant.ts) runs them and reports their progress.
 */
import type { Models } from "../../providers/models";
import type { AgentCost } from "../../providers/pricing";

export type LatLng = { latitude: number; longitude: number };

/** The place in the user's own words, and where it is when the link says. */
export type PlaceInput = { name: string; latLng?: LatLng };

/** The languages a check can be read in. */
export type Language = "en" | "zh";

/** How a prompt names each language. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  zh: "Traditional Chinese as written in Taiwan",
};

/** Everything an agent gets besides its input. */
export type AgentContext = {
  model: string;
  /** The shared model clients; the agent asks them for its model by name. */
  models: Models;
  /** Reports what the agent is doing now, for the page's progress line. */
  progress: (text: string) => void;
};

export type Agent<Input, Result> = {
  defaultModel: string;
  run: (input: Input, context: AgentContext) => Promise<Result>;
  cost: (result: Result) => AgentCost;
};
