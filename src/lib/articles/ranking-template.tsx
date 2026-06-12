/**
 * /articles/rankings/{segment} 共通テンプレート
 *
 * CURATED_HOTELS から `bestFor` フィールドで filter し、
 * tier 優先 + reviewScore で上位 N 件を抽出してランキング表示。
 *
 * - 実在しないスコアや順位は捏造しない (CURATED の reviewScore のみ使用)
 * - emoji 文字は使わない
 * - 各ホテルに HotelBookingButtons を併設しアフィリエイト動線を確保
 */

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Trophy,
  Star,
  BedDouble,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { HotelBookingButtons } from "@/components/affiliate/hotel-booking-buttons";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { PrNotice } from "@/components/compliance/pr-notice";
import { CURATED_HOTELS, type CuratedHotel } from "@/data/hotel-curated";
import {
  HOTEL_DESTINATIONS,
  getHotelDestinationBySlug,
} from "@/data/hotel-destinations";

type BestFor = NonNullable<CuratedHotel["bestFor"]>[number];

type RankingSegment = {
  slug: string;
  filterKey: BestFor;
  /** ページ URL の末尾 (/articles/rankings/{path}) */
  path: string;
  /** ナビ表示名 */
  navLabel: string;
  /** SEO タイトル */
  title: string;
  /** SEO description */
  description: string;
  /** Hero リード文 */
  lede: string;
  /** Hero 帯のグラデーション (Tailwind) */
  heroGradient: string;
  /** keywords */
  keywords: string[];
  /** FAQ */
  faqs: { q: string; a: string }[];
};

const tierPriority: Record<CuratedHotel["tier"], number> = {
  ラグジュアリー: 0,
  ハイクラス: 1,
  ミドル: 2,
  バジェット: 3,
};

