import { apps } from "@/constants/toys";
import { GITHUB_URL } from "@/constants/urls";
import type { Metadata } from "next";
import { Github } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToyThemeToggle } from "../_components/toy-theme";
import styles from "../home.module.css";

const locales = ["en", "zh"] as const;

type Locale = (typeof locales)[number];

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

const copy = {
  en: {
    lang: "en",
    metaDescription: "Small, useful projects for everyday decisions.",
    homeLabel: "SuicaのToy Box home",
    navigationLabel: "Primary navigation",
    blog: "BLOG",
    githubLabel: "Open the project on GitHub",
    languageSwitch: "中文",
    languageSwitchLabel: "切換至中文",
    switchToDark: "Switch to dark mode",
    switchToLight: "Switch to light mode",
    avatarAlt: "Suica penguin holding a yellow JavaScript card",
    heroTitle: ["Tiny tools.", "Real utility."],
    intro: ["Useful little projects for", "everyday decisions."],
    projects: "PROJECTS",
    projectCount: (count: number) => `${count} projects`,
    viewProject: "VIEW PROJECT",
    privacyTitle: "PRIVACY FIRST",
    privacyStatement: "No accounts. No behavioural tracking.",
  },
  zh: {
    lang: "zh-Hant",
    metaDescription: "為日常選擇而做的小型實用專案。",
    homeLabel: "SuicaのToy Box 首頁",
    navigationLabel: "主要導覽",
    blog: "部落格",
    githubLabel: "在 GitHub 查看專案",
    languageSwitch: "EN",
    languageSwitchLabel: "Switch to English",
    switchToDark: "切換至深色模式",
    switchToLight: "切換至淺色模式",
    avatarAlt: "Suica 企鵝抱著黃色 JavaScript 卡片",
    heroTitle: ["小工具。", "真正實用。"],
    intro: ["為日常選擇而做的", "小型實用專案。"],
    projects: "專案",
    projectCount: (count: number) => `共 ${count} 個專案`,
    viewProject: "查看專案",
    privacyTitle: "隱私優先",
    privacyStatement: "無需帳號，不做行為追蹤。",
  },
} as const;

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function isLocale(locale: string): locale is Locale {
  return locale === "en" || locale === "zh";
}

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
  const nextLocale: Locale = locale === "en" ? "zh" : "en";
  const nextHrefLang = nextLocale === "zh" ? "zh-Hant" : "en";

  return (
    <main className={styles.page} lang={content.lang}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <Link
            className={styles.brand}
            href={`/${locale}`}
            aria-label={content.homeLabel}
            translate="no"
          >
            <span>SUICA</span>
            <span aria-hidden="true">の</span>
            <span>TOY BOX</span>
          </Link>

          <nav
            className={styles.navigation}
            aria-label={content.navigationLabel}
          >
            <Link
              href={`https://suica.dev/${locale}/blogs`}
              target="_blank"
              rel="noreferrer"
            >
              {content.blog}
            </Link>
            <Link
              className={styles.githubLink}
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={content.githubLabel}
            >
              <Github aria-hidden="true" />
              <span>GITHUB</span>
            </Link>
            <Link
              className={styles.languageLink}
              href={`/${nextLocale}`}
              hrefLang={nextHrefLang}
              aria-label={content.languageSwitchLabel}
            >
              {content.languageSwitch}
            </Link>
            <ToyThemeToggle
              switchToDarkLabel={content.switchToDark}
              switchToLightLabel={content.switchToLight}
            />
          </nav>
        </header>

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
                    href={app.href}
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

        <footer className={styles.footer}>
          <p>
            <span className={styles.privacyLead}>{content.privacyTitle}</span>
            <span aria-hidden="true">—</span>
            <span>{content.privacyStatement}</span>
          </p>
        </footer>
      </div>
    </main>
  );
}
