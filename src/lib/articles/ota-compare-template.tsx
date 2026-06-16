/**
 * /articles/ota-compare/{city} 共通テンプレート
 *
 * 「{都市名} ホテル予約 Booking vs Agoda vs Trip.com vs Hotellook」の比較記事を
 * 都市ごとに同じ構造で出すための共通テンプレ。
 *
 * - 都市別の price hint / strength tilt（簡単な特性差）はあるが、
 *   実在しない数値を断言しないよう「目安」「傾向」表現を徹底。
 * - 各 OTA への CTA は `<HotelBookingButtons hotelName="" cityNameEn=... />` を再利用し、
 *   `analytics` 経由のクリック計測 + tp.media wrap を共通動線で活用。
 * - 末尾の curated hotel sec も既存の `CompactHotelsRecommendation` を流用。
 *
 * 制約:
 *  - 「最安サイト」と単一の断言はしない（旅程/時期で逆転するため）。
 *  - emoji 文字は使わない。
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BedDouble,
  Globe2,
  Coins,
  Sparkles,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { HotelBookingButtons } from "@/components/affiliate/hotel-booking-buttons";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";
import { PrNotice } from "@/components/compliance/pr-notice";
import {
  getHotelDestinationBySlug,
  type HotelDestination,
} from "@/data/hotel-destinations";

/** 4 大 OTA の特徴を中立的に整理 */
type OtaTilt = "low" | "mid" | "high";

type OtaCompareRow = {
  name: string;
  /** カラー（バッジ用） */
  accent: "blue" | "rose" | "sky" | "violet";
  /** 在庫の傾向（その都市での強さ） */
  inventoryTilt: OtaTilt;
  /** 価格競争力の一般的傾向 */
  priceTilt: OtaTilt;
  /** 都市別補足（必要に応じて override 可能） */
  cityNote?: string;
  /** 強み（共通） */
  strength: string;
  /** 弱み・注意 */
  caveat: string;
  /** キャンセル/手数料 */
  cancel: string;
};

const TILT_LABEL: Record<OtaTilt, string> = {
  low: "やや弱め",
  mid: "標準",
  high: "強い",
};

const TILT_COLOR: Record<OtaTilt, string> = {
  low: "text-zinc-500 dark:text-zinc-400",
  mid: "text-sky-700 dark:text-sky-300",
  high: "text-emerald-700 dark:text-emerald-300",
};

/**
 * 都市別の OTA 特性チューニング。
 * 一般論として広く言われている傾向のみを反映。固有数値は出さない。
 */
type CityOtaProfile = {
  /** OTA id ごとの inventory/price tilt の override（無指定はデフォルト値） */
  overrides?: Partial<
    Record<
      "booking" | "agoda" | "trip" | "hotellook",
      Pick<OtaCompareRow, "inventoryTilt" | "priceTilt" | "cityNote">
    >
  >;
  /** トップに置くハイライト文（H1 下のリード文） */
  lede: string;
  /** 「あなたに合うサイト」3 セグメントの補足 */
  segments: {
    budget: string;
    premium: string;
    instant: string;
  };
  /** 価格相場（円, 1 泊目安）— hotel-destinations の priceFromJpy をそのまま使う */
  priceFromJpyOverride?: number;
};

const DEFAULT_ROWS: OtaCompareRow[] = [
  {
    name: "Booking.com",
    accent: "blue",
    inventoryTilt: "high",
    priceTilt: "mid",
    strength:
      "世界最大級の在庫量。無料キャンセル/現地払いの選択肢が豊富で、Genius 会員割引が継続的に効く。",
    caveat: "セール時以外は他 OTA より少し高めなことも。為替次第。",
    cancel: "無料キャンセル可の物件が多い（プラン依存）。",
  },
  {
    name: "Agoda",
    accent: "rose",
    inventoryTilt: "high",
    priceTilt: "high",
    strength:
      "アジア圏に強く、Secret Deals / Insider Deals で底値を引きやすい。AgodaCash で再訪割引。",
    caveat:
      "返金不可レートを最安として提示しがち。条件を必ず確認。",
    cancel: "返金不可レートは原則変更不可。柔軟プランは別途用意。",
  },
  {
    name: "Trip.com",
    accent: "sky",
    inventoryTilt: "mid",
    priceTilt: "mid",
    strength:
      "航空券+ホテルのバンドル割引が強み。Trip Coins、会員ランクで継続的に値引。",
    caveat: "欧米独立系ホテルの在庫は他社に比べやや少なめ。",
    cancel: "プラン別。柔軟プランは若干高めの傾向。",
  },
  {
    name: "Hotellook",
    accent: "violet",
    inventoryTilt: "mid",
    priceTilt: "high",
    strength:
      "横断メタサーチで上記 3 社+地場 OTA を一括比較。「どこが最安か」を最短で確認できる。",
    caveat: "決済は遷移先 OTA 側。Hotellook 自体は予約を持たない。",
    cancel: "遷移先 OTA のポリシーに従う。",
  },
];

