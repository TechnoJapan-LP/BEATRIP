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
import {
  cityNameEn,
  cityNameJa,
  CITY_NAMES_JA,
  CITY_NAMES_EN,
} from "@/lib/airport-names";
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

type Props = { params: Promise<{ route: string; lang: string }> };

// ISR: 1800秒キャッシュ (30分)
export const revalidate = 21600;

// 既知の空港コード allowlist。AIRPORTS (国内) + airport-names.ts が知っている
// 国際コードのみ。未知コード (例: QQQ-ZZZ) を許すと 17,576^2 通りの doorway
// ページが生成可能になり SEO スパム判定リスクが致命的なため、必ず 404 にする。
const KNOWN_IATA_CODES = new Set<string>([
  ...AIRPORTS.map((ap) => ap.iata),
  ...Object.keys(CITY_NAMES_JA),
  ...Object.keys(CITY_NAMES_EN),
]);

function isKnownCode(code: string): boolean {
  return KNOWN_IATA_CODES.has(code);
}

function parseRoute(slug: string) {
  const decoded = decodeURIComponent(slug);
  const match = decoded.match(/^([A-Z]{3})-([A-Z]{3})$/);
  if (!match) return null;
  const origin = match[1];
  const destination = match[2];
  // 両端が既知コードでなければ無効ルート扱い (doorway 封鎖)
  if (!isKnownCode(origin) || !isKnownCode(destination)) return null;
  return { origin, destination };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { route, lang } = await params;
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

  // データ連動 index 制御: セールも価格履歴も無い路線は本文が空テンプレに
  // なるため noindex,follow (薄い量産ページをインデックス母集団から除外し、
  // サイト全体の品質評価を守る)。セール or 履歴が付いたら自動で index 復帰。
  const routeKey = `${parsed.origin}-${parsed.destination}`;
  const historical = await getHistoricalPrices(routeKey);
  const hasContent = routeDeals.length > 0 || historical.length > 0;

  const isEn = lang === "en";
  const originJa = routeDeals[0]?.origin ?? cityNameJa(parsed.origin);
  const destJa = routeDeals[0]?.destination ?? cityNameJa(parsed.destination);
  const originEn = cityNameEn(parsed.origin);
  const destEn = cityNameEn(parsed.destination);

  const title = isEn
    ? `${originEn} to ${destEn} — cheap flights and current sales${cheapest ? ` (from JPY ${cheapest.toLocaleString()})` : ""}`
    : `${originJa}→${destJa} 格安航空券・飛行機セール${cheapest ? `（最安¥${cheapest.toLocaleString()}〜）` : ""}`;
  const description = isEn
    ? `Latest flight sales from ${originEn} to ${destEn}. ${cheapest ? `Fares from JPY ${cheapest.toLocaleString()}, ` : ""}price comparisons across multiple airlines, next-sale forecasts, and historical lows.`
    : `${originJa}から${destJa}への格安フライトセール最新情報。${cheapest ? `最安¥${cheapest.toLocaleString()}〜、` : ""}複数航空会社の価格比較・次回セール時期の予測・過去最安値まで。`;
  const path = isEn ? `/en/routes/${route}` : `/routes/${route}`;

  return {
    title,
    description,
    keywords: isEn
      ? [
          `${originEn} to ${destEn} flights`,
          `cheap ${originEn} ${destEn}`,
          `${originEn} ${destEn} sale`,
          `${parsed.origin} ${parsed.destination}`,
          `${destEn} cheap flights`,
          "flight sale",
          "cheap flights from Japan",
        ]
      : [
          `${originJa} ${destJa} 飛行機`,
          `${originJa} ${destJa} 格安`,
          `${originJa} ${destJa} 航空券`,
          `${originJa} ${destJa} セール`,
          `${originJa} ${destJa} 最安`,
          `${parsed.origin} ${parsed.destination}`,
          `${destJa} 旅行 格安`,
          "航空券セール",
          "格安航空券",
        ],
    openGraph: {
      title,
      description: isEn
        ? cheapest
          ? `${originEn} → ${destEn} from JPY ${cheapest.toLocaleString()} — compare fares across airlines`
          : `Sales on ${originEn} → ${destEn} flights`
        : cheapest
        ? `${originJa}→${destJa} 最安¥${cheapest.toLocaleString()}〜 | 複数航空会社の価格を比較`
        : `${originJa}→${destJa}のセール情報`,
      type: "website",
    },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: `https://beatrip.jp/routes/${route}`,
        "x-default": `https://beatrip.jp/routes/${route}`,
      },
    },
    ...(hasContent ? {} : { robots: { index: false, follow: true } }),
  };
}

