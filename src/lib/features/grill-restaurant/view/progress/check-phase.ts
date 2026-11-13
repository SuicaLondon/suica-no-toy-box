import type { GrillRunView } from "../../hooks/use-grill-run";

/** Where a started check stands. */
export type CheckPhase = "live" | "done" | "lost" | "stopped";

export function checkPhase(
  state: Pick<GrillRunView, "status" | "cancelled">,
): CheckPhase {
  if (state.status === "done") return "done";
  if (state.cancelled) return "stopped";
  if (state.status === "failed") return "lost";
  return "live";
}

/**
 * The moment the page froze: when the check was stopped, or when its
 * connection dropped. Null while it is live, and once it is done.
 */
export function frozenTime(
  phase: CheckPhase,
  stoppedAt: number | null,
  eventTime: number,
): number | null {
  if (phase === "stopped") return stoppedAt ?? eventTime;
  if (phase === "lost") return eventTime;
  return null;
}
