import type { Metadata } from "next";
import Link from "next/link";
import {
  BedDouble,
  BarChart3,
  Calendar,
  Globe2,
  Coins,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { CATEGORY_GRADIENTS } from "@/lib/theme/category-gradients";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";
import { OG_IMAGES } from "@/lib/seo/og";

// ISR: 21600 秒キャッシュ (6時間)
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = isEn
    ? "OTA hotel-sale guide — Booking, Agoda, Trip.com, Rakuten compared"
    : "OTA セール完全ガイド｜Booking/楽天/Agoda/じゃらん 徹底比較";
  const description = isEn
    ? "All the major hotel OTA sales in one place. Compare Booking.com, Trip.com, Rakuten Travel, Agoda, Jalan, Yahoo Travel, Ikyu, and Expedia by strengths and reward points, plus a month-by-month sale calendar that tells you when, where, and how to book."
    : "ホテル予約サイト (OTA) のセール時期・料金比較・ポイント還元を 1 ページに集約。Booking.com / Trip.com / 楽天トラベル / Agoda / じゃらん / Yahoo!トラベル / 一休.com / Expedia など主要 OTA の特徴と月別キャンペーンカレンダーで「いつ・どこで・どう予約するか」が分かるガイド。";
  const path = isEn ? "/en/ota-sales" : "/ota-sales";
  return {
    title,
    description,
    keywords: isEn
      ? [
          "OTA hotel sale",
          "Booking.com sale",
          "Agoda sale",
          "Trip.com sale",
          "Rakuten Travel super sale",
          "hotel sale comparison",
          "best time to book hotel",
          "lowest hotel price",
        ]
      : [
          "OTA セール",
          "OTA 比較",
          "ホテル予約サイト 比較",
          "Booking キャンペーン",
          "楽天トラベル スーパーセール",
          "Agoda セール",
          "じゃらん セール",
          "ホテル予約 安い時期",
          "ホテル 最安値",
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
        ja: "https://beatrip.jp/ota-sales",
        "x-default": "https://beatrip.jp/ota-sales",
      },
    },
  };
}

type Coverage = "海外中心" | "国内中心" | "国内・海外";

type OtaRow = {
  name: string;
  url: string;
  strength: string;
  sale: string;
  coverage: Coverage;
  points: string;
};

