import { ToyThemeToggle } from "@/components/site/toy-theme-toggle";
import { GITHUB_URL } from "@/constants/urls";
import {
  getAlternateLocale,
  getLanguageTag,
  type Locale,
} from "@/i18n/locales";
import { siteCopy } from "@/i18n/tool-copy";
import { cn } from "@/utils/cn";
import { Github } from "lucide-react";
import Link from "next/link";

interface SiteHeaderProps {
  locale: Locale;
  languageHref?: string;
  compact?: boolean;
}

export function SiteHeader({
  locale,
  languageHref,
  compact = false,
}: SiteHeaderProps) {
  const content = siteCopy[locale];
  const nextLocale = getAlternateLocale(locale);

  return (
    <header
      className={cn(
        "border-toy-line flex min-h-[72px] items-center justify-between gap-6 border-b font-mono text-xs tracking-[0.16em] uppercase max-[767px]:gap-2",
        compact && "min-h-[72px]",
      )}
    >
      <Link
        className="[&>:first-child]:text-toy-accent flex min-h-10 items-center gap-3.5 text-[0.9375rem] font-medium whitespace-nowrap max-[767px]:gap-2.5 max-[767px]:text-[0.8125rem] max-[767px]:tracking-[0.12em] max-[520px]:[&>:not(:first-child)]:hidden"
        href={`/${locale}`}
        aria-label={content.homeLabel}
        translate="no"
      >
        <span>SUICA</span>
        <span aria-hidden="true">の</span>
        <span>TOY BOX</span>
      </Link>

      <nav
        className="[&_a:hover]:text-toy-accent flex items-center gap-[23px] tracking-[0.02em] max-[767px]:gap-2.5 max-[767px]:text-xs max-[767px]:tracking-[0.1em] [&_a]:flex [&_a]:min-h-10 [&_a]:shrink-0 [&_a]:items-center [&_a]:gap-1.5 [&_a]:transition-colors [&_a]:duration-180 [&_a]:motion-reduce:transition-none max-[767px]:[&_a]:min-h-11 [&_svg]:size-[15px] [&_svg]:stroke-[1.5]"
        aria-label={content.navigationLabel}
      >
        <Link
          href={`https://suica.dev/${locale}/blogs`}
          target="_blank"
          rel="noreferrer"
        >
          {content.blog}
        </Link>
        <Link
          className="gap-2!"
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={content.githubLabel}
        >
          <Github aria-hidden="true" />
          <span className="max-[520px]:hidden">GITHUB</span>
        </Link>
        <Link
          className="text-toy-accent"
          href={languageHref ?? `/${nextLocale}`}
          hrefLang={getLanguageTag(nextLocale)}
          aria-label={content.languageSwitchLabel}
        >
          {content.languageSwitch}
        </Link>
        <ToyThemeToggle
          switchToDarkLabel={content.switchToDark}
          switchToLightLabel={content.switchToLight}
        />
      </nav>
    </header>
  );
}
