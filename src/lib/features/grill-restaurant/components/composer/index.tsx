"use client";

import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { tryCatch, tryCatchAsync } from "@/utils/try-catch";
import { ClipboardPaste, Flame } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { Field } from "suica-ui/field";
import { Spinner } from "suica-ui/spinner";
import {
  classifyMapsLink,
  extractLink,
  MapsLinkError,
} from "../../check/maps-link";
import { MapsText } from "../common/maps-text";
import { PaddedCard } from "../common/padded-card";
import { ToolButton } from "../common/tool-button";
import { ComposerInput } from "./composer-input";

type Messages = GrillRestaurantMessages;

type ComposerProps = {
  messages: Messages;
  /** True from pressing the button until the check begins. */
  busy: boolean;
  /** A problem the server reported with the last link, already worded. */
  error: string | null;
  /** The server asked for an access code. */
  needsCode: boolean;
  onSubmit: (url: string, accessCode?: string) => void;
};

/** Why a pasted link cannot start a check, or null when it can. */
function linkProblem(value: string, messages: Messages): string | null {
  if (!value.trim()) return messages.linkErrors.required;
  const { error } = tryCatch(() => classifyMapsLink(value));
  if (!error) return null;
  const known =
    error instanceof MapsLinkError &&
    (error.code === "invalid" || error.code === "unsupported");
  return known ? messages.linkErrors[error.code] : messages.linkErrors.invalid;
}

/** The link box: paste a Google Maps link and start a check. */
export function Composer({
  messages,
  busy,
  error,
  needsCode,
  onSubmit,
}: ComposerProps) {
  const [link, setLink] = useState("");
  const [code, setCode] = useState("");
  const [problem, setProblem] = useState<string | null>(null);
  const [canPaste, setCanPaste] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCanPaste(typeof navigator.clipboard?.readText === "function");
  }, []);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = linkProblem(link, messages);
    setProblem(found);
    if (found) {
      input.current?.focus();
      return;
    }
    onSubmit(extractLink(link), code.trim() || undefined);
  }

  async function paste() {
    const clipboard = await tryCatchAsync(() => navigator.clipboard.readText());
    if (clipboard.error) {
      setProblem(messages.pasteFailed);
    } else {
      // The share sheet may copy the place name along with the link.
      setLink(extractLink(clipboard.data));
      setProblem(null);
    }
    input.current?.focus();
  }

  const shown = problem ?? error;

  return (
    <PaddedCard>
      <form onSubmit={submit} noValidate className="grid gap-3.5">
        <Field
          label={<MapsText>{messages.linkLabel}</MapsText>}
          description={
            <>
              <MapsText>{messages.linkHelp}</MapsText>
              {messages.resultsLanguage}
            </>
          }
          error={shown ? <MapsText>{shown}</MapsText> : undefined}
        >
          <ComposerInput
            ref={input}
            id="grill-maps-link"
            type="url"
            inputMode="url"
            enterKeyHint="go"
            autoCorrect="off"
            placeholder={messages.linkPlaceholder}
            value={link}
            disabled={busy}
            onChange={(event) => {
              setLink(event.target.value);
              setProblem(null);
            }}
          />
        </Field>

        {needsCode ? (
          <Field
            label={messages.accessCodeLabel}
            description={messages.accessCodeHelp}
          >
            <ComposerInput
              id="grill-access-code"
              type="text"
              value={code}
              disabled={busy}
              onChange={(event) => setCode(event.target.value)}
            />
          </Field>
        ) : null}

        <div className="flex flex-wrap gap-2.5">
          {canPaste ? (
            <ToolButton
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={() => void paste()}
            >
              <ClipboardPaste aria-hidden="true" />
              {messages.paste}
            </ToolButton>
          ) : null}
          <ToolButton type="submit" className="min-h-11 grow" disabled={busy}>
            {busy ? (
              <Spinner
                label={messages.opening}
                className="size-4.5 shrink-0 motion-reduce:animate-none"
                aria-hidden="true"
              />
            ) : (
              <Flame aria-hidden="true" />
            )}
            {busy ? messages.opening : messages.submit}
          </ToolButton>
        </div>
      </form>
    </PaddedCard>
  );
}
