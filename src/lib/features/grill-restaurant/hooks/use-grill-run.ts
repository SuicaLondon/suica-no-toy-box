"use client";

import { tryCatchAsync } from "@/utils/try-catch";
import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  GrillRequestError,
  streamGrillRun,
  type GrillSource,
} from "../stream/grill-client";
import type { GrillEvent } from "../check/grill-restaurant";
import {
  initialGrillState,
  reduceGrillEvent,
  type GrillRunState,
} from "../check/grill-state";

export type GrillRunView = GrillRunState & {
  /** True between start() and the end of the stream. */
  streaming: boolean;
  /** Set when the request was refused before the run began. */
  requestError?: { message: string; status: number };
  /** Set when the user stopped the run. */
  cancelled: boolean;
};

type Action =
  | { type: "start" }
  | { type: "reset" }
  | { type: "event"; event: GrillEvent }
  | { type: "ended" }
  | { type: "cancelled" }
  | { type: "refused"; message: string; status: number };

export const CONNECTION_LOST = "connection-lost";

export function initialGrillView(): GrillRunView {
  return { ...initialGrillState(), streaming: false, cancelled: false };
}

export function grillViewReducer(
  state: GrillRunView,
  action: Action,
): GrillRunView {
  switch (action.type) {
    case "start":
      return { ...initialGrillView(), streaming: true };
    case "reset":
      return initialGrillView();
    case "event":
      return { ...state, ...reduceGrillEvent(state, action.event) };
    case "ended":
      // A stream that closes mid-run lost its connection.
      return state.status === "running" || state.status === "idle"
        ? {
            ...state,
            streaming: false,
            status: "failed",
            error: CONNECTION_LOST,
          }
        : { ...state, streaming: false };
    case "cancelled":
      return { ...state, streaming: false, cancelled: true };
    case "refused":
      return {
        ...state,
        streaming: false,
        requestError: { message: action.message, status: action.status },
      };
  }
}

/** Runs one Grill Restaurant check at a time. */
export function useGrillRun() {
  const [state, dispatch] = useReducer(
    grillViewReducer,
    undefined,
    initialGrillView,
  );
  const controller = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (!controller.current) return;
    controller.current.abort();
    controller.current = null;
    dispatch({ type: "cancelled" });
  }, []);

  const start = useCallback(async (source: GrillSource) => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    dispatch({ type: "start" });
    const { error } = await tryCatchAsync(() =>
      streamGrillRun(
        source,
        (event) => {
          if (!current.signal.aborted) dispatch({ type: "event", event });
        },
        current.signal,
      ),
    );
    if (controller.current === current) controller.current = null;
    if (current.signal.aborted) return;
    if (!error) {
      dispatch({ type: "ended" });
      return;
    }
    const refused = error instanceof GrillRequestError ? error : null;
    dispatch({
      type: "refused",
      message: refused?.message ?? CONNECTION_LOST,
      status: refused?.status ?? 0,
    });
  }, []);

  /** Drops the current run and its results. */
  const reset = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    dispatch({ type: "reset" });
  }, []);

  useEffect(() => () => controller.current?.abort(), []);

  return { state, start, cancel, reset };
}
