import type { Locale } from "@/i18n/locales";
import { siteCopy } from "@/i18n/tool-copy";
import { cn } from "@/utils/cn";

interface SiteFooterProps {
  locale: Locale;
  compact?: boolean;
}

export function SiteFooter({ locale, compact = false }: SiteFooterProps) {
  const content = siteCopy[locale];

  return (
    <footer
      className={cn(
        "border-toy-line text-toy-muted mt-5 min-h-[68px] border-t px-0 pt-5 pb-6 font-mono text-xs leading-[1.6] tracking-[0.12em] uppercase motion-reduce:transition-none",
        locale === "zh" && "tracking-[0.1em]",
        compact && "mt-[18px]",
      )}
    >
      <p className="m-0 flex flex-wrap items-center gap-3">
        <span className="text-toy-accent">{content.privacyTitle}</span>
        <span aria-hidden="true">—</span>
        <span>{content.privacyStatement}</span>
      </p>
    </footer>
  );
}
