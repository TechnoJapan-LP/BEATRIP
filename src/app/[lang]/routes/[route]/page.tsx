import type { Metadata } from "next";
import Image from "next/image";
import { BLUR_PLACEHOLDER_LIGHT } from "@/lib/images/blur";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plane, TrendingDown, Calendar } from "lucide-react";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { PriceChart } from "@/components/deals/price-chart";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { NextTripSuggestions } from "@/components/home/next-trip-suggestions";
import { HotelCrossSell } from "@/components/deals/hotel-cross-sell";
import { TravelCompanions } from "@/components/affiliate/travel-companions";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import type { AspCategory } from "@/lib/affiliate/asp-partners";
import { getActiveDeals, getHistoricalPrices } from "@/lib/deals/deal-service";
import {
  getHotelSlugByIata,
  getHotelDestinationBySlug,
} from "@/data/hotel-destinations";
import { cityNameEn, cityNameJa } from "@/lib/airport-names";
import { calculateBestTimeToBook } from "@/lib/predictions/best-time-to-book";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { AIRPORTS, getAirportByCode, type AirportRegion } from "@/data/airports";

const REGION_SLUGS: Record<AirportRegion, string> = {
  北海道: "hokkaido",
  東北: "tohoku",
  関東: "kanto",
  中部: "chubu",
  近畿: "kinki",
  中国: "chugoku",
  四国: "shikoku",
  九州: "kyushu",
  沖縄: "okinawa",
};

type Props = { params: Promise<{ route: string }> };

// ISR: 1800秒キャッシュ (30分)
export const revalidate = 1800;

