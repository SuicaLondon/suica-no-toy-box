import { getRequestLocale } from "@/i18n/server";
import { redirect } from "next/navigation";

export default async function LegacyTranslatePage() {
  redirect(`/${await getRequestLocale()}/translate`);
}
