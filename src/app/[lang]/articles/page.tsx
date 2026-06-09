import type { Metadata } from "next";
import { Header } from "@/components/header";
import { ArticleList } from "@/components/articles/article-list";
import { getAllArticles } from "@/lib/articles/get-all-articles";
import { SiteFooter } from "@/components/site-footer";

// ISR: 3600秒キャッシュ (1時間)
export const revalidate = 3600;

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
        en: "https://beatrip.jp/en/articles",
        "x-default": "https://beatrip.jp/articles",
      },
    },
  };
}

export default async function ArticlesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
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

        <ArticleList articles={articles} />
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
