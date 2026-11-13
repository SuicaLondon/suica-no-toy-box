import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";
import type { AgentState } from "../../check/grill-state";
import type { Lane } from "../../view/progress/progress";
import { sourceLine, type SourceId } from "../../view/sources/source-lines";
import type { Language } from "../../agents/common/agent";
import { shownState, textStatus } from "../../view/sources/translation";
import { DataText } from "../common/data-text";
import { MapsText } from "../common/maps-text";
import { SourceDetail } from "../source-detail";
import { StatusMark } from "./status-mark";

type SourceRowProps = {
  messages: GrillRestaurantMessages;
  source: SourceId;
  lane: Lane;
  state: AgentState;
  language: Language;
  /** True while the check is still running. */
  live: boolean;
  open: boolean;
  onToggle: () => void;
};

/**
 * One source: a status mark, its name and one line. Once it has finished, the
 * row is a button that opens the source's full result below it. MICHELIN's
 * line names a distinction, so it waits for the translation like the detail;
 * the others' lines are names and figures, shown at once.
 */
export function SourceRow({
  messages,
  source,
  lane,
  state,
  language,
  live,
  open,
  onToggle,
}: SourceRowProps) {
  const openable = lane.status === "done" || lane.status === "failed";
  const isOpen = open && openable;
  const text =
    lane.status === "done" ? textStatus(language, state, live) : "original";
  const lineWaits = source === "michelin" && text === "translating";
  const head = (
    <>
      <StatusMark status={lane.status} />
      <span className="min-w-0 flex-1">
        <span className="text-title-sm block">
          <MapsText>{messages.sources[source]}</MapsText>
        </span>
        <DataText
          className={cn(
            "wrap-anywhere mt-0.5 block",
            lane.status === "done" && !lineWaits && "text-toy-text",
          )}
        >
          {lineWaits
            ? messages.translating
            : sourceLine(source, lane, shownState(state), messages)}
        </DataText>
      </span>
    </>
  );

  return (
    <li className="border-toy-line border-t first:border-t-0">
      {openable ? (
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`grill-source-${source}`}
          className="hover:text-toy-accent flex w-full cursor-pointer items-center gap-3 bg-transparent py-3.5 text-left text-inherit transition-colors duration-150 motion-reduce:transition-none"
          onClick={onToggle}
        >
          {head}
          <ChevronDown
            className={cn(
              "text-toy-muted size-4 shrink-0 transition-transform duration-150 motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
            aria-hidden="true"
          />
          <span className="sr-only">
            {isOpen ? messages.hideDetails : messages.showDetails}
          </span>
        </button>
      ) : (
        <div className="flex items-center gap-3 py-3.5">{head}</div>
      )}
      {isOpen ? (
        <div id={`grill-source-${source}`} className="pb-5 pl-7">
          <SourceDetail
            messages={messages}
            source={source}
            state={state}
            status={lane.status}
            text={text}
            language={language}
          />
        </div>
      ) : null}
    </li>
  );
}
