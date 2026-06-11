import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Plane,
  MapPin,
  ArrowRight,
  TrendingDown,
  Sunrise,
  Snowflake,
  Sun,
  Leaf,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";
import { getHotelCitiesForRegion } from "@/lib/hotels/area-hotel-mapping";
import { AIRPORTS, type AirportRegion, type Airport } from "@/data/airports";
import { cityNameJa } from "@/lib/airport-names";
import { getAirlineByCode } from "@/data/airlines";
import { getActiveDeals } from "@/lib/deals/deal-service";

type Props = { params: Promise<{ region: string; lang: string;}> };

// ISR: 1800秒キャッシュ (30分)
export const revalidate = 21600;

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

const SLUG_TO_REGION = Object.fromEntries(
  Object.entries(REGION_SLUGS).map(([k, v]) => [v, k]),
) as Record<string, AirportRegion>;

const REGION_GRADIENT: Record<AirportRegion, string> = {
  北海道: "from-blue-900 via-cyan-700 to-sky-500",
  東北: "from-indigo-900 via-violet-700 to-blue-500",
  関東: "from-zinc-900 via-zinc-700 to-zinc-500",
  中部: "from-amber-900 via-orange-700 to-yellow-500",
  近畿: "from-rose-900 via-rose-700 to-pink-500",
  中国: "from-teal-900 via-teal-700 to-emerald-500",
  四国: "from-lime-900 via-green-700 to-emerald-500",
  九州: "from-red-900 via-orange-700 to-amber-500",
  沖縄: "from-emerald-700 via-cyan-500 to-sky-400",
};

const REGION_OVERVIEW: Record<AirportRegion, string> = {
  北海道:
    "新千歳をハブに、函館・旭川・釧路・帯広・稚内・丘珠の計 6 空港。冬は降雪による欠航や季節運休便も多く、夏は新千歳発の国内線・国際線とも在庫が一気に増えます。道内航空 (HAC) の小型機が結ぶ離島・道東路線は地方発ならではの強みです。",
  東北:
    "仙台を最大ハブに、青森・秋田・山形・花巻・福島・庄内の 7 空港。仙台以外は便数が少なく、東京 (HND)・大阪 (ITM)・名古屋 (NGO) 経由の乗継便が多いのが特徴。FDA・IBEX が地方間路線で活躍し、雪まつり・桜・紅葉の繁忙期は早期予約が必須です。",
  関東:
    "首都圏 3 大空港のうち、地方発テーマでは茨城空港 (IBR) が中心。スカイマーク・Peach の格安便が新千歳・福岡・那覇・鹿児島へ就航し、東京駅から高速バス 100 分でアクセス可能。空港利用料 (PSFC) も他主要空港より安く設定されています。",
  中部:
    "セントレア (NGO) と県営名古屋 (NKM/小牧) に加え、新潟・小松・富山・静岡の地方空港。FDA が小牧を中部拠点に地方間路線を多数運航し、北陸新幹線開業後も小松・富山は東京・福岡・札幌・那覇への定期便を維持。富士山静岡からは台北・ソウル等の国際線もあります。",
  近畿:
    "関空 (KIX)・伊丹 (ITM) の 2 大ハブに、神戸空港 (UKB) が地方発の主役。神戸はスカイマーク・Peach・ANA が新千歳・那覇・鹿児島・石垣・茨城を結び、三宮駅からポートライナーで 18 分の好立地。発着枠拡大により今後も路線増の見込みです。",
  中国:
    "広島・岡山・米子・鳥取・出雲・山口宇部・岩国の 7 空港。新幹線が並行する区間でも、HIJ・OKJ の国際線 (台北・ソウル・上海) と離島・東京路線で需要を維持。出雲・米子は縁結び・水木しげる関連でテーマ性が強く、観光誘致 OK の地方便ブランドが定着しています。",
  四国:
    "松山・高松・高知・徳島の 4 県すべてに空港。松山と高松が地方拠点でジェットスター・Peach の LCC が東京・那覇・福岡へ就航。瀬戸大橋・しまなみ海道経由の鉄道アクセスより、航空便のほうが速く安いケースも多く、本州方面への需要は安定しています。",
  九州:
    "福岡を九州最大ハブに、北九州・佐賀・長崎・熊本・大分・宮崎・鹿児島・離島 (種子島/屋久島/奄美/与論) を含め充実。Peach・Jetstar・SFJ・SNA など九州拠点 LCC/MCC が多く、24 時間運用の北九州空港は深夜便も活用可能。離島路線は JAC が運航します。",
  沖縄:
    "那覇 (OKA) を起点に石垣 (ISG)・宮古 (MMY) の 3 空港。本土主要都市・台北・ソウル路線が中心で、Peach・JJP・SNA が LCC/MCC 価格帯を支えます。離島ホッピングは琉球エアコミューター (RAC) が運航。台風シーズン (8-10 月) は欠航リスクに注意。",
};

