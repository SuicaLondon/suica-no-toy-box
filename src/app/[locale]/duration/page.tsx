import { ToolShell } from "@/components/site/tool-shell";
import { isLocale } from "@/i18n/locales";
import { getToolMetadata } from "@/i18n/tool-metadata";
import { DurationTool } from "@/lib/features/duration/duration-tool";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface DurationPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: DurationPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? getToolMetadata(locale, "duration") : {};
}

export default async function DurationPage({ params }: DurationPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <ToolShell locale={locale} tool="duration">
      <DurationTool />
    </ToolShell>
  );
}
