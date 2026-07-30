"use client";

import type { Locale } from "./locales";
import { toolCopy } from "./tool-copy";
import { createContext, type ReactNode, useContext } from "react";

const contextValues = {
  en: { locale: "en", copy: toolCopy.en },
  zh: { locale: "zh", copy: toolCopy.zh },
} as const;

type ToolI18nContextValue = (typeof contextValues)[Locale];

const ToolI18nContext = createContext<ToolI18nContextValue | null>(null);

export function ToolI18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <ToolI18nContext.Provider value={contextValues[locale]}>
      {children}
    </ToolI18nContext.Provider>
  );
}

export function useToolI18n() {
  const value = useContext(ToolI18nContext);

  if (!value) {
    throw new Error("useToolI18n must be used inside ToolI18nProvider");
  }

  return value;
}
