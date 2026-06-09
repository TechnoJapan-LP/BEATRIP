import type { Metadata } from "next";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, ArrowUpRight, Calendar, MapPin, Plane, TrendingDown, Star } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import {
  HOTEL_DESTINATIONS,
  getHotelDestinationBySlug,
  getRelatedHotelDestinations,
} from "@/data/hotel-destinations";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { NextTripSuggestions } from "@/components/home/next-trip-suggestions";
import { buildHotelLink } from "@/lib/affiliate/url-builder";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { getCityGuide } from "@/data/hotel-city-guides";
import { getCuratedHotels } from "@/data/hotel-curated";
import type { CuratedHotel } from "@/data/hotel-curated";
import { TravelCompanions } from "@/components/affiliate/travel-companions";
import { HotelBookingButtons } from "@/components/affiliate/hotel-booking-buttons";
import { getAirlineByCode } from "@/data/airlines";
import { getCityStartingPrice, getCityPriceTrend } from "@/lib/affiliate/hotel-price";
import { getCityPracticalInfo } from "@/data/city-practical-info";
import { PriceTrendBadge } from "@/components/hotels/price-trend-badge";
import { HotelMetaRow } from "@/components/hotels/hotel-meta-row";
import { CityPracticalCard } from "@/components/hotels/city-practical-card";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import type { AspCategory } from "@/lib/affiliate/asp-partners";
import { RecentlyViewedTracker } from "@/components/recently-viewed/recently-viewed-tracker";
import { EditorPickCallout } from "@/components/hotels/editor-pick-callout";
import { ComparisonBadge } from "@/components/affiliate/comparison-badge";
import { MobileStickyCta } from "@/components/sticky-cta/mobile-sticky-cta";

/**
 * tier ベースの 1 泊価格目安レンジ (¥)。実 OTA 価格が未取得でも
 * 「想像可能な金額感」をユーザーに与えるための fallback。Pack D。
 */
function tierPriceRange(tier: CuratedHotel["tier"]): { low: number; high: number } {
  switch (tier) {
    case "ラグジュアリー":
      return { low: 40000, high: 120000 };
    case "ハイクラス":
      return { low: 18000, high: 35000 };
    case "ミドル":
      return { low: 10000, high: 18000 };
    case "バジェット":
      return { low: 4000, high: 10000 };
  }
}

type Props = { params: Promise<{ city: string; lang: string;}> };

// ISR: 3600秒キャッシュ (1時間)
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d) return { title: "Not Found" };

  const title = `${d.nameJa}のホテル予約・最安値検索｜エリア別の特徴と相場 | BEATRIP`;
  const description = `${d.nameJa}（${d.nameEn}）のホテルを最安値で検索。${d.tagline}。${d.priceFromJpy ? `1泊¥${d.priceFromJpy.toLocaleString()}〜の目安。` : ""}主要エリアの特徴、ベストシーズン、関連フライトディールも掲載。`;

  return {
    title,
    description,
    keywords: [
      `${d.nameJa} ホテル`,
      `${d.nameJa} ホテル 格安`,
      `${d.nameJa} ホテル 予約`,
      `${d.nameJa} 宿泊`,
      `${d.nameJa} ホテル 最安値`,
      `${d.nameEn} hotel`,
    ],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp/hotels/${d.slug}`,
      languages: {
        ja: `https://beatrip.jp/hotels/${d.slug}`,
        en: `https://beatrip.jp/en/hotels/${d.slug}`,
        "x-default": `https://beatrip.jp/hotels/${d.slug}`,
      },
    },
  };
}

export function generateStaticParams() {
  return HOTEL_DESTINATIONS.map((d) => ({ city: d.slug }));
}

function priceFmt(n: number): string {
  return new Intl.NumberFormat("ja-JP").format(n);
}

