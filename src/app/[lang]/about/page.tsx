import type { Metadata } from "next";
import { Plane, BarChart3, Bell, Shield } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import Link from "next/link";
import { getDictionary, hasLocale } from "../dictionaries";
import { localizeHref } from "@/lib/i18n/locale";
import { SITE_OPERATOR, CONTACT_EMAIL, ESTABLISHED } from "@/lib/site-config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "ja";
  const dict = await getDictionary(locale);
  return {
    title: dict.about.metaTitle,
    description: dict.about.metaDescription,
    alternates: {
      canonical: locale === "en" ? "https://beatrip.jp/en/about" : "https://beatrip.jp/about",
      languages: {
        ja: "https://beatrip.jp/about",
        "x-default": "https://beatrip.jp/about",
      },
    },
  };
}

const icons = [Plane, BarChart3, Bell, Shield];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "ja";
  const dict = await getDictionary(locale);
  const t = dict.about;

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            currentPath={localizeHref("/about", locale)}
            items={[
              { label: dict.common.home, href: localizeHref("/", locale) },
              { label: t.breadcrumb },
            ]}
          />
        </div>

        <h1 className="font-heading text-3xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-4xl">
          {t.title}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          {t.intro}
        </p>

        <section className="mt-12">
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl mb-6">
            {t.featuresTitle}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {t.features.map((feature, i) => {
              const Icon = icons[i] ?? Plane;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl mb-4">
            {t.missionTitle}
          </h2>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            {t.mission.map((para, i) => (
              <p
                key={i}
                className={`text-sm leading-relaxed text-zinc-600 dark:text-zinc-400${i > 0 ? " mt-4" : ""}`}
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl mb-4">
            {t.dataSourcesTitle}
          </h2>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-3">
              {t.dataSourcesIntro}
            </p>
            <div className="flex flex-wrap gap-2">
              {["ANA", "JAL", "Peach", "Jetstar Japan", "Scoot", "AirAsia", "ZIPAIR", "Spring Japan", "Emirates", "Cathay Pacific"].map(
                (name) => (
                  <span
                    key={name}
                    className="rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* データの収集方法と正確性 — E-E-A-T の核となる説明 */}
        <section className="mt-12">
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl mb-4">
            {t.methodologyTitle}
          </h2>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            {t.methodology.map((para, i) => (
              <p
                key={i}
                className={`text-sm leading-relaxed text-zinc-600 dark:text-zinc-400${i > 0 ? " mt-4" : ""}`}
              >
                {para}
              </p>
            ))}
          </div>
        </section>

        {/* 運営者情報 — 正式情報の確定までは site-config のプレースホルダを表示 */}
        <section className="mt-12">
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl mb-4">
            {t.operatorTitle}
          </h2>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <dl className="space-y-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                <dt className="w-32 shrink-0 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {t.operatorNameLabel}
                </dt>
                <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                  {SITE_OPERATOR[locale]}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                <dt className="w-32 shrink-0 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {t.contactLabel}
                </dt>
                <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                  {CONTACT_EMAIL ? (
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  ) : (
                    t.contactPending
                  )}
                </dd>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
                <dt className="w-32 shrink-0 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {t.establishedLabel}
                </dt>
                <dd className="text-sm text-zinc-600 dark:text-zinc-400">
                  {ESTABLISHED}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* 編集ポリシーへの導線 */}
        <section className="mt-12 mb-8">
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl mb-4">
            {t.editorialPolicyTitle}
          </h2>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {t.editorialPolicyText}
            </p>
            <Link
              href={localizeHref("/editorial-policy", locale)}
              className="mt-3 inline-block text-sm font-bold text-zinc-900 underline underline-offset-2 dark:text-zinc-100"
            >
              {t.editorialPolicyLink}
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