const OTAS: OtaRow[] = [
  {
    name: "Booking.com",
    url: "https://www.booking.com/",
    strength: "世界最大の在庫量・無料キャンセル比率が高い",
    sale: "ブラックフライデー / Cyber Monday / 早割 (Early Bird)",
    coverage: "海外中心",
    points: "Genius 会員 10〜20% OFF / クレカ系特典",
  },
  {
    name: "Trip.com",
    url: "https://jp.trip.com/",
    strength: "アジア圏のホテルと航空券同時予約に強い",
    sale: "毎月 5/15/25 のスーパーセール / 季節大型セール",
    coverage: "国内・海外",
    points: "Trip Coins / 会員ランクで割引",
  },
  {
    name: "楽天トラベル",
    url: "https://travel.rakuten.co.jp/",
    strength: "楽天ポイント経済圏・国内宿泊数 No.1 級",
    sale: "楽天スーパーSALE (3/6/9/12 月) / 月初お得な10日間",
    coverage: "国内中心",
    points: "楽天ポイント 1〜10% / SPU 連動",
  },
  {
    name: "Agoda",
    url: "https://www.agoda.com/ja-jp/",
    strength: "アジア (タイ・韓国・台湾) のホテルが最安傾向",
    sale: "Insider Deals / 季節セール / Secret Deals",
    coverage: "海外中心",
    points: "AgodaCash / 会員価格",
  },
  {
    name: "じゃらんnet",
    url: "https://www.jalan.net/",
    strength: "国内宿 25,000 軒・温泉旅館の口コミ豊富",
    sale: "じゃらんスペシャルウィーク (1/4/8/11 月)",
    coverage: "国内中心",
    points: "Ponta / dポイント 2%",
  },
  {
    name: "Yahoo!トラベル",
    url: "https://travel.yahoo.co.jp/",
    strength: "PayPay 経済圏・国内宿泊で還元率が高い",
    sale: "ゾロ目の日 / PayPay 祭 / 月替わりクーポン",
    coverage: "国内中心",
    points: "PayPay ポイント 5〜20%",
  },
  {
    name: "一休.com",
    url: "https://www.ikyu.com/",
    strength: "高級ホテル・料亭旅館の特別プランに強い",
    sale: "一休.com セール (春・夏・冬) / タイムセール",
    coverage: "国内中心",
    points: "一休ポイント 3〜6% / プレミアサービス",
  },
  {
    name: "Expedia",
    url: "https://www.expedia.co.jp/",
    strength: "航空券＋ホテルのダイナミックパッケージが安い",
    sale: "メンバーシークレットセール / シーズナルセール",
    coverage: "国内・海外",
    points: "One Key (Hotels.com と共通) / 会員価格",
  },
  {
    name: "Hotels.com",
    url: "https://jp.hotels.com/",
    strength: "10 泊で 1 泊無料の「Hotels.com Rewards」",
    sale: "シークレットプライス / シーズナルセール",
    coverage: "国内・海外",
    points: "One Key (Expedia と共通)",
  },
  {
    name: "Travelist",
    url: "https://www.travelist.jp/",
    strength: "国内ホテル＋格安航空券の組み合わせに強い",
    sale: "月替わりキャンペーン / 期間限定クーポン",
    coverage: "国内中心",
    points: "なし (現金値引型)",
  },
  {
    name: "HIS",
    url: "https://www.his-j.com/",
    strength: "ツアー＋ホテルの店舗サポートが手厚い",
    sale: "決算セール (3/9 月) / 直前割",
    coverage: "国内・海外",
    points: "HIS ポイント / クレカ連携",
  },
  {
    name: "JTB",
    url: "https://www.jtb.co.jp/",
    strength: "国内最大手・大型施設の独自プラン多数",
    sale: "決算セール / 季節キャンペーン / 旅トク",
    coverage: "国内・海外",
    points: "JTB トラベルポイント",
  },
];

type MonthEntry = { month: string; deals: string[] };

const CALENDAR: MonthEntry[] = [
  {
    month: "1月",
    deals: [
      "楽天 お年玉セール (1〜3日) / 新春クーポン",
      "Agoda 新年セール / Insider Deals",
      "じゃらん スペシャルウィーク (中旬)",
    ],
  },
  {
    month: "2月",
    deals: [
      "Booking バレンタイン / 早春の海外セール",
      "Trip.com 旧正月セール (中華圏需要回避)",
      "一休.com 平日限定タイムセール",
    ],
  },
  {
    month: "3月",
    deals: [
      "楽天スーパーSALE (上旬)",
      "HIS / JTB 決算セール (年度末)",
      "春の旅セール (各社) / 桜シーズン直前",
    ],
  },
  {
    month: "4月",
    deals: [
      "じゃらん 春のスペシャルウィーク",
      "Agoda Easter / 春の海外ホテルセール",
      "Yahoo!トラベル 新生活クーポン",
    ],
  },
  {
    month: "5月",
    deals: [
      "GW 直前直後の在庫処分セール",
      "Trip.com 5/15/25 スーパーセール",
      "Booking 早夏セール (Summer Sale)",
    ],
  },
  {
    month: "6月",
    deals: [
      "楽天スーパーSALE (上旬)",
      "Booking Summer Sale (本格化)",
      "梅雨割・国内宿の平日プラン",
    ],
  },
  {
    month: "7月",
    deals: [
      "夏の大型セール (各社) / 早期予約割",
      "Agoda 夏のフラッシュセール",
      "Yahoo!トラベル PayPay 還元強化",
    ],
  },
  {
    month: "8月",
    deals: [
      "お盆前の最終在庫セール (8/10 前後)",
      "じゃらん スペシャルウィーク (お盆明け)",
      "一休.com 残暑タイムセール",
    ],
  },
  {
    month: "9月",
    deals: [
      "楽天スーパーSALE (上旬)",
      "HIS / JTB 中間決算セール",
      "Booking 秋の海外ホテルセール",
    ],
  },
  {
    month: "10月",
    deals: [
      "全国旅行 / 自治体クーポン併用シーズン",
      "Agoda Halloween / Insider Deals",
      "Trip.com 5/15/25 セール強化",
    ],
  },
  {
    month: "11月",
    deals: [
      "じゃらん スペシャルウィーク (11/11 前後)",
      "Booking ブラックフライデー (11月後半)",
      "Agoda / Hotels.com BFCM 早期割",
    ],
  },
  {
    month: "12月",
    deals: [
      "ブラックフライデー / Cyber Monday (12月初週)",
      "楽天スーパーSALE (上旬)",
      "年末カウントダウン / 年越し直前セール",
    ],
  },
];