export default async function HotelCityPage({ params }: Props) {
  const { city, lang} = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d) notFound();

  const hotelUrl = buildHotelLink(d.nameEn);
  const guide = getCityGuide(d.slug);
  const curatedHotels = getCuratedHotels(d.slug);
  // スターティング価格: 承認後は Booking feed / 未承認時はシーズン補正推定
  const startingPrice = await getCityStartingPrice(d.slug);
  // 価格動向シグナル (今後1-3ヶ月) と都市の実用旅行情報
  const priceTrend = getCityPriceTrend(d.slug);
  const practicalInfo = getCityPracticalInfo(d.slug);

  // ASP 経由 partner の表示カテゴリ — 国内/海外で出すべきものを切替
  const isDomestic = d.region === "国内";
  const aspCategories: AspCategory[] = isDomestic
    ? [
        "hotel-domestic",
        "hotel-luxury",
        "hotel-glamping",
        "tour-package",
        ...(d.slug === "okinawa" ? (["tour-okinawa"] as AspCategory[]) : []),
        "flight-domestic",
        "rail-domestic",
        "rental-car",
        "bus-domestic",
        "activity-domestic",
      ]
    : [
        "hotel-overseas",
        "hotel-luxury",
        "flight-overseas",
        "tour-overseas",
        ...(d.slug === "honolulu" ? (["tour-hawaii"] as AspCategory[]) : []),
        "tour-local",
        "airline-direct",
        "esim-wifi",
        "transport-europe",
        "cruise",
        "transfer",
      ];

  // 関連フライトディール（この都市行き、最大4件）
  const deals = await getActiveDeals();
  const cityDeals = deals.filter((deal) =>
    d.iataCodes.includes(deal.destination_code)
  );
  const relatedFlights = [...cityDeals]
    .sort((a, b) => a.sale_price - b.sale_price)
    .slice(0, 4);

  // この都市行きの人気路線（出発地ごとに重複排除、上位4路線）
  const popularRoutes = Array.from(
    new Set(
      cityDeals.map((dd) => `${dd.origin_code}-${dd.destination_code}`)
    )
  ).slice(0, 4);

  // 関連都市 — 同 region (海外なら同国優先) で最大 6 件、内部リンクで cluster 横断
  const relatedCities = getRelatedHotelDestinations(d.slug, 6);

  // FAQ — 「{都市} ホテル 安く」「{都市} ホテル どのエリア」「{都市} ホテル 相場」需要に対応
  const faqs = [
    {
      q: `${d.nameJa}のホテル相場はどのくらいですか？`,
      a: `${d.nameJa}の3つ星クラスのホテル相場は${startingPrice ? `今の時期で1泊¥${priceFmt(startingPrice.jpy)}〜（${startingPrice.isEstimate ? "編集部ベースラインに季節係数を反映した目安" : "提携OTAの直近最安値"}）` : "シーズン・エリアにより変動します"}。シーズンや立地により上下するため、最新の価格は本ページの予約ボタンから各OTAでご確認ください。`,
    },
    {
      q: `${d.nameJa}のホテルはどのエリアが便利ですか？`,
      a: `${d.nameJa}の代表的なエリアは ${d.areas.map((a) => `「${a}」`).join("、")} です。観光中心地と空港アクセスのバランスで選ぶのがコツです。`,
    },
    {
      q: `${d.nameJa}に行くベストシーズンはいつですか？`,
      a: `${d.nameJa}のベストシーズンは「${d.bestSeason}」です。シーズン中は航空券・ホテルとも価格が上がるため、早めの予約が安く取るコツです。`,
    },
    {
      q: `${d.nameJa}のホテルを安く取るコツは？`,
      a: `平日宿泊・出発の2〜3ヶ月前予約・キャンセル無料プランの早期確保・週末や連休を外す・複数の予約サイトで比較する、が基本です。BEATRIPでは${d.nameJa}行きフライトのセール時期予測も提供しています。`,
    },
    {
      q: `${d.nameJa}行きの航空券もチェックしたいです`,
      a: `${d.nameJa}（${d.iataCodes.join("/")}）行きのフライトディール一覧は本ページ下部の「${d.nameJa}行きフライトディール」セクションでご確認いただけます。BEATRIPは航空券セール情報を自動収集しており、過去最安や次回セール予測もご覧いただけます。`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: d.nameJa,
    alternateName: d.nameEn,
    description: d.tagline,
    url: `https://beatrip.jp/hotels/${d.slug}`,
    image: d.image,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <RecentlyViewedTracker
        item={{
          type: "hotel",
          id: d.slug,
          label: d.nameJa,
          sublabel: d.tagline,
          href: `/hotels/${d.slug}`,
          imageUrl: d.image ?? undefined,
        }}
      />
      <Header />

      {/* Hero */}
      <section className="relative h-[280px] sm:h-[360px] overflow-hidden">
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
              { label: d.nameJa },
            ]}
          />
          <h1 className="mt-4 font-heading text-3xl tracking-wide text-white uppercase sm:text-5xl lg:text-6xl">
            {d.nameJa}
          </h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base max-w-2xl">
            {d.tagline}
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* Pack B: この都市への航空券セールへの逆方向リンク — 主CTA より控えめ。
            ホテルから来た訪問者の航空券需要も拾う（双方向の internal link で
            cluster 内ナビゲーションと PageRank 流通を強化） */}
        <div className="mb-5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <Plane className="h-3.5 w-3.5 flex-shrink-0 text-zinc-400" />
          <span>
            {d.nameJa}（{d.iataCodes[0]}）への
            <Link
              href={`/airports/${d.iataCodes[0]}`}
              className="ml-1 font-bold text-zinc-700 dark:text-zinc-200 underline-offset-2 hover:underline"
            >
              航空券セール・路線一覧を見る
            </Link>
          </span>
        </div>

        {/* 主要CTA: フライト + ホテル の双子カード */}
        <section className="mb-10 grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
          {/* 航空券 — 最安ディール詳細へ直接 */}
          {relatedFlights[0] ? (
            <Link
              href={`/deals/${relatedFlights[0].id}`}
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 px-4 py-4 text-white shadow-lg shadow-rose-500/20 sm:gap-4 sm:px-5 sm:py-5 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]"
            >
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20">
                <Plane className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-90">
                  航空券
                </p>
                <h2 className="font-heading text-xl tracking-wide uppercase sm:text-2xl">
                  {relatedFlights[0].origin}→{d.nameJa}
                </h2>
                <p className="text-xs text-white/90 mt-0.5">
                  最安 ¥{relatedFlights[0].sale_price.toLocaleString()}〜
                  {relatedFlights[0].discount_percent
                    ? ` (-${relatedFlights[0].discount_percent}%)`
                    : ""}{" "}
                  · {relatedFlights[0].airline_name}
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ) : (
            <Link
              href="/"
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-800 px-4 py-4 text-white shadow-lg sm:gap-4 sm:px-5 sm:py-5 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Plane className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                  航空券
                </p>
                <h2 className="font-heading text-xl tracking-wide uppercase sm:text-2xl">
                  {d.nameJa}行きを探す
                </h2>
                <p className="text-xs text-white/80 mt-0.5">
                  BEATRIP で最新セールを横断検索
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}

          {/* ホテル — Hotellook 横断検索（marker 帰属あり） */}
          <a
            href={hotelUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-200 px-4 py-4 text-white dark:text-zinc-900 shadow-lg sm:gap-4 sm:px-5 sm:py-5 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 dark:bg-zinc-900/15">
              <BedDouble className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">
                ホテル
              </p>
              <h2 className="font-heading text-xl tracking-wide uppercase sm:text-2xl">
                {d.nameJa}のホテル
              </h2>
              <p className="text-xs text-white/80 dark:text-zinc-900/80 mt-0.5">
                複数サイトから最安値で
                {startingPrice
                  ? `（1泊¥${priceFmt(startingPrice.jpy)}〜${startingPrice.isEstimate ? " 目安" : ""}）`
                  : ""}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* エリア解説 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  主要エリア
                </h2>
              </div>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <ul className="space-y-2">
                  {d.areas.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ベストシーズン */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  ベストシーズン
                </h2>
              </div>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {d.bestSeason}
                </p>
                {guide?.climate && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                    気候: {guide.climate}
                  </p>
                )}
                <p className="text-xs text-zinc-400 mt-2">
                  ※ ハイシーズンは航空券・ホテルとも価格上昇傾向。予約は2〜3ヶ月前が目安です。
                </p>
                <Link
                  href={`/hotels/${d.slug}/best-season`}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                >
                  {d.nameJa}の月別ベストシーズンガイドを見る
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </section>

            {/* キュレートされた代表ホテル — 編集者による厳選リスト */}
            {curatedHotels.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BedDouble className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    {d.nameJa}の代表的なホテル
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  編集者が選ぶ、価格帯別の代表的なホテル。複数の予約サイトを横断比較して最安値で予約できます。
                </p>
                {/* Pack D: 比較対応 OTA を明示 (信頼性アンカー、card variant — 各カード内
                    の比較 chip とは別観点でブランド名を列挙) */}
                <ComparisonBadge variant="card" className="mb-3" />
                <div className="space-y-2">
                  {curatedHotels.map((h) => {
                    // tier → グラデーション色 (imageUrl 未設定時の fallback)
                    const tierGradient =
                      h.tier === "ラグジュアリー"
                        ? "from-amber-400 via-rose-500 to-purple-600"
                        : h.tier === "ハイクラス"
                          ? "from-sky-400 to-indigo-600"
                          : h.tier === "ミドル"
                            ? "from-emerald-400 to-teal-600"
                            : "from-zinc-400 to-zinc-600";
                    // Pack D: 価格レンジ / レビュー highlight 用の fallback 値
                    const priceRange = tierPriceRange(h.tier);
                    const reviewScore = h.reviewScore ?? 8.5;
                    const reviewCount = h.reviewCount ?? 1500;
                    const isLuxury = h.tier === "ラグジュアリー";
                    return (
                      <div
                        key={h.name}
                        className="overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row">
                          {/* 左 (PC): テキスト情報 / mobile では画像の下 */}
                          <div className="order-2 sm:order-1 min-w-0 flex-1 p-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                {h.name}
                              </h3>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                  h.tier === "ラグジュアリー"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                    : h.tier === "ハイクラス"
                                      ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                                      : h.tier === "ミドル"
                                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                }`}
                              >
                                {h.tier}
                              </span>
                            </div>
                            {/* Pack D: レビュー強調 (カード冒頭) — ホテル名直下に大きく */}
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 ring-1 ring-emerald-100 dark:bg-emerald-900/30 dark:ring-emerald-800">
                                <Star
                                  className="h-3.5 w-3.5 fill-emerald-500 text-emerald-500"
                                  aria-hidden="true"
                                />
                                <span className="text-base font-bold leading-none text-emerald-700 dark:text-emerald-200">
                                  {reviewScore.toFixed(1)}
                                </span>
                                <span className="text-[10px] font-medium text-emerald-600/80 dark:text-emerald-300/80">
                                  /10
                                </span>
                              </span>
                              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {reviewCount.toLocaleString()} 件のレビュー
                              </span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2 flex-wrap text-[11px] text-zinc-500 dark:text-zinc-400">
                              <span>エリア: {h.area}</span>
                              <span aria-hidden="true" className="text-zinc-300">
                                ·
                              </span>
                              <span className="font-mono">
                                目安: ¥{priceRange.low.toLocaleString()}〜¥
                                {priceRange.high.toLocaleString()} / 1泊
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                              {h.highlight}
                            </p>
                            {/* Pack D: ラグジュアリーのみ編集部おすすめ吹き出し */}
                            {isLuxury && (
                              <div className="mt-2">
                                <EditorPickCallout
                                  reason={h.highlight}
                                  tier={h.tier}
                                />
                              </div>
                            )}
                            {/* 星評価 / 客室数 / アメニティ / 推奨利用シーン
                                (review score は上で大きく出したので hideReviewScore) */}
                            <HotelMetaRow hotel={h} hideReviewScore />
                            {/* 各OTAへホテル名指定で直接深リンク（複数の予約サイトを比較） */}
                            <div className="mt-3">
                              <HotelBookingButtons
                                hotelName={h.name}
                                cityNameEn={d.nameEn}
                                destinationCode={d.iataCodes[0]}
                              />
                            </div>
                          </div>

                          {/* 右 (PC: w-48 / mobile: 上 full-width 16:9) */}
                          <div className="order-1 sm:order-2 relative sm:w-48 sm:flex-shrink-0 aspect-[16/9] sm:aspect-auto bg-zinc-100 dark:bg-zinc-800">
                            {h.imageUrl ? (
                              <Image
                                src={h.imageUrl}
                                alt={h.name}
                                fill
                                sizes="(min-width: 640px) 192px, 100vw"
                                loading="lazy"
                                className="object-cover"
                              />
                            ) : (
                              <div
                                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${tierGradient}`}
                                aria-hidden="true"
                              >
                                <span className="font-heading text-5xl font-bold text-white/90 drop-shadow">
                                  {h.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 観光名所 */}
            {guide && guide.attractions.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                  人気の観光スポット
                </h2>
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                  <ul className="space-y-2">
                    {guide.attractions.map((a) => (
                      <li
                        key={a}
                        className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* グルメ */}
            {guide && guide.food.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                  ご当地グルメ
                </h2>
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                  <ul className="space-y-2">
                    {guide.food.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* 関連コンテンツ — best-season / activities / esim への双方向リンク */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
                {d.nameJa}の関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href={`/hotels/${d.slug}/best-season`}
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    {d.nameJa}のベストシーズン
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">月別おすすめ度・気候・服装</p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    詳細を見る
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href={`/hotels/${d.slug}/activities`}
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    {d.nameJa}の現地ツアー
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">日本語ガイドから英語ツアーまで</p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    詳細を見る
                    <ArrowUpRight className="h-3 w-3" />
                  </div>
                </Link>
                {d.region !== "国内" && (
                  <Link
                    href={`/hotels/${d.slug}/esim`}
                    className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                      {d.nameJa}の eSIM 比較
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">現地通信の選び方ガイド</p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                      詳細を見る
                      <ArrowUpRight className="h-3 w-3" />
                    </div>
                  </Link>
                )}
              </div>
            </section>

            {/* 旅の準備 — 高料率アフィリエイト（env で有効なものだけ表示） */}
            <TravelCompanions
              ctx={{
                cityNameEn: d.nameEn,
                cityNameJa: d.nameJa,
                countryNameEn: d.countryEn,
                countrySlug: d.airaloSlug,
                destinationIata: d.iataCodes[0],
                originIata: relatedFlights[0]?.origin_code,
                checkIn: relatedFlights[0]?.departure_date,
                checkOut: relatedFlights[0]?.return_date,
              }}
              source="hotel-city"
            />

            {/* 旅の基本情報 */}
            {guide && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                  旅の基本情報
                </h2>
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-zinc-400 mb-1 font-bold uppercase tracking-wider">通貨</div>
                      <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {guide.currency}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-400 mb-1 font-bold uppercase tracking-wider">言語</div>
                      <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {guide.language}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-400 mb-1 font-bold uppercase tracking-wider">治安</div>
                      <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {guide.safety}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 text-xs">
                    <div className="text-zinc-400 mb-1 font-bold uppercase tracking-wider">空港アクセス</div>
                    <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {guide.airportAccess}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  よくある質問
                </h2>
              </div>
              <FAQAccordion items={faqs} />
            </section>
          </div>

          {/* 右サイド: 関連フライト + 価格動向 + 実用情報 */}
          <aside className="space-y-6">
            {/* 価格動向シグナル (FOMO/信頼性) */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  価格動向
                </h2>
              </div>
              <PriceTrendBadge trend={priceTrend} />
            </section>

            {/* 実用旅行情報 (eSIM/旅行保険/送迎クロスセル トリガー) */}
            {practicalInfo && (
              <section>
                <CityPracticalCard
                  info={practicalInfo}
                  cityNameJa={d.nameJa}
                />
              </section>
            )}

            {/* 日本系 ASP partner 集約 — env で有効化された分だけ表示 */}
            <section>
              <JapanesePartnersPanel
                title={`${d.nameJa}旅行の比較・予約`}
                subtitle={
                  isDomestic
                    ? "日本の旅行サービスから最安値で予約"
                    : `${d.nameJa}行きの航空券・ホテル・現地ツアーを比較`
                }
                categories={aspCategories}
                destinationCode={d.iataCodes[0]}
                source="hotel-city"
              />
            </section>

            <section>
              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  {d.nameJa}行きフライトディール
                </h2>
              </div>
              {relatedFlights.length > 0 ? (
                <div className="space-y-2">
                  {relatedFlights.map((deal) => {
                    const airline = getAirlineByCode(deal.airline_id);
                    return (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}`}
                        className="group block rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-colors hover:border-zinc-200 dark:hover:border-zinc-700"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            {airline?.logo && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={airline.logo}
                                alt=""
                                className="h-7 w-7 flex-shrink-0 rounded object-contain"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="text-[11px] font-mono text-zinc-400">
                                {deal.origin_code} → {deal.destination_code}
                              </div>
                              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                {deal.airline_name}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-heading text-lg leading-none text-zinc-900 dark:text-zinc-100">
                              ¥{deal.sale_price.toLocaleString()}
                            </div>
                            <div className="flex items-center justify-end gap-0.5 text-rose-500 text-[10px] mt-0.5">
                              <TrendingDown className="h-2.5 w-2.5" />
                              -{deal.discount_percent}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-2.5 flex items-center justify-end gap-1 text-[11px] font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                          このディールを見る
                          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    現在この目的地のセール情報はありません。BEATRIPは新セールを毎日収集しています。
                  </p>
                  <Link
                    href="/"
                    className="mt-3 inline-block text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                  >
                    すべてのディールを見る →
                  </Link>
                </div>
              )}
            </section>

            {/* 人気路線（出発地別）— 内部リンク強化 */}
            {popularRoutes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    {d.nameJa}行きの人気路線
                  </h2>
                </div>
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {popularRoutes.map((r) => {
                      const [o, dCode] = r.split("-");
                      return (
                        <li key={r}>
                          <Link
                            href={`/routes/${r}`}
                            className="flex items-center justify-between px-3 py-2.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                          >
                            <span className="font-mono text-zinc-600 dark:text-zinc-300">
                              {o} → {dCode}
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            )}
          </aside>
        </div>

        {/* 関連都市 — 同リージョン (海外は同国優先) の他都市へ内部リンク */}
        {relatedCities.length > 0 && (
          <section className="mt-12">
            <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
              {d.region === "国内" ? "国内の他の人気都市" : `${d.region}の他の人気都市`}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              {d.nameJa}周辺・同じ{d.region === "国内" ? "国内" : "リージョン"}で人気の宿泊先。気候・予算が近い行き先として比較検討にどうぞ。
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {relatedCities.map((c) => (
                <Link
                  key={c.slug}
                  href={`/hotels/${c.slug}`}
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    {c.nameJa}
                  </h3>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                    {c.tagline}
                  </p>
                  {c.priceFromJpy && (
                    <p className="text-[10px] text-zinc-400 mt-1 font-mono">
                      ¥{c.priceFromJpy.toLocaleString()}〜/泊
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <NextTripSuggestions excludeSlug={d.slug} seed={d.slug} />
      </main>
      <SiteFooter lang={lang} />

      {/* Pack C: モバイル限定 sticky CTA — スクロール 50% 以上で fade-in */}
      <MobileStickyCta
        label="最安値で予約"
        sublabel={`${d.nameJa}のホテル比較`}
        primaryHref={hotelUrl}
        primaryLabel="比較する"
        accent="emerald"
        trackingKind="hotel"
        trackingContext={{
          destinationCode: d.iataCodes[0],
          provider: "hotellook",
        }}
      />
    </>
  );
}
