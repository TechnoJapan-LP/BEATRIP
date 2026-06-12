/**
 * /articles/guides/{slug} 共通テンプレート
 *
 * 旅行 Tips / ハウツー記事を同じ構造で量産するための共通テンプレ。
 *
 * 構成:
 *  - Hero (タイトル + リード文 + パンくず)
 *  - 本文 (h2 セクション 4-6、各セクションに段落とリスト)
 *  - FAQ (FAQAccordion)
 *  - Article JSON-LD (FAQPage schema は出さない — リッチリザルト対象外 + テンプレ乱用回避)
 *  - 関連 ASP CTA (JapanesePartnersPanel)
 *  - 関連リンク
 *
 * 制約:
 *  - 実在しない事実・数値を捏造しない (一般的・正確な情報のみ)。
 *  - emoji 文字は使わない。
 *  - 全ページ ISR 21600 / generateMetadata (canonical/hreflang) / JSON-LD。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, HelpCircle, ArrowRight, ListChecks } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { TravelGoodsBlock } from "@/components/affiliate/travel-goods-block";
import { PrNotice } from "@/components/compliance/pr-notice";
import { localizeHref, type Locale } from "@/lib/i18n/locale";
import type { AspCategory } from "@/lib/affiliate/asp-partners";

/** 本文セクション。段落 + 任意のリスト (順序なし / チェックリスト) */
export type GuideSection = {
  heading: string;
  /** 導入段落 (複数可) */
  paragraphs?: string[];
  /** 箇条書き (各項目は「ラベル: 説明」形式でも素のテキストでも可) */
  bullets?: Array<{ label?: string; text: string }>;
  /** リストをチェックリスト風に表示するか */
  checklist?: boolean;
  /** セクション末尾の補足段落 */
  note?: string;
};

export type GuideRelatedLink = {
  href: string;
  label: string;
  desc: string;
};

export type GuideContent = {
  slug: string;
  /** ページ <title> 用 (｜BEATRIP は自動付与) */
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  /** H1 */
  title: string;
  /** Hero リード文 */
  lede: string;
  /** 公開日 (ISO) */
  published: string;
  sections: GuideSection[];
  faqs: Array<{ q: string; a: string }>;
  /** ASP パネルのカテゴリ */
  aspCategories: AspCategory[];
  aspTitle: string;
  aspSubtitle: string;
  /** GA4 計測用ソース識別子 */
  aspSource: string;
  relatedLinks: GuideRelatedLink[];
};

const BASE = "https://beatrip.jp";

export function buildGuideMetadata(c: GuideContent, lang: string): Metadata {
  const isEn = lang === "en";
  const path = `/articles/guides/${c.slug}`;
  return {
    title: `${c.metaTitle} | BEATRIP`,
    description: c.metaDescription,
    keywords: c.keywords,
    openGraph: { title: c.metaTitle, description: c.metaDescription, type: "article" },
    alternates: {
      canonical: isEn ? `${BASE}/en${path}` : `${BASE}${path}`,
      languages: {
        ja: `${BASE}${path}`,
        en: `${BASE}/en${path}`,
        "x-default": `${BASE}${path}`,
      },
    },
  };
}

export function GuidePage({ content: c, lang }: { content: GuideContent; lang: string }) {
  const locale: Locale = lang === "en" ? "en" : "ja";
  const lh = (href: string) => localizeHref(href, locale);
  const path = `/articles/guides/${c.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: c.title,
    description: c.metaDescription,
    inLanguage: "ja",
    datePublished: c.published,
    dateModified: c.published,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}${path}` },
    author: { "@type": "Organization", name: "BEATRIP" },
    publisher: { "@type": "Organization", name: "BEATRIP", url: BASE },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header />

      {/* Hero */}
      <section className="border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
          <Breadcrumbs
            currentPath={lh(path)}
            items={[
              { label: "Home", href: lh("/") },
              { label: "Articles", href: lh("/articles") },
              { label: "ガイド", href: lh("/articles/guides/lcc-tips") },
              { label: c.title },
            ]}
          />
          <h1 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl tracking-wide text-zinc-900 dark:text-zinc-100 leading-tight">
            {c.title}
          </h1>
          <PrNotice className="mt-2" />
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {c.lede}
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            旅行ハウツーガイド
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6 py-8 sm:py-10 space-y-10"
      >
        {/* 本文 */}
        <article className="space-y-9">
          {c.sections.map((s, i) => (
            <section key={i}>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                {s.heading}
              </h2>
              {s.paragraphs?.map((p, j) => (
                <p
                  key={j}
                  className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3 last:mb-0"
                >
                  {p}
                </p>
              ))}
              {s.bullets && s.bullets.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {s.bullets.map((b, k) => (
                    <li key={k} className="flex items-start gap-2.5 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {s.checklist ? (
                        <ListChecks className="h-4 w-4 mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-600" aria-hidden="true" />
                      )}
                      <span>
                        {b.label && (
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {b.label}:{" "}
                          </span>
                        )}
                        {b.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {s.note && (
                <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-l-2 border-zinc-200 dark:border-zinc-700 pl-3">
                  {s.note}
                </p>
              )}
            </section>
          ))}
        </article>

        {/* 関連 ASP CTA */}
        <section>
          <JapanesePartnersPanel
            title={c.aspTitle}
            subtitle={c.aspSubtitle}
            categories={c.aspCategories}
            source={c.aspSource}
          />
        </section>

        {/* 物販 (旅行用品) — env (AFFILIATE_URL_GOODS_*) 設定済みの記事のみ表示。
            recommendedFor に該当しない / env 未設定なら自動的に何も出ない。 */}
        <section>
          <TravelGoodsBlock articleSlug={c.slug} source={c.aspSource} />
        </section>

        {/* FAQ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
              よくある質問
            </h2>
          </div>
          <FAQAccordion items={c.faqs} />
        </section>

        {/* 編集部注記 */}
        <section>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            本記事は一般的な旅行情報をまとめたものです。航空券・ホテルの価格や各社の規約・サービス内容は変更される場合があるため、予約前に必ず各公式サイトで最新情報をご確認ください。記事内のリンクの一部はアフィリエイト広告を含みます。
          </p>
        </section>

        {/* 関連リンク */}
        {c.relatedLinks.length > 0 && (
          <section>
            <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
              関連ガイド
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {c.relatedLinks.map((r) => (
                <Link
                  key={r.href}
                  href={lh(r.href)}
                  className="group flex items-center justify-between rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {r.label}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {r.desc}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5 flex-shrink-0 ml-3" />
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
