/**
 * /articles/autumn-sale-2026
 * 「【2026年秋】航空会社セールカレンダー — 9〜11月の狙い目と過去実績」
 *
 * 秋セール期 (9〜11月) の迎撃コンテンツ。編集部の憶測ではなく、
 * resolveSaleHistory の開催実績 (観測 or 参考、出所を明示) だけで構成する。
 * 各社ブロックはライブ: いま開催中のセールがあれば ISR (6h) で自動的に
 * 「開催中」バッジ + 現物リンクへ切り替わり、無ければメール通知 CTA を出す。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Calendar, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { NewsletterCTASlim } from "@/components/newsletter/newsletter-cta-slim";
import { airlines } from "@/data/airlines";
import {
  resolveSaleHistory,
  computeSaleStats,
} from "@/lib/deals/sale-history-resolver";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { OG_IMAGES } from "@/lib/seo/og";

// セールの開催状況 (開催中バッジ/現物リンク) を6時間ごとに再評価。
// タイトルの鮮度スタンプもこの周期で更新されるため嘘にならない
export const revalidate = 21600;

const PUBLISHED = "2026-08-13";
/** 秋 = 9,10,11月 (0-index では 8,9,10) */
const AUTUMN_MONTHS = [8, 9, 10];

export async function generateMetadata(): Promise<Metadata> {
  const now = new Date();
  const stamp = `【${now.getFullYear()}年${now.getMonth() + 1}月更新】`;
  const title = `2026年秋の航空券セールはいつ？9〜11月の開催カレンダーと過去実績${stamp}`;
  const description =
    "9月・10月・11月に航空券セールを開催した実績がある航空会社を、BEATRIPの観測記録と参考データから整理。ピーチ・ジェットスター・スカイマーク・ZIPAIR等の秋セールの傾向と、いま開催中のセールを1ページで確認できます。";
  return {
    title,
    description,
    keywords: [
      "航空券 セール 9月",
      "航空券 セール 10月",
      "航空券 セール 秋",
      "LCC セール 秋",
      "ピーチ セール 秋",
      "ジェットスター セール 9月",
      "スカイマーク セール 10月",
      "航空券 安い時期 秋",
    ],
    openGraph: { images: OG_IMAGES, title, description, type: "article" },
    alternates: {
      canonical: "https://beatrip.jp/articles/autumn-sale-2026",
      languages: {
        ja: "https://beatrip.jp/articles/autumn-sale-2026",
        "x-default": "https://beatrip.jp/articles/autumn-sale-2026",
      },
    },
  };
}

type AirlineAutumn = {
  code: string;
  name: string;
  /** 秋 (9-11月) の開催回数 (月別) */
  autumnCounts: { month: number; count: number }[];
  autumnTotal: number;
  /** 実測 or 参考 */
  observed: boolean;
  totalRecords: number;
  /** いま開催中のセール件数 (実在庫のみ) */
  liveDeals: number;
};

