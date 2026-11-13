/**
 * What a page in another language than English shows of a finished source:
 * its result waits for its translation and is replaced by it once it lands,
 * with the original one tap away. If the translation fails, or the check
 * stops first, the original shows with a note.
 */
import type { Language } from "../../agents/common/agent";
import type { AgentState } from "../../check/grill-state";

/** Where a finished source's text stands for the reader. */
export type TextStatus =
  | "original"
  | "translating"
  | "translated"
  | "untranslated";

export function textStatus(
  language: Language,
  state: AgentState,
  live: boolean,
): TextStatus {
  if (language === "en") return "original";
  if (state.translation) return "translated";
  if (state.translationError) return "untranslated";
  return live ? "translating" : "untranslated";
}

/** The source with its result in the reader's language, unless the original is asked for. */
export function shownState(state: AgentState, original = false): AgentState {
  if (original || !state.translation) return state;
  return { ...state, result: state.translation.result };
}
