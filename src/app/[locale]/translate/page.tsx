import { ToolShell } from "@/components/site/tool-shell";
import { isLocale } from "@/i18n/locales";
import { getToolMetadata } from "@/i18n/tool-metadata";
import { TranslateTool } from "@/lib/features/translate/translate-tool";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface TranslatePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TranslatePageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? getToolMetadata(locale, "translate") : {};
}

export default async function TranslatePage({ params }: TranslatePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <ToolShell locale={locale} tool="translate">
      <TranslateTool />
    </ToolShell>
  );
}
