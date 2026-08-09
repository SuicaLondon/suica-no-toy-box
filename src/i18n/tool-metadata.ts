import type { Metadata } from "next";
import type { Locale } from "./locales";
import { toolCopy, type ToolKey } from "./tool-copy";

export function getToolMetadata(locale: Locale, tool: ToolKey): Metadata {
  const content = toolCopy[locale][tool];
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
