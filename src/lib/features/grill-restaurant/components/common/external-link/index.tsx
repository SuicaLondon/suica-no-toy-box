import type { GrillRestaurantMessages } from "@/i18n/grill-restaurant-messages";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type ExternalLinkProps = {
  messages: GrillRestaurantMessages;
  href: string;
  children: ReactNode;
};

/** A link that opens a new tab, says so to screen readers, and ends in an arrow. */
export function ExternalLink({ messages, href, children }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-toy-accent wrap-anywhere text-sm underline decoration-1 underline-offset-4 hover:decoration-2"
    >
      {children}
      <ArrowUpRight
        className="ml-0.5 inline size-3.5 align-middle"
        aria-hidden="true"
      />
      <span className="sr-only"> ({messages.opensNewTab})</span>
    </a>
  );
}
