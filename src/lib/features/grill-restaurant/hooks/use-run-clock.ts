"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type RunClockOptions = {
  /** True while the check is live: the clock keeps moving between events. */
  active: boolean;
  /** Milliseconds of the latest event, or the moment the check stopped. */
  eventTime: number;
};

/**
 * The check's clock. Events carry the server's time, so the clock re-syncs on
 * each one and runs on locally in between, ticking once a second.
 */
export function useRunClock({ active, eventTime }: RunClockOptions) {
  const input = useRef({ active, eventTime, local: 0 });
  const [seconds, setSeconds] = useState(0);

  /** The clock in milliseconds, right now. */
  const read = useCallback(() => {
    const { active, eventTime, local } = input.current;
    if (!active) return eventTime;
    return eventTime + Math.max(0, performance.now() - local);
  }, []);

  useEffect(() => {
    input.current = { active, eventTime, local: performance.now() };
    const tick = () => setSeconds(Math.floor(read() / 1000));
    tick();
    if (!active) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [active, eventTime, read]);

  return { seconds, read };
}
