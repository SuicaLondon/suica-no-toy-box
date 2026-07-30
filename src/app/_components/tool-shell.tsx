import {
  getAlternateLocale,
  getLanguageTag,
  type Locale,
} from "@/i18n/locales";
import { ToolI18nProvider } from "@/i18n/tool-i18n";
import { toolCopy, type ToolKey } from "@/i18n/tool-copy";
import {
  BriefcaseBusiness,
  CalendarDays,
  Languages,
  Utensils,
} from "lucide-react";
import type { ReactNode } from "react";
import homeStyles from "../home.module.css";
import styles from "../tool-shell.module.css";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const toolIcons = {
  translate: Languages,
  sponsorship: BriefcaseBusiness,
  dinner: Utensils,
  duration: CalendarDays,
} as const;

export function ToolShell({
  locale,
  tool,
  languageHref,
  children,
}: {
  locale: Locale;
  tool: ToolKey;
  languageHref?: string;
  children: ReactNode;
}) {
  const content = toolCopy[locale][tool];
  const Icon = toolIcons[tool];
  const nextLocale = getAlternateLocale(locale);

  return (
    <main
      className={`${homeStyles.page} ${styles.toolPage}`}
      lang={getLanguageTag(locale)}
    >
      <div className={homeStyles.shell}>
        <SiteHeader
          locale={locale}
          languageHref={languageHref ?? `/${nextLocale}/${tool}`}
        />

        <section
          className={styles.toolLayout}
          aria-labelledby="tool-page-title"
        >
          <header className={styles.toolHeader}>
            <Icon
              className={styles.toolHeaderIcon}
              strokeWidth={1.35}
              aria-hidden="true"
            />
            <div className={styles.toolHeaderCopy}>
              <h1 id="tool-page-title">{content.title}</h1>
              <p>{content.description}</p>
            </div>
          </header>

          <ToolI18nProvider locale={locale}>{children}</ToolI18nProvider>
        </section>

        <SiteFooter locale={locale} />
      </div>
    </main>
  );
}
