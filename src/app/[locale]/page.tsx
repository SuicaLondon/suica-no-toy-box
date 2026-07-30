import { SiteFooter } from "@/app/_components/site-footer";
import { SiteHeader } from "@/app/_components/site-header";
import { apps } from "@/constants/toys";
import { isLocale } from "@/i18n/locales";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "../home.module.css";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

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
    <main className={styles.page} lang={content.lang}>
      <div className={styles.shell}>
        <SiteHeader locale={locale} />

        <div className={styles.content}>
          <section className={styles.hero} aria-labelledby="home-title">
            <div className={styles.heroInner}>
              <div className={styles.avatarMark}>
                <div className={styles.avatarFrame}>
                  <Image
                    src="/avatar.jpeg"
                    alt={content.avatarAlt}
                    fill
                    sizes="80px"
                    className={styles.avatar}
                    priority
                  />
                </div>
                <span className={styles.avatarSquare} aria-hidden="true" />
                <span className={styles.avatarLine} aria-hidden="true" />
              </div>

              <div className={styles.heroCopy}>
                <p className={styles.eyebrow} translate="no">
                  SUICAのTOY BOX
                </p>
                <h1 id="home-title">
                  {content.heroTitle[0]}
                  <br />
                  {content.heroTitle[1]}
                </h1>
                <p className={styles.intro}>
                  {content.intro[0]}
                  <br />
                  {content.intro[1]}
                </p>
              </div>
            </div>
          </section>

          <section className={styles.shelf} aria-labelledby="projects-title">
            <div className={styles.shelfHeading}>
              <h2 id="projects-title">{content.projects}</h2>
              <span aria-label={content.projectCount(apps.length)}>
                {formatCount(apps.length)}
              </span>
            </div>

            <div className={styles.projectGrid}>
              {apps.map((app, index) => {
                const Icon = app.icon;

                return (
                  <Link
                    key={app.href}
                    href={`/${locale}${app.href}`}
                    className={styles.projectCard}
                  >
                    <span className={styles.projectIndex} aria-hidden="true">
                      {formatCount(index + 1)}
                    </span>

                    <Icon
                      className={styles.projectIcon}
                      strokeWidth={1.35}
                      aria-hidden="true"
                    />

                    <div className={styles.projectCopy}>
                      <h3>{app.title[locale]}</h3>
                      <p>{app.description[locale]}</p>
                    </div>

                    <span className={styles.projectAction}>
                      {content.viewProject}
                    </span>
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
