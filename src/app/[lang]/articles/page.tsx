import type { Metadata } from "next";
import { Header } from "@/components/header";
import { ArticleList } from "@/components/articles/article-list";
import { getAllArticles } from "@/lib/articles/get-all-articles";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "セール記事・攻略ガイド",
  description:
    "航空会社セール速報、格安航空券の攻略ガイド、旅行Tipsなど。お得なフライト情報を見逃さない。",
  openGraph: {
    title: "セール記事・攻略ガイド",
    description: "航空会社セール速報、格安航空券の攻略ガイド、旅行Tips",
  },
  alternates: {
    canonical: "https://beatrip.jp/articles",
    languages: {
      ja: "https://beatrip.jp/articles",
      en: "https://beatrip.jp/en/articles",
      "x-default": "https://beatrip.jp/articles",
    },
  },
};

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
    <>
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
      <SiteFooter />
    </>
  );
}
