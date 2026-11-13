import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { CONNECTION_LOST, type GrillRunView } from "../../hooks/use-grill-run";
import type { GrillSource } from "../../stream/grill-client";

type Messages = GrillRestaurantMessages;

/** Why the server refused the request, in the page's words. */
function refusal(
  { status, message }: NonNullable<GrillRunView["requestError"]>,
  source: GrillSource | null,
  messages: Messages,
): string | null {
  if (status === 401) {
    // The first refusal just asks for the code; only a wrong code is a problem.
    return source?.accessCode ? messages.accessCodeWrong : null;
  }
  if (status === 503) return messages.notConfigured;
  if (status === 0 || message === CONNECTION_LOST) return messages.offline;
  return message;
}

/** Why the link itself could not start a check. */
function linkFailure(state: GrillRunView, messages: Messages): string {
  if (state.error === CONNECTION_LOST) return messages.offline;
  if (state.errorCode) return messages.linkErrors[state.errorCode];
  return state.error ?? messages.offline;
}

/** What the link box should say about the last attempt, if anything. */
export function composerProblem(
  state: GrillRunView,
  source: GrillSource | null,
  messages: Messages,
): { message: string | null; needsCode: boolean } {
  if (state.requestError) {
    return {
      message: refusal(state.requestError, source, messages),
      needsCode: state.requestError.status === 401,
    };
  }
  if (state.status === "failed" && state.place === undefined) {
    return { message: linkFailure(state, messages), needsCode: false };
  }
  return { message: null, needsCode: false };
}
