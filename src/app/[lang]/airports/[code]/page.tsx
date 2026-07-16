import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Plane,
  MapPin,
  Building2,
  ArrowRight,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { AIRPORTS, getAirportByCode, type Airport } from "@/data/airports";
import { cityNameJa } from "@/lib/airport-names";
import { getAirlineByCode } from "@/data/airlines";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { getHotelSlugByIata } from "@/data/hotel-destinations";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";
import { getHotelCitiesForAirport } from "@/lib/hotels/area-hotel-mapping";
import type { AspCategory } from "@/lib/affiliate/asp-partners";
import { OG_IMAGES } from "@/lib/seo/og";

type Props = { params: Promise<{ code: string; lang: string }> };

// ISR: 1800秒キャッシュ (30分)
export const revalidate = 21600;

const SIZE_BADGE: Record<Airport["size"], { label: string; cls: string }> = {
  major: {
    label: "主要空港",
    cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  },
  regional: {
    label: "地方拠点",
    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200",
  },
  minor: {
    label: "地方/離島",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, lang } = await params;
  const airport = getAirportByCode(code.toUpperCase());
  if (!airport) return { title: "Not Found" };

  const isEn = lang === "en";
  const title = isEn
    ? `${airport.nameEn} Airport (${airport.iata}) — flight sales and cheap fares`
    : `${airport.nameJa} (${airport.iata}) 発着セール・航空券`;
  const description = isEn
    ? `Latest flight sales out of ${airport.nameEn} Airport (${airport.iata}) in ${airport.prefecture}. ${airport.tagline ?? ""} Carriers serving the airport: ${airport.airlines.join(", ")}. Find popular routes and the cheapest fares on BEATRIP.`
    : `${airport.fullNameJa}（${airport.nameEn} ${airport.iata}）発着の航空券セール情報を最新で集約。${airport.tagline ?? ""}就航航空会社: ${airport.airlines.join(", ")}。人気路線・最安セールをBEATRIPでチェック。`;
  const path = isEn
    ? `/en/airports/${airport.iata}`
    : `/airports/${airport.iata}`;

  return {
    title,
    description,
    keywords: isEn
      ? [
          `${airport.nameEn} Airport`,
          `${airport.iata} flights`,
          `cheap flights from ${airport.nameEn}`,
          `${airport.nameEn} ${airport.iata}`,
          `flights from ${airport.prefecture}`,
        ]
      : [
          `${airport.nameJa} 空港`,
          `${airport.nameJa} 航空券`,
          `${airport.nameJa} 格安`,
          `${airport.fullNameJa}`,
          `${airport.iata} 空港`,
          `${airport.prefecture} 飛行機`,
        ],
    openGraph: {
      images: OG_IMAGES,
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: `https://beatrip.jp/airports/${airport.iata}`,
        "x-default": `https://beatrip.jp/airports/${airport.iata}`,
      },
    },
  };
}

export function generateStaticParams() {
  return AIRPORTS.map((a) => ({ code: a.iata }));
}

