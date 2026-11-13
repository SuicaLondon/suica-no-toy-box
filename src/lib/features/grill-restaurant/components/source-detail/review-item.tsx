import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import type { GroundedReview } from "../../agents/sources/google";
import { DataText } from "../common/data-text";
import { ExternalLink } from "../common/external-link";

type ReviewItemProps = {
  messages: GrillRestaurantMessages;
  review: GroundedReview;
};

/**
 * One Google Maps review, as Google returned it, set off by a rule like a
 * quote, with its date and link under it.
 */
export function ReviewItem({ messages, review }: ReviewItemProps) {
  return (
    <li className="border-toy-line-strong border-l-2 pl-3.5">
      <p className="text-body max-w-measure wrap-anywhere m-0 whitespace-pre-line">
        {review.text}
      </p>
      <p className="m-0 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        {review.date ? (
          <DataText dateTime={review.date}>{review.date}</DataText>
        ) : null}
        <ExternalLink messages={messages} href={review.uri}>
          {messages.openReview}
        </ExternalLink>
      </p>
    </li>
  );
}
