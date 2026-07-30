"use client";

import { getLanguageTag, type Locale } from "@/i18n/locales";
import { useEffect } from "react";

export function LocaleDocumentLanguage({ locale }: { locale: Locale }) {
  useEffect(() => {
    const documentElement = document.documentElement;
    documentElement.lang = getLanguageTag(locale);
  }, [locale]);

  return null;
}