function parseRoute(slug: string) {
  const decoded = decodeURIComponent(slug);
  const match = decoded.match(/^([A-Z]{3})-([A-Z]{3})$/);
  if (!match) return null;
  return { origin: match[1], destination: match[2] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { route } = await params;
  const parsed = parseRoute(route);
  if (!parsed) return { title: "Not Found" };

  const deals = await getActiveDeals();
  const routeDeals = deals.filter(
    (d) =>
      d.origin_code === parsed.origin &&
      d.destination_code === parsed.destination
  );
  const cheapest = routeDeals.length > 0
    ? Math.min(...routeDeals.map((d) => d.sale_price))
    : null;

  const origin = routeDeals[0]?.origin ?? cityNameJa(parsed.origin);
  const dest = routeDeals[0]?.destination ?? cityNameJa(parsed.destination);

  // GSCで「{出発} {目的地} 飛行機」需要を確認。タイトルに"飛行機"も含めて取りに行く。
  const title = `${origin}→${dest} 格安航空券・飛行機セール${cheapest ? `（最安¥${cheapest.toLocaleString()}〜）` : ""} | BEATRIP`;
  const description = `${origin}から${dest}への格安フライトセール最新情報。${cheapest ? `最安¥${cheapest.toLocaleString()}〜、` : ""}複数航空会社の価格比較・次回セール時期の予測・過去最安値まで。`;

  return {
    title,
    description,
    keywords: [
      `${origin} ${dest} 飛行機`,
      `${origin} ${dest} 格安`,
      `${origin} ${dest} 航空券`,
      `${origin} ${dest} セール`,
      `${origin} ${dest} 最安`,
      `${parsed.origin} ${parsed.destination}`,
      `${dest} 旅行 格安`,
      "航空券セール",
      "格安航空券",
    ],
    openGraph: {
      title,
      description: cheapest
        ? `${origin}→${dest} 最安¥${cheapest.toLocaleString()}〜 | 複数航空会社の価格を比較`
        : `${origin}→${dest}のセール情報`,
      type: "website",
    },
    alternates: {
      canonical: `https://beatrip.jp/routes/${route}`,
      languages: {
        ja: `https://beatrip.jp/routes/${route}`,
        en: `https://beatrip.jp/en/routes/${route}`,
        "x-default": `https://beatrip.jp/routes/${route}`,
      },
    },
  };
}

export async function generateStaticParams() {
  const deals = await getActiveDeals();
  const routes = new Set<string>();
  for (const d of deals) {
    routes.add(`${d.origin_code}-${d.destination_code}`);
  }
  // AIRPORTS の popularRoutes から全 O→D ペアを追加 (deal 不在路線の SSG)
  // popularRoutes に airline 名等が混じるケースがあるので IATA 3 文字のみ受け付ける
  for (const ap of AIRPORTS) {
    for (const dst of ap.popularRoutes ?? []) {
      if (/^[A-Z]{3}$/.test(dst) && dst !== ap.iata) {
        routes.add(`${ap.iata}-${dst}`);
      }
    }
  }
  return Array.from(routes).map((r) => ({ route: r }));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

export default async function RoutePage({ params }: Props) {
  const { route } = await params;
  const parsed = parseRoute(route);
  if (!parsed) notFound();

  const deals = await getActiveDeals();
  const routeDeals = deals.filter(
    (d) =>
      d.origin_code === parsed.origin &&
      d.destination_code === parsed.destination
  );
  const hasDeals = routeDeals.length > 0;

  const routeKey = `${parsed.origin}→${parsed.destination}`;
  const historicalData = await getHistoricalPrices(routeKey);
  const prediction =
    historicalData.length > 0
      ? calculateBestTimeToBook(routeKey, historicalData)
      : null;

  const firstDeal = routeDeals[0];
  const origin = firstDeal?.origin ?? cityNameJa(parsed.origin);
  const dest = firstDeal?.destination ?? cityNameJa(parsed.destination);
  const cheapest = hasDeals
    ? Math.min(...routeDeals.map((d) => d.sale_price))
    : 0;
  const avgPrice = hasDeals
    ? Math.round(
        routeDeals.reduce((s, d) => s + d.sale_price, 0) / routeDeals.length
      )
    : 0;
  const airlinesOnRoute = Array.from(
    new Set(routeDeals.map((d) => d.airline_name))
  );
  const originAirport = getAirportByCode(parsed.origin);
  const originRegionSlug = originAirport
    ? REGION_SLUGS[originAirport.region]
    : null;
  // deal が無い場合の checkIn/checkOut フォールバック (60-67 日後)
  const today = new Date();
  const inDays = (n: number) =>
    new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10);
  const fallbackCheckIn = inDays(60);
  const fallbackCheckOut = inDays(67);
  const checkIn = firstDeal?.departure_date ?? fallbackCheckIn;
  const checkOut = firstDeal?.return_date ?? fallbackCheckOut;
  const hotelSlug = getHotelSlugByIata(parsed.destination);
  const destDestination = hotelSlug ? getHotelDestinationBySlug(hotelSlug) : null;
  const isDomestic = destDestination?.region === "国内";
  const aspCategories: AspCategory[] = isDomestic
    ? [
        "flight-domestic",
        "tour-package",
        "hotel-domestic",
        "hotel-luxury",
        "rental-car",
        "rail-domestic",
        "bus-domestic",
        "activity-domestic",
      ]
    : [
        "flight-overseas",
        "tour-overseas",
        "hotel-overseas",
        "airline-direct",
        "tour-local",
        "esim-wifi",
        "transport-europe",
        "transfer",
        "cruise",
      ];

  // FAQ — 路線特有の検索意図にピンポイントで答えてリッチ結果を狙う
  const faqs: { q: string; a: string }[] = [];
  if (hasDeals) {
    faqs.push({
      q: `${origin}→${dest}の航空券はいくらから買えますか？`,
      a: `BEATRIPで現在掲載中の${origin}→${dest}の最安値は¥${cheapest.toLocaleString()}（平均¥${avgPrice.toLocaleString()}）です。価格は時期・予約タイミング・残席数で変動します。本ページのセール一覧から最新の価格をご確認ください。`,
    });
  } else {
    faqs.push({
      q: `${origin}→${dest}の航空券はいくらから買えますか？`,
      a: `${origin}→${dest}の運賃は時期・予約タイミング・残席数で大きく変動します。BEATRIPは各航空会社の公式セールを毎日収集し、当路線にセールが入荷次第このページに掲載します。`,
    });
  }
  if (airlinesOnRoute.length > 0) {
    faqs.push({
      q: `${origin}→${dest}にはどの航空会社が就航していますか？`,
      a: `現在BEATRIPに掲載中の${origin}→${dest}のセールは ${airlinesOnRoute.join("、")} の${airlinesOnRoute.length}社で確認できます。各社の運賃・キャビン・予約期限はセール一覧で比較できます。`,
    });
  }
  if (prediction && prediction.best_month_name) {
    faqs.push({
      q: `${origin}→${dest}を安く買うなら何月が良いですか？`,
      a: `過去の${origin}→${dest}の運賃データから、${prediction.best_month_name}の出発が最も安い傾向（平均より約${prediction.avg_saving_percent}%安）です。出発の2〜3ヶ月前の予約も安く取るコツです。`,
    });
  } else {
    faqs.push({
      q: `${origin}→${dest}はいつ予約するのが安いですか？`,
      a: `航空券は一般に出発の2〜3ヶ月前の予約が最も安くなりやすい傾向です。BEATRIPでは新着セールを毎日収集しており、${origin}→${dest}の値下げ通知を受け取りたい場合は本ページの「価格アラート」をご利用ください。`,
    });
  }
  faqs.push({
    q: `${origin}→${dest}のセールはどれくらいの頻度で出ますか？`,
    a: `各航空会社の四半期セール・タイムセール・サマー/ウィンターセール等で年に複数回出ます。最新の開催状況は本ページのセール一覧、過去履歴は各航空会社の「セール時期・実績」ページ、新着通知はBEATRIPニュースレターでお届けします。`,
  });
  faqs.push({
    q: `${origin}→${dest}のセールを見逃さないには？`,
    a: `BEATRIPの無料ニュースレターに登録すると、${origin}→${dest}を含む各路線の新着セールを週次でお届けします。特定価格以下になったら通知してほしい場合は、各ディール詳細ページの「価格アラート」もご利用いただけます。`,
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // ItemList 構造化データ（路線のセール一覧） — deal がある時のみ出す
  const jsonLd = hasDeals
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${origin}→${dest} 格安航空券セール一覧`,
        description: `${origin}から${dest}への航空券セール ${routeDeals.length}件。最安¥${cheapest.toLocaleString()}〜`,
        numberOfItems: routeDeals.length,
        itemListElement: routeDeals
          .sort((a, b) => a.sale_price - b.sale_price)
          .map((deal, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Product",
              name: `${deal.airline_name} ${origin}→${dest}`,
              url: `https://beatrip.jp/deals/${deal.id}`,
              image: deal.image_url,
              offers: {
                "@type": "Offer",
                priceCurrency: "JPY",
                price: deal.sale_price,
                availability: "https://schema.org/InStock",
              },
            },
          })),
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: `${origin}→${dest}` },
            ]}
          />
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          ディール一覧に戻る
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm text-zinc-500">
              {parsed.origin}
            </span>
            <Plane className="h-4 w-4 text-zinc-400 rotate-45" />
            <span className="font-mono text-sm text-zinc-500">
              {parsed.destination}
            </span>
          </div>
          <h1 className="font-heading text-4xl tracking-wide text-zinc-900 uppercase sm:text-5xl">
            {origin}→{dest}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {hasDeals
              ? `この路線の格安フライトセール ${routeDeals.length}件`
              : "現在この路線のセールは掲載されていません"}
          </p>
        </div>

        {/* 関連空港・地方ハブへの戻り導線 (deal の有無に関わらず常時表示) */}
        <div className="mb-6 flex flex-wrap gap-2 text-xs">
          <Link
            href={`/airports/${parsed.origin}`}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <ArrowLeft className="h-3 w-3" />
            {origin} ({parsed.origin}) 発の他路線
          </Link>
          <Link
            href={`/airports/${parsed.destination}`}
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            {dest} ({parsed.destination}) 着の他路線
            <ArrowRight className="h-3 w-3" />
          </Link>
          {originRegionSlug && (
            <Link
              href={`/local-flights/${originRegionSlug}`}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            >
              {originAirport?.region}発の地方便ハブ
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {!hasDeals && (
              <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 p-8 text-center">
                <Plane className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
                <h2 className="font-heading text-lg tracking-wide text-zinc-900 uppercase mb-1">
                  現在この路線のセールはありません
                </h2>
                <p className="text-sm text-zinc-600 mb-4">
                  {origin}→{dest}の航空券セールは、各航空会社の公式サイトから毎日収集しています。新着次第ここに掲載しますので、今後の入荷をお待ちください。
                </p>
                <p className="text-xs text-zinc-500">
                  価格アラートに登録すると、新着セールを優先的にお届けします。
                </p>
              </div>
            )}
            {routeDeals
              .sort((a, b) => a.sale_price - b.sale_price)
              .map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-5 transition-colors hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={deal.image_url}
                      alt={deal.destination}
                      width={96}
                      height={64}
                      sizes="96px"
                      className="h-16 w-24 rounded-lg object-cover flex-shrink-0"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER_LIGHT}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-zinc-900">
                          {deal.airline_name}
                        </span>
                        {deal.badge && (
                          <Badge
                            className={`text-[9px] ${
                              deal.badge === "NEW"
                                ? "bg-emerald-500 text-white"
                                : deal.badge === "ENDING_SOON"
                                  ? "bg-amber-500 text-white"
                                  : "bg-rose-500 text-white"
                            }`}
                          >
                            {deal.badge.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {deal.sale_name} · {deal.cabin}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
                        <span>
                          <Calendar className="h-3 w-3 inline mr-0.5" />
                          {formatDate(deal.departure_date)}〜
                          {formatDate(deal.return_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400 line-through font-mono">
                      ¥{formatPrice(deal.original_price)}
                    </div>
                    <div className="font-heading text-2xl tracking-wide text-zinc-900">
                      ¥{formatPrice(deal.sale_price)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-rose-500">
                      <TrendingDown className="h-3 w-3" />
                      <span className="text-xs font-bold">
                        -{deal.discount_percent}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}

            {/* FAQ — 路線の検索意図に答え、FAQPage構造化データでリッチ結果を狙う */}
            <section className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
                よくある質問
              </h2>
              <FAQAccordion items={faqs} />
            </section>
          </div>

          <div className="space-y-6">
            <HotelCrossSell
              destinationCode={parsed.destination}
              destinationLabel={dest}
              checkIn={checkIn}
              checkOut={checkOut}
            />

            {/* 日本系 ASP partner 集約 — env で有効化された分だけ表示 */}
            <JapanesePartnersPanel
              title={`${origin}→${dest}の比較・予約`}
              subtitle={
                isDomestic
                  ? "日本の旅行サービスから最安値で予約"
                  : `${dest}行きの航空券・ツアー・現地サービスを比較`
              }
              categories={aspCategories}
              destinationCode={parsed.destination}
              source="route"
            />

            {/* 旅の周辺商品（eSIM / 空港送迎 / 海外旅行保険 等）— env で有効なものだけ表示 */}
            <TravelCompanions
              ctx={{
                cityNameEn: cityNameEn(parsed.destination),
                cityNameJa: dest,
                countryNameEn: getHotelDestinationBySlug(hotelSlug ?? "")
                  ?.countryEn,
                countrySlug: getHotelDestinationBySlug(hotelSlug ?? "")
                  ?.airaloSlug,
                destinationIata: parsed.destination,
                originIata: parsed.origin,
                checkIn,
                checkOut,
              }}
              title="旅の準備"
              subtitle="eSIM・空港送迎・海外旅行保険まで一括で"
              source="route"
            />

            {hotelSlug && (
              <Link
                href={`/hotels/${hotelSlug}`}
                className="block rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-colors hover:border-zinc-200 dark:hover:border-zinc-700 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {dest}の旅行ガイド
                    </h3>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      ベストシーズン・観光・グルメ・ホテル
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            )}

            {prediction && prediction.historical_prices.length > 0 && (
              <div className="rounded-xl border border-zinc-100 bg-white p-5">
                <h2 className="font-heading text-lg tracking-wide text-zinc-900 uppercase mb-3">
                  Best Time to Book
                </h2>
                <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2">
                  <span className="text-sm font-bold text-emerald-700">
                    ベスト: {prediction.best_month_name}
                  </span>
                  <p className="text-[11px] text-emerald-600">
                    平均より約{prediction.avg_saving_percent}%安い
                  </p>
                </div>
                <PriceChart prediction={prediction} />
              </div>
            )}

            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <h3 className="font-heading text-lg tracking-wide text-zinc-900 uppercase mb-3">
                他の路線
              </h3>
              <div className="space-y-2">
                {Array.from(
                  new Set(
                    deals
                      .filter(
                        (d) =>
                          !(
                            d.origin_code === parsed.origin &&
                            d.destination_code === parsed.destination
                          )
                      )
                      .map(
                        (d) => `${d.origin_code}-${d.destination_code}`
                      )
                  )
                )
                  .slice(0, 6)
                  .map((r) => {
                    const [o, d] = r.split("-");
                    const sample = deals.find(
                      (deal) =>
                        deal.origin_code === o &&
                        deal.destination_code === d
                    );
                    return (
                      <Link
                        key={r}
                        href={`/routes/${r}`}
                        className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 transition-colors hover:bg-zinc-100"
                      >
                        <span className="text-xs font-mono text-zinc-600">
                          {o}→{d}
                        </span>
                        {sample && (
                          <span className="text-xs font-bold text-zinc-800">
                            ¥{formatPrice(sample.sale_price)}〜
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        <NextTripSuggestions
          excludeSlug={hotelSlug}
          seed={route}
        />
      </main>
    </>
  );
}
