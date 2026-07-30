export const locales = ["en", "zh"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return value === "en" || value === "zh";
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "en" ? "zh" : "en";
}

export function getLanguageTag(locale: Locale) {
  return locale === "zh" ? "zh-Hant" : "en";
}

export function getPreferredLocale(acceptLanguage: string): Locale {
  const preferredLocale = acceptLanguage
    .split(",")
    .map((entry, index) => {
      const [languageRange, ...parameters] = entry
        .trim()
        .toLowerCase()
        .split(";");
      const qualityParameter = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      const parsedQuality = qualityParameter
        ? Number(qualityParameter.trim().slice(2))
        : 1;
      const quality =
        Number.isFinite(parsedQuality) &&
        parsedQuality >= 0 &&
        parsedQuality <= 1
          ? parsedQuality
          : 0;
      const locale =
        languageRange === "zh" || languageRange.startsWith("zh-")
          ? "zh"
          : languageRange === "en" || languageRange.startsWith("en-")
            ? "en"
            : null;

      return locale ? { locale, quality, index } : null;
    })
    .filter(
      (
        preference,
      ): preference is { locale: Locale; quality: number; index: number } =>
        preference !== null && preference.quality > 0,
    )
    .sort(
      (first, second) =>
        second.quality - first.quality || first.index - second.index,
    )[0];

  return preferredLocale?.locale ?? "en";
}
