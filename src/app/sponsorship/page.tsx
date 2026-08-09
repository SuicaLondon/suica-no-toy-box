import { getRequestLocale } from "@/i18n/server";
import { redirect } from "next/navigation";

interface LegacySponsorshipPageProps {
  searchParams: Promise<{
    companyName?: string | string[];
    selectedCompanyId?: string | string[];
  }>;
}

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LegacySponsorshipPage({
  searchParams,
}: LegacySponsorshipPageProps) {
  const query = await searchParams;
  const nextSearchParams = new URLSearchParams();
  const companyName = getFirstValue(query.companyName)?.trim();
  const selectedCompanyId = getFirstValue(query.selectedCompanyId)?.trim();

  if (companyName) {
    nextSearchParams.set("companyName", companyName);
  }

  if (selectedCompanyId) {
    nextSearchParams.set("selectedCompanyId", selectedCompanyId);
  }

  const queryString = nextSearchParams.toString();
  redirect(
    `/${await getRequestLocale()}/sponsorship${queryString ? `?${queryString}` : ""}`,
  );
}
