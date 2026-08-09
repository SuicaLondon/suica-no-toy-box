"use client";

import { getLanguageTag, type Locale } from "@/i18n/locales";
import { useEffect } from "react";

export function useDocumentLanguage(locale: Locale) {
  useEffect(() => {
    document.documentElement.lang = getLanguageTag(locale);
  }, [locale]);
}
