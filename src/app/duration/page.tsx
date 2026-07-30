import { getRequestLocale } from "@/i18n/server";
import { redirect } from "next/navigation";

export default async function LegacyDurationPage() {
  redirect(`/${await getRequestLocale()}/duration`);
}
