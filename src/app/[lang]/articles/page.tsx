import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { ArticleList } from "@/components/articles/article-list";
import { getAllArticles } from "@/lib/articles/get-all-articles";
import {
  STATIC_ARTICLE_CATEGORY_LABEL,
  getStaticArticlesByCategory,
  type StaticArticleCategory,
} from "@/lib/articles/static-articles";
import { SiteFooter } from "@/components/site-footer";
import { localizeHref, type Locale } from "@/lib/i18n/locale";

// ISR: 3600秒キャッシュ (1時間)
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = isEn
    ? "Flight sale articles and booking guides"
    : "セール記事・攻略ガイド";
  const description = isEn
    ? "Daily updates from the BEATRIP editorial team — flash sale alerts on ANA, JAL, Peach, Jetstar and more, plus booking-window guides, route-specific tips, and travel hacks for the cheapest fares out of Japan."
    : "「航空会社セール」「格安航空券 攻略」で検索する方へ。ANA・JAL・Peach・Jetstar などのセール速報、最安値で取るための予約タイミング・路線別の傾向・旅行Tipsまで。BEATRIP編集部が毎日更新。";
  const path = isEn ? "/en/articles" : "/articles";
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/articles",
        "x-default": "https://beatrip.jp/articles",
      },
    },
  };
}

// 静的記事 (編集部の定番コンテンツ) の表示順とハブリンク
const STATIC_SECTIONS: {
  category: StaticArticleCategory;
  hub?: { href: string; label: string };
}[] = [
  { category: "guide" },
  {
    category: "ota-compare",
    hub: { href: "/articles/ota-compare", label: "OTA 比較ハブで見る" },
  },
  { category: "ranking" },
  {
    category: "seasonal",
    hub: { href: "/seasons", label: "シーズン特集一覧で見る" },
  },
  { category: "feature" },
];

export default async function ArticlesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale: Locale = lang === "en" ? "en" : "ja";
  const lh = (href: string) => localizeHref(href, locale);
  const articles = await getAllArticles();

  // CollectionPage + ItemList — 記事ハブの構造を検索エンジンに明示
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "セール記事・攻略ガイド",
    description:
      "航空会社セール速報、格安航空券の攻略ガイド、旅行Tipsを毎日更新。",
    url: "https://beatrip.jp/articles",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: articles.length,
      itemListElement: articles.slice(0, 20).map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://beatrip.jp/articles/${a.slug}`,
        name: a.title,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="font-heading text-3xl tracking-wide text-zinc-900 uppercase sm:text-4xl lg:text-5xl">
            Articles
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            セール速報・攻略ガイド・航空会社ニュース
          </p>
        </div>

        {/* 編集部の定番コンテンツ (静的記事レジストリ) */}
        <section aria-labelledby="static-articles-heading" className="mb-12">
          <h2
            id="static-articles-heading"
            className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase"
          >
            定番ガイド・特集
          </h2>
          <p className="mt-1 mb-5 text-xs text-zinc-500">
            時期を問わず役立つ、編集部の常設コンテンツ
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STATIC_SECTIONS.map(({ category, hub }) => {
              const items = getStaticArticlesByCategory(category);
              if (items.length === 0) return null;
              return (
                <section
                  key={category}
                  className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                >
                  <h3 className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {STATIC_ARTICLE_CATEGORY_LABEL[category]}
                    <span className="font-normal normal-case">
                      {items.length} 本
                    </span>
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {items.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={lh(a.href)}
                          className="group flex items-baseline justify-between gap-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
                        >
                          <span className="font-medium group-hover:underline">
                            {a.title}
                          </span>
                          <ArrowRight
                            className="h-3 w-3 flex-shrink-0 translate-y-0.5 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500"
                            aria-hidden="true"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {hub && (
                    <Link
                      href={lh(hub.href)}
                      className="group mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-300 hover:underline"
                    >
                      {hub.label}
                      <ArrowRight
                        className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </Link>
                  )}
                </section>
              );
            })}
          </div>
        </section>

        <h2 className="mb-4 font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
          最新記事
        </h2>
        <ArticleList articles={articles} />
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
