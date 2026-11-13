"use client";

import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { useEffect, useRef, useState } from "react";
import type { Lane } from "../view/progress/progress";

/**
 * What screen readers should hear: a sentence each time a source or the
 * verdict finishes, or a source fails. Render it in an aria-live region.
 */
export function useCheckAnnouncement(
  lanes: Lane[],
  messages: GrillRestaurantMessages,
): string {
  const [announcement, setAnnouncement] = useState("");
  const seen = useRef<Record<string, string>>({});

  useEffect(() => {
    for (const lane of lanes) {
      const before = seen.current[lane.agent];
      seen.current[lane.agent] = lane.status;
      if (before === lane.status || before === undefined) continue;
      if (lane.agent === "summary") {
        if (lane.status === "done") setAnnouncement(messages.verdictReady);
      } else if (lane.status === "done") {
        setAnnouncement(messages.finished(messages.sources[lane.agent]));
      } else if (lane.status === "failed") {
        setAnnouncement(messages.failed(messages.sources[lane.agent]));
      }
    }
  }, [lanes, messages]);

  return announcement;
}