export async function generateStaticParams() {
  const deals = await getActiveDeals();
  const routes = new Set<string>();
  for (const d of deals) {
    if (isKnownCode(d.origin_code) && isKnownCode(d.destination_code)) {
      routes.add(`${d.origin_code}-${d.destination_code}`);
    }
  }
  // AIRPORTS の popularRoutes から全 O→D ペアを追加 (deal 不在路線の SSG)
  // popularRoutes に airline 名等が混じるケースがあるので IATA 3 文字のみ受け付ける
  for (const ap of AIRPORTS) {
    for (const dst of ap.popularRoutes ?? []) {
      if (/^[A-Z]{3}$/.test(dst) && dst !== ap.iata && isKnownCode(dst)) {
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
  const { route, lang } = await params;
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

  // 「次に見るべき路線」を出発地・目的地でグルーピング。
  // 1) 同じ出発地から別目的地  2) 同じ目的地へ別出発地。
  // deal がある路線を優先し、不足分は空港データの popularRoutes で補完。
  type RouteSuggestion = { route: string; o: string; d: string; price: number | null };

  const cheapestForRoute = (o: string, d: string): number | null => {
    const matched = deals.filter(
      (dd) => dd.origin_code === o && dd.destination_code === d
    );
    return matched.length > 0
      ? Math.min(...matched.map((dd) => dd.sale_price))
      : null;
  };
  const buildSuggestions = (
    pairs: { o: string; d: string }[]
  ): RouteSuggestion[] => {
    const seen = new Set<string>();
    const out: RouteSuggestion[] = [];
    for (const { o, d } of pairs) {
      if (o === d) continue;
      const key = `${o}-${d}`;
      if (key === `${parsed.origin}-${parsed.destination}`) continue;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ route: key, o, d, price: cheapestForRoute(o, d) });
      if (out.length >= 6) break;
    }
    // deal あり (price != null) を上に
    return out.sort((a, b) => {
      if (a.price === null && b.price !== null) return 1;
      if (a.price !== null && b.price === null) return -1;
      return 0;
    });
  };

  // 同じ出発地 → 別目的地
  const sameOriginPairs: { o: string; d: string }[] = [
    ...deals
      .filter((dd) => dd.origin_code === parsed.origin)
      .map((dd) => ({ o: dd.origin_code, d: dd.destination_code })),
    ...(originAirport?.popularRoutes ?? [])
      .filter((c) => /^[A-Z]{3}$/.test(c))
      .map((d) => ({ o: parsed.origin, d })),
  ];
  // 同じ目的地 ← 別出発地
  const sameDestPairs: { o: string; d: string }[] = [
    ...deals
      .filter((dd) => dd.destination_code === parsed.destination)
      .map((dd) => ({ o: dd.origin_code, d: dd.destination_code })),
    // 目的地を popularRoutes に含む空港を「他の出発地」として提案
    ...AIRPORTS.filter(
      (ap) =>
        ap.iata !== parsed.destination &&
        (ap.popularRoutes ?? []).includes(parsed.destination)
    ).map((ap) => ({ o: ap.iata, d: parsed.destination })),
  ];

  const sameOriginRoutes = buildSuggestions(sameOriginPairs);
  const sameDestRoutes = buildSuggestions(sameDestPairs);
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

  // 注: FAQPage JSON-LD は出さない。全路線で同型のテンプレ FAQ schema を
  // 量産すると Google のスパムポリシー (構造化データ乱用) に抵触し得るため、
  // FAQ 本文 (FAQAccordion) のみ表示する。

  // ItemList 構造化データ（路線のセール一覧） — deal がある時のみ出す
  const jsonLd = hasDeals
    ? (() => {
        // 確定セール (非 estimate) と目安 (TP 最安値ウォッチ) を区別する。
        // 目安データに InStock/確定価格の Offer を出すと事実表明になるため、
        // Offer/AggregateOffer は確定セールのみから構成する (deals/[id] と同方針)。
        const firmDeals = routeDeals.filter((d) => d.is_estimate !== true);
        const firmPrices = firmDeals.map((d) => d.sale_price);
        const latestUpdated = routeDeals.reduce(
          (max, d) => (d.updated_at > max ? d.updated_at : max),
          routeDeals[0].updated_at
        );
        return {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${origin}→${dest} 格安航空券セール一覧`,
          description: `${origin}から${dest}への航空券セール ${routeDeals.length}件。最安¥${cheapest.toLocaleString()}〜`,
          numberOfItems: routeDeals.length,
          dateModified: latestUpdated,
          // 価格レンジ (確定セールが複数ある路線のみ)。「{路線} 最安値」意図に応える
          ...(firmPrices.length >= 2
            ? {
                aggregateOffer: {
                  "@type": "AggregateOffer",
                  priceCurrency: "JPY",
                  lowPrice: Math.min(...firmPrices),
                  highPrice: Math.max(...firmPrices),
                  offerCount: firmPrices.length,
                },
              }
            : {}),
          itemListElement: [...routeDeals]
            .sort((a, b) => a.sale_price - b.sale_price)
            .map((deal, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Product",
                name: `${deal.airline_name} ${origin}→${dest}`,
                url: `https://beatrip.jp/deals/${deal.id}`,
                image: deal.image_url,
                // 目安 (estimate) は確定オファーの事実表明をしない
                ...(deal.is_estimate !== true
                  ? {
                      offers: {
                        "@type": "Offer",
                        priceCurrency: "JPY",
                        price: deal.sale_price,
                        ...(deal.booking_deadline
                          ? {
                              priceValidUntil:
                                deal.booking_deadline.slice(0, 10),
                            }
                          : {}),
                        availability: "https://schema.org/InStock",
                      },
                    }
                  : {}),
              },
            })),
        };
      })()
    : null;

  // 鮮度表示: 掲載価格の最終取得日 (最安値情報は鮮度が信頼の核)
  const latestUpdatedLabel = hasDeals
    ? new Date(
        routeDeals.reduce(
          (max, d) => (d.updated_at > max ? d.updated_at : max),
          routeDeals[0].updated_at
        )
      ).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            currentPath={lang === "en" ? `/en/routes/${route}` : `/routes/${route}`}
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
          {/* h1 に主要検索意図 (格安航空券) を含める — GSC で路線×格安クエリが
              200表示/0クリックのため、見出し一致で順位/CTR を取りにいく */}
          <h1 className="font-heading text-4xl tracking-wide text-zinc-900 uppercase sm:text-5xl">
            {origin}→{dest} 格安航空券
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {hasDeals
              ? `この路線の格安フライトセール ${routeDeals.length}件・最安値と安い時期の目安`
              : "現在この路線のセールは掲載されていません"}
            {latestUpdatedLabel && (
              <span className="ml-2 text-xs text-zinc-400">
                価格更新日: {latestUpdatedLabel}
              </span>
            )}
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
          {/* セール速報の中核ハブへの動線 (deal→route→calendar の循環を閉じる) */}
          <Link
            href="/sale-calendar"
            className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            各社の次回セール時期・予測
            <ArrowRight className="h-3 w-3" />
          </Link>
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
                  // モバイル: 縦積み (左右潰し合いでタイトルが1文字ずつ折れるのを防止)
                  // sm以上: 従来の左右レイアウト
                  className="flex flex-col gap-3 rounded-xl border border-zinc-100 bg-white p-4 transition-colors hover:bg-zinc-50 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <Image
                      src={deal.image_url}
                      alt={deal.destination}
                      width={96}
                      height={64}
                      sizes="96px"
                      className="h-14 w-20 flex-shrink-0 rounded-lg object-cover sm:h-16 sm:w-24"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER_LIGHT}
                    />
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
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
                            {deal.badge === "NEW"
                              ? "新着"
                              : deal.badge === "ENDING_SOON"
                                ? "締切間近"
                                : "2年で最安"}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-zinc-500">
                        {deal.sale_name} · {deal.cabin}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-400">
                        <span>
                          <Calendar className="mr-0.5 inline h-3 w-3" />
                          {formatDate(deal.departure_date)}〜
                          {formatDate(deal.return_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* 価格: モバイルは横並び左寄せ、sm以上は右寄せ縦積み */}
                  <div className="flex items-baseline gap-2 pl-[92px] sm:block sm:pl-0 sm:text-right">
                    <div className="font-heading text-2xl tracking-wide text-zinc-900">
                      ¥{formatPrice(deal.sale_price)}
                    </div>
                    <div className="text-xs text-zinc-400 line-through font-mono">
                      ¥{formatPrice(deal.original_price)}
                    </div>
                    <div className="flex items-center gap-1 text-rose-500 sm:justify-end">
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

            {sameDestRoutes.length > 0 && (
              <div className="rounded-xl border border-zinc-100 bg-white p-5">
                <h3 className="font-heading text-lg tracking-wide text-zinc-900 uppercase mb-1">
                  {dest}への他の路線
                </h3>
                <p className="text-[11px] text-zinc-400 mb-3">
                  別の出発地から{dest}を目指す
                </p>
                <div className="space-y-2">
                  {sameDestRoutes.map((r) => (
                    <Link
                      key={r.route}
                      href={`/routes/${r.route}`}
                      className="card-interactive flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 hover:bg-zinc-100"
                    >
                      <span className="text-xs text-zinc-600">
                        <span className="font-medium text-zinc-800">
                          {cityNameJa(r.o)}
                        </span>
                        <span className="mx-1 text-zinc-400">→</span>
                        {cityNameJa(r.d)}
                      </span>
                      {r.price !== null && (
                        <span className="text-xs font-bold text-zinc-800">
                          ¥{formatPrice(r.price)}〜
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {sameOriginRoutes.length > 0 && (
              <div className="rounded-xl border border-zinc-100 bg-white p-5">
                <h3 className="font-heading text-lg tracking-wide text-zinc-900 uppercase mb-1">
                  {origin}発の他の路線
                </h3>
                <p className="text-[11px] text-zinc-400 mb-3">
                  同じ出発地から別の目的地へ
                </p>
                <div className="space-y-2">
                  {sameOriginRoutes.map((r) => (
                    <Link
                      key={r.route}
                      href={`/routes/${r.route}`}
                      className="card-interactive flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 hover:bg-zinc-100"
                    >
                      <span className="text-xs text-zinc-600">
                        <span className="font-medium text-zinc-800">
                          {cityNameJa(r.o)}
                        </span>
                        <span className="mx-1 text-zinc-400">→</span>
                        {cityNameJa(r.d)}
                      </span>
                      {r.price !== null && (
                        <span className="text-xs font-bold text-zinc-800">
                          ¥{formatPrice(r.price)}〜
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
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
