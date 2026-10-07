import {
  getAlternateLocale,
  getLanguageTag,
  type Locale,
} from "@/i18n/locales";
import { ToolI18nProvider } from "@/i18n/tool-i18n";
import { toolCopy, type ToolKey } from "@/i18n/tool-copy";
import { cn } from "@/utils/cn";
import {
  BriefcaseBusiness,
  CalendarDays,
  Languages,
  ImageDown,
  Utensils,
} from "lucide-react";
import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const toolIcons = {
  translate: Languages,
  sponsorship: BriefcaseBusiness,
  dinner: Utensils,
  duration: CalendarDays,
  "image-compress": ImageDown,
} as const;

interface ToolShellProps {
  locale: Locale;
  tool: ToolKey;
  languageHref?: string;
  children: ReactNode;
}

export function ToolShell({
  locale,
  tool,
  languageHref,
  children,
}: ToolShellProps) {
  const content = toolCopy[locale][tool];
  const Icon = toolIcons[tool];
  const nextLocale = getAlternateLocale(locale);

  return (
    <main
      className={cn(
        "toy-page text-toy-text min-h-svh overflow-x-clip font-sans transition-[color,background-color] duration-180 [font-synthesis:none] [text-rendering:optimizeLegibility] motion-reduce:transition-none",
      )}
      lang={getLanguageTag(locale)}
    >
      <div className="mx-auto w-[min(1600px,calc(100%-48px))] max-[1023px]:w-[calc(100%-48px)] max-[767px]:w-[calc(100%-36px)]">
        <SiteHeader
          locale={locale}
          languageHref={languageHref ?? `/${nextLocale}/${tool}`}
          compact
        />

        <section className="min-w-0 pt-6" aria-labelledby="tool-page-title">
          <header className="flex min-w-0 items-center gap-3.5 max-[767px]:gap-3">
            <Icon
              className="text-toy-icon size-[38px] shrink-0 max-[767px]:size-[34px]"
              strokeWidth={1.35}
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h1
                id="tool-page-title"
                className="m-0 text-[1.375rem] leading-[1.15] font-[650] tracking-[-0.025em] max-[767px]:text-xl"
              >
                {content.title}
              </h1>
              <p className="text-toy-muted mt-1 mb-0 text-[0.8125rem] leading-[1.45]">
                {content.description}
              </p>
            </div>
          </header>

          <ToolI18nProvider locale={locale}>{children}</ToolI18nProvider>
        </section>

        <SiteFooter locale={locale} compact />
      </div>
    </main>
  );
}
