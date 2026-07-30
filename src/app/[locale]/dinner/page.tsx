import { ToolShell } from "@/app/_components/tool-shell";
import { isLocale } from "@/i18n/locales";
import { getToolMetadata } from "@/i18n/tool-metadata";
import { DinnerTool } from "@/lib/features/dinner/dinner-tool";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type DinnerPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: DinnerPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? getToolMetadata(locale, "dinner") : {};
}

export default async function DinnerPage({ params }: DinnerPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <ToolShell locale={locale} tool="dinner">
      <DinnerTool />
    </ToolShell>
  );
}