const REGION_SEASONS: Record<AirportRegion, string> = {
  北海道:
    "ベストシーズンは 6-9 月 (避暑・ラベンダー・知床)、12-2 月 (スノースポーツ・流氷)。航空券は 5 月・10-11 月のオフがおすすめ。",
  東北:
    "桜 (4 月)・夏祭り (8 月)・紅葉 (10-11 月)・蔵王樹氷 (1-2 月) が需要ピーク。狙い目は 6 月・9 月・1 月中旬以降の閑散期。",
  関東:
    "通年で需要が安定。地方発として茨城を使うなら、本土観光ベースのため特別なシーズン制約は少なめ。GW・お盆・年末年始だけ避ければ常に格安。",
  中部:
    "立山黒部 (4-5 月の雪の大谷)・北陸グルメ・富士登山 (7-8 月) が繁忙期。新潟は冬の雪国観光が人気。9-11 月・1-2 月の平日が狙い目。",
  近畿:
    "桜と紅葉の京都需要で 4 月・11 月が最繁忙。神戸発の地方便としては、5-6 月・9 月・1 月中旬が最も安く取れる時期です。",
  中国:
    "宮島・出雲大社・倉敷の通年観光に加え、瀬戸内国際芸術祭 (3 年に 1 度)・尾道桜の春・紅葉の秋がピーク。1-2 月と 6 月が比較的安い。",
  四国:
    "桜・道後温泉・四万十川は通年人気。お遍路シーズン (4-5 月、10-11 月) と祭り (8 月の阿波おどり) が繁忙。6 月梅雨時と 1-2 月が穴場。",
  九州:
    "桜の太宰府・湯布院温泉・桜島など通年需要。GW・お盆・正月以外は比較的安定価格。離島 (屋久島・奄美) は梅雨明け 7 月から繁忙期突入。",
  沖縄:
    "海開き (3 月下旬) から 9 月までが繁忙期で、特に夏休み・シルバーウィークがピーク。狙い目は 11-2 月のオフ (海なしでも観光は十分可能)。",
};

export function generateStaticParams() {
  return Object.values(REGION_SLUGS).map((slug) => ({ region: slug }));
}

const REGION_EN: Record<AirportRegion, string> = {
  北海道: "Hokkaido",
  東北: "Tohoku",
  関東: "Kanto",
  中部: "Chubu",
  近畿: "Kinki",
  中国: "Chugoku",
  四国: "Shikoku",
  九州: "Kyushu",
  沖縄: "Okinawa",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { region: slug, lang } = await params;
  const region = SLUG_TO_REGION[slug.toLowerCase()];
  if (!region) return { title: "Not Found" };

  const isEn = lang === "en";
  const airports = AIRPORTS.filter((a) => a.region === region);
  const repNamesJa = airports.slice(0, 3).map((a) => a.fullNameJa).join("・");
  const repNamesEn = airports.slice(0, 3).map((a) => a.nameEn).join(", ");
  const regionEn = REGION_EN[region];

  const title = isEn
    ? `Cheap flights from ${regionEn}, Japan — guide to airports and popular routes | BEATRIP`
    : `${region}発の格安航空券セール｜主要空港・人気路線完全ガイド | BEATRIP`;
  const description = isEn
    ? `Latest flight sales from airports in ${regionEn}, Japan (${repNamesEn}) — carriers serving the region, popular routes, and the best time to travel. Don't miss cheap fares out of regional Japan.`
    : `${region} (${repNamesJa}) 発着の最新セール情報、就航航空会社、人気路線、ベストシーズンを集約。地方発の格安便を見逃さない。`;
  const path = isEn ? `/en/local-flights/${slug}` : `/local-flights/${slug}`;

  return {
    title,
    description,
    keywords: isEn
      ? [
          `flights from ${regionEn}`,
          `${regionEn} airports`,
          `${regionEn} cheap flights`,
          `${regionEn} Japan LCC`,
          ...airports.slice(0, 6).map((a) => `${a.nameEn} flights`),
        ]
      : [
          `${region} 発 航空券`,
          `${region} LCC`,
          `${region} 格安`,
          `${region} 空港`,
          ...airports.slice(0, 6).map((a) => `${a.nameJa} セール`),
        ],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: `https://beatrip.jp/local-flights/${slug}`,
        en: `https://beatrip.jp/en/local-flights/${slug}`,
        "x-default": `https://beatrip.jp/local-flights/${slug}`,
      },
    },
  };
}

