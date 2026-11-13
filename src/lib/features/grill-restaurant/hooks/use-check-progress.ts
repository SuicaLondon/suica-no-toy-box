"use client";

import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { useMemo, useRef } from "react";
import type { GrillRunState } from "../check/grill-state";
import type { CheckPhase } from "../view/progress/check-phase";
import { estimateRun, type Lane } from "../view/progress/progress";
import { statusLine, timeLeftText } from "../view/progress/status-line";

/**
 * The bar's fill and the line under it. The bar never quite fills before the
 * check is done, and it keeps its place when the check stops or is cut off.
 */
export function useCheckProgress({
  phase,
  lanes,
  agents,
  seconds,
  eventTime,
  frozenAt,
  translates,
  messages,
}: {
  phase: CheckPhase;
  lanes: Lane[];
  agents: GrillRunState["agents"];
  /** The check's clock, in whole seconds. */
  seconds: number;
  eventTime: number;
  frozenAt: number | null;
  /** Whether the reader's language needs a translation. */
  translates: boolean;
  messages: GrillRestaurantMessages;
}): { fraction: number; line: string } {
  const live = phase === "live";
  const estimate = useMemo(
    () => (live ? estimateRun(lanes, agents, seconds, translates) : null),
    [live, lanes, agents, seconds, translates],
  );
  const last = useRef(0);
  if (estimate && estimate.end > 0) {
    last.current = Math.min(0.97, seconds / estimate.end);
  }

  const timeLeft = estimate ? timeLeftText(estimate, seconds, messages) : null;
  return {
    fraction: phase === "done" ? 1 : last.current,
    line: statusLine({ phase, eventTime, frozenAt, timeLeft, messages }),
  };
}
