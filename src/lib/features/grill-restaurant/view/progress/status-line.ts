import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { formatDollars } from "../../providers/pricing";
import type { RunCost } from "../../check/grill-restaurant";
import type { CheckPhase } from "./check-phase";
import { formatClock, secondsLeft, type RunEstimate } from "./progress";

/** "This check cost about $0.11 in API fees.", once the cost is known. */
export function costLine(
  cost: RunCost | undefined,
  messages: GrillRestaurantMessages,
): string | null {
  if (!cost) return null;
  if (cost.total === null) return messages.costLine(messages.costUnknown);
  return messages.costLine(formatDollars(cost.total));
}

/** "about 40 s left", "almost done" or "taking longer than usual". */
export function timeLeftText(
  estimate: Pick<RunEstimate, "end" | "overdue">,
  now: number,
  messages: GrillRestaurantMessages,
): string {
  if (estimate.overdue) return messages.runningLong;
  const left = secondsLeft(estimate.end, now);
  if (left <= 2) return messages.almostDone;
  return messages.secondsLeft(left);
}

/** The one line under the bar: what the check is doing, or how it ended. */
export function statusLine({
  phase,
  eventTime,
  frozenAt,
  timeLeft,
  messages,
}: {
  phase: CheckPhase;
  /** Milliseconds of the latest event. */
  eventTime: number;
  frozenAt: number | null;
  timeLeft: string | null;
  messages: GrillRestaurantMessages;
}): string {
  switch (phase) {
    case "live":
      return [messages.grilling, timeLeft].filter(Boolean).join(" · ");
    case "done":
      return messages.doneIn(Math.round(eventTime / 1000));
    case "lost":
      return messages.lostAt(formatClock(eventTime));
    case "stopped":
      return messages.stoppedAt(formatClock(frozenAt ?? eventTime));
  }
}
