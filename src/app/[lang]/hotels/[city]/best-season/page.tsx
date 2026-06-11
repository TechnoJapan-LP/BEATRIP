/**
 * /hotels/[city]/best-season
 *
 * 「{都市} ベストシーズン」「{都市} 何月がいい」「{都市} 旅行 おすすめ時期」
 * 等のロングテール検索クエリを取りに行く専用ページ。
 *
 * - hotel-destinations の bestSeason
 * - hotel-city-guides の climate
 * - when-to-visit-content の monthRatings/monthNotes/packingTips/yearlyHighlights
 * を組み合わせて、月別カレンダー / 服装ヒント / 年間イベント / FAQ を提供。
 *
 * JSON-LD は Article + FAQPage を併記。
 */

import type { Metadata } from "next";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, BedDouble, Calendar, Plane } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import {
  HOTEL_DESTINATIONS,
  getHotelDestinationBySlug,
} from "@/data/hotel-destinations";
import { getCityGuide } from "@/data/hotel-city-guides";
import {
  getWhenToVisitContent,
  hasWhenToVisitContent,
  MONTH_LABELS_JA,
  RATING_LABEL_JA,
  type MonthRating,
} from "@/data/when-to-visit-content";
import { buildHotelLink } from "@/lib/affiliate/url-builder";

type Props = { params: Promise<{ city: string; lang: string;}> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, lang } = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d) return { title: "Not Found" };

  const w = getWhenToVisitContent(d.slug);
  const isEn = lang === "en";
  const title = isEn
    ? `Best time to visit ${d.nameEn} — month-by-month guide and what to pack | BEATRIP`
    : `${d.nameJa}のベストシーズンはいつ？月別カレンダーと服装ガイド | BEATRIP`;
  const description = isEn
    ? `When to visit ${d.nameEn}, month by month. Best months: ${w.bestMonthsLabel}. Cheapest months: ${w.cheapMonthsLabel}. Climate, packing tips, yearly events, and FAQs.`
    : `${d.nameJa}（${d.nameEn}）旅行のベストシーズンを月別に解説。おすすめは${w.bestMonthsLabel}。安く行ける時期は${w.cheapMonthsLabel}。気候・服装・年間イベント・FAQまで網羅。`;
  const path = isEn ? `/en/hotels/${d.slug}/best-season` : `/hotels/${d.slug}/best-season`;

  // when-to-visit データ未整備の都市は汎用プレースホルダしか出せないため
  // noindex (検索流入させない)。sitemap.ts 側でも非掲載にしている。
  const hasContent = hasWhenToVisitContent(d.slug);

  return {
    title,
    description,
    ...(hasContent ? {} : { robots: { index: false, follow: true } }),
    keywords: isEn
      ? [
          `${d.nameEn} best time to visit`,
          `${d.nameEn} when to go`,
          `${d.nameEn} weather`,
          `${d.nameEn} what to pack`,
          `${d.nameEn} cheapest month`,
        ]
      : [
          `${d.nameJa} ベストシーズン`,
          `${d.nameJa} 何月`,
          `${d.nameJa} 旅行 時期`,
          `${d.nameJa} 旅行 おすすめ 時期`,
          `${d.nameJa} 気候`,
          `${d.nameJa} 服装`,
          `${d.nameJa} 安い時期`,
          `${d.nameEn} best time to visit`,
        ],
    openGraph: { title, description, type: "article" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: `https://beatrip.jp/hotels/${d.slug}/best-season`,
        en: `https://beatrip.jp/en/hotels/${d.slug}/best-season`,
        "x-default": `https://beatrip.jp/hotels/${d.slug}/best-season`,
      },
    },
  };
}

export function generateStaticParams() {
  // when-to-visit データのある都市のみ事前生成。
  // データ無し都市はオンデマンド描画 + noindex (上記 generateMetadata)。
  return HOTEL_DESTINATIONS.filter((d) => hasWhenToVisitContent(d.slug)).map(
    (d) => ({ city: d.slug })
  );
}

const RATING_CHIP: Record<
  MonthRating,
  { bg: string; text: string; ring: string }
