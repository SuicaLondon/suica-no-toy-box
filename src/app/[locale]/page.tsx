import { Card } from "suica-ui/card";
import { SectionHeading } from "suica-ui/section-heading";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { apps } from "@/constants/toys";
import { isLocale } from "@/i18n/locales";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cn } from "@/utils/cn";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

const copy = {
  en: {
    lang: "en",
    metaDescription: "Small, useful projects for everyday decisions.",
    avatarAlt: "Suica penguin holding a yellow JavaScript card",
    heroTitle: ["Tiny tools.", "Real utility."],
    intro: ["Useful little projects for", "everyday decisions."],
    projects: "PROJECTS",
    projectCount: (count: number) => `${count} projects`,
    viewProject: "VIEW PROJECT",
  },
  zh: {
    lang: "zh-Hant",
    metaDescription: "為日常選擇而做的小型實用專案。",
    avatarAlt: "Suica 企鵝抱著黃色 JavaScript 卡片",
    heroTitle: ["小工具。", "真正實用。"],
    intro: ["為日常選擇而做的", "小型實用專案。"],
    projects: "專案",
    projectCount: (count: number) => `共 ${count} 個專案`,
    viewProject: "查看專案",
  },
} as const;

function formatCount(count: number) {
  return String(count).padStart(2, "0");
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  return {
    title: "SuicaのToy Box",
    description: copy[locale].metaDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        "zh-Hant": "/zh",
        "x-default": "/en",
      },
    },
  };
}

