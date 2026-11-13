"use client";

import type { Locale } from "./locales";
import { toolMessages } from "./tool-messages";
import { createContext, type ReactNode, useContext } from "react";

const contextValues = {
  en: { locale: "en", messages: toolMessages.en },
  zh: { locale: "zh", messages: toolMessages.zh },
} as const;

type ToolI18nContextValue = (typeof contextValues)[Locale];

const ToolI18nContext = createContext<ToolI18nContextValue | null>(null);

interface ToolI18nProviderProps {
  locale: Locale;
  children: ReactNode;
}

export function ToolI18nProvider({ locale, children }: ToolI18nProviderProps) {
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
