import { Check, Minus, X } from "lucide-react";
import type { LaneStatus } from "../../view/progress/progress";
import { StatusRing } from "./status-ring";

/** Running is green, done is ink, failed is red, waiting is a dashed ring. */
export function StatusMark({ status }: { status: LaneStatus }) {
  switch (status) {
    case "running":
      return <StatusRing status="running" />;
    case "done":
      return (
        <Check
          className="size-4 shrink-0"
          strokeWidth={2.25}
          aria-hidden="true"
        />
      );
    case "failed":
      return (
        <X
          className="text-toy-error size-4 shrink-0"
          strokeWidth={2.25}
          aria-hidden="true"
        />
      );
    case "stopped":
      return (
        <Minus
          className="text-toy-muted size-4 shrink-0"
          strokeWidth={2.25}
          aria-hidden="true"
        />
      );
    default:
      return <StatusRing status="waiting" />;
  }
}