type Pick = { icon: typeof BedDouble; title: string; body: string };

const PICKS: Pick[] = [
  {
    icon: Globe2,
    title: "海外ホテルなら Booking / Agoda",
    body: "在庫量と無料キャンセル比率が高い Booking.com、アジア圏の最安値が出やすい Agoda の 2 サイト併用が定番。同じ部屋でも 5〜15% 価格差が出ることがあるため必ず比較を。",
  },
  {
    icon: Coins,
    title: "ポイント重視なら 楽天 / Yahoo!",
    body: "楽天経済圏なら楽天トラベル + 楽天スーパーSALE + SPU 連動で実質 10% 以上、PayPay 派なら Yahoo!トラベルの「ゾロ目の日」「PayPay 祭」で 5〜20% 還元が狙えます。",
  },
  {
    icon: BedDouble,
    title: "国内大型施設なら じゃらん",
    body: "国内 25,000 軒の在庫量とリアルな口コミが武器。温泉旅館・大型ホテル・家族向け施設の独自プランは じゃらん限定が多く、Ponta / d ポイントとも連携。",
  },
  {
    icon: Sparkles,
    title: "高級ホテルなら 一休 / Trip.com",
    body: "一休.com は国内ラグジュアリーと料亭旅館の特別プランに強く、Trip.com は海外 5 つ星ホテルの会員価格が魅力。価格よりも体験重視ならこの 2 サイトを軸に。",
  },
];

const FAQS = [
  {
    q: "結局どの OTA が最安ですか？",
    a: "同じホテル・同じ部屋でも日付やセール時期によって OTA 間で 5〜20% 価格差が出ます。「常に最安の OTA」は存在せず、Booking.com・Agoda・楽天トラベル・Trip.com の 4 サイトを横並びで比較するのが基本。BEATRIP のホテルページからは複数 OTA の在庫を一括で確認できます。",
  },
  {
    q: "OTA セールはいつが本当に安いですか？",
    a: "国内宿は「楽天スーパーSALE (3/6/9/12 月上旬)」と「じゃらんスペシャルウィーク (1/4/8/11 月)」、海外ホテルは「Booking のブラックフライデー (11月後半〜12月初週)」と「Agoda の Insider Deals」が年間最安水準。逆に GW・お盆・年末年始の直前は値段が跳ね上がるため、繁忙期は 3〜6 ヶ月前の早期予約が安全です。",
  },
  {
    q: "OTA 予約とホテル直予約はどちらがお得？",
    a: "価格だけ見れば OTA セール時の方が安いケースが多いですが、ホテル直予約は「会員特典 (朝食無料・レイトチェックアウト等)」「変更柔軟性」「上級会員資格 (Marriott Bonvoy / Hilton Honors 等) の宿泊実績」が積めるメリットがあります。長期滞在・高級ホテルは直予約、短期・コスト重視は OTA が一般的なベストプラクティス。",
  },
  {
    q: "ポイント還元の仕組みはどうなっていますか？",
    a: "楽天トラベルは楽天ポイント 1〜10% (SPU で増減)、Yahoo!トラベルは PayPay ポイント 5〜20%、じゃらんは Ponta / d ポイント 2%、Booking は Genius 会員価格、Expedia / Hotels.com は共通プログラム「One Key」で還元。クレジットカードの決済ポイントと併せると実質還元率は 1〜25% まで広がります。",
  },
  {
    q: "OTA でキャンセルが必要になった場合は？",
    a: "予約時に「無料キャンセル可」のプランを選んでいれば、各 OTA のマイページから無料で取消できます (期限はホテル毎に異なる、通常 1〜7 日前まで)。「Non-Refundable」「キャンセル不可」プランは安い代わりに返金されないため、出張・繁忙期で予定変動が読めない場合は無料キャンセル可プランを選ぶのが鉄則。",
  },
  {
    q: "同じ部屋なのに OTA で値段が違うのはなぜですか？",
    a: "OTA ごとにホテルとの契約条件・手数料率・在庫枠 (アロットメント) が異なるためです。Booking は朝食付き、Agoda は朝食なし、楽天は禁煙確約など条件差で見かけ上の価格差が出ることも多いので、必ず「室料に何が含まれるか」を確認してから比較してください。",
  },
];