export default async function AutumnSale2026Page({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  await params;
  const activeDeals = (await getActiveDeals()).filter((d) => !d.is_sample);

  const rows: AirlineAutumn[] = [];
  for (const a of airlines) {
    const history = await resolveSaleHistory(a.code);
    const counts = AUTUMN_MONTHS.map((m) => ({
      month: m + 1,
      count: history.records.filter(
        (r) => new Date(r.startDate).getMonth() === m
      ).length,
    }));
    rows.push({
      code: a.code,
      name: a.searchNameJa ?? a.name,
      autumnCounts: counts,
      autumnTotal: counts.reduce((s, c) => s + c.count, 0),
      observed: history.source === "observed",
      totalRecords: history.records.length,
      liveDeals: activeDeals.filter((d) => d.airline_id === a.code).length,
    });
  }

  // 秋実績あり (回数降順) → 実績なし の順
  const withAutumn = rows
    .filter((r) => r.autumnTotal > 0)
    .sort((a, b) => b.autumnTotal - a.autumnTotal);
  const withoutAutumn = rows.filter((r) => r.autumnTotal === 0);
  const liveTotal = rows.reduce((s, r) => s + r.liveDeals, 0);

  const now = new Date();
  const faqs = [
    {
      q: "秋 (9〜11月) に航空券セールを開催する航空会社はどこですか？",
      a:
        withAutumn.length > 0
          ? `BEATRIPの記録では ${withAutumn
              .slice(0, 5)
              .map((r) => r.name)
              .join("、")} などに9〜11月の開催実績があります。開催月の内訳は本ページの各社ブロックをご覧ください。`
          : "現在、9〜11月の開催実績は集計中です。実績が貯まり次第このページに掲載します。",
    },
    {
      q: "秋のセールはいつ発表されますか？",
      a: "各社とも事前予告なく開始されることが多く、タイムセールは数時間〜数日で終了します。BEATRIPは約6時間ごとに各社を巡回しており、検出した新着セールはこのページと無料ニュースレターに反映されます。",
    },
    {
      q: "このカレンダーのデータの出所は？",
      a: "BEATRIPが実際に観測した開催記録を第一とし、観測が貯まっていない会社は出所を明示した参考データで補っています。推測に基づく開催予告は掲載しません。",
    },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "2026年秋の航空券セールカレンダー — 9〜11月の開催実績と狙い目",
    datePublished: PUBLISHED,
    dateModified: now.toISOString(),
    inLanguage: "ja",
    author: { "@type": "Organization", name: "BEATRIP" },
    publisher: { "@type": "Organization", name: "BEATRIP", url: "https://beatrip.jp" },
    mainEntityOfPage: "https://beatrip.jp/articles/autumn-sale-2026",
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <Breadcrumbs
            currentPath="/articles/autumn-sale-2026"
            items={[
              { label: "ホーム", href: "/" },
              { label: "記事", href: "/articles" },
              { label: "2026年秋セールカレンダー" },
            ]}
          />
        </div>

        <div className="mb-6">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Autumn Sale Calendar 2026
          </p>
          <h1 className="text-2xl font-bold leading-snug text-zinc-900 dark:text-zinc-100 sm:text-3xl">
            2026年秋の航空券セールはいつ？
            <br className="hidden sm:block" />
            9〜11月の開催カレンダーと過去実績
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            9〜11月にセールを開催した実績がある航空会社を、BEATRIPの記録から
            月別に整理しました。開催中のセールが検出されると、このページは
            約6時間ごとに自動で更新されます (最終更新:{" "}
            {now.getFullYear()}年{now.getMonth() + 1}月{now.getDate()}日)。
          </p>
        </div>

        {/* ライブ状況サマリー */}
        <div
          className={`mb-8 rounded-xl border p-4 sm:p-5 ${
            liveTotal > 0
              ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/30"
              : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50"
          }`}
        >
          {liveTotal > 0 ? (
            <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
              <Zap className="mr-1 inline h-4 w-4 text-rose-500" aria-hidden />
              いま {liveTotal} 件のセールを掲載中です — 各社ブロックの
              「開催中」からご覧ください
            </p>
          ) : (
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              現在、掲載中のセールはありません — 開始したらこのページと
              メールでお知らせします
            </p>
          )}
          <div className="mt-3">
            <NewsletterCTASlim source="autumn_calendar_2026" />
          </div>
        </div>

        {/* 秋実績のある社 */}
        <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
          9〜11月に開催実績のある航空会社
        </h2>
        <p className="mb-4 text-xs text-zinc-400">
          回数はBEATRIPの記録に基づく実数です。「観測」= BEATRIPが実際に検出した
          記録、「参考」= 観測が貯まるまでの出所つき参考データ
        </p>
        {withAutumn.length === 0 && (
          <p className="mb-8 rounded-xl border border-dashed border-zinc-200 p-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            9〜11月の開催実績はまだ記録がありません。観測を継続中です —
            検出され次第ここに掲載されます (推測では埋めません)。
          </p>
        )}
        <div className="mb-10 space-y-3">
          {withAutumn.map((r) => (
            <div
              key={r.code}
              className="rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {r.name}
                  </span>
                  <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {r.observed ? "観測" : "参考"}
                  </span>
                  {r.liveDeals > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                      開催中 {r.liveDeals}件
                    </span>
                  )}
                </div>
                <Link
                  href={`/airlines/${r.code}/sales`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  {r.liveDeals > 0 ? "セールを見る" : "実績と次回予測"}
                  <ArrowRight className="h-3 w-3" aria-hidden />
                </Link>
              </div>
              <div className="mt-3 flex gap-2">
                {r.autumnCounts.map((c) => (
                  <div
                    key={c.month}
                    className={`flex-1 rounded-lg px-3 py-2 text-center ${
                      c.count > 0
                        ? "bg-emerald-50 dark:bg-emerald-950/40"
                        : "bg-zinc-50 dark:bg-zinc-800/60"
                    }`}
                  >
                    <div className="text-[10px] text-zinc-400">{c.month}月</div>
                    <div
                      className={`text-sm font-bold ${
                        c.count > 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-zinc-300 dark:text-zinc-600"
                      }`}
                    >
                      {c.count > 0 ? `${c.count}回` : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 実績未記録の社 */}
        {withoutAutumn.length > 0 && (
          <div className="mb-10">
            <h2 className="mb-1 text-lg font-bold text-zinc-900 dark:text-zinc-100">
              秋の開催実績が未記録の航空会社
            </h2>
            <p className="mb-4 text-xs text-zinc-400">
              開催しないという意味ではなく、BEATRIPの記録にまだ無いという意味です。
              観測は約6時間ごとに継続しています
            </p>
            <div className="flex flex-wrap gap-2">
              {withoutAutumn.map((r) => (
                <Link
                  key={r.code}
                  href={`/airlines/${r.code}/sales`}
                  className="rounded-full border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  {r.name}
                  {r.liveDeals > 0 && (
                    <span className="ml-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                      ●開催中
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="mb-10">
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-zinc-400" aria-hidden />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              よくある質問
            </h2>
          </div>
          <FAQAccordion items={faqs} />
        </div>

        {/* データポリシー (E-E-A-T / AIO: 出所の明示) */}
        <div className="mb-10 rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-5">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden />
            <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              このカレンダーのデータについて
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
            BEATRIPは各社のセール情報を約6時間ごとに自動巡回し、検出した開催を
            記録しています。「観測」ラベルは実際に検出した記録、「参考」ラベルは
            観測が貯まるまでの出所つき参考データです。推測に基づく開催予告や、
            観測していない価格は掲載しません。
          </p>
        </div>

        {/* 回遊 */}
        <div className="flex flex-wrap gap-2">
          <Link
            href="/sale-calendar"
            className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            全社のセールカレンダー
            <ArrowRight className="h-3 w-3" aria-hidden />
          </Link>
          <Link
            href="/hot-deals"
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            価格急落の速報を見る
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
