"use client";

import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { useState } from "react";
import { Alert } from "suica-ui/alert";
import type { AgentResults } from "../../check/grill-restaurant";
import { placeDetail } from "../../view/sources/source-lines";
import { ExternalLink } from "../common/external-link";
import { MapsText } from "../common/maps-text";
import { Note } from "../common/note";
import { SectionTitle } from "../common/section-title";
import { TextButton } from "../common/text-button";
import { GoogleAnswer } from "./google-answer";
import { ReviewItem } from "./review-item";

/** Reviews shown before "Show all". */
const FIRST_REVIEWS = 3;

type GoogleDetailProps = {
  messages: GrillRestaurantMessages;
  result: AgentResults["google"];
  /** The language the answer and reviews are shown in. */
  lang: string;
  /** True when Gemini translated them for the reader. */
  translated: boolean;
};

/**
 * Google Maps' answer as Gemini returned it, or as Gemini translated it, then
 * the reviews behind it. The rating is already on the source's row, so it is
 * not repeated here.
 */
export function GoogleDetail({
  messages,
  result,
  lang,
  translated,
}: GoogleDetailProps) {
  const [showAll, setShowAll] = useState(false);
  const { gemini, reviews } = result;
  const place = gemini.places[0];
  const address = placeDetail(place?.details, "Address");
  const shown = showAll ? reviews : reviews.slice(0, FIRST_REVIEWS);

  return (
    <>
      <div className="grid gap-1" translate="no">
        {address ? <Note>{address}</Note> : null}
        {place?.uri ? (
          <p className="m-0">
            <ExternalLink messages={messages} href={place.uri}>
              <MapsText>{messages.openInMaps}</MapsText>
            </ExternalLink>
          </p>
        ) : null}
      </div>
      {gemini.warnings.map((warning) => (
        <Alert key={warning} variant="warning" className="mt-4">
          {warning}
        </Alert>
      ))}
      <div className="mt-5 grid gap-5">
        {gemini.rounds.map((round) => (
          <GoogleAnswer
            key={round.round}
            answerText={round.answerText}
            lang={lang}
          />
        ))}
      </div>
      <Note className="mt-3">
        <MapsText>
          {translated ? messages.googleTranslated : messages.googleAnswer}
        </MapsText>
      </Note>

      <SectionTitle>{messages.googleReviews}</SectionTitle>
      {reviews.length === 0 ? (
        <Note>
          <MapsText>{messages.googleNoReviews}</MapsText>
        </Note>
      ) : (
        <ul className="m-0 grid list-none gap-4 p-0" lang={lang}>
          {shown.map((review) => (
            <ReviewItem key={review.uri} messages={messages} review={review} />
          ))}
        </ul>
      )}
      {reviews.length > FIRST_REVIEWS && !showAll ? (
        <TextButton className="mt-4" onClick={() => setShowAll(true)}>
          {messages.showAllReviews(reviews.length)}
        </TextButton>
      ) : null}
      <Note className="mt-5">
        <MapsText>{messages.googlePrivacy}</MapsText>
      </Note>
    </>
  );
}
