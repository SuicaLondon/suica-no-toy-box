import type { Locale } from "@/i18n/locales";
import { siteCopy } from "@/i18n/tool-copy";
import styles from "../home.module.css";

export function SiteFooter({ locale }: { locale: Locale }) {
  const content = siteCopy[locale];

  return (
    <footer className={styles.footer}>
      <p>
        <span className={styles.privacyLead}>{content.privacyTitle}</span>
        <span aria-hidden="true">—</span>
        <span>{content.privacyStatement}</span>
      </p>
    </footer>
  );
}