const tierBadge: Record<CuratedHotel["tier"], string> = {
  ラグジュアリー:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  ハイクラス:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  ミドル: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  バジェット:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const tierGradient: Record<CuratedHotel["tier"], string> = {
  ラグジュアリー: "from-amber-400 via-rose-500 to-purple-600",
  ハイクラス: "from-sky-400 to-indigo-600",
  ミドル: "from-emerald-400 to-teal-600",
  バジェット: "from-zinc-400 to-zinc-600",
};

type Ranked = {
  rank: number;
  hotel: CuratedHotel;
  citySlug: string;
  cityNameJa: string;
  cityNameEn: string;
};

export function pickRanking(filterKey: BestFor, max = 10): Ranked[] {
  const all: { hotel: CuratedHotel; citySlug: string }[] = [];
  for (const [citySlug, hotels] of Object.entries(CURATED_HOTELS)) {
    for (const h of hotels) {
      if (h.bestFor?.includes(filterKey)) {
        all.push({ hotel: h, citySlug });
      }
    }
  }
  all.sort((a, b) => {
    const t = tierPriority[a.hotel.tier] - tierPriority[b.hotel.tier];
    if (t !== 0) return t;
    return (b.hotel.reviewScore ?? 0) - (a.hotel.reviewScore ?? 0);
  });
  return all.slice(0, max).map((x, i) => {
    const dest = getHotelDestinationBySlug(x.citySlug);
    return {
      rank: i + 1,
      hotel: x.hotel,
      citySlug: x.citySlug,
      cityNameJa: dest?.nameJa ?? x.citySlug,
      cityNameEn: dest?.nameEn ?? x.citySlug,
    };
  });
}

export function buildRankingMetadata(seg: RankingSegment): Metadata {
  return {
    title: `${seg.title} | BEATRIP`,
    description: seg.description,
    keywords: seg.keywords,
    openGraph: { title: seg.title, description: seg.description, type: "article" },
    alternates: {
      canonical: `https://beatrip.jp/articles/rankings/${seg.path}`,
      languages: {
        ja: `https://beatrip.jp/articles/rankings/${seg.path}`,
        en: `https://beatrip.jp/en/articles/rankings/${seg.path}`,
        "x-default": `https://beatrip.jp/articles/rankings/${seg.path}`,
      },
    },
  };
}

type Props = {
  seg: RankingSegment;
  lang: string;
};

export function RankingPage({ seg, lang }: Props) {
  const ranked = pickRanking(seg.filterKey, 10);
  const today = new Date().toISOString().split("T")[0];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: seg.title,
    description: seg.description,
    inLanguage: "ja-JP",
    datePublished: "2026-06-01",
    dateModified: today,
    author: { "@type": "Organization", name: "BEATRIP", url: "https://beatrip.jp" },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    mainEntityOfPage: `https://beatrip.jp/articles/rankings/${seg.path}`,
  };
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: ranked.map((r) => ({
      "@type": "ListItem",
      position: r.rank,
      name: `${r.hotel.name} (${r.cityNameJa})`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Header />

      <section className={`relative bg-gradient-to-br ${seg.heroGradient} text-white`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            currentPath={lang === "en" ? `/en/articles/rankings/${seg.path}` : `/articles/rankings/${seg.path}`}
            items={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/articles" },
              { label: "ランキング" },
              { label: seg.navLabel },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Trophy className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Hotel Ranking 2026
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-4xl lg:text-5xl">
            {seg.title}
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            {seg.lede}
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        {/* 景表法: PR 表記 (Hero 直下) */}
        <PrNotice className="mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* ランキングリスト */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                編集部選定 TOP {ranked.length}
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                CURATED_HOTELS から「{seg.navLabel}」適性が高いホテルを tier 優先 +
                編集部レビュースコア順で抽出。掲載順は順位を保証するものではなく
                編集部キュレートに基づく目安です。
              </p>
              <ol className="space-y-4">
                {ranked.map((r) => (
                  <li
                    key={`${r.citySlug}-${r.hotel.name}`}
                    className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                      {/* Rank + image */}
                      <div className="flex sm:flex-col items-center sm:items-start gap-3 flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-heading text-xl font-bold">
                          {r.rank}
                        </div>
                        <div className="relative w-24 h-16 sm:w-32 sm:h-20 rounded-lg overflow-hidden">
                          {r.hotel.imageUrl ? (
                            <Image
                              src={r.hotel.imageUrl}
                              alt={r.hotel.name}
                              fill
                              sizes="128px"
                              className="object-cover"
                            />
                          ) : (
                            <div
                              className={`absolute inset-0 bg-gradient-to-br ${tierGradient[r.hotel.tier]}`}
                            />
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tierBadge[r.hotel.tier]}`}
                          >
                            {r.hotel.tier}
                          </span>
                          <Link
                            href={`/hotels/${r.citySlug}`}
                            className="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline"
                          >
                            {r.cityNameJa}
                          </Link>
                          {r.hotel.reviewScore !== undefined && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-bold">
                              <Star className="h-3 w-3 fill-current" />
                              {r.hotel.reviewScore.toFixed(1)}
                              {r.hotel.reviewCount !== undefined && (
                                <span className="text-zinc-400 font-normal">
                                  ({r.hotel.reviewCount.toLocaleString("ja-JP")}+)
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100">
                          {r.hotel.name}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                          {r.hotel.area} ・ {r.cityNameJa}
                        </p>
                        <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                          {r.hotel.highlight}
                        </p>

                        {r.hotel.amenities && r.hotel.amenities.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {r.hotel.amenities.slice(0, 5).map((a) => (
                              <span
                                key={a}
                                className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-300"
                              >
                                {a}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-3">
                          <HotelBookingButtons
                            hotelName={r.hotel.name}
                            cityNameEn={r.cityNameEn}
                            otaUrls={r.hotel.otaUrls}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* 信頼性パネル */}
            <section>
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-start gap-3">
                <ShieldCheck
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-heading text-base tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    ランキングの選定基準
                  </h2>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    BEATRIP のランキングは編集部キュレートデータ ({Object.keys(CURATED_HOTELS).length} 都市)
                    から「{seg.navLabel}」適性タグを持つホテルを抽出し、ラグジュアリー優先 + レビュースコア順で
                    上位を掲載しています。順位は固定ランキングではなく編集部の見解で、実価格・空室・サービス内容は
                    予約直前画面で必ずご確認ください。
                  </p>
                  <p className="mt-2 text-[11px] text-zinc-400">
                    本記事のリンクの一部はアフィリエイト広告を含みます。
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-3xl">
                よくある質問
              </h2>
              <FAQAccordion items={seg.faqs} />
            </section>

            {/* 関連ランキング */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-3xl">
                関連ランキング
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {OTHER_RANKINGS.filter((r) => r.path !== seg.path).map((r) => (
                  <Link
                    key={r.path}
                    href={`/articles/rankings/${r.path}`}
                    className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-zinc-400" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                        {r.label}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{r.desc}</p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                      ランキングを見る
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="ホテル予約サイト比較"
              subtitle="国内・海外ホテルをまとめて比較"
              categories={["hotel-domestic", "hotel-overseas", "tour-package"]}
              source={`rankings-${seg.path}`}
            />
            <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-center gap-2 mb-2">
                <BedDouble className="h-4 w-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  全 {HOTEL_DESTINATIONS.length} 都市のホテル一覧
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                エリア解説と編集部選定ホテルを都市別に整理しています。
              </p>
              <Link
                href="/hotels"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                都市別ホテル一覧へ <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}

const OTHER_RANKINGS: { path: string; label: string; desc: string }[] = [
  {
    path: "couples",
    label: "カップル向け TOP 10",
    desc: "二人旅・記念日にふさわしいホテル",
  },
  {
    path: "family",
    label: "ファミリー向け TOP 10",
    desc: "子連れに優しい設備・キッズ対応",
  },
  {
    path: "solo",
    label: "一人旅向け TOP 10",
    desc: "ソロ滞在で快適なホテル",
  },
];

export type { RankingSegment };
