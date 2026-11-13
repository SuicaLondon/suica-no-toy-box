import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { cn } from "@/utils/cn";
import type { GrillPlace } from "../../check/grill-restaurant";
import type { CheckPhase } from "../../view/progress/check-phase";
import { ExternalLink } from "../common/external-link";
import { MapsText } from "../common/maps-text";
import { Note } from "../common/note";
import { PaddedCard } from "../common/padded-card";
import { ToolButton } from "../common/tool-button";
import { RunProgress } from "./run-progress";

type PlaceCardProps = {
  messages: GrillRestaurantMessages;
  place: GrillPlace;
  phase: CheckPhase;
  /** 0 to 1. */
  progress: number;
  /** What the check is doing, or how it ended. */
  statusLine: string;
  /** What the check cost, once it is done. */
  costLine: string | null;
  onStop: () => void;
  /** Offered when the connection dropped. */
  onRunAgain?: () => void;
  onReset: () => void;
};

/** The place being checked, the check's progress and what to do next. */
export function PlaceCard({
  messages,
  place,
  phase,
  progress,
  statusLine,
  costLine,
  onStop,
  onRunAgain,
  onReset,
}: PlaceCardProps) {
  const live = phase === "live";
  return (
    <PaddedCard>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-title-md wrap-anywhere m-0 text-balance">
            {place.name}
          </h2>
          {place.mapsUrl ? (
            <p className="m-0 mt-1">
              <ExternalLink messages={messages} href={place.mapsUrl}>
                <MapsText>{messages.openInMaps}</MapsText>
              </ExternalLink>
            </p>
          ) : null}
        </div>
        {live ? (
          <ToolButton
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={onStop}
          >
            {messages.stop}
          </ToolButton>
        ) : null}
      </div>

      <RunProgress
        className="mt-4"
        phase={phase}
        fraction={progress}
        label={statusLine}
      />
      <p
        className={cn(
          "text-data text-toy-muted mt-2.5 mb-0 font-mono font-medium tabular-nums",
          live && "text-toy-accent",
        )}
      >
        {statusLine}
      </p>
      {costLine ? <Note className="mt-1">{costLine}</Note> : null}
      {phase === "lost" ? (
        <Note className="mt-1.5">{messages.lostBody}</Note>
      ) : null}
      {live ? null : (
        <div className="mt-4 flex flex-wrap gap-2.5">
          {onRunAgain ? (
            <ToolButton size="sm" onClick={onRunAgain}>
              {messages.runAgain}
            </ToolButton>
          ) : null}
          <ToolButton variant="outline" size="sm" onClick={onReset}>
            {messages.again}
          </ToolButton>
        </div>
      )}
    </PaddedCard>
  );
}