> = {
  best: {
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "ring-emerald-200 dark:ring-emerald-800/60",
  },
  good: {
    bg: "bg-sky-100 dark:bg-sky-900/40",
    text: "text-sky-700 dark:text-sky-300",
    ring: "ring-sky-200 dark:ring-sky-800/60",
  },
  ok: {
    bg: "bg-zinc-100 dark:bg-zinc-800",
    text: "text-zinc-600 dark:text-zinc-300",
    ring: "ring-zinc-200 dark:ring-zinc-700",
  },
  avoid: {
    bg: "bg-rose-100 dark:bg-rose-900/40",
    text: "text-rose-700 dark:text-rose-300",
    ring: "ring-rose-200 dark:ring-rose-800/60",
  },
};

export default async function BestSeasonPage({ params }: Props) {
  const { city, lang} = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d) notFound();

  const guide = getCityGuide(d.slug);
  const w = getWhenToVisitContent(d.slug);
  const hotelUrl = buildHotelLink(d.nameEn);

  // FAQ — 「ベストシーズン」周辺の検索意図に合わせて
  const faqs = [
    {
      q: `${d.nameJa}に行くベストシーズンはいつですか？`,
      a: `${d.nameJa}のベストシーズンは${w.bestMonthsLabel}です。${d.bestSeason}という傾向があり、気候が安定し観光しやすい時期です。`,
    },
    {
      q: `${d.nameJa}を安く旅行できる時期は？`,
      a: `${d.nameJa}で航空券・ホテルとも比較的安く取れるのは${w.cheapMonthsLabel}です。需要が落ち着く時期を狙うと、ハイシーズンより20-40%程度の節約が見込めます。${w.avoidMonthsLabel ? `ただし${w.avoidMonthsLabel}は観光面で不向きな点もあるので、目的との兼ね合いで判断してください。` : ""}`,
    },
    {
      q: `${d.nameJa}の気候はどんな感じ？`,
      a: guide?.climate
        ? `${guide.climate}`
        : `${d.bestSeason}を中心に観光しやすい気候です。詳細は本ページの月別カレンダーをご覧ください。`,
    },
    {
      q: `${d.nameJa}旅行の服装は？`,
      a: `主なポイントは次のとおりです: ${w.packingTips.map((t) => `「${t}」`).join("、")}。月ごとの気候差が大きい都市もあるため、訪問月に合わせて準備するのがおすすめです。`,
    },
    {
      q: `何泊くらいすればよい？`,
      a: `${d.nameJa}は ${d.areas.length >= 3 ? "観光エリアが分散しているため3〜4泊以上" : "コンパクトな観光が可能なため2〜3泊"} が目安です。フライト時間と現地での移動時間を考慮して、無理のないスケジュールを組みましょう。`,
    },
  ];

  // JSON-LD: Article + FAQPage の併記
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${d.nameJa}のベストシーズン｜月別カレンダーと服装ガイド`,
    description: `${d.nameJa}旅行のベストシーズンを月別に解説。気候・服装・年間イベント・FAQまで網羅。`,
    inLanguage: "ja",
    about: { "@type": "TouristDestination", name: d.nameJa, alternateName: d.nameEn },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://beatrip.jp/hotels/${d.slug}/best-season`,
    },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
    },
    image: d.image ? [d.image] : undefined,
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
  // BreadcrumbList JSON-LD は <Breadcrumbs> コンポーネント内で自動付与されるため重複させない。

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

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

      {/* Hero */}
      <section className="relative h-[240px] sm:h-[320px] overflow-hidden">
        {d.image && (
          <Image
            src={d.image}
            alt={d.nameJa}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER_DARK}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="relative mx-auto max-w-7xl h-full flex flex-col justify-end px-4 sm:px-6 pb-6">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "ホテル", href: "/hotels" },
              { label: d.nameJa, href: `/hotels/${d.slug}` },
              { label: "ベストシーズン" },
            ]}
          />
          <h1 className="mt-4 font-heading text-3xl tracking-wide text-white uppercase sm:text-4xl lg:text-5xl">
            {d.nameJa}のベストシーズン
          </h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base max-w-2xl">
            月別カレンダー・気候・服装・年間イベントから「いつ行くべきか」を整理。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* サマリー: ベスト / 安い / 避ける */}
        <section className="mb-10 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-950/30 p-5">
            <div className="text-[10px] font-bold tracking-widest uppercase text-emerald-700 dark:text-emerald-300">
              ベスト
            </div>
            <p className="mt-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
              {w.bestMonthsLabel}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              気候・観光ともに最適
            </p>
          </div>
          <div className="rounded-2xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/60 dark:bg-sky-950/30 p-5">
            <div className="text-[10px] font-bold tracking-widest uppercase text-sky-700 dark:text-sky-300">
              安く行ける
            </div>
            <p className="mt-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
              {w.cheapMonthsLabel}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              航空券・ホテルの需要が緩和
            </p>
          </div>
          <div
            className={`rounded-2xl border p-5 ${
              w.avoidMonthsLabel
                ? "border-rose-100 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/30"
                : "border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/30"
            }`}
          >
            <div
              className={`text-[10px] font-bold tracking-widest uppercase ${
                w.avoidMonthsLabel
                  ? "text-rose-700 dark:text-rose-300"
                  : "text-zinc-500 dark:text-zinc-400"
              }`}
            >
              注意の時期
            </div>
            <p className="mt-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
              {w.avoidMonthsLabel || "特になし"}
            </p>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              天候・混雑・料金高騰など
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* 月別カレンダー */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  月別カレンダー
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                色は気候・観光のおすすめ度。各月の見どころも添えています。
              </p>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
                {months.map((m) => {
                  const r = w.monthRatings[m];
                  const chip = RATING_CHIP[r];
                  return (
                    <div key={m} className="flex items-start gap-3 px-4 py-3">
                      <div className="w-10 flex-shrink-0">
                        <div className="font-heading text-base text-zinc-900 dark:text-zinc-100">
                          {MONTH_LABELS_JA[m]}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${chip.bg} ${chip.text} ${chip.ring}`}
                        >
                          {RATING_LABEL_JA[r]}
                        </span>
                        <p className="mt-1.5 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {w.monthNotes[m]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 気候の概要 */}
            {guide?.climate && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                  気候の概要
                </h2>
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {guide.climate}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                    ベストシーズン目安: {d.bestSeason}
                  </p>
                </div>
              </section>
            )}

            {/* 服装・持ち物 */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                服装・持ち物のヒント
              </h2>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <ul className="space-y-2">
                  {w.packingTips.map((t) => (
                    <li
                      key={t}
                      className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                      <span className="leading-relaxed">{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* 年間イベント */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                年間イベントハイライト
              </h2>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <ul className="space-y-2">
                  {w.yearlyHighlights.map((e) => (
                    <li
                      key={e}
                      className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                      <span className="leading-relaxed">{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
                よくある質問
              </h2>
              <FAQAccordion items={faqs} />
            </section>
          </div>

          {/* 右サイド: 戻る導線 + CTA */}
          <aside className="space-y-6">
            <section>
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <h2 className="font-heading text-base tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  {d.nameJa}の旅を計画する
                </h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  ベストシーズンが決まったら、宿と航空券を押さえましょう。
                </p>
                <div className="mt-4 space-y-2">
                  <Link
                    href={`/hotels/${d.slug}`}
                    className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 px-4 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4" />
                      {d.nameJa}のホテルページに戻る
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  <a
                    href={hotelUrl}
                    target="_blank"
                    rel="sponsored noopener noreferrer"
                    className="flex items-center justify-between gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-3 text-sm font-bold text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
                  >
                    <span className="flex items-center gap-2">
                      <BedDouble className="h-4 w-4" />
                      {d.nameJa}のホテルを比較
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                  <Link
                    href="/"
                    className="flex items-center justify-between gap-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      {d.nameJa}行きのセールを見る
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </section>

            {/* 凡例 */}
            <section>
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <h2 className="font-heading text-xs tracking-wide text-zinc-500 dark:text-zinc-400 uppercase mb-3">
                  カレンダーの見方
                </h2>
                <ul className="space-y-2 text-xs">
                  {(["best", "good", "ok", "avoid"] as MonthRating[]).map((r) => {
                    const chip = RATING_CHIP[r];
                    return (
                      <li key={r} className="flex items-center gap-2">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${chip.bg} ${chip.text} ${chip.ring}`}
                        >
                          {RATING_LABEL_JA[r]}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-300">
                          {r === "best"
                            ? "気候・観光ともに最適"
                            : r === "good"
                              ? "観光向きの好条件"
                              : r === "ok"
                                ? "可もなく不可もなく"
                                : "雨・猛暑・混雑などに注意"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          </aside>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
