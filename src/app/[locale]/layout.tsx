import { LocaleDocumentLanguageProvider } from "@/components/providers/locale-document-language-provider";
import { isLocale, locales } from "@/i18n/locales";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <LocaleDocumentLanguageProvider locale={locale}>
      {children}
    </LocaleDocumentLanguageProvider>
  );
}
