"use client";

import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { cn } from "@/utils/cn";
import type { ReactNode } from "react";
import { Alert } from "suica-ui/alert";
import type { AgentResults } from "../../check/grill-restaurant";
import type { AgentState } from "../../check/grill-state";
import type { LaneStatus } from "../../view/progress/progress";
import { PaddedCard } from "../common/padded-card";
import { VerdictCall } from "./verdict-call";
import { VerdictPending } from "./verdict-pending";

type VerdictCardProps = {
  messages: GrillRestaurantMessages;
  state: AgentState;
  status: LaneStatus;
};

/** The verdict leads the page: a call, its reason, and the catch. */
export function VerdictCard({ messages, state, status }: VerdictCardProps) {
  const pending = status === "waiting" || status === "running";

  let body: ReactNode;
  if (status === "done" && state.result) {
    const { verdict } = state.result as AgentResults["summary"];
    body = <VerdictCall messages={messages} verdict={verdict} />;
  } else if (status === "failed") {
    body = (
      <>
        <h2 className="text-headline m-0">{messages.verdictFailedTitle}</h2>
        <Alert variant="danger" className="mt-4">
          {messages.verdictFailedBody}
        </Alert>
      </>
    );
  } else if (status === "stopped") {
    body = (
      <h2 className="text-headline text-toy-muted m-0">
        {messages.verdictStoppedTitle}
      </h2>
    );
  } else {
    body = (
      <VerdictPending messages={messages} writing={status === "running"} />
    );
  }

  return (
    <PaddedCard className={cn(pending && "border-dashed")} aria-busy={pending}>
      {body}
    </PaddedCard>
  );
}
