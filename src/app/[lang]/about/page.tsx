import type { Metadata } from "next";
import { Plane, BarChart3, Bell, Shield } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { getDictionary, hasLocale } from "../dictionaries";
import { localizeHref } from "@/lib/i18n/locale";

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
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
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

        <section className="mt-12 mb-8">
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
      </main>
      <SiteFooter />
    </>
  );
}
