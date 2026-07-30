import { headers } from "next/headers";
import { getPreferredLocale } from "./locales";

export async function getRequestLocale() {
  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  return getPreferredLocale(acceptLanguage);
}
