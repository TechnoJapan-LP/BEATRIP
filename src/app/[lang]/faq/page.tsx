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
    title: dict.faq.metaTitle,
    description: dict.faq.metaDescription,
    alternates: {
      canonical: locale === "en" ? "https://beatrip.jp/en/faq" : "https://beatrip.jp/faq",
      languages: {
        ja: "https://beatrip.jp/faq",
        en: "https://beatrip.jp/en/faq",
        "x-default": "https://beatrip.jp/faq",
      },
    },
  };
}

export default async function FAQPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "ja";
  const dict = await getDictionary(locale);
  const t = dict.faq;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.items.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
          {t.subtitle}
        </p>

        <div className="mt-8 space-y-4">
          {t.items.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {faq.q}
                <span className="ml-4 text-zinc-400 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-5 pt-1">
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
