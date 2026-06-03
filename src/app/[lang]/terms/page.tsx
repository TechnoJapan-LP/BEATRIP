import type { Metadata } from "next";
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
    title: dict.terms.metaTitle,
    description: dict.terms.metaDescription,
    alternates: {
      canonical: locale === "en" ? "https://beatrip.jp/en/terms" : "https://beatrip.jp/terms",
      languages: {
        ja: "https://beatrip.jp/terms",
        en: "https://beatrip.jp/en/terms",
        "x-default": "https://beatrip.jp/terms",
      },
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "ja";
  const dict = await getDictionary(locale);
  const t = dict.terms;

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
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
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {t.updated}
        </p>

        <div className="mt-8 space-y-6">
          {t.sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
            >
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                {section.title}
              </h2>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