const SIZE_BADGE: Record<Airport["size"], { label: string; cls: string }> = {
  major: { label: "主要空港", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200" },
  regional: { label: "地方拠点", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200" },
  minor: { label: "地方/離島", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200" },
};

function formatJPY(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export default async function LocalFlightsRegionPage({ params }: Props) {
  const { region: slug, lang} = await params;
  const region = SLUG_TO_REGION[slug.toLowerCase()];
  if (!region) notFound();

  const airports = AIRPORTS.filter((a) => a.region === region);
  if (airports.length === 0) notFound();

  const hotelCitySlugs = getHotelCitiesForRegion(slug);

  const airportCodes = new Set(airports.map((a) => a.iata));
  const airlineCodes = Array.from(
    new Set(airports.flatMap((a) => a.airlines)),
  );

  // region 内空港 origin の deals (最大 8、安い順)
  const deals = await getActiveDeals();
  const regionDeals = deals
    .filter((d) => airportCodes.has(d.origin_code))
    .sort((a, b) => a.total_cost - b.total_cost)
    .slice(0, 8);

  // 人気路線: region 内空港の popularRoutes を集約・重複排除・上位 8
  const popularRoutesMap = new Map<string, { origin: Airport; destIata: string }>();
  for (const airport of airports) {
    for (const destIata of airport.popularRoutes) {
      const key = `${airport.iata}-${destIata}`;
      if (!popularRoutesMap.has(key)) {
        popularRoutesMap.set(key, { origin: airport, destIata });
      }
    }
  }
  const popularRoutes = Array.from(popularRoutesMap.values()).slice(0, 8);

  const faqs = [
    {
      q: `${region}発で安く航空券を取るコツは？`,
      a: `(1) ${airports
        .slice(0, 3)
        .map((a) => a.nameJa)
        .join("・")} など主要空港の LCC/MCC 在庫を最初に確認、(2) 早朝・深夜便を狙う、(3) 火・水・土の出発便を選ぶ、(4) 出発 60-90 日前に予約、(5) Peach・Jetstar・Skymark などの定期セール開催時を狙う、の 5 点が基本。BEATRIP では ${region} の全 ${airports.length} 空港の最新セール価格を航空会社横断で比較できます。`,
    },
    {
      q: `${region}から海外直行便はある？`,
      a: airports.some((a) => a.popularRoutes.some((r) => /^(ICN|TPE|PVG|BKK|HKG|HNL|SIN|KUL|JFK|LAX|CDG|LHR|FRA|AMS)$/.test(r)))
        ? `${region} の主要空港からは台北 (TPE)・ソウル (ICN)・上海 (PVG) など東アジア路線を中心に国際直行便があります。中長距離は便数が限られるため、関空・成田・羽田・中部経由が一般的です。`
        : `${region} 発の国際直行便は限定的で、多くは羽田・成田・関空・中部経由になります。地方発の国際線セールも BEATRIP では集約しているので、まずは主要ハブまでの国内乗継便を含めた総額で比較するのがおすすめです。`,
    },
    {
      q: `${region}の LCC・MCC は何が使える？`,
      a: `${region} の各空港に就航する主な LCC/MCC は ${airlineCodes
        .filter((c) => ["APJ", "JJP", "SKY", "AIRDO", "SNA", "SFJ", "ZIP", "JAC", "FDA", "IBX"].includes(c))
        .slice(0, 6)
        .join("、") || "Peach・Jetstar・Skymark など"} です。各社の運賃体系・受託手荷物料金・セール頻度を比較したうえで、目的地・日程に合うキャリアを選びましょう。`,
    },
    {
      q: `${region}の主要空港アクセスは？`,
      a: `${region} 内の主要空港 (${airports
        .slice(0, 3)
        .map((a) => a.fullNameJa)
        .join("・")}) は、いずれもリムジンバス・鉄道・タクシーで市街地から 30-60 分でアクセス可能。地方空港は駐車場代が安く、マイカー利用も現実的な選択肢です。空港公式サイトで最新ダイヤを確認してください。`,
    },
    {
      q: `${region}内の地方→地方便はある？`,
      a: airports.length >= 3
        ? `${region} 内の空港同士を結ぶ直行便は限られますが、地方拠点空港 (${airports.find((a) => a.size === "major")?.nameJa ?? airports[0].nameJa}) を経由すれば全国アクセス可能。FDA・JAC などのコミューター航空が地方間需要を支えています。`
        : `${region} は空港数が少ないため、地方間の直行便はほぼなく、東京・大阪・福岡・那覇等の主要ハブ経由が基本です。`,
    },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${region}発の格安航空券セール｜主要空港・人気路線完全ガイド`,
    description: `${region} 発着の最新セール情報、就航航空会社、人気路線、ベストシーズンを集約した地方発航空券ガイド。`,
    inLanguage: "ja-JP",
    datePublished: "2026-06-08",
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: "BEATRIP", url: "https://beatrip.jp" },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    image: "https://beatrip.jp/opengraph-image",
    mainEntityOfPage: `https://beatrip.jp/local-flights/${slug}`,
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

      {/* Hero */}
      <section className="relative h-[320px] sm:h-[400px] overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${REGION_GRADIENT[region]}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl h-full flex flex-col justify-end px-4 sm:px-6 pb-8">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "地方発の格安航空券", href: "/local-flights" },
              { label: region },
            ]}
          />
          <div className="mt-4 flex items-center gap-3 mb-2">
            <Plane className="h-7 w-7 text-white/90" />
            <MapPin className="h-6 w-6 text-white/80" />
            <p className="text-[11px] font-bold tracking-wider uppercase text-white/90">
              {region} Local Flight Deals
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide text-white uppercase sm:text-5xl lg:text-6xl">
            {region}発の格安航空券
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90 max-w-2xl">
            {region} の主要 {airlineCodes.length} 社 / {airports.length} 空港から最新セール
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* region 概要 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-3xl">
                {region}の地方便概要
              </h2>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {REGION_OVERVIEW[region]}
              </p>
            </section>

            {/* 空港一覧 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                {region}の空港一覧
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                各空港のハブページで就航航空会社・路線・セールを確認できます
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {airports.map((a) => {
                  const badge = SIZE_BADGE[a.size];
                  return (
                    <Link
                      key={a.iata}
                      href={`/airports/${a.iata}`}
                      className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono text-zinc-400">
                            {a.iata} · {a.prefecture}
                          </div>
                          <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:underline">
                            {a.fullNameJa}
                          </div>
                        </div>
                        <span
                          className={`inline-flex flex-shrink-0 items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      {a.tagline && (
                        <p className="mt-2 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                          {a.tagline}
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* region 内の最安セール */}
            <section id="deals" className="scroll-mt-24">
              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl">
                  {region}発の最新セール
                </h2>
              </div>
              {regionDeals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {regionDeals.map((deal) => {
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
                              {formatJPY(deal.sale_price)}
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
                    現在 {region} 発のアクティブセールはありません。BEATRIP では毎日新セールを収集しています。
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
            {popularRoutes.length > 0 && (
              <section>
                <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-3xl">
                  {region}発の人気路線
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {popularRoutes.map(({ origin, destIata }) => (
                    <Link
                      key={`${origin.iata}-${destIata}`}
                      href={`/routes/${origin.iata}-${destIata}`}
                      className="group rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[10px] font-mono text-zinc-400">
                            {origin.iata} → {destIata}
                          </div>
                          <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {origin.nameJa} → {cityNameJa(destIata)}
                          </div>
                        </div>
                        <ArrowRight className="h-3 w-3 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* おすすめホテル (該当エリア) */}
            {hotelCitySlugs.length > 0 && (
              <CompactHotelsRecommendation
                citySlugs={hotelCitySlugs}
                title={`${region}のおすすめホテル`}
                subtitle="飛行機と一緒に宿泊予約も。編集者が選ぶ代表的なホテル。"
                maxHotels={4}
              />
            )}

            {/* ベストシーズン */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3 sm:text-3xl">
                {region}のベストシーズン
              </h2>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="h-4 w-4 text-amber-500" />
                  <Leaf className="h-4 w-4 text-emerald-500" />
                  <Snowflake className="h-4 w-4 text-sky-500" />
                  <Sunrise className="h-4 w-4 text-rose-500" />
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    繁忙期と狙い目
                  </p>
                </div>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {REGION_SEASONS[region]}
                </p>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                {region}発のよくある質問
              </h2>
              <FAQAccordion items={faqs} />
            </section>

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/local-flights"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    地方発の格安航空券 (全 9 地方)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    北海道から沖縄まで、全国地方発の航空券セールを一覧
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    地方発トップへ
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/airports"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    空港ハブ一覧
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    全 45 空港の就航路線・航空会社・特徴を空港別に確認
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    空港ハブを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                {airports.slice(0, 2).map((a) => (
                  <Link
                    key={a.iata}
                    href={`/airports/${a.iata}`}
                    className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors"
                  >
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                      {a.fullNameJa} ({a.iata})
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      {a.tagline ?? `${a.prefecture} の代表空港。発着セール・人気路線を確認。`}
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                      空港ページを見る
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
              title={`${region}発の航空券・ツアー予約`}
              subtitle="航空券・パッケージ・ホテル・レンタカーを比較"
              categories={[
                "flight-domestic",
                "tour-package",
                "hotel-domestic",
                "rental-car",
              ]}
              source={`local-flights-${slug}`}
            />

            <JapanesePartnersPanel
              title="鉄道・バス・現地レジャー"
              subtitle="航空券以外の移動手段とアクティビティも比較"
              categories={[
                "rail-domestic",
                "bus-domestic",
                "activity-domestic",
              ]}
              source={`local-flights-${slug}`}
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
