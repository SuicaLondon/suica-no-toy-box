import { ToolShell } from "@/app/_components/tool-shell";
import { getAlternateLocale, isLocale } from "@/i18n/locales";
import { getToolMetadata } from "@/i18n/tool-metadata";
import { SponsorshipTool } from "@/lib/features/sponsorship/sponsorship-tool";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type SponsorshipPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    companyName?: string | string[];
    selectedCompanyId?: string | string[];
  }>;
};

function getFirstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export async function generateMetadata({
  params,
}: SponsorshipPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? getToolMetadata(locale, "sponsorship") : {};
}

export default async function SponsorshipPage({
  params,
  searchParams,
}: SponsorshipPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const query = await searchParams;
  const languageSearchParams = new URLSearchParams();
  const companyName = getFirstValue(query.companyName).trim();
  const selectedCompanyId = getFirstValue(query.selectedCompanyId).trim();

  if (companyName) {
    languageSearchParams.set("companyName", companyName);
  }

  if (selectedCompanyId) {
    languageSearchParams.set("selectedCompanyId", selectedCompanyId);
  }

  const languageQuery = languageSearchParams.toString();
  const alternateLocale = getAlternateLocale(locale);

  return (
    <ToolShell
      locale={locale}
      tool="sponsorship"
      languageHref={`/${alternateLocale}/sponsorship${languageQuery ? `?${languageQuery}` : ""}`}
    >
      <SponsorshipTool
        companyName={companyName}
        selectedCompanyId={selectedCompanyId}
      />
    </ToolShell>
  );
}
