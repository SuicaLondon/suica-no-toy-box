import { GITHUB_URL } from "@/constants/urls";
import {
  getAlternateLocale,
  getLanguageTag,
  type Locale,
} from "@/i18n/locales";
import { siteCopy } from "@/i18n/tool-copy";
import { Github } from "lucide-react";
import Link from "next/link";
import styles from "../home.module.css";
import { ToyThemeToggle } from "./toy-theme";

export function SiteHeader({
  locale,
  languageHref,
}: {
  locale: Locale;
  languageHref?: string;
}) {
  const content = siteCopy[locale];
  const nextLocale = getAlternateLocale(locale);

  return (
    <header className={styles.header}>
      <Link
        className={styles.brand}
        href={`/${locale}`}
        aria-label={content.homeLabel}
        translate="no"
      >
        <span>SUICA</span>
        <span aria-hidden="true">の</span>
        <span>TOY BOX</span>
      </Link>

      <nav className={styles.navigation} aria-label={content.navigationLabel}>
        <Link
          href={`https://suica.dev/${locale}/blogs`}
          target="_blank"
          rel="noreferrer"
        >
          {content.blog}
        </Link>
        <Link
          className={styles.githubLink}
          href={GITHUB_URL}
          target="_blank"
          rel="noreferrer"
          aria-label={content.githubLabel}
        >
          <Github aria-hidden="true" />
          <span>GITHUB</span>
        </Link>
        <Link
          className={styles.languageLink}
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
