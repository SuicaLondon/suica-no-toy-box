import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import type { Verdict } from "../../agents/summary/summary";

type DecisionStampProps = {
  messages: GrillRestaurantMessages;
  decision: Verdict["decision"];
};

/** The call, set like a stamp beside the headline: GO, MAYBE or SKIP. */
export function DecisionStamp({ messages, decision }: DecisionStampProps) {
  return (
    <span
      className="bg-toy-text text-toy-bg tracking-button rounded-control inline-flex h-7 shrink-0 items-center px-2.5 font-mono text-xs font-medium uppercase"
      data-decision={decision}
    >
      {messages.decisions[decision]}
    </span>
  );
}
