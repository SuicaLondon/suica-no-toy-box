import type { Locale } from "@/i18n/locales";
import { enUS, zhTW } from "date-fns/locale";

export function getDurationDateLocale(locale: Locale) {
  return locale === "zh" ? zhTW : enUS;
}
