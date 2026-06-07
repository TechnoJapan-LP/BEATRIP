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
import { airlines, getAirlineByCode } from "@/data/airlines";
import { AIRPORTS, getAirportByCode } from "@/data/airports";
import { cityNameJa } from "@/lib/airport-names";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { getHotelSlugByIata } from "@/data/hotel-destinations";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import type { AspCategory } from "@/lib/affiliate/asp-partners";

type Props = { params: Promise<{ code: string; iata: string }> };

// ISR: 3600秒キャッシュ (1時間)
export const revalidate = 3600;

/**
 * 航空会社 × 空港の組み合わせは爆発するため、
 * 「実際に airport.airlines にコードが含まれる」組合せのみ生成する。
 */
export function generateStaticParams() {
  const params: { code: string; iata: string }[] = [];
  for (const airline of airlines) {
    const servedAirports = AIRPORTS.filter((a) =>
      a.airlines.includes(airline.code),
    );
    for (const airport of servedAirports) {
      params.push({
        code: airline.code.toLowerCase(),
        iata: airport.iata,
      });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, iata } = await params;
  const airline = getAirlineByCode(code.toUpperCase());
  const airport = getAirportByCode(iata.toUpperCase());
  if (!airline || !airport) return { title: "Not Found" };

  const title = `${airline.name}の${airport.fullNameJa}発着セール・航空券情報 | BEATRIP`;
  const description = `${airline.name}（${airline.nameEn}）が${airport.fullNameJa}（${airport.iata}）で運航する航空券の最新セール情報・人気路線・予約サイト比較。${airport.tagline ?? ""}`;

  const canonical = `https://beatrip.jp/airlines/${airline.code.toLowerCase()}/airports/${airport.iata}`;

  return {
    title,
    description,
    keywords: [
      `${airline.name} ${airport.nameJa}`,
      `${airline.name} ${airport.fullNameJa}`,
      `${airline.name} ${airport.iata}`,
      `${airline.nameEn} ${airport.iata}`,
      `${airport.nameJa} ${airline.name} セール`,
      `${airport.nameJa} ${airline.name} 格安`,
    ],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical,
      languages: {
        ja: canonical,
        en: `https://beatrip.jp/en/airlines/${airline.code.toLowerCase()}/airports/${airport.iata}`,
        "x-default": canonical,
      },
    },
  };
}

