"use client";

import { useDocumentLanguage } from "@/hooks/use-document-language";
import type { Locale } from "@/i18n/locales";
import type { ReactNode } from "react";

interface LocaleDocumentLanguageProviderProps {
  children: ReactNode;
  locale: Locale;
}

export function LocaleDocumentLanguageProvider({
  children,
  locale,
}: LocaleDocumentLanguageProviderProps) {
  useDocumentLanguage(locale);

  return children;
}
