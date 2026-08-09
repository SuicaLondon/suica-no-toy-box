import { type LanguageCode, languages } from "@/constants/languages";

export type LanguagePreferenceKey = "sourceLang" | "targetLang";

function isLanguageCode(value: string): value is LanguageCode {
  return languages.some((language) => language.code === value);
}

export function getLanguagePreference(
  key: LanguagePreferenceKey,
  fallback: LanguageCode,
) {
  try {
    const savedLanguage = window.localStorage.getItem(key);
    return savedLanguage && isLanguageCode(savedLanguage)
      ? savedLanguage
      : fallback;
  } catch {
    return fallback;
  }
}

export function saveLanguagePreference(
  key: LanguagePreferenceKey,
  language: LanguageCode,
) {
  try {
    window.localStorage.setItem(key, language);
  } catch {
    // Translation remains available when browser storage is disabled.
  }
}