export default async function AirlineAirportPage({ params }: Props) {
  const { code, iata } = await params;
  const airline = getAirlineByCode(code.toUpperCase());
  const airport = getAirportByCode(iata.toUpperCase());

  if (!airline || !airport) notFound();
  if (!airport.airlines.includes(airline.code)) notFound();

  const hotelSlug = getHotelSlugByIata(airport.iata);

  // 関連 deals: airline_id 一致 かつ origin/destination が当該空港
  const allDeals = await getActiveDeals();
  const relatedDeals = allDeals
    .filter(
      (d) =>
        d.airline_id === airline.code &&
        (d.origin_code === airport.iata ||
          d.destination_code === airport.iata),
    )
    .sort((a, b) => b.discount_percent - a.discount_percent)
    .slice(0, 8);

  // この空港の人気路線で、当該 airline が就航している宛先のみ抽出
  // (宛先空港マスタに airline コードが含まれる場合のみ "就航可能" と判断)
  const popularRoutesForAirline = airport.popularRoutes
    .map((destIata) => {
      const destAirport = getAirportByCode(destIata);
      return {
        iata: destIata,
        name: cityNameJa(destIata),
        served: destAirport
          ? destAirport.airlines.includes(airline.code)
          : false,
      };
    })
    .filter((r) => r.served)
    .slice(0, 6);

  // fallback: 就航判定で 0 件なら editorial に popularRoutes を全部出す
  const popularDisplay =
    popularRoutesForAirline.length > 0
      ? popularRoutesForAirline
      : airport.popularRoutes.slice(0, 6).map((destIata) => ({
          iata: destIata,
          name: cityNameJa(destIata),
          served: false,
        }));

  const aspCategories: AspCategory[] = [
    "flight-domestic",
    "hotel-domestic",
    "tour-package",
    "rental-car",
  ];

  const faqs = [
    {
      q: `${airline.name}は${airport.fullNameJa}発着のどのクラスを運航していますか？`,
      a: `${airline.name}（${airline.nameEn}）は${airline.type === "LCC" ? "LCC（格安航空会社）" : "フルサービスキャリア"}として${airport.fullNameJa}に就航しています。${airline.type === "LCC" ? "シンプルな運賃体系で、手荷物・座席指定はオプション扱いが基本です。" : "エコノミー〜上位クラスまで複数のサービスクラスを展開しており、座席指定・受託手荷物などが運賃に含まれます。"}最新の運航クラス・機材は ${airline.nameEn} 公式サイトでご確認ください。`,
    },
    {
      q: `${airline.name}の${airport.nameJa}発着セールはいつ開催されますか？`,
      a: `${airline.name}は年に複数回、季節の変わり目（春・夏休み前・年末年始前）や決算期（3月・9月）に大型セールを行う傾向があります。${airport.nameJa}発着便も対象になることが多いので、BEATRIPの本ページで最新のセール開催状況をご確認ください。タイムセールは数時間〜数日で売り切れるため、メール通知の登録もおすすめです。`,
    },
    {
      q: `${airport.fullNameJa}発の${airline.name}便で人気の路線は？`,
      a:
        popularDisplay.length > 0
          ? `${airport.nameJa}発で利用が多いのは ${popularDisplay
              .slice(0, 4)
              .map((d) => d.name)
              .join("、")} 行きです。${airline.name}はこれらの主要路線で複数便/日を運航することが多く、早割やセール対象になりやすい区間です。`
          : `${airport.nameJa}発の${airline.name}運航路線は時期によって変動します。最新のフライトスケジュールは公式予約サイトでご確認ください。`,
    },
    {
      q: `${airline.name}の航空券を予約するのにおすすめのサイトは？`,
      a: `最安値を狙うなら、まず ${airline.nameEn} 公式サイトと、楽天トラベル・じゃらん・Yahoo!トラベルなどの国内 OTA を横断比較するのが基本です。BEATRIP では本ページのサイドバーから主要予約サイトを一括比較できます。LCC の場合は公式直販が最安になりやすく、FSC（フルサービス）の場合はマイル特典やパッケージとの組合せで OTA が有利になるケースもあります。`,
    },
  ];

  // JSON-LD: Airline + FAQPage + Breadcrumb
  const airlineJsonLd = {
    "@context": "https://schema.org",
    "@type": "Airline",
    name: airline.name,
    alternateName: airline.nameEn,
    iataCode: airline.code,
    url: `https://beatrip.jp/airlines/${airline.code.toLowerCase()}/airports/${airport.iata}`,
    logo: airline.logo
      ? airline.logo.startsWith("http")
        ? airline.logo
        : `https://beatrip.jp${airline.logo}`
      : undefined,
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://beatrip.jp",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Airlines",
        item: "https://beatrip.jp/airlines",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: airline.name,
        item: `https://beatrip.jp/airlines/${airline.code.toLowerCase()}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: airport.fullNameJa,
        item: `https://beatrip.jp/airlines/${airline.code.toLowerCase()}/airports/${airport.iata}`,
      },
    ],
  };

  // 安全なグラデーション: airline.color が無効 / 暗すぎる場合のフォールバック
  const brandColor = airline.color || "#1d4ed8";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(airlineJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />

      {/* Hero: airline ブランドカラーのグラデ */}
      <section
        className="relative text-white"
        style={{
          background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}cc 50%, #1e3a8a 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-10">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Airlines", href: "/airlines" },
              { label: airline.name, href: `/airlines/${airline.code.toLowerCase()}` },
              { label: airport.fullNameJa },
            ]}
          />

          <div className="mt-6 flex items-center gap-4 flex-wrap">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/95 overflow-hidden flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={airline.logo}
                alt={airline.nameEn}
                className="h-10 w-10 object-contain"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-white/80">
                <MapPin className="h-3 w-3" />
                {airport.prefecture} · {airport.region}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                {airline.type === "LCC" ? "LCC" : "Full Service"} · {airline.country}
              </span>
            </div>
          </div>

          <h1 className="mt-4 font-heading text-2xl tracking-wide uppercase sm:text-4xl lg:text-5xl">
            {airline.name}
            <span className="mx-2 text-white/60">×</span>
            {airport.fullNameJa}
            <span className="ml-3 font-mono text-base text-white/70 sm:text-xl">
              ({airport.iata})
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/90 max-w-2xl">
            {airline.nameEn} が {airport.fullNameJa} で運航する航空券のセール・人気路線・予約サイト比較を集約。
            {airport.tagline ? ` ${airport.tagline}` : ""}
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-8">
            {/* 1. 関連 deals */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-2xl">
                  {airline.name} × {airport.nameJa}発着の最新セール
                </h2>
              </div>
              {relatedDeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {airline.logo && (
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
                            <TrendingDown className="h-2.5 w-2.5" />
                            -{deal.discount_percent}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 text-center">
                  <p className="text-sm text-zinc-500">
                    現在 {airline.name} の {airport.nameJa}{" "}
                    発着アクティブセールはありません。BEATRIPでは毎日新セールを収集しています。
                  </p>
                  <Link
                    href={`/airlines/${airline.code.toLowerCase()}`}
                    className="mt-3 inline-block text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                  >
                    {airline.name} のセール一覧を見る →
                  </Link>
                </div>
              )}
            </section>

            {/* 2. 人気路線 */}
            {popularDisplay.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-2xl">
                  {airline.name}の{airport.nameJa}発着 人気路線
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {popularDisplay.map((dest) => (
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
                {popularRoutesForAirline.length === 0 && (
                  <p className="mt-2 text-[11px] text-zinc-400">
                    ※ 当該空港で需要が大きい主要路線を参考表示しています。{airline.name} の実際の運航路線は時期により変動します。
                  </p>
                )}
              </section>
            )}

            {/* 3. 航空会社×空港の特徴 (editorial) */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-2xl">
                {airline.name} × {airport.nameJa} の特徴
              </h2>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                <p>
                  <strong className="text-zinc-900 dark:text-zinc-100">{airline.name}</strong>
                  （{airline.nameEn}・{airline.country}）は
                  {airline.type === "LCC"
                    ? "シンプルな運賃体系と早期予約割引が特徴のLCC（格安航空会社）"
                    : "サービス品質とネットワークに強みを持つフルサービスキャリア (FSC)"}
                  です。
                  {airport.tagline
                    ? `就航空港の${airport.nameJa}は「${airport.tagline}」と評される空港で、`
                    : `就航空港の${airport.fullNameJa}は${airport.region}の主要拠点で、`}
                  {airport.size === "major"
                    ? "国内線・国際線ともに便数が多く、乗継・最終便の選択肢も豊富です。"
                    : airport.size === "regional"
                      ? "地方の拠点空港として安定した便数があり、繁忙期には増便されるケースもあります。"
                      : "小規模ながら定期便が運航されており、地域へのアクセスを支える重要な空港です。"}
                </p>
                <p>
                  運航本数や機材構成は季節やダイヤ改正で変動します。
                  {airline.type === "LCC"
                    ? "LCC のため早朝・深夜便、または曜日限定運航のことが多く、予約タイミングで運賃が大きく変わります。"
                    : "ピーク時には機材を大型化する運用も見られ、繁忙期の予約は早めが安心です。"}
                  最新の運航計画は {airline.nameEn} 公式サイトと、本ページの最新セール情報を併せてご確認ください。
                </p>
              </div>
            </section>

            {/* 4. FAQ */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-2xl">
                よくある質問
              </h2>
              <FAQAccordion items={faqs} />
            </section>

            {/* 5. 関連リンク */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-2xl">
                関連ページ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <Link
                  href={`/airlines/${airline.code.toLowerCase()}`}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {airline.name} の全セール
                    </div>
                    <div className="text-[11px] text-zinc-500">航空会社ハブ</div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </Link>

                <Link
                  href={`/airlines/${airline.code.toLowerCase()}/sales`}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {airline.name} セール時期まとめ
                    </div>
                    <div className="text-[11px] text-zinc-500">過去実績・次回予測</div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </Link>

                <Link
                  href={`/airports/${airport.iata}`}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {airport.fullNameJa} 発着セール全社
                    </div>
                    <div className="text-[11px] text-zinc-500">他キャリアも比較</div>
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                </Link>

                {hotelSlug && (
                  <Link
                    href={`/hotels/${hotelSlug}`}
                    className="group flex items-center justify-between gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {airport.nameJa} 周辺のホテル
                      </div>
                      <div className="text-[11px] text-zinc-500">エリア別代表ホテル</div>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                  </Link>
                )}
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
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
              title={`${airline.name} × ${airport.nameJa} の比較・予約`}
              subtitle="航空券・ホテル・レンタカーを厳選サイトで比較"
              categories={aspCategories}
              destinationCode={airport.iata}
              source="airline-airport-hub"
            />
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
