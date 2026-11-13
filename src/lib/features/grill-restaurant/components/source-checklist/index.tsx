"use client";

import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { useState } from "react";
import { Card } from "suica-ui/card";
import type { GrillRunState } from "../../check/grill-state";
import type { Lane } from "../../view/progress/progress";
import { SOURCES, type SourceId } from "../../view/sources/source-lines";
import type { Language } from "../../agents/common/agent";
import { SourceRow } from "./source-row";

type SourceChecklistProps = {
  messages: GrillRestaurantMessages;
  lanes: Lane[];
  agents: GrillRunState["agents"];
  /** The reader's language; other than English, sources are translated. */
  language: Language;
  /** True while the check is still running. */
  live: boolean;
};

/**
 * What was checked, under the verdict and in the same column: one row per
 * source. One finished row opens at a time.
 */
export function SourceChecklist({
  messages,
  lanes,
  agents,
  language,
  live,
}: SourceChecklistProps) {
  const [open, setOpen] = useState<SourceId | null>(null);
  return (
    <Card className="px-6 pt-5 pb-1.5 max-md:px-4.5">
      <h2 className="font-heading m-0 text-base leading-snug">
        {live ? messages.checksLive : messages.checksTitle}
      </h2>
      <ul className="m-0 mt-1.5 list-none p-0">
        {SOURCES.map((source) => (
          <SourceRow
            key={source}
            messages={messages}
            source={source}
            lane={lanes.find((lane) => lane.agent === source)!}
            state={agents[source]}
            language={language}
            live={live}
            open={open === source}
            onToggle={() => setOpen(open === source ? null : source)}
          />
        ))}
      </ul>
    </Card>
  );
}
