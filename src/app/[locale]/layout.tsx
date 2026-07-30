import { LocaleDocumentLanguage } from "@/app/_components/locale-document-language";
import { isLocale, locales } from "@/i18n/locales";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <>
      <LocaleDocumentLanguage locale={locale} />
      {children}
    </>
  );
}
