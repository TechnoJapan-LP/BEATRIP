import type { Metadata } from "next";
import Link from "next/link";
import {
  Plane,
  Mountain,
  ArrowRight,
  Sunrise,
  TicketPercent,
  RouteOff,
  CalendarClock,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { AIRPORTS, type AirportRegion } from "@/data/airports";
import { getActiveDeals } from "@/lib/deals/deal-service";
import type { DealSchema } from "@/data/deal-schema";

// ISR: 21600秒キャッシュ (6時間)
export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  const title =
    "地方発の格安航空券特集｜北海道・東北・九州・四国から | BEATRIP";
  const description =
    "東京・大阪以外、地方空港発の格安航空券を一覧。仙台・札幌・福岡・那覇・松山・旭川など 45 空港の最新セールを region 別に集約。";
  return {
    title,
    description,
    keywords: [
      "地方発",
      "格安航空券",
      "地方空港",
      "地方便",
      "LCC",
      "Peach",
      "Skymark",
      "AIRDO",
      "札幌発",
      "仙台発",
      "福岡発",
      "那覇発",
      "松山発",
    ],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: "https://beatrip.jp/local-flights",
      languages: {
        ja: "https://beatrip.jp/local-flights",
        en: "https://beatrip.jp/en/local-flights",
        "x-default": "https://beatrip.jp/local-flights",
      },
    },
  };
}

// 表示順 (北→南)
const REGION_ORDER: AirportRegion[] = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州",
  "沖縄",
];

// 関東・近畿は「地方発」テーマ的に主要ハブ (HND/NRT/KIX/ITM) を除外し、地方扱いの空港のみ
const EXCLUDE_IATA = new Set(["HND", "NRT", "KIX", "ITM"]);

const REGION_TAGLINE: Record<AirportRegion, string> = {
  北海道: "新千歳を起点に、函館・旭川・釧路など道内の地方便も豊富",
  東北: "仙台ハブと青森・秋田・山形・花巻・福島の地方便",
  関東: "首都圏第三の茨城空港から LCC 中心の格安便",
  中部: "セントレア・新潟・小松・静岡・富山・小牧の中部発路線",
  近畿: "神戸発のスカイマーク・Peach を中心とした関西の地方発",
  中国: "広島・岡山・出雲・米子・鳥取・山口宇部・岩国の中国地方",
  四国: "松山・高松・高知・徳島の四国 4 県すべての空港から",
  九州: "福岡ハブと長崎・熊本・大分・宮崎・鹿児島・北九州・佐賀",
  沖縄: "那覇を起点に石垣・宮古へ。離島巡りも地方発で完結",
};

const TIPS: { icon: typeof Sunrise; title: string; body: string }[] = [
  {
    icon: TicketPercent,
    title: "LCC 直行便を狙う",
    body: "Peach・Jetstar・Skymark・AIRDO・Solaseed・StarFlyer など、地方空港発でも LCC・MCC の直行便が増えています。FSC (ANA/JAL) の正規運賃と比べ往復で 1-3 万円安くなることも多く、まず LCC 在庫から探すのが基本です。",
  },
  {
    icon: Sunrise,
    title: "早朝・深夜便で大幅割引",
    body: "地方空港発の早朝 6 時台・夜 21 時以降の便は通常便より 20-40% 安いことが多く、北九州空港のような 24 時間運用空港なら深夜便も選択肢に。送迎やリムジンバスの始発・終発時刻の確認は忘れずに。",
  },
  {
    icon: RouteOff,
    title: "路線統廃合に注意",
    body: "地方→地方便は搭乗率次第で減便・運休になることがあり、季節運航のみの路線も多数。羽田・伊丹・福岡経由の乗継便が必要なケースも珍しくないため、購入前に運航期間・曜日を必ず確認してください。",
  },
  {
    icon: CalendarClock,
    title: "帰省・離島の繁忙期を外す",
    body: "お盆 (8/10-16)・年末年始 (12/28-1/4)・GW は地方便こそ料金が跳ね上がります。前後 1 週間ずらすだけで往復 2-5 万円違うことも。ハイシーズンを避けて平日出発・日曜帰着のパターンが地方発では特に効きます。",
  },
];

