import type { Metadata } from "next";
import type { Locale } from "./locales";
import { toolMessages, type ToolKey } from "./tool-messages";

export function getToolMetadata(locale: Locale, tool: ToolKey): Metadata {
  const content = toolMessages[locale][tool];
  const path = `/${locale}/${tool}`;

  return {
    title: `${content.title} | SuicaのToy Box`,
    description: content.metaDescription,
    alternates: {
      canonical: path,
      languages: {
        en: `/en/${tool}`,
        "zh-Hant": `/zh/${tool}`,
        "x-default": `/en/${tool}`,
      },
    },
  };
}
