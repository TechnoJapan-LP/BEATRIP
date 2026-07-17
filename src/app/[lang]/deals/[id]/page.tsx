import type { Metadata } from "next";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  Shield,
  TrendingDown,
  Users,
  ExternalLink,
  Fuel,
  Receipt,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { PriceChart } from "@/components/deals/price-chart";
import { BookingButton } from "@/components/deals/booking-button";
import { ShareButtons } from "@/components/deals/share-buttons";
import { PriceAlertForm } from "@/components/deals/price-alert-form";
import { HotelCrossSell } from "@/components/deals/hotel-cross-sell";
import { DealHotelHighlights } from "@/components/deals/deal-hotel-highlights";
import { TravelCompanions } from "@/components/affiliate/travel-companions";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import type { AspCategory } from "@/lib/affiliate/asp-partners";
import {
  getHotelDestinationBySlug,
  getHotelSlugByIata,
} from "@/data/hotel-destinations";
import { cityNameEn } from "@/lib/airport-names";
import { getAirlineByCode } from "@/data/airlines";
import { NewsletterCTA } from "@/components/newsletter/newsletter-cta";
import { NextTripSuggestions } from "@/components/home/next-trip-suggestions";
import { DealCarousel } from "@/components/deals/deal-carousel";
import { FavoriteButton } from "@/components/deals/favorite-button";
import { CountdownTimer } from "@/components/deals/countdown-timer";
import { CountdownBadge } from "@/components/deals/countdown-badge";
import { SocialProofBadge } from "@/components/deals/social-proof-badge";
import { PrNotice } from "@/components/compliance/pr-notice";
import { getActiveDeals, getDealById as getDealByIdFromService, getHistoricalPrices, isMockDeal } from "@/lib/deals/deal-service";
import { calculateBestTimeToBook } from "@/lib/predictions/best-time-to-book";
import { buildCompareLinksFromDeal } from "@/lib/affiliate/url-builder";
import { SiteFooter } from "@/components/site-footer";
import { StickyCTA } from "@/components/deals/sticky-cta";
import { RelatedDeals } from "@/components/deals/related-deals";
import { RecentlyViewedTracker } from "@/components/recently-viewed/recently-viewed-tracker";
import { TravelEssentialsCta } from "@/components/deals/travel-essentials-cta";
import { MobileStickyCta } from "@/components/sticky-cta/mobile-sticky-cta";

type Props = { params: Promise<{ id: string; lang: string;}> };

