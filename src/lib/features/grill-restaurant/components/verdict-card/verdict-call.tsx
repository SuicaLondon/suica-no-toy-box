import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { TriangleAlert } from "lucide-react";
import { Alert } from "suica-ui/alert";
import type { Verdict } from "../../agents/summary/summary";
import { MapsText } from "../common/maps-text";
import { Note } from "../common/note";
import { ProsCons } from "../common/pros-cons";
import { DecisionStamp } from "./decision-stamp";
import { VerdictList } from "./verdict-list";

type VerdictCallProps = {
  messages: GrillRestaurantMessages;
  verdict: Verdict;
};

/**
 * The finished verdict: the call, a warning in the rare case the sources
 * split, the good and the bad, the take on the hype, the dishes worth and not
 * worth ordering, who should go and who should skip, and the catch.
 */
export function VerdictCall({ messages, verdict }: VerdictCallProps) {
  return (
    <>
      <div className="flex items-start gap-3">
        <DecisionStamp messages={messages} decision={verdict.decision} />
        <h2 className="text-headline m-0 text-balance">{verdict.headline}</h2>
      </div>
      {verdict.divided ? (
        <Alert
          variant="warning"
          role="note"
          icon={<TriangleAlert aria-hidden="true" />}
          title={messages.dividedTitle}
          className="mt-5 items-start"
        >
          {verdict.divided}
        </Alert>
      ) : null}
      <ProsCons
        className="mt-6"
        level={3}
        good={{ title: messages.theGood, items: verdict.good }}
        bad={{ title: messages.theBad, items: verdict.bad }}
      />
      {verdict.hype ? (
        <p className="text-body max-w-measure mt-5 mb-0 text-pretty">
          {verdict.hype}
        </p>
      ) : null}
      <ProsCons
        className="border-toy-line mt-5 border-t pt-4"
        level={3}
        good={{ title: messages.worthOrdering, items: verdict.dishesToOrder }}
        bad={{ title: messages.notWorthOrdering, items: verdict.dishesToSkip }}
      />
      <div className="border-toy-line mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2">
        <VerdictList title={messages.goIf} items={verdict.goIf} />
        <VerdictList title={messages.skipIf} items={verdict.skipIf} />
      </div>
      {verdict.headsUp.length > 0 ? (
        <div className="border-toy-line mt-5 border-t pt-4">
          <VerdictList title={messages.headsUp} items={verdict.headsUp} />
        </div>
      ) : null}
      <Note className="mt-4 text-pretty">
        {messages.confidence[verdict.confidence]}{" "}
        <MapsText>{messages.verdictScope}</MapsText>
      </Note>
    </>
  );
}