const FAQS = [
  {
    q: "地方発で安く航空券を取るコツは？",
    a: "(1) Peach・Jetstar・Skymark・AIRDO・Solaseed・StarFlyer など LCC・MCC の在庫を最初に確認、(2) 早朝・深夜便を狙う、(3) 火・水・土の出発便を選ぶ、(4) 出発 60-90 日前に予約、(5) 各 LCC の定期セール (Peach の Tuesday Sale、Jetstar の Friday Sale など) を活用、の 5 点が基本です。BEATRIP では地方空港 45 箇所の最新セール価格を航空会社横断で比較できます。",
  },
  {
    q: "地方→地方の直行便はある？",
    a: "あります。代表的なのは仙台-福岡 (ANA/JAL/Peach)、新千歳-那覇 (Peach/AIRDO)、福岡-那覇 (ANA/JAL/Peach/SNA)、新千歳-福岡 (ANA/JAL/APJ/JJP) など。ただし地方間の便は本数が限られ、季節運航や週数便のみの路線もあります。直行便がない場合は羽田・伊丹・福岡・新千歳・那覇のいずれかでの乗継が一般的です。",
  },
  {
    q: "地方発の LCC は信頼できる？",
    a: "Peach・Jetstar Japan・Spring Japan・Skymark などの LCC・MCC は国土交通省の認可を受けた定期航空会社で、整備・運航品質は FSC (ANA/JAL) と同じ基準で管理されています。注意点としては、(1) 機材繰りで欠航時の振替便が少ない、(2) 受託手荷物・座席指定が別料金、(3) 空港カウンター閉鎖時刻が早い、の 3 点。時間に余裕を持ち、必要なオプションを事前に把握しておけば問題なく利用できます。",
  },
  {
    q: "主要空港経由 vs 地方直行、どっちが得？",
    a: "目的地と日程次第ですが、(1) 直行便がある路線は時間・料金とも直行が有利、(2) 乗継便は 1-2 万円安くなることもあるが、空港間移動 (例: 羽田-成田) を挟むと安さが相殺、(3) 国際線へ接続する場合は羽田・成田・関空・中部経由が便数も多く乗継保証も得られやすい、というのが目安。地方→地方の短距離便なら直行を最優先、地方発の国際線なら主要空港経由が無難です。",
  },
  {
    q: "地方発の国際線はどこから飛ぶ？",
    a: "新千歳・仙台・新潟・小松・中部 (セントレア)・関西・神戸・広島・岡山・福岡・長崎・熊本・鹿児島・那覇・石垣などから国際線が運航しています。仁川 (ICN)・台北 (TPE)・上海 (PVG)・香港 (HKG) など東アジア路線が中心で、関西・中部・福岡からはバンコク・シンガポール・ホノルル等の中長距離便も。地方空港の国際線は LCC (Peach・Tigerair Taiwan・Jeju Air 等) のセールが特に狙い目です。",
  },
];

type RegionStats = {
  region: AirportRegion;
  airports: typeof AIRPORTS;
  dealCount: number;
  cheapest: DealSchema | undefined;
};

function buildRegionStats(deals: DealSchema[]): RegionStats[] {
  return REGION_ORDER.map((region) => {
    const airports = AIRPORTS.filter(
      (a) => a.region === region && !EXCLUDE_IATA.has(a.iata)
    );
    const codes = new Set(airports.map((a) => a.iata));
    const regionDeals = deals.filter((d) => codes.has(d.origin_code));
    const cheapest = regionDeals
      .slice()
      .sort((a, b) => a.total_cost - b.total_cost)[0];
    return {
      region,
      airports,
      dealCount: regionDeals.length,
      cheapest,
    };
  });
}

function formatJPY(n: number): string {
  return `¥${n.toLocaleString("ja-JP")}`;
}

