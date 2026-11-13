import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import type { AgentResults } from "../../check/grill-restaurant";
import { hostOf } from "../../view/progress/progress";
import { platformFigures } from "../../view/sources/source-lines";
import { DataText } from "../common/data-text";
import { ExternalLink } from "../common/external-link";
import { Markdown } from "../common/markdown";
import { ProsCons } from "../common/pros-cons";
import { SiteMark } from "./site-mark";

type ReviewSitesDetailProps = {
  messages: GrillRestaurantMessages;
  result: AgentResults["otherSources"];
};

/**
 * Each review site found: its mark and rating, its reviewers' one-line
 * verdict, what they liked and disliked, the dishes they say are and are not
 * worth ordering, and a link to it.
 */
export function ReviewSitesDetail({
  messages,
  result,
}: ReviewSitesDetailProps) {
  const { platforms } = result.findings;
  return (
    <ul className="m-0 list-none p-0">
      {platforms.map((platform) => (
        <li
          key={`${platform.platform}-${platform.url}`}
          className="border-toy-line flex gap-2 border-t py-5 first:border-t-0 first:pt-0 last:pb-0"
        >
          <SiteMark
            url={platform.url}
            name={platform.platform}
            className="text-toy-muted mt-0.5"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <h4 className="text-title-sm m-0">{platform.platform}</h4>
              <DataText>{platformFigures(platform, messages)}</DataText>
            </div>
            <p className="text-body max-w-measure m-0 mt-1.5">
              <Markdown inline>{platform.summary}</Markdown>
            </p>
            <ProsCons
              className="mt-4"
              good={{ title: messages.pros, items: platform.pros }}
              bad={{ title: messages.cons, items: platform.cons }}
            />
            <ProsCons
              className="mt-4"
              good={{
                title: messages.worthOrdering,
                items: platform.dishesToOrder,
              }}
              bad={{
                title: messages.notWorthOrdering,
                items: platform.dishesToSkip,
              }}
            />
            {platform.url ? (
              <p className="m-0 mt-4">
                <ExternalLink messages={messages} href={platform.url}>
                  {hostOf(platform.url)}
                </ExternalLink>
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
