import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import type { AgentResults } from "../../check/grill-restaurant";
import { ExternalLink } from "../common/external-link";
import { SectionTitle } from "../common/section-title";

type MichelinDetailProps = {
  messages: GrillRestaurantMessages;
  result: AgentResults["michelin"];
};

/** What the inspectors say, the place's distinctions year by year, and its page. */
export function MichelinDetail({ messages, result }: MichelinDetailProps) {
  const { findings } = result;
  if (!findings.listed) {
    return <p className="text-body m-0">{messages.notListed}</p>;
  }
  const history = [...findings.history].sort((a, b) => a.year - b.year);
  return (
    <>
      {findings.inspectorSummary ? (
        <>
          <SectionTitle className="mt-0">
            {messages.michelinInspector}
          </SectionTitle>
          <p className="text-body max-w-measure m-0">
            {findings.inspectorSummary}
          </p>
        </>
      ) : null}
      {history.length > 0 ? (
        <>
          <SectionTitle>{messages.michelinHistory}</SectionTitle>
          <ol className="m-0 list-none p-0">
            {history.map((entry) => (
              <li
                key={entry.year}
                className="border-toy-line text-body flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t py-2 leading-normal first:border-t-0 first:pt-0"
              >
                <span>
                  <span className="text-body-sm mr-3 font-mono tabular-nums">
                    {entry.year}
                  </span>
                  {entry.distinction}
                </span>
                {entry.sourceUrl ? (
                  <ExternalLink messages={messages} href={entry.sourceUrl}>
                    {messages.source}
                  </ExternalLink>
                ) : null}
              </li>
            ))}
          </ol>
        </>
      ) : null}
      {findings.guideUrl ? (
        <p className="m-0 mt-4">
          <ExternalLink messages={messages} href={findings.guideUrl}>
            {messages.michelinGuide}
          </ExternalLink>
        </p>
      ) : null}
    </>
  );
}