function applyCityProfile(
  rows: OtaCompareRow[],
  profile: CityOtaProfile,
): OtaCompareRow[] {
  return rows.map((r) => {
    const key = r.name.toLowerCase().split(".")[0] as
      | "booking"
      | "agoda"
      | "trip"
      | "hotellook";
    const o = profile.overrides?.[key];
    if (!o) return r;
    return {
      ...r,
      inventoryTilt: o.inventoryTilt ?? r.inventoryTilt,
      priceTilt: o.priceTilt ?? r.priceTilt,
      cityNote: o.cityNote ?? r.cityNote,
    };
  });
}

const ACCENT_BG: Record<OtaCompareRow["accent"], string> = {
  blue:
    "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800",
  rose: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800",
  sky: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-200 dark:ring-sky-800",
  violet:
    "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-900/30 dark:text-violet-200 dark:ring-violet-800",
};

export function buildOtaCompareMetadata(slug: string, lang: string = "ja"): Metadata {
  const d = getHotelDestinationBySlug(slug);
  if (!d) return { title: "Not Found" };
  const isEn = lang === "en";
  const title = isEn
    ? `${d.nameEn} hotels — Booking vs. Agoda vs. Trip.com (which is cheapest?)`
    : `${d.nameJa}のホテル Booking/Agoda/Trip.com 徹底比較 — 最安サイトはどれ?`;
  const description = isEn
    ? `Where to book ${d.nameEn} hotels at the lowest price. Our editors compare the four major OTAs (Booking.com, Agoda, Trip.com, Hotellook) with real price trends, cancellation rules, and per-site strengths.`
    : `${d.nameJa}のホテルを最安で予約するなら? 4 大 OTA (Booking.com / Agoda / Trip.com / Hotellook) を編集部が比較・推奨を解説。実際の価格傾向・キャンセル条件・特徴を一覧で。`;
  const path = isEn ? `/en/articles/ota-compare/${slug}` : `/articles/ota-compare/${slug}`;
  return {
    title,
    description,
    keywords: isEn
      ? [
          `${d.nameEn} hotel comparison`,
          `${d.nameEn} hotel booking sites`,
          `${d.nameEn} Booking.com`,
          `${d.nameEn} Agoda`,
          `${d.nameEn} Trip.com`,
          `cheapest hotels in ${d.nameEn}`,
          "hotel OTA comparison",
        ]
      : [
          `${d.nameJa} ホテル 比較`,
          `${d.nameJa} ホテル 予約 サイト`,
          `${d.nameJa} Booking.com`,
          `${d.nameJa} Agoda`,
          `${d.nameJa} Trip.com`,
          `${d.nameJa} 最安`,
          `${d.nameJa} OTA`,
          "ホテル予約サイト 比較",
        ],
    openGraph: { title, description, type: "article" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: `https://beatrip.jp/articles/ota-compare/${slug}`,
        "x-default": `https://beatrip.jp/articles/ota-compare/${slug}`,
      },
    },
  };
}

type Props = {
  /** ホテル都市スラッグ */
  slug: string;
  /** 言語（footer 用） */
  lang: string;
  /** 都市固有プロファイル */
  profile: CityOtaProfile;
};

