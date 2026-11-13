"use client";

import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { getLanguageTag } from "@/i18n/locales";
import { useState, type ReactNode } from "react";
import { Alert } from "suica-ui/alert";
import type { Language } from "../../agents/common/agent";
import type { AgentResults } from "../../check/grill-restaurant";
import type { AgentState } from "../../check/grill-state";
import type { LaneStatus } from "../../view/progress/progress";
import type { SourceId } from "../../view/sources/source-lines";
import { shownState, type TextStatus } from "../../view/sources/translation";
import { Note } from "../common/note";
import { TextButton } from "../common/text-button";
import { GoogleDetail } from "./google-detail";
import { MichelinDetail } from "./michelin-detail";
import { ReviewSitesDetail } from "./review-sites-detail";

type SourceDetailProps = {
  messages: GrillRestaurantMessages;
  source: SourceId;
  state: AgentState;
  status: LaneStatus;
  /** Where this source's translation stands. */
  text: TextStatus;
  language: Language;
};

/**
 * One source's full result, shown when its row is opened. On a page in
 * another language it waits for its translation, then shows it with the
 * original one tap away.
 */
export function SourceDetail({
  messages,
  source,
  state,
  status,
  text,
  language,
}: SourceDetailProps) {
  const [original, setOriginal] = useState(false);
  if (status === "failed") {
    return (
      <Alert variant="danger">
        <span className="wrap-anywhere">{messages.detailFailed}</span>
      </Alert>
    );
  }
  if (status !== "done" || !state.result) {
    return <Note>{messages.detailStopped}</Note>;
  }
  if (text === "translating") {
    return <Note>{messages.translating}</Note>;
  }

  const translated = text === "translated" && !original;
  const { result } = shownState(state, original);
  const lang = translated ? getLanguageTag(language) : "en";
  let content: ReactNode;
  if (source === "google") {
    content = (
      <GoogleDetail
        messages={messages}
        result={result as AgentResults["google"]}
        lang={lang}
        translated={translated}
      />
    );
  } else if (source === "otherSources") {
    content = (
      <ReviewSitesDetail
        messages={messages}
        result={result as AgentResults["otherSources"]}
      />
    );
  } else {
    content = (
      <MichelinDetail
        messages={messages}
        result={result as AgentResults["michelin"]}
      />
    );
  }

  return (
    <>
      {text === "untranslated" ? (
        <Note className="mb-3.5">{messages.untranslated}</Note>
      ) : null}
      {text === "translated" ? (
        <TextButton
          className="mb-3.5"
          aria-pressed={original}
          onClick={() => setOriginal(!original)}
        >
          {original ? messages.showTranslation : messages.showOriginal}
        </TextButton>
      ) : null}
      <div lang={lang}>{content}</div>
    </>
  );
}