export default async function LocalFlightsPage() {
  const deals = await getActiveDeals();
  const regionStats = buildRegionStats(deals);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "地方発の格安航空券特集｜北海道・東北・九州・四国から",
    description:
      "東京・大阪以外、地方空港発の格安航空券を region 別に集約。LCC 直行便・早朝深夜便・路線統廃合の注意点まで、地方発ならではの選び方を解説。",
    inLanguage: "ja-JP",
    datePublished: "2026-06-07",
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: "BEATRIP", url: "https://beatrip.jp" },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    image: "https://beatrip.jp/opengraph-image",
    mainEntityOfPage: "https://beatrip.jp/local-flights",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
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
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-500 to-sky-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl h-full flex flex-col justify-end px-4 sm:px-6 pb-8">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "地方発の格安航空券" },
            ]}
          />
          <div className="mt-4 flex items-center gap-3 mb-2">
            <Plane className="h-7 w-7 text-emerald-100" />
            <Mountain className="h-6 w-6 text-sky-100" />
            <p className="text-[11px] font-bold tracking-widest uppercase text-emerald-100">
              Local Airports Flight Deals
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide text-white uppercase sm:text-5xl lg:text-6xl">
            地方発の格安航空券
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90 max-w-2xl">
            東京・大阪以外、お住まいの地域から最安便を探す。9 地方 45 空港のセール情報をまとめて比較。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* region 別カード */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                地方別の発着空港
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                お住まいの地方を選んで、地元空港発の最新セールをチェック
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regionStats.map(({ region, airports, dealCount, cheapest }) => (
                  <div
                    key={region}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex flex-col"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {region}
                      </h3>
                      <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-300">
                        {dealCount} 件のセール
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                      {REGION_TAGLINE[region]}
                    </p>

                    {cheapest && (
                      <div className="mt-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 px-3 py-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-200">
                          最安セール
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-700 dark:text-zinc-200">
                          {cheapest.origin} → {cheapest.destination}
                        </p>
                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-200">
                          {formatJPY(cheapest.total_cost)}
                          <span className="ml-1 text-[10px] font-normal text-zinc-500">
                            総額 / {cheapest.airline_name}
                          </span>
                        </p>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {airports.slice(0, 6).map((a) => (
                        <Link
                          key={a.iata}
                          href={`/airports/${a.iata.toLowerCase()}`}
                          className="rounded-full bg-sky-50 dark:bg-sky-900/30 px-2 py-0.5 text-[10px] text-sky-700 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors"
                        >
                          {a.nameJa}
                        </Link>
                      ))}
                      {airports.length > 6 && (
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-500">
                          +{airports.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 地方便ならではの選び方 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                地方便ならではの選び方
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIPS.map((t) => (
                  <div
                    key={t.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <t.icon className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {t.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {t.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                地方発のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/airports"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    空港一覧 (全 45 空港)
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    各空港の就航路線・航空会社・特徴をハブページから確認
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    空港ハブを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/okinawa"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    沖縄旅行ガイド
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    本島・宮古・石垣・西表・久米の総合ガイドと予約比較
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    沖縄特集を見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/package-tour"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    パッケージツアー
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    航空券＋ホテルセットでさらにお得。地方発ツアーも豊富
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ツアーを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/hotels"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-sky-200 dark:hover:border-sky-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    国内ホテル
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    目的地のホテルも一括予約。航空券との同時手配で時短
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ホテルを探す
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー: 地方発 partner */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="地方発の航空券・ツアー予約"
              subtitle="航空券・パッケージ・ホテル・レンタカーを比較"
              categories={[
                "flight-domestic",
                "tour-package",
                "hotel-domestic",
                "rental-car",
              ]}
              source="local-flights-landing"
            />

            <JapanesePartnersPanel
              title="鉄道・バス・現地レジャー"
              subtitle="航空券以外の移動手段とアクティビティも比較"
              categories={[
                "rail-domestic",
                "bus-domestic",
                "activity-domestic",
              ]}
              source="local-flights-landing"
            />
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
