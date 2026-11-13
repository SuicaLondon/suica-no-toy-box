"use client";

import { useToolI18n } from "@/i18n/tool-i18n";
import { useMemo, useState } from "react";
import { Composer } from "./components/composer";
import { IdleCard } from "./components/idle-card";
import { PlaceCard } from "./components/place-card";
import { SourceChecklist } from "./components/source-checklist";
import { VerdictCard } from "./components/verdict-card";
import { useCheckAnnouncement } from "./hooks/use-check-announcement";
import { useCheckProgress } from "./hooks/use-check-progress";
import { useGrillRun } from "./hooks/use-grill-run";
import { useRunClock } from "./hooks/use-run-clock";
import type { GrillSource } from "./stream/grill-client";
import { checkPhase, frozenTime } from "./view/progress/check-phase";
import { composerProblem } from "./view/composer/composer-problem";
import { buildLanes } from "./view/progress/progress";
import { costLine } from "./view/progress/status-line";

/**
 * Grill Restaurant: paste a Google Maps link, then read the verdict. One
 * column on phones and tablets: the place, the verdict, then what was
 * checked. From 1024px, the place and verdict stay on the left while what
 * was checked scrolls on the right.
 */
export function GrillRestaurantTool() {
  const { locale, messages: allMessages } = useToolI18n();
  const messages = allMessages["grill-restaurant"];
  const { state, start, cancel, reset } = useGrillRun();
  const [source, setSource] = useState<GrillSource | null>(null);
  const [stoppedAt, setStoppedAt] = useState<number | null>(null);

  const phase = checkPhase(state);
  const frozenAt = frozenTime(phase, stoppedAt, state.t);
  const live = state.place !== undefined && phase === "live";
  const clock = useRunClock({ active: live, eventTime: frozenAt ?? state.t });
  const lanes = useMemo(
    () => buildLanes(state.agents, frozenAt),
    [state.agents, frozenAt],
  );
  const summaryLane = lanes.find((lane) => lane.agent === "summary")!;
  const progress = useCheckProgress({
    phase,
    lanes,
    agents: state.agents,
    seconds: clock.seconds,
    eventTime: state.t,
    frozenAt,
    translates: state.language !== "en",
    messages,
  });
  const announcement = useCheckAnnouncement(lanes, messages);

  const run = (next: GrillSource) => {
    setSource(next);
    setStoppedAt(null);
    void start(next);
  };

  const problem = composerProblem(state, source, messages);

  return (
    <div className="mt-5 grid max-w-2xl gap-3.5 max-md:mt-4.5 lg:max-w-none lg:grid-cols-2 lg:items-start">
      <div className="grid gap-3.5 lg:sticky lg:top-6">
        {state.place ? (
          <PlaceCard
            messages={messages}
            place={state.place}
            phase={phase}
            progress={progress.fraction}
            statusLine={progress.line}
            costLine={phase === "done" ? costLine(state.cost, messages) : null}
            onStop={() => {
              setStoppedAt(clock.read());
              cancel();
            }}
            onRunAgain={
              phase === "lost" && source ? () => run(source) : undefined
            }
            onReset={() => {
              reset();
              setSource(null);
            }}
          />
        ) : (
          <Composer
            messages={messages}
            busy={state.streaming}
            error={problem.message}
            needsCode={problem.needsCode}
            onSubmit={(url, accessCode) => run({ url, accessCode, locale })}
          />
        )}
        {state.place ? (
          <VerdictCard
            messages={messages}
            state={state.agents.summary}
            status={summaryLane.status}
          />
        ) : null}
      </div>

      {state.place ? (
        <SourceChecklist
          messages={messages}
          lanes={lanes}
          agents={state.agents}
          language={state.language}
          live={live}
        />
      ) : (
        <IdleCard messages={messages} />
      )}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}
