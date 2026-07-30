import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const acceptLanguage = (await headers()).get("accept-language") ?? "";
  const preferredLocale = acceptLanguage
    .split(",")
    .map((language) => language.split(";")[0].trim().toLowerCase())
    .find(
      (language) =>
        language === "en" ||
        language.startsWith("en-") ||
        language === "zh" ||
        language.startsWith("zh-"),
    );

  redirect(preferredLocale?.startsWith("zh") ? "/zh" : "/en");
}