export default async function LocalizedHome({ params }: HomePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const content = copy[locale];

  return (
    <main
      className="toy-page text-toy-text min-h-svh overflow-x-clip font-sans transition-[color,background-color] duration-180 [font-synthesis:none] [text-rendering:optimizeLegibility] motion-reduce:transition-none"
      lang={content.lang}
    >
      <div className="mx-auto w-[min(1320px,calc(100%-64px))] max-[1023px]:w-[calc(100%-48px)] max-[767px]:w-[calc(100%-36px)]">
        <SiteHeader locale={locale} />

        <div className="grid grid-cols-[508px_minmax(0,1fr)] gap-[52px] pt-[46px] max-[1023px]:grid-cols-1 max-[1023px]:gap-0 max-[1023px]:pt-0 min-[1024px]:max-[1279px]:grid-cols-[minmax(320px,34%)_minmax(0,1fr)] min-[1024px]:max-[1279px]:gap-8">
          <section
            className="border-toy-line min-w-0 border-r max-[1023px]:border-r-0"
            aria-labelledby="home-title"
          >
            <div className="sticky top-10 py-20 pr-[52px] pl-[22px] max-[1023px]:static max-[1023px]:max-w-[640px] max-[1023px]:px-0 max-[1023px]:py-14 max-[1023px]:pt-16 max-[767px]:py-12 max-[767px]:pt-[52px] min-[1024px]:max-[1279px]:py-[72px] min-[1024px]:max-[1279px]:pt-[90px] min-[1024px]:max-[1279px]:pr-8 min-[1024px]:max-[1279px]:pl-2">
              <div className="relative ml-[38px] w-fit max-[1023px]:ml-1.5">
                <div className="border-toy-line-strong bg-toy-avatar relative z-1 size-20 overflow-hidden rounded-full border max-[1023px]:size-[72px] max-[767px]:size-[66px] min-[1024px]:max-[1279px]:size-[72px]">
                  <Image
                    src="/avatar.jpeg"
                    alt={content.avatarAlt}
                    fill
                    sizes="80px"
                    className="object-contain"
                    priority
                  />
                </div>
                <span
                  className="bg-toy-accent absolute -top-[7px] -right-[7px] z-2 size-[18px] max-[767px]:size-[15px]"
                  aria-hidden="true"
                />
                <span
                  className="bg-toy-accent absolute -top-2.5 -right-[33px] h-0.5 w-5 max-[767px]:-right-7 max-[767px]:w-[17px]"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-[72px] max-[1023px]:mt-[52px] max-[767px]:mt-10 min-[1024px]:max-[1279px]:mt-[58px]">
                <p
                  className={cn(
                    "text-toy-accent m-0 font-mono text-lg font-medium tracking-[0.18em] uppercase max-[767px]:text-[0.9375rem]",
                    locale === "zh" && "tracking-[0.1em]",
                  )}
                  translate="no"
                >
                  SUICAのTOY BOX
                </p>
                <h1
                  id="home-title"
                  className={cn(
                    "mt-[34px] mb-0 text-[clamp(4.5rem,5.47vw,5.25rem)] leading-[0.93] font-bold tracking-[-0.045em] max-[1023px]:text-[clamp(3.75rem,8vw,4rem)] max-[767px]:mt-[26px] max-[767px]:text-[clamp(3rem,14vw,3.5rem)] min-[1024px]:max-[1279px]:text-[clamp(3.75rem,5.5vw,4.5rem)]",
                    locale === "zh" && "leading-[1.06] tracking-[-0.06em]",
                  )}
                >
                  {content.heroTitle[0]}
                  <br />
                  {content.heroTitle[1]}
                </h1>
                <p
                  className={cn(
                    "text-toy-muted mt-[22px] mb-0 max-w-[420px] text-[1.6875rem] leading-[1.45] tracking-[-0.02em] max-[1023px]:text-xl max-[767px]:mt-5 max-[767px]:text-[clamp(1.125rem,5vw,1.25rem)] min-[1024px]:max-[1279px]:text-[1.375rem]",
                    locale === "zh" && "leading-[1.65] tracking-normal",
                  )}
                >
                  {content.intro[0]}
                  <br />
                  {content.intro[1]}
                </p>
              </div>
            </div>
          </section>

          <section
            className="max-[1023px]:border-toy-line min-w-0 max-[1023px]:border-t max-[1023px]:pt-12 max-[767px]:pt-10"
            aria-labelledby="projects-title"
          >
            <SectionHeading
              titleId="projects-title"
              eyebrow={null}
              title={content.projects}
              description={
                <span aria-label={content.projectCount(apps.length)}>
                  {formatCount(apps.length)}
                </span>
              }
              className="[&_h2]:text-accent px-0 [&_[data-slot=section-heading-description]]:block"
            />

            <div className="mt-7 grid auto-rows-[minmax(276px,auto)] grid-cols-2 gap-3.5 max-[1023px]:auto-rows-[minmax(238px,auto)] max-[767px]:mt-[22px] max-[767px]:auto-rows-[minmax(232px,auto)] max-[767px]:grid-cols-1 max-[767px]:gap-3 min-[1024px]:max-[1279px]:auto-rows-[minmax(252px,auto)]">
              {apps.map((app, index) => {
                const Icon = app.icon;

                return (
                  <Link
                    key={app.href}
                    href={`/${locale}${app.href}`}
                    className="group block min-w-0"
                  >
                    <Card className="hover:border-toy-line-strong hover:bg-toy-hover relative grid h-full min-w-0 grid-rows-[minmax(104px,1fr)_auto_auto] px-6 pt-[22px] text-inherit transition-[border-color,background-color] duration-180 [contain-intrinsic-size:276px] [content-visibility:auto] motion-reduce:transition-none max-[1023px]:px-[22px] max-[1023px]:pt-5 max-[1023px]:[contain-intrinsic-size:238px] max-[767px]:grid-rows-[minmax(82px,1fr)_auto_auto] max-[767px]:[contain-intrinsic-size:232px] min-[1024px]:max-[1279px]:px-[22px] min-[1024px]:max-[1279px]:pt-5 min-[1024px]:max-[1279px]:[contain-intrinsic-size:252px]">
                      <span
                        className="text-toy-muted absolute top-[22px] right-6 font-mono text-xs tracking-[0.12em] uppercase"
                        aria-hidden="true"
                      >
                        {formatCount(index + 1)}
                      </span>

                      <Icon
                        className="text-toy-icon size-[82px] self-center justify-self-start max-[1023px]:size-[68px] max-[767px]:size-16 min-[1024px]:max-[1279px]:size-[72px]"
                        strokeWidth={1.35}
                        aria-hidden="true"
                      />

                      <div>
                        <h3 className="m-0 text-[1.375rem] leading-[1.2] font-semibold tracking-[-0.02em] text-balance max-[767px]:text-[1.375rem] min-[1024px]:max-[1279px]:text-xl">
                          {app.title[locale]}
                        </h3>
                        <p className="text-toy-muted mt-[7px] mb-0 text-[0.9375rem] leading-[1.55] text-pretty [overflow-wrap:anywhere]">
                          {app.description[locale]}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "border-toy-line text-toy-muted group-hover:text-toy-accent mt-5 flex self-end justify-self-stretch border-t py-[15px] pb-4 font-mono text-xs tracking-[0.13em] uppercase transition-colors duration-180 motion-reduce:transition-none",
                          locale === "zh" && "tracking-[0.1em]",
                        )}
                      >
                        {content.viewProject}
                      </span>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>

        <SiteFooter locale={locale} />
      </div>
    </main>
  );
}