// ISR: 1800秒キャッシュ (30分)
// 30分。予約リンクの日付は 3 時間おきのスキャンで更新されるため、6 時間の
// ままだと利用者が最大 6 時間古い観測日付の Skyscanner 検索に飛んでしまう。
// CDN キャッシュ (kv cache:"default" 修正) が効いているので負荷は問題ない。
export const revalidate = 1800;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, lang } = await params;
  const deal = await getDealByIdFromService(id);
  if (!deal) return { title: "Not Found" };

  const isEn = lang === "en";
  const originEn = cityNameEn(deal.origin_code);
  const destEn = cityNameEn(deal.destination_code);
  const path = isEn ? `/en/deals/${id}` : `/deals/${id}`;

  return {
    // タイトルは日本語キーワード (都市名・航空券・航空会社・セール) を含める。
    // 旧実装はコードのみ (NRT→BKK ¥38,000) で SERP に意味が伝わらず CTR が出ず、
    // 数百ページが同型に酷似していた。template が末尾に「 | BEATRIP」を1回付与。
    title: isEn
      ? `${originEn} to ${destEn} flights from JPY ${deal.sale_price.toLocaleString()} — ${deal.airline_name} sale`
      : `${deal.origin}→${deal.destination} 航空券 ¥${deal.sale_price.toLocaleString()}〜｜${deal.airline_name}セール`,
    description: isEn
      ? `${deal.airline_name} ${deal.sale_name} — ${originEn} to ${destEn} from JPY ${deal.sale_price.toLocaleString()} (${deal.discount_percent}% off).`
      : `${deal.airline_name} ${deal.sale_name} — ${deal.origin}から${deal.destination}まで¥${deal.sale_price.toLocaleString()}。${deal.discount_percent}%OFF。`,
    openGraph: {
      title: isEn
        ? `${destEn} from JPY ${deal.sale_price.toLocaleString()} (-${deal.discount_percent}%)`
        : `${deal.destination} ¥${deal.sale_price.toLocaleString()} (-${deal.discount_percent}%)`,
      description: `${deal.airline_name} ${deal.sale_name}`,
    },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: `https://beatrip.jp/deals/${id}`,
        "x-default": `https://beatrip.jp/deals/${id}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const deals = await getActiveDeals();
  return deals.map((deal) => ({ id: deal.id }));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysLeft(dateStr: string) {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

const badgeConfig = {
  NEW: { label: "新着", className: "bg-emerald-500 text-white" },
  ENDING_SOON: { label: "締切間近", className: "bg-amber-500 text-white" },
  BIG_DISCOUNT: { label: "50%OFF以上", className: "bg-rose-500 text-white" },
} as const;

export default async function DealDetailPage({ params }: Props) {
  const { id, lang} = await params;
  const [deal, deals] = await Promise.all([
    getDealByIdFromService(id),
    getActiveDeals(),
  ]);
  if (!deal) notFound();

  const routeKey = `${deal.origin_code}→${deal.destination_code}`;
  const historicalData = await getHistoricalPrices(routeKey);
  const prediction = calculateBestTimeToBook(routeKey, historicalData);
  // sample_count は実際に観測した日数。合成データは 0 なので実測判定に使える。
  const observedDays = historicalData.reduce((n, h) => n + h.sample_count, 0);

  const deadlineDays = daysLeft(deal.booking_deadline);
  const badge = deal.badge ? badgeConfig[deal.badge] : null;

  const sameSaleDeals = deals.filter(
    (d) => d.id !== deal.id && d.sale_id === deal.sale_id
  );

  const similar = deals
    .filter((d) => d.id !== deal.id && d.sale_id !== deal.sale_id)
    .filter(
      (d) =>
        d.destination_code === deal.destination_code ||
        d.airline_id === deal.airline_id
    )
    .slice(0, 3);

  const otherDeals = deals
    .filter((d) => d.id !== deal.id && !similar.some((s) => s.id === d.id))
    .sort((a, b) => b.discount_percent - a.discount_percent)
    .slice(0, 8);

  // mock 由来の deal は架空価格のため Product schema (事実の表明) を出力しない。
  // 本番では mock は配信されないが、開発/プレビュー環境での誤出力も防ぐ。
  // is_estimate (TP最安値ウォッチ) も確定価格/在庫でないため Offer schema を出さない。
  const isMock = isMockDeal(deal);
  const suppressOfferSchema = isMock || deal.is_estimate === true;

  // airlines マスタに登録のあるキャリアのみ航空会社リンク/ロゴを描画 (TP は undefined → 404防止)
  const airline = getAirlineByCode(deal.airline_id);

  // 最安値の取得時点 (鮮度表示) — YYYY/MM/DD
  const updatedAtLabel = new Date(deal.updated_at).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${deal.origin_code}→${deal.destination_code} ${deal.airline_name} ${deal.sale_name}`,
    description: `${deal.airline_name} ${deal.sale_name} — ${deal.origin}から${deal.destination}まで¥${deal.sale_price.toLocaleString()}。${deal.discount_percent}%OFF。`,
    image: deal.image_url,
    dateModified: deal.updated_at,
    brand: {
      "@type": "Organization",
      name: deal.airline_name,
    },
    offers: {
      "@type": "Offer",
      url: `https://beatrip.jp/deals/${deal.id}`,
      priceCurrency: "JPY",
      price: deal.sale_price,
      // ISO 8601 形式 (YYYY-MM-DD) で priceValidUntil を保証
      priceValidUntil: deal.booking_deadline
        ? deal.booking_deadline.slice(0, 10)
        : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            .toISOString()
            .slice(0, 10),
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "出発地",
        value: `${deal.origin} (${deal.origin_code})`,
      },
      {
        "@type": "PropertyValue",
        name: "目的地",
        value: `${deal.destination} (${deal.destination_code})`,
      },
      {
        "@type": "PropertyValue",
        name: "割引率",
        value: `${deal.discount_percent}%`,
      },
      {
        "@type": "PropertyValue",
        name: "キャビン",
        value: deal.cabin,
      },
    ],
  };

  return (
    <>
      {!suppressOfferSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <RecentlyViewedTracker
        item={{
          type: "deal",
          id: deal.id,
          label: `${deal.origin_code} → ${deal.destination}`,
          sublabel: `¥${deal.sale_price.toLocaleString()} · ${deal.airline_name}`,
          href: `/deals/${deal.id}`,
          imageUrl: deal.image_url,
        }}
      />
      <Header />

      <div className="relative h-[30vh] min-h-[240px] overflow-hidden sm:h-[40vh] sm:min-h-[320px]">
        <Image
          src={deal.image_url}
          alt={deal.destination}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER_DARK}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
            <div className="mb-4">
              <Breadcrumbs
                variant="dark"
                currentPath={lang === "en" ? `/en/deals/${id}` : `/deals/${id}`}
                items={[
                  { label: "Home", href: "/" },
                  { label: "Flash Deals", href: "/" },
                  { label: deal.destination },
                ]}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {badge && (
                    <Badge className={`text-[10px] font-bold tracking-[0.15em] uppercase ${badge.className}`}>
                      {badge.label}
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <span className="font-mono">{deal.origin_code}</span>
                    <Plane className="h-3.5 w-3.5 rotate-45" />
                    <span className="font-mono">{deal.destination_code}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="font-heading text-3xl tracking-wide text-white uppercase sm:text-5xl lg:text-6xl">
                    {deal.destination}
                  </h1>
                  <FavoriteButton dealId={deal.id} />
                </div>
                <p className="mt-1 text-xs text-white/50 sm:text-sm">
                  {deal.airline_name} · {deal.sale_name}
                </p>
              </div>

              <div className="text-right">
                <div className="text-white/40 text-xs line-through font-mono sm:text-sm">
                  ¥{formatPrice(deal.original_price)}
                </div>
                <div className="font-heading text-3xl tracking-wide text-white sm:text-5xl">
                  ¥{formatPrice(deal.sale_price)}
                </div>
                <div className="flex items-center justify-end gap-1.5 mt-1 sm:gap-2">
                  <TrendingDown className="h-3.5 w-3.5 text-rose-400 sm:h-4 sm:w-4" />
                  <span className="text-sm font-bold text-rose-400 sm:text-lg">
                    -{deal.discount_percent}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {/* 景表法: PR 表記 (hero 直下) */}
        <PrNotice className="mb-4" />

        {/* 参考事例の明示 — mock 由来 deal は現在予約可能なオファーではない */}
        {isMock && (
          <div className="mb-4 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs leading-relaxed text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300">
            <span className="mr-2 rounded-full bg-zinc-700 px-2 py-0.5 text-[10px] font-bold text-zinc-100">
              参考事例
            </span>
            このディールは過去のセール傾向に基づく参考例です。現在予約できるセールではない場合があります。最新のセール情報は各航空会社の公式サイトでご確認ください。
          </div>
        )}

        {/* 最安値の目安の明示 — TP 由来は確定価格・確定在庫ではない (景表法) */}
        {deal.is_estimate && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
            <span className="mr-2 rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold text-white">
              最安値の目安
            </span>
            この価格は検索時点で見つかった最安運賃の目安です。確定価格・空席・予約期限は予約サイトで必ずご確認ください。実際の価格は変動します。
          </div>
        )}

        {/* セール終了カウントダウン (即効性 CTA) — 参考事例/目安では出さない */}
        {!isMock && !deal.is_estimate && (
          <div className="mb-6 flex items-center gap-2">
            <CountdownBadge deadline={deal.booking_deadline} />
          </div>
        )}

        {/* 3 ゾーン構成:
            - メインカラム (lg:col-span-2): ディール情報 → ホテル → 旅の準備
            - サイドバー (lg:col 3): 予約ゾーン (sticky) → アラート・回遊・シェア
            - モバイル order: 予約ゾーン → ディール情報/ホテル/旅の準備 → サイドバー残り */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 予約ゾーン — モバイル最優先 / デスクトップはサイドバー最上部 sticky */}
          <div className="order-1 lg:order-none lg:col-start-3 lg:row-start-1">
            <div className="space-y-6 lg:sticky lg:top-20">
              {deal.affiliate_url && (
                <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 space-y-3">
                  <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    このディールを予約
                  </h2>
                  <div className="empty:hidden">
                    <SocialProofBadge dealId={deal.id} />
                  </div>
                  {/* 予約期限・カウントダウンは確定情報のため、目安データでは出さない */}
                  {!deal.is_estimate && (
                    <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        予約期限 {formatDate(deal.booking_deadline)}
                      </span>
                      <CountdownTimer deadline={deal.booking_deadline} />
                    </div>
                  )}
                  <BookingButton
                    dealId={deal.id}
                    affiliateUrl={deal.affiliate_url}
                    affiliateProvider={deal.affiliate_provider ?? "パートナーサイト"}
                    saleName={deal.sale_name}
                    routeJa={`${deal.origin}→${deal.destination}`}
                    departDateLabel={
                      deal.departure_date
                        ? `${new Date(deal.departure_date).getMonth() + 1}/${new Date(deal.departure_date).getDate()}発`
                        : undefined
                    }
                    compareLinks={buildCompareLinksFromDeal(deal)}
                    price={deal.sale_price}
                    route={`${deal.origin_code}→${deal.destination_code}`}
                    discountPercent={deal.discount_percent}
                    bestMonthName={
                      prediction.historical_prices.length > 0
                        ? prediction.best_month_name
                        : undefined
                    }
                    avgSavingPercent={
                      prediction.historical_prices.length > 0
                        ? prediction.avg_saving_percent
                        : undefined
                    }
                    isLowest={deal.badge === "BIG_DISCOUNT"}
                  />
                </div>
              )}

              {/* バンドル試算 (航空券+ホテル総額) はユーザーフィードバックで撤去:
                  「情報量が多くなるだけ」+ 泊数計算がディール期間全体を泊数と
                  誤認する欠陥もあった (60泊= ¥48万 等の非現実な表示) */}
            </div>
          </div>

          {/* メインカラム — ディール本体を主役に */}
          <div className="order-2 space-y-8 lg:order-none lg:col-start-1 lg:col-span-2 lg:row-start-1 lg:row-span-2">
            {/* ディール情報ゾーン */}
            <section className="space-y-6">
              <div>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  ディール情報
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  価格の内訳・日程・予約タイミングの目安
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
                  <h3 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
                    Price Breakdown
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Plane className="h-4 w-4 text-zinc-400" />
                        航空券（{deal.cabin}）
                      </div>
                      <span className="text-sm font-mono font-medium">
                        ¥{formatPrice(deal.sale_price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Fuel className="h-4 w-4 text-zinc-400" />
                        燃油サーチャージ
                      </div>
                      <span className="text-sm font-mono text-zinc-500">
                        +¥{formatPrice(deal.fuel_surcharge)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-zinc-50 dark:border-zinc-800">
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Receipt className="h-4 w-4 text-zinc-400" />
                        諸税
                      </div>
                      <span className="text-sm font-mono text-zinc-500">
                        +¥{formatPrice(deal.taxes)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        支払総額
                      </span>
                      <span className="text-lg font-heading tracking-wide text-zinc-900 dark:text-zinc-100">
                        ¥{formatPrice(deal.total_cost)}
                      </span>
                    </div>
                    <p className="pt-1 text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500">
                      ※ 燃油サーチャージ・諸税は距離帯からの概算です。
                      {deal.is_estimate
                        ? "航空券価格も検索時点の最安運賃の目安のため、"
                        : ""}
                      確定金額は予約サイトでご確認ください。
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
                  <h3 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
                    Details
                  </h3>
                  <div className="space-y-3">
                    {/* 出発日・帰着日は確定旅程のため、目安データ (TP) では出さない */}
                    {!deal.is_estimate && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">出発日</span>
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {formatDate(deal.departure_date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">帰着日</span>
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {formatDate(deal.return_date)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-zinc-400">予約期限</span>
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {formatDate(deal.booking_deadline)}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">キャビン</span>
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {deal.cabin}
                      </span>
                    </div>
                    {!isMock && deal.seats_remaining !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">残席</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-amber-500" />
                          <span className="text-sm font-bold text-amber-600">
                            {deal.seats_remaining}席
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Best Time to Book — 価格判断の主要シグナル */}
              {prediction.historical_prices.length > 0 && (
                <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-xl">
                      Best Time to Book
                    </h3>
                    {/* sample_count は実際に観測した日数。合成データは 0 なので
                        これが「実測 / 推計」の判定になる。実測が貯まれば自動で
                        表示が切り替わる (price-observations.ts)。 */}
                    <span className="text-[10px] font-medium text-zinc-400">
                      {observedDays > 0
                        ? `実測 ${observedDays}日分`
                        : "季節傾向からの推計"}
                    </span>
                  </div>

                  <div className="mb-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-200">
                        ベスト予約時期: {prediction.best_month_name}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-300">
                      {observedDays > 0
                        ? `実測データでは、平均より約${prediction.avg_saving_percent}%安い時期です`
                        : `季節傾向の推計では、年間平均より約${prediction.avg_saving_percent}%安い時期です`}
                    </p>
                  </div>

                  <PriceChart prediction={prediction} />
                </div>
              )}
            </section>

            {/* ホテルゾーン — 検索 + 代表ホテル + OTA ピルの統合カード (高料率アフィリエイト) */}
            <HotelCrossSell
              destinationCode={deal.destination_code}
              destinationLabel={deal.destination}
              checkIn={deal.departure_date}
              checkOut={deal.return_date}
              dealId={deal.id}
              hotelHighlights={
                <DealHotelHighlights
                  destinationCode={deal.destination_code}
                  destinationLabel={deal.destination}
                />
              }
            />

            {/* 旅の準備ゾーン — 出発前アフィリエイトを 1 セクションに集約 */}
            <section className="space-y-6">
              <div>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  旅の準備
                </h2>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  eSIM・保険・送迎・現地ツアーなど、出発前にまとめて手配
                </p>
              </div>

              {/* 行先別 必需品 CTA (eSIM / 保険 / 現地アクティビティ) — Pack B */}
              <TravelEssentialsCta deal={deal} />

              <TravelCompanions
                ctx={{
                  cityNameEn: cityNameEn(deal.destination_code),
                  cityNameJa: deal.destination,
                  countryNameEn: getHotelDestinationBySlug(
                    getHotelSlugByIata(deal.destination_code) ?? ""
                  )?.countryEn,
                  countrySlug: getHotelDestinationBySlug(
                    getHotelSlugByIata(deal.destination_code) ?? ""
                  )?.airaloSlug,
                  destinationIata: deal.destination_code,
                  originIata: deal.origin_code,
                  checkIn: deal.departure_date,
                  checkOut: deal.return_date,
                }}
                title="出発前の一括手配"
                subtitle="ホテル・eSIM・送迎・保険まで一括で"
                source="deal"
              />

              {/* 日本系 ASP partner — 旧 2 枚 (旅行のお供 / 比較・予約) を 1 枚に統合 */}
              <JapanesePartnersPanel
                title={`${deal.destination}行きの比較・準備`}
                subtitle="航空券・ホテル・ツアー・保険・eSIM を厳選サイトで比較"
                categories={
                  (getHotelDestinationBySlug(
                    getHotelSlugByIata(deal.destination_code) ?? ""
                  )?.region === "国内"
                    ? [
                        "flight-domestic",
                        "hotel-domestic",
                        "tour-package",
                        "rental-car",
                        "rail-domestic",
                        "credit-card",
                      ]
                    : [
                        "insurance",
                        "esim-wifi",
                        "credit-card",
                        "flight-overseas",
                        "hotel-overseas",
                        "tour-overseas",
                        "tour-local",
                        "transfer",
                      ]) as AspCategory[]
                }
                destinationCode={deal.destination_code}
                source="deal"
                compact
                maxChips={10}
              />
            </section>
          </div>

          {/* サイドバー後半 — アラート・回遊リンク・シェア */}
          <div className="order-3 space-y-6 lg:order-none lg:col-start-3 lg:row-start-2">
            <PriceAlertForm
              routeKey={routeKey}
              currentPrice={deal.sale_price}
              dealId={deal.id}
            />

            {sameSaleDeals.length > 0 && (
              <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
                <h3 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-1">
                  Same Sale
                </h3>
                <p className="text-[11px] text-zinc-400 mb-3">
                  {deal.sale_name}の他の対象便
                </p>
                <div className="space-y-2">
                  {sameSaleDeals.map((s) => (
                    <Link
                      key={s.id}
                      href={`/deals/${s.id}`}
                      className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          <span className="truncate">{s.origin}</span>
                          <Plane className="h-3 w-3 flex-shrink-0 text-zinc-300 rotate-45" />
                          <span className="truncate">{s.destination}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {s.origin_code}→{s.destination_code} · {s.cabin}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          ¥{formatPrice(s.sale_price)}
                        </div>
                        <span className="text-[10px] text-rose-500 font-medium">
                          -{s.discount_percent}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 space-y-3">
              {/* 航空会社リンクは airlines マスタ登録の実在キャリアのみ (TP は 404 防止で非表示) */}
              {airline && (
                <>
                  <Link
                    href={`/airlines/${deal.airline_id}`}
                    className="flex items-center justify-between transition-colors hover:opacity-70"
                  >
                    <div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider">
                        航空会社
                      </span>
                      <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {deal.airline_name}
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-zinc-300" />
                  </Link>
                  <Link
                    href={`/airlines/${deal.airline_id}/sales`}
                    className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        {deal.airline_name}のセール時期・実績
                      </span>
                    </div>
                    <ExternalLink className="h-3 w-3 text-zinc-300" />
                  </Link>
                </>
              )}
              <Link
                href={`/routes/${deal.origin_code}-${deal.destination_code}`}
                className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
              >
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {deal.origin_code}→{deal.destination_code} の価格推移
                  </span>
                </div>
                <ExternalLink className="h-3 w-3 text-zinc-300" />
              </Link>
            </div>

            {similar.length > 0 && (
              <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
                <h3 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                  Similar
                </h3>
                <div className="space-y-2">
                  {similar.map((s) => (
                    <Link
                      key={s.id}
                      href={`/deals/${s.id}`}
                      className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {s.origin}
                          <span className="mx-1 font-normal text-zinc-400">→</span>
                          {s.destination}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {s.origin_code}→{s.destination_code} · {s.airline_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          ¥{formatPrice(s.sale_price)}
                        </div>
                        <span className="text-[10px] text-rose-500 font-medium">
                          -{s.discount_percent}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 flex items-center justify-between">
              <span className="text-xs text-zinc-400 dark:text-zinc-500">このディールを友達にシェア</span>
              <ShareButtons
                url={`https://beatrip.jp/deals/${deal.id}`}
                title={`${deal.origin_code}→${deal.destination_code} ¥${formatPrice(deal.sale_price)} (-${deal.discount_percent}%)`}
                description={`${deal.airline_name} ${deal.sale_name} | BEATRIP`}
              />
            </div>
          </div>
        </div>

        {otherDeals.length > 0 && (
          <div className="mt-12">
            <DealCarousel
              deals={otherDeals}
              title="Other Deals"
              subtitle="他のお得なフライトディール"
            />
          </div>
        )}

        {/* ディール詳細末尾CTA: 興味は高いが今は予約しない層をリピート化 */}
        <NewsletterCTA />

        <NextTripSuggestions
          excludeSlug={getHotelSlugByIata(deal.destination_code)}
          seed={deal.id}
        />

        {/* 関連ディール (同 destination または ±30% 価格帯) — セッション深度向上 */}
        <RelatedDeals currentDeal={deal} />
      </main>
      <SiteFooter lang={lang} />

      {/* モバイル スティッキーCTA — Pack C で多階層化
          - sm 未満: 新 MobileStickyCta (scroll 50% で fade-in, 軽量バッジ型)
          - sm〜lg: 既存 StickyCTA (常時表示, full-width)
          deal 詳細では bottom-nav が自身を非表示にするため z-30 同階層でも衝突しない。*/}
      {deal.affiliate_url && (
        <>
          <div className="hidden sm:block">
            <StickyCTA
              dealId={deal.id}
              price={deal.sale_price}
              discountPercent={deal.discount_percent}
              affiliateUrl={deal.affiliate_url}
              affiliateProvider={deal.affiliate_provider ?? "パートナーサイト"}
              route={`${deal.origin_code}→${deal.destination_code}`}
            />
          </div>
          <MobileStickyCta
            label={`¥${deal.sale_price.toLocaleString("ja-JP")} -${deal.discount_percent}%`}
            sublabel={`${deal.origin_code} → ${deal.destination_code} · ${deal.airline_name}`}
            primaryHref={deal.affiliate_url}
            primaryLabel="今すぐ予約"
            accent="rose"
            bottomNavOffset={false}
            trackingKind="deal"
            trackingContext={{
              dealId: deal.id,
              provider: deal.affiliate_provider ?? "パートナーサイト",
              price: deal.sale_price,
              route: `${deal.origin_code}→${deal.destination_code}`,
              destinationCode: deal.destination_code,
            }}
          />
        </>
      )}
    </>
  );
}