export function OtaCompareCityPage({ slug, lang, profile }: Props) {
  const d = getHotelDestinationBySlug(slug);
  if (!d) return null;
  const rows = applyCityProfile(DEFAULT_ROWS, profile);
  const priceFrom =
    profile.priceFromJpyOverride ?? d.priceFromJpy ?? undefined;

  const faqs = [
    {
      q: `${d.nameJa}のホテルはどのサイトが最安ですか?`,
      a: `単一の「常に最安」サイトは存在しません。日付・部屋タイプ・会員ランク・セール時期で逆転します。Hotellook で横断比較してから、Booking.com / Agoda / Trip.com の各公式ページで最終価格 (税・サービス料込み) を見比べるのが効率的です。`,
    },
    {
      q: `Booking.com と Agoda はどちらが${d.nameJa}に向いていますか?`,
      a: `${d.region === "アジア" ? "アジア圏は Agoda の在庫・価格競争力がやや強い傾向ですが、" : ""}Booking.com は無料キャンセル可のプランが豊富で予定変更に強いのが特徴。柔軟性なら Booking、底値追求なら Agoda、というのが一般的な使い分けです。`,
    },
    {
      q: `Trip.com を選ぶメリットは?`,
      a: `航空券とホテルを同時予約するとバンドル割引が効くことが多く、Trip Coins や会員ランクの長期還元も継続的に効きます。${d.region === "アジア" ? `${d.nameJa}を含むアジア圏の在庫網も充実しています。` : ""}`,
    },
    {
      q: `Hotellook はどう使えばいいですか?`,
      a: `Hotellook 自体は予約サイトではなく「比較メタサーチ」。${d.nameJa}のホテル名や都市名で検索すると、Booking / Agoda / Trip.com 等の値段を横並びで表示してくれます。最安候補を 30 秒で絞り込みたいときに有効です。`,
    },
    {
      q: `キャンセル条件はどう確認すべき?`,
      a: `各 OTA とも「返金不可レート」を最安価格として強調表示する傾向があります。予定変更の可能性があるなら、表示価格より少し高くても「無料キャンセル可」プランを選ぶのが結局得です。${d.nameJa}は ${d.bestSeason} 周辺の繁忙期は変更不可レートでも当日争奪戦になりやすいため、早めの確保推奨。`,
    },
  ];

  // Article JSON-LD
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${d.nameJa}のホテル予約 Booking vs Agoda vs Trip.com vs Hotellook 徹底比較`,
    description: `${d.nameJa}で最安ホテルを予約するための 4 大 OTA 比較記事。`,
    inLanguage: "ja",
    about: {
      "@type": "TouristDestination",
      name: d.nameJa,
      alternateName: d.nameEn,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://beatrip.jp/articles/ota-compare/${slug}`,
    },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
    },
    image: d.image ? [d.image] : undefined,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header />

      {/* Hero — 文字主体（信頼性記事のため、写真でなく明確な比較表を上に） */}
      <section className="border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
          <Breadcrumbs
            currentPath={lang === "en" ? `/en/articles/ota-compare/${slug}` : `/articles/ota-compare/${slug}`}
            items={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/articles" },
              { label: "OTA 比較", href: "/articles/ota-compare/tokyo" },
              { label: d.nameJa },
            ]}
          />
          <h1 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl tracking-wide text-zinc-900 dark:text-zinc-100 leading-tight">
            {d.nameJa}のホテル予約
            <br className="sm:hidden" />
            <span className="text-zinc-500 dark:text-zinc-400"> Booking vs Agoda vs Trip.com vs Hotellook 徹底比較</span>
          </h1>
          <PrNotice className="mt-2" />
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {profile.lede}
          </p>
          {priceFrom !== undefined && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-300">
              <Coins className="h-3.5 w-3.5" aria-hidden="true" />
              {d.nameJa}の 1 泊相場目安: ¥{priceFrom.toLocaleString("ja-JP")}〜
              <span className="text-zinc-400">（3 つ星クラス）</span>
            </p>
          )}

          {/* Above-the-fold CTA: 4 OTA 横並びボタン（最重要） */}
          <div className="mt-5">
            <HotelBookingButtons
              hotelName=""
              cityNameEn={d.nameEn}
              destinationCode={d.iataCodes[0]}
              size="md"
            />
          </div>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 py-8 sm:py-10 space-y-10"
      >
        {/* 4 サイト比較表 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Globe2 className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
              4 サイト比較表
            </h2>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
            {d.nameJa}での在庫量・価格競争力・特徴を編集部が中立的に整理。
          </p>

          <p className="mb-2 text-[11px] text-zinc-400 sm:hidden" aria-hidden="true">
            ← 表は横にスクロールできます →
          </p>
          <div className="overflow-x-auto overscroll-x-contain rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="text-left border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                  <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">サイト</th>
                  <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">{d.nameJa}の在庫</th>
                  <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">価格傾向</th>
                  <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200">強み</th>
                  <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200">弱み / 注意</th>
                  <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200">キャンセル</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {rows.map((r) => (
                  <tr key={r.name} className="align-top">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ${ACCENT_BG[r.accent]}`}
                      >
                        {r.name}
                      </span>
                    </td>
                    <td className={`px-3 py-3 text-xs font-bold whitespace-nowrap ${TILT_COLOR[r.inventoryTilt]}`}>
                      {TILT_LABEL[r.inventoryTilt]}
                    </td>
                    <td className={`px-3 py-3 text-xs font-bold whitespace-nowrap ${TILT_COLOR[r.priceTilt]}`}>
                      {TILT_LABEL[r.priceTilt]}
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed min-w-[220px]">
                      {r.strength}
                      {r.cityNote && (
                        <span className="block mt-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                          {d.nameJa}固有: {r.cityNote}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed min-w-[180px]">
                      {r.caveat}
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed min-w-[160px]">
                      {r.cancel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-[11px] text-zinc-400 leading-relaxed">
            表中の「在庫」「価格傾向」は編集部による一般的な評価です。同じ条件でも日付・部屋・会員ランクで価格は逆転します。最終的には複数サイトの実価格を確認してください。
          </p>
        </section>

        {/* 結論: あなたに合うサイト 3 セグメント */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
              結論: あなたに合うサイト
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* コスパ */}
            <div className="rounded-2xl border border-rose-100 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-5 flex flex-col">
              <div className="text-[10px] font-bold tracking-widest uppercase text-rose-700 dark:text-rose-300">
                コスパ重視
              </div>
              <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Agoda + Hotellook
              </p>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
                {profile.segments.budget}
              </p>
              <HotelBookingButtons
                hotelName=""
                cityNameEn={d.nameEn}
                destinationCode={d.iataCodes[0]}
                className="mt-3"
              />
            </div>

            {/* プレミアム */}
            <div className="rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-5 flex flex-col">
              <div className="text-[10px] font-bold tracking-widest uppercase text-amber-700 dark:text-amber-300">
                プレミアム / 安心
              </div>
              <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Booking.com
              </p>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
                {profile.segments.premium}
              </p>
              <HotelBookingButtons
                hotelName=""
                cityNameEn={d.nameEn}
                destinationCode={d.iataCodes[0]}
                className="mt-3"
              />
            </div>

            {/* 即時 / バンドル */}
            <div className="rounded-2xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 p-5 flex flex-col">
              <div className="text-[10px] font-bold tracking-widest uppercase text-sky-700 dark:text-sky-300">
                即時予約 / 航空券セット
              </div>
              <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Trip.com
              </p>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed flex-1">
                {profile.segments.instant}
              </p>
              <HotelBookingButtons
                hotelName=""
                cityNameEn={d.nameEn}
                destinationCode={d.iataCodes[0]}
                className="mt-3"
              />
            </div>
          </div>
        </section>

        {/* 信頼性パネル */}
        <section>
          <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 className="font-heading text-base tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                編集部の見解
              </h2>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                BEATRIP は特定の OTA を一方的に推奨することはせず、{d.nameJa}を含む各都市での価格・在庫・予約条件を継続的に観測しています。本ページは {new Date().getFullYear()} 年時点の一般的な傾向に基づく比較で、実価格は日付・部屋タイプ・キャンペーンで変動します。最終確認は必ず各 OTA の予約直前画面 (税・サービス料込み合計) で行ってください。
              </p>
              <p className="mt-2 text-[11px] text-zinc-400">
                本記事のリンクの一部はアフィリエイト広告を含みます。掲載順は編集部の評価とコミッション率を総合的に考慮しており、価格や条件はリンク先で必ずご確認ください。
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
            よくある質問
          </h2>
          <FAQAccordion items={faqs} />
        </section>

        {/* 関連: 都市別ホテル + 都市 curated */}
        <section className="space-y-6">
          <CompactHotelsRecommendation
            citySlugs={[d.slug]}
            title={`${d.nameJa}の編集部おすすめホテル`}
            subtitle="比較に飽きたら、編集部選定のホテル候補から検討するのも近道です。"
            maxHotels={4}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              href={`/hotels/${d.slug}`}
              className="group flex items-center justify-between rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BedDouble className="h-5 w-5 text-zinc-500" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {d.nameJa}のホテル一覧へ
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    エリア解説・編集部の選定ホテル
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/ota-sales"
              className="group flex items-center justify-between rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ArrowUpRight className="h-5 w-5 text-zinc-500" aria-hidden="true" />
                <div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    OTA セールカレンダー
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Booking / 楽天 / Agoda / じゃらん の年間セール時期
                  </div>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-zinc-300 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}

export type { CityOtaProfile, HotelDestination };
