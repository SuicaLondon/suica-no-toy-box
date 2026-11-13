import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { Skeleton } from "suica-ui/skeleton";
import { Note } from "../common/note";

type VerdictPendingProps = {
  messages: GrillRestaurantMessages;
  /** True once the sources are in and the verdict is being written. */
  writing: boolean;
};

/** Where the verdict will land, and what it is waiting for. */
export function VerdictPending({ messages, writing }: VerdictPendingProps) {
  return (
    <>
      <h2 className="text-headline m-0">{messages.verdictTitle}</h2>
      <div className="mt-4 grid gap-2.5" aria-hidden="true">
        <Skeleton className="h-5 w-11/12 rounded-xs" />
        <Skeleton className="h-5 w-2/3 rounded-xs" />
      </div>
      <Note className="mt-4">
        {writing ? messages.verdictWriting : messages.verdictPending}
      </Note>
    </>
  );
}
