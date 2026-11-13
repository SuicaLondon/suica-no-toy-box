import { ToyThemeToggle } from "@/components/site/toy-theme-toggle";
import { GITHUB_URL } from "@/constants/urls";
import {
  getLanguageTag,
  LOCALE_NAMES,
  locales,
  type Locale,
} from "@/i18n/locales";
import { siteMessages } from "@/i18n/tool-messages";
import { cn } from "@/utils/cn";
import { Github, Languages } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";
import { NavLink } from "./nav-link";

interface SiteHeaderProps {
  locale: Locale;
  /** This page in the other language. Defaults to that language's home. */
  languageHref?: string;
  compact?: boolean;
}

/**
 * The site's top bar: the wordmark, then Blog, GitHub, the languages and the
 * theme toggle. Both languages are always shown by their own names: the
 * page's own in green, as selected, the other as an ink link.
 */
export function SiteHeader({
  locale,
  languageHref,
  compact = false,
}: SiteHeaderProps) {
  const content = siteMessages[locale];

  return (
    <header
      className={cn(
        "border-toy-line flex min-h-18 items-center justify-between gap-6 border-b font-mono text-xs uppercase max-md:gap-2",
        compact && "min-h-18",
      )}
    >
      <Link
        className="tracking-wordmark text-body max-md:text-body-sm max-md:tracking-chrome flex min-h-10 items-center gap-3.5 font-medium whitespace-nowrap max-md:gap-2.5"
        href={`/${locale}`}
        aria-label={content.homeLabel}
        translate="no"
      >
        <span className="text-toy-accent">SUICA</span>
        <span className="max-xs:hidden" aria-hidden="true">
          の
        </span>
        <span className="max-xs:hidden">TOY BOX</span>
      </Link>

      <nav
        className="chrome-icons flex items-center gap-5.75 tracking-wide max-md:gap-2.5 max-md:text-xs max-md:tracking-widest"
        aria-label={content.navigationLabel}
      >
        <NavLink
          href={`https://suica.dev/${locale}/blogs`}
          target="_blank"
          rel="noreferrer"
        >
          {content.blog}
        </NavLink>
        <NavLink
          className="gap-2"
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={content.githubLabel}
        >
          <Github aria-hidden="true" />
          <span className="max-xs:hidden">GITHUB</span>
        </NavLink>
        <div
          className="flex items-center gap-1.5"
          role="group"
          aria-label={content.languageLabel}
        >
          <Languages className="text-toy-muted shrink-0" aria-hidden="true" />
          {locales.map((option, index) => (
            <Fragment key={option}>
              {index > 0 ? (
                <span className="text-toy-muted" aria-hidden="true">
                  /
                </span>
              ) : null}
              {option === locale ? (
                <span
                  className="text-toy-accent"
                  lang={getLanguageTag(option)}
                  aria-current="true"
                >
                  {LOCALE_NAMES[option]}
                </span>
              ) : (
                <NavLink
                  href={languageHref ?? `/${option}`}
                  hrefLang={getLanguageTag(option)}
                  lang={getLanguageTag(option)}
                >
                  {LOCALE_NAMES[option]}
                </NavLink>
              )}
            </Fragment>
          ))}
        </div>
        <ToyThemeToggle
          switchToDarkLabel={content.switchToDark}
          switchToLightLabel={content.switchToLight}
        />
      </nav>
    </header>
  );
}
