import { ToolShell } from "@/components/site/tool-shell";
import { isLocale } from "@/i18n/locales";
import { getToolMetadata } from "@/i18n/tool-metadata";
import { GrillRestaurantTool } from "@/lib/features/grill-restaurant/grill-restaurant-tool";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface GrillRestaurantPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: GrillRestaurantPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? getToolMetadata(locale, "grill-restaurant") : {};
}

export default async function GrillRestaurantPage({
  params,
}: GrillRestaurantPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <ToolShell locale={locale} tool="grill-restaurant">
      <GrillRestaurantTool />
    </ToolShell>
  );
}
