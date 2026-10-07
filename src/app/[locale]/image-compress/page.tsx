import { ToolShell } from "@/components/site/tool-shell";
import { isLocale } from "@/i18n/locales";
import { getToolMetadata } from "@/i18n/tool-metadata";
import { ImageCompressTool } from "@/lib/features/image-compress/image-compress-tool";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface ImageCompressPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: ImageCompressPageProps): Promise<Metadata> {
  const { locale } = await params;
  return isLocale(locale) ? getToolMetadata(locale, "image-compress") : {};
}

export default async function ImageCompressPage({
  params,
}: ImageCompressPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <ToolShell locale={locale} tool="image-compress">
      <ImageCompressTool />
    </ToolShell>
  );
}
