import { cn } from "@/utils/cn";
import { Globe } from "lucide-react";
import { siteMarkFor } from "../../view/site-marks/site-marks";

type SiteMarkProps = {
  url: string | null;
  name: string;
  className?: string;
};

/**
 * A review site's own mark in the text colour, or a globe for a site without
 * one. Decorative: the site's name always stands beside it.
 */
export function SiteMark({ url, name, className }: SiteMarkProps) {
  const mark = siteMarkFor({ url, name });
  const classes = cn("size-4 shrink-0", className);
  if (!mark) {
    return (
      <Globe className={classes} aria-hidden="true" data-site-mark="default" />
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={classes}
      aria-hidden="true"
      focusable="false"
      data-site-mark={mark.id}
    >
      <path d={mark.path} />
    </svg>
  );
}