export default async function AirportPage({ params }: Props) {
  const { code, lang } = await params;
  const airport = getAirportByCode(code.toUpperCase());
  if (!airport) notFound();

  const sizeBadge = SIZE_BADGE[airport.size];
  const hotelSlug = getHotelSlugByIata(airport.iata);
  const hotelCitySlugs = getHotelCitiesForAirport(airport.iata);

  // この空港 origin or destination の deals (最大 8)
  const deals = await getActiveDeals();
  const relatedDeals = deals
    .filter(
      (d) =>
        d.origin_code === airport.iata || d.destination_code === airport.iata,
    )
    .sort((a, b) => b.discount_percent - a.discount_percent)
    .slice(0, 8);

  // 主要就航航空会社の Link 解決。airport.airlines は別表記 (SKY/SNA 等) を
  // 含むため、表示と href には解決後の正規 code を使う。
  const airlineLinks = airport.airlines
    .map((raw) => getAirlineByCode(raw))
    .filter((info) => info !== undefined)
    .map((info) => ({ code: info.code, info }));

  // 人気路線: airport.popularRoutes は IATA list、その先空港情報を解決
  const popularDestinations = airport.popularRoutes
    .map((iata) => ({ iata, name: cityNameJa(iata) }))
    .slice(0, 6);

  // 近隣の空港: まず同一都道府県、足りなければ同一地域で補完。
  const samePrefecture = AIRPORTS.filter(
    (a) => a.prefecture === airport.prefecture && a.iata !== airport.iata,
  );
  const sameRegion = AIRPORTS.filter(
    (a) => a.region === airport.region && a.iata !== airport.iata,
  );
  const nearbyAirports = samePrefecture.slice(0, 6);
  // 同地域 (近隣の都道府県を除く) — 重複を避ける
  const nearbyIata = new Set(nearbyAirports.map((a) => a.iata));
  const regionAirports = sameRegion
    .filter((a) => !nearbyIata.has(a.iata))
    .slice(0, 8);

  const aspCategories: AspCategory[] = [
    "flight-domestic",
    "hotel-domestic",
    "tour-package",
    "rental-car",
    "rail-domestic",
    "bus-domestic",
  ];

  const faqs = [
    {
      q: `${airport.fullNameJa}発の格安航空券を探すコツは？`,
      a: `${airport.fullNameJa}発は ${airport.airlines.slice(0, 3).join("、")} などが就航しています。LCC のセール時期（早朝・深夜便を狙う）や、出発の2〜3ヶ月前予約、平日出発でかなり安く取れます。BEATRIPでは ${airport.fullNameJa} 発着セールを自動収集しており、本ページで最新の最安便が確認できます。`,
    },
    {
      q: `${airport.fullNameJa}からどの路線が人気？`,
      a: `${airport.fullNameJa}から特に利用が多いのは ${popularDestinations
        .slice(0, 4)
        .map((d) => d.name)
        .join(
          "、",
        )} 行きです。${airport.size === "major" ? "国内主要都市と国際線の選択肢が豊富。" : "羽田・新千歳・那覇・福岡などの主要空港経由で全国アクセス可能。"}`,
    },
    {
      q: `${airport.fullNameJa}にはどの航空会社が就航？`,
      a: `${airport.fullNameJa}に就航している主な航空会社は ${airport.airlines.join("、")} です。各社のセール情報は BEATRIPの「航空会社セール」セクションでもまとめてご覧いただけます。`,
    },
    {
      q: `${airport.fullNameJa} と最寄り市街地のアクセスは？`,
      a: `${airport.size === "major" ? "リムジンバス・電車などで30〜60分。" : "リムジンバス・タクシーなどでアクセス可能（所要時間は空港により異なる）。"}空港公式サイトで最新ダイヤを確認してください。`,
    },
  ];

  const airportJsonLd = {
    "@context": "https://schema.org",
    "@type": "Airport",
    name: airport.fullNameJa,
    alternateName: airport.nameEn,
    iataCode: airport.iata,
    address: {
      "@type": "PostalAddress",
      addressRegion: airport.prefecture,
      addressCountry: "JP",
    },
    image: "https://beatrip.jp/opengraph-image",
    containedInPlace: {
      "@type": "AdministrativeArea",
      name: airport.prefecture,
    },
    url: `https://beatrip.jp/airports/${airport.iata}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://beatrip.jp/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "空港",
        item: "https://beatrip.jp/airports",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: airport.fullNameJa,
        item: `https://beatrip.jp/airports/${airport.iata}`,
      },
    ],
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(airportJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      {/* Hero (no image, gradient with airport branding) */}
      <section className="relative bg-gradient-to-br from-sky-900 via-sky-700 to-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-10">
          <Breadcrumbs
            variant="dark"
            currentPath={
              lang === "en"
                ? `/en/airports/${airport.iata}`
                : `/airports/${airport.iata}`
            }
            items={[
              { label: "Home", href: "/" },
              { label: "空港", href: "/airports" },
              { label: airport.fullNameJa },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold ${sizeBadge.cls}`}
            >
              {sizeBadge.label}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-white/80">
              <MapPin className="h-3 w-3" />
              {airport.prefecture} · {airport.region}
            </span>
          </div>
          <h1 className="mt-3 font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            {airport.fullNameJa}
          </h1>
          <p className="mt-1 font-mono text-sm tracking-wider text-white/70 sm:text-base">
            ({airport.iata})
          </p>
          {airport.tagline && (
            <p className="mt-3 text-sm sm:text-base text-white/90 max-w-2xl">
              {airport.tagline}
            </p>
          )}
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-8">
            {/* 関連 deals */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-2xl">
                  {airport.nameJa}発着の最新セール
                </h2>
              </div>
              {relatedDeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedDeals.map((deal) => {
                    const airline = getAirlineByCode(deal.airline_id);
                    return (
                      <Link
                        key={deal.id}
                        href={`/deals/${deal.id}`}
                        className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
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
                                {deal.airline_name} {deal.sale_name}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-heading text-lg leading-none text-zinc-900 dark:text-zinc-100">
                              ¥{deal.sale_price.toLocaleString()}
                            </div>
                            <div className="flex items-center justify-end gap-0.5 text-rose-500 text-[10px] mt-0.5">
                              <TrendingDown className="h-2.5 w-2.5" />-
                              {deal.discount_percent}%
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
                  <p className="text-sm text-zinc-500">
                    現在 {airport.nameJa}{" "}
                    発着のアクティブセールはありません。BEATRIPでは毎日新セールを収集しています。
                  </p>
                  <Link
                    href="/"
                    className="mt-3 inline-block text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                  >
                    すべてのセールを見る →
                  </Link>
                </div>
              )}
            </section>

            {/* 人気路線 */}
            {popularDestinations.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-2xl">
                  {airport.nameJa}発の人気路線
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {popularDestinations.map((dest) => (
                    <Link
                      key={dest.iata}
                      href={`/routes/${airport.iata}-${dest.iata}`}
                      className="group rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono text-zinc-400">
                            {airport.iata} → {dest.iata}
                          </div>
                          <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {dest.name}
                          </div>
                        </div>
                        <ArrowRight className="h-3 w-3 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 就航航空会社 */}
            {airlineLinks.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-2xl">
                  主要就航航空会社
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {airlineLinks.map(({ code, info }) => (
                    <Link
                      key={code}
                      href={`/airlines/${code}`}
                      className="group flex items-center gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                    >
                      {info?.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={info.logo}
                          alt=""
                          className="h-7 w-7 flex-shrink-0 rounded object-contain"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                          {info?.name}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400">
                          {code}
                        </div>
                      </div>
                      <ArrowUpRight className="ml-auto h-3 w-3 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-2xl">
                よくある質問
              </h2>
              <FAQAccordion items={faqs} />
            </section>

            {/* おすすめホテル (該当エリア) */}
            {hotelCitySlugs.length > 0 && (
              <CompactHotelsRecommendation
                citySlugs={hotelCitySlugs}
                title={`${airport.nameJa}周辺のおすすめホテル`}
                subtitle="編集者が選ぶ代表的なホテル。複数の予約サイトを横断比較できます。"
                maxHotels={4}
              />
            )}

            {/* 近隣の空港 (同一都道府県) */}
            {nearbyAirports.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-2xl">
                  {airport.prefecture}の近隣空港
                </h2>
                <div className="flex flex-wrap gap-2">
                  {nearbyAirports.map((a) => (
                    <Link
                      key={a.iata}
                      href={`/airports/${a.iata}`}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {a.nameJa}
                      <span className="font-mono text-zinc-400">{a.iata}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 関連リンク: 同地域の他空港 */}
            {regionAirports.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-2xl">
                  {airport.region}の他の空港
                </h2>
                <div className="flex flex-wrap gap-2">
                  {regionAirports.map((a) => (
                    <Link
                      key={a.iata}
                      href={`/airports/${a.iata}`}
                      className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-1 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {a.nameJa}
                      <span className="font-mono text-zinc-400">{a.iata}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            {/* 関連ホテル都市があれば誘導 */}
            {hotelSlug && (
              <Link
                href={`/hotels/${hotelSlug}`}
                className="group block rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                      {airport.nameJa}周辺のホテル
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      エリア別の代表ホテル・最安値検索
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                      ホテルを見る
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </Link>
            )}

            <JapanesePartnersPanel
              title={`${airport.nameJa}発の比較・予約`}
              subtitle="航空券・ホテル・レンタカーを厳選サイトで比較"
              categories={aspCategories}
              destinationCode={airport.iata}
              source="airport-hub"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