const CITY_LINKS: { code: string; name: string }[] = [
  { code: "tokyo", name: "東京" },
  { code: "osaka", name: "大阪" },
  { code: "kyoto", name: "京都" },
  { code: "fukuoka", name: "福岡" },
  { code: "sapporo", name: "札幌" },
  { code: "okinawa", name: "沖縄 (那覇)" },
];

const COVERAGE_BADGE: Record<Coverage, string> = {
  海外中心: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200",
  国内中心: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200",
  "国内・海外":
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200",
};

export default async function OtaSalesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const today = new Date().toISOString().split("T")[0];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "OTA セール完全ガイド｜Booking / Trip.com / 楽天 / Agoda / じゃらん 徹底比較",
    description:
      "ホテル予約サイト (OTA) のセール時期・料金比較・ポイント還元を 1 ページに集約したガイド。",
    inLanguage: "ja-JP",
    datePublished: "2026-06-08",
    dateModified: today,
    author: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
    },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: {
        "@type": "ImageObject",
        url: "https://beatrip.jp/logo.png",
      },
    },
    image: "https://beatrip.jp/opengraph-image",
    mainEntityOfPage: "https://beatrip.jp/ota-sales",
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

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "主要 OTA (ホテル予約サイト) 比較",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: OTAS.length,
    itemListElement: OTAS.map((o, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: o.name,
      url: o.url,
      description: `${o.strength}。主要セール: ${o.sale}。`,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Header />

      {/* Hero */}
      <section
        className={`relative bg-gradient-to-br ${CATEGORY_GRADIENTS.knowledge} text-white`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            currentPath={lang === "en" ? "/en/ota-sales" : "/ota-sales"}
            items={[
              { label: "Home", href: "/" },
              { label: "OTA セールガイド" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <BedDouble className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              OTA Sales Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            OTA セール完全ガイド
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            ホテル予約サイトの料金比較・セール時期一覧。 Booking / Trip.com /
            楽天 / Agoda / じゃらん など主要 12 社の特徴を、
            月別キャンペーンカレンダーと併せて整理しました。
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* 1. 5 大 OTA 比較表 */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl">
                  主要 OTA 比較表
                </h2>
              </div>
              <p className="text-sm text-zinc-500 mb-6">
                Booking / Trip.com / 楽天 / Agoda / じゃらん など 12
                社の強み・セール時期・ポイント還元
              </p>
              {/* モバイル: 縦積みカードリスト */}
              <ul className="sm:hidden divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                {OTAS.map((o) => (
                  <li key={`m-${o.name}`} className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={o.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-1 font-bold text-sm text-zinc-900 dark:text-zinc-100"
                      >
                        {o.name}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${COVERAGE_BADGE[o.coverage]}`}
                      >
                        {o.coverage}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {o.strength}
                    </p>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
                      <dt className="text-zinc-400 font-bold">セール時期</dt>
                      <dd className="text-zinc-700 dark:text-zinc-200">
                        {o.sale}
                      </dd>
                      <dt className="text-zinc-400 font-bold">ポイント</dt>
                      <dd className="text-zinc-700 dark:text-zinc-200">
                        {o.points}
                      </dd>
                    </dl>
                  </li>
                ))}
              </ul>

              {/* PC: 通常テーブル */}
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800">
                <table className="min-w-[820px] w-full text-xs sm:text-sm">
                  <thead className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-300">
                    <tr>
                      <th className="text-left font-bold px-4 py-3 whitespace-nowrap">
                        サービス
                      </th>
                      <th className="text-left font-bold px-4 py-3">強み</th>
                      <th className="text-left font-bold px-4 py-3 whitespace-nowrap">
                        主要セール時期
                      </th>
                      <th className="text-left font-bold px-4 py-3 whitespace-nowrap">
                        取扱範囲
                      </th>
                      <th className="text-left font-bold px-4 py-3 whitespace-nowrap">
                        ポイント還元
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {OTAS.map((o) => (
                      <tr key={o.name}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <a
                            href={o.url}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="inline-flex items-center gap-1 font-bold text-zinc-900 dark:text-zinc-100 hover:text-violet-600 dark:hover:text-violet-300"
                          >
                            {o.name}
                            <ArrowUpRight className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                          {o.strength}
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                          {o.sale}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${COVERAGE_BADGE[o.coverage]}`}
                          >
                            {o.coverage}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-300">
                          {o.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-zinc-400 mt-2">
                ※ セール時期は各 OTA
                の例年実績ベース。最新の開催は各社公式サイトをご確認ください。
              </p>
            </section>

            {/* 2. 月別 OTA セールカレンダー */}
            <section>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl">
                  月別 OTA セールカレンダー
                </h2>
              </div>
              <p className="text-sm text-zinc-500 mb-6">
                各月で開催されやすい主要キャンペーンを一覧化
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {CALENDAR.map((m) => (
                  <div
                    key={m.month}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                      {m.month}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {m.deals.map((d, i) => (
                        <li
                          key={i}
                          className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed flex gap-2"
                        >
                          <span className="text-zinc-300 dark:text-zinc-600">
                            •
                          </span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. OTA 選び方のコツ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                OTA 選び方のコツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PICKS.map((p) => (
                  <div
                    key={p.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <p.icon className="h-4 w-4 text-indigo-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {p.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {p.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                OTA セールのよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* 人気目的地のおすすめホテル */}
            <CompactHotelsRecommendation
              citySlugs={["tokyo", "osaka", "seoul", "bangkok"]}
              title="人気目的地のおすすめホテル"
              subtitle="OTA セール対象になりやすい都市の代表的なホテル。"
              maxHotels={4}
            />

            {/* 5. 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href="/hotels"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    都市別ホテルを探す
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    BEATRIP の主要都市別ホテル一覧
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-zinc-100">
                    ホテル一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/package-tour"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    パッケージツアー比較
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    航空券＋ホテルでさらにお得
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-zinc-100">
                    ツアー一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/cruise"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    クルーズ旅行ガイド
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    船旅・寄港地ホテルの併せ買いに
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-zinc-100">
                    クルーズ
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="ホテル予約サイトで比較"
              subtitle="国内・海外・高級・グランピングまで一括検索"
              categories={[
                "hotel-domestic",
                "hotel-luxury",
                "hotel-overseas",
                "hotel-glamping",
              ]}
              source="ota-sales-landing"
            />

            <JapanesePartnersPanel
              title="ツアー・航空券を併せて"
              subtitle="パッケージで予約するとさらにお得"
              categories={["tour-package", "tour-overseas", "flight-overseas"]}
              source="ota-sales-landing"
            />

            {/* 主要都市ホテルリンク */}
            <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
              <header className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  人気都市のホテル
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  BEATRIP のホテル都市別ページ
                </p>
              </header>
              <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {CITY_LINKS.map((c) => (
                  <li key={c.code}>
                    <Link
                      href={`/hotels/${c.code}`}
                      className="flex items-center justify-between px-5 py-2.5 text-xs text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <span className="font-bold">{c.name}</span>
                      <ArrowRight className="h-3 w-3 text-zinc-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
