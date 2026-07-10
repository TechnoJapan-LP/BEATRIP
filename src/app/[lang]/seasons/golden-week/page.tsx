import type { Metadata } from "next";
import Link from "next/link";
import { Sun, Calendar, Plane, Hotel, Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { CATEGORY_GRADIENTS } from "@/lib/theme/category-gradients";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";
import { OG_IMAGES } from "@/lib/seo/og";

// ISR: 21600秒キャッシュ (6時間)
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = isEn
    ? "Golden Week travel from Japan — 2026 booking guide for the lowest fares"
    : "GW (ゴールデンウィーク) の航空券・ホテル予約完全ガイド｜2026 最安タイミング";
  const description = isEn
    ? "How to book Golden Week (late April–early May) flights and hotels at the lowest price. Peak vs. shoulder dates, early-bird discounts, top destinations, and separate strategies for domestic and overseas trips."
    : "GW (4月末〜5月初旬) の航空券・ホテルを最安で取るコツ、人気目的地、ピークと底値、早期予約割引まで。国内・海外それぞれの戦略を網羅。";
  const path = isEn ? "/en/seasons/golden-week" : "/seasons/golden-week";
  return {
    title,
    description,
    keywords: isEn
      ? [
          "Golden Week Japan",
          "Golden Week travel 2026",
          "May flights Japan",
          "GW travel from Japan",
          "Japan May holidays",
          "Golden Week destinations",
        ]
      : [
          "GW 航空券",
          "ゴールデンウィーク 旅行",
          "GW ホテル",
          "GW 海外旅行",
          "GW 国内旅行",
          "5月 航空券 安い",
          "GW おすすめ 目的地",
          "GW 最安",
          "GW 早期予約",
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
        ja: "https://beatrip.jp/seasons/golden-week",
        "x-default": "https://beatrip.jp/seasons/golden-week",
      },
    },
  };
}

const CALENDAR: {
  range: string;
  level: "peak" | "high" | "mid" | "low";
  note: string;
}[] = [
  {
    range: "4/25 〜 4/28",
    level: "mid",
    note: "前半は平日も混在。月末平日狙いは比較的安め。",
  },
  {
    range: "4/29 〜 4/30",
    level: "high",
    note: "GW突入直前で出発便が急上昇。",
  },
  {
    range: "5/1 〜 5/5",
    level: "peak",
    note: "GW中核。航空券・ホテルとも年間最高値水準。",
  },
  {
    range: "5/6 〜 5/7",
    level: "high",
    note: "Uターン集中、復路便の高値ピーク。",
  },
  {
    range: "5/8 以降",
    level: "low",
    note: "通常料金に急落。前後ずらしで大幅節約可能。",
  },
];

const TIPS: { icon: typeof Calendar; title: string; body: string }[] = [
  {
    icon: Calendar,
    title: "3〜6ヶ月前予約",
    body: "GW は需要が読みやすく早割の恩恵が最大。国内航空券は1〜2月、海外便は前年12月〜2月までに押さえると最安帯。",
  },
  {
    icon: Plane,
    title: "前後の平日活用",
    body: "4/28 出発・5/7 帰着の有給活用パターンは数万円〜十数万円下がることも。完全カレンダー通りは最も高い。",
  },
  {
    icon: Clock,
    title: "中核日を1日ずらす",
    body: "5/3〜5 のピーク中央でなく 5/1出発・5/4帰着 など中核から1日でも外すと価格と混雑の両方で改善。",
  },
  {
    icon: Hotel,
    title: "キャンセル無料で仮押さえ",
    body: "ホテルは早期に押さえつつキャンセル無料プランで保険を。直前で値下がりすれば取り直すのが定石。",
  },
];

const DESTINATIONS: {
  area: string;
  type: "国内" | "海外";
  emoji: string;
  highlight: string;
}[] = [
  {
    area: "沖縄",
    type: "国内",
    emoji: "🌺",
    highlight: "梅雨入り前の最高シーズン。海開きも進み GW 国内人気No.1。",
  },
  {
    area: "北海道",
    type: "国内",
    emoji: "🌸",
    highlight: "本州より遅咲きの桜と新緑。GW でも比較的予約が取りやすい。",
  },
  {
    area: "台湾",
    type: "海外",
    emoji: "🇹🇼",
    highlight: "近距離・短期日程に最適。GW でも往復5万円台が狙える。",
  },
  {
    area: "ヨーロッパ",
    type: "海外",
    emoji: "🇪🇺",
    highlight: "GW＋有給で10日確保すれば現実的。気候も観光ベストシーズン。",
  },
  {
    area: "韓国",
    type: "海外",
    emoji: "🇰🇷",
    highlight: "2泊3日で行ける近距離。LCC のセール対象も多い。",
  },
  {
    area: "シンガポール",
    type: "海外",
    emoji: "🇸🇬",
    highlight: "通年安定気候・乗継便不要・GW でも家族向け定番。",
  },
];

const FAQS = [
  {
    q: "GW の航空券はいつから安くなりますか？",
    a: "復路は5月8日以降、往路は4月28日以前の便から通常料金に近づきます。5/1〜5/5のピーク日は3〜6ヶ月前の早期予約割引が最も有効。直前 (出発2週間以内) は LCC で残席が出ることもありますが価格は高止まりが一般的です。",
  },
  {
    q: "GW は国内と海外どちらがコスパ良いですか？",
    a: "5連休以下なら国内 (沖縄・北海道)、6日以上確保できるなら台湾・韓国・シンガポール、10日以上ならヨーロッパもおすすめ。海外は早期予約で航空券差額が大きいため、行き先より「いつ予約するか」のほうが総額に効きます。",
  },
  {
    q: "GW の直前予約でも間に合いますか？",
    a: "5/3〜5 のピーク日はほぼ満席か高値固定。一方、前後の平日 (4/28 や 5/7) を含むパターンは直前でもキャンセル戻りが出ます。価格より「行ける日があるか」が問題になりやすいので、複数候補を持って毎日チェックが現実的です。",
  },
  {
    q: "予約後にキャンセル料はいつから発生しますか？",
    a: "航空券は航空会社・運賃で異なり、LCC は予約直後から不可、フラッグキャリアは出発21日前まで無料運賃もあります。ホテルはキャンセル無料プランなら多くが出発3〜7日前まで無料。GW は規定が厳しめなので予約時に必ず確認を。",
  },
  {
    q: "GW の海外旅行で穴場はありますか？",
    a: "ジャパニーズGWは海外ではただの平日扱いの国も多く、現地ホテルは思ったほど高くなりません。韓国・台湾・シンガポール・ベトナム・タイなどアジア近郊は GW でも比較的取りやすく、ヨーロッパは航空券さえ早期予約できれば現地は通常料金です。",
  },
];

export default async function GoldenWeekSeasonPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "GW (ゴールデンウィーク) の航空券・ホテル予約完全ガイド｜2026 最安タイミング",
    description:
      "GW のピーク・底値カレンダー、予約のコツ、人気目的地、FAQ までを完全網羅した予約ガイド。",
    inLanguage: "ja-JP",
    datePublished: "2026-06-01",
    dateModified: new Date().toISOString().split("T")[0],
    author: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
    },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    image: "https://beatrip.jp/opengraph-image",
    mainEntityOfPage: "https://beatrip.jp/seasons/golden-week",
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

  const levelStyle: Record<string, string> = {
    peak: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
    high: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    mid: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30",
    low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  };
  const levelLabel: Record<string, string> = {
    peak: "ピーク",
    high: "高値",
    mid: "やや高",
    low: "底値",
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
      <section
        className={`relative bg-gradient-to-br ${CATEGORY_GRADIENTS.season} text-white`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            currentPath={
              lang === "en" ? "/en/seasons/golden-week" : "/seasons/golden-week"
            }
            items={[
              { label: "Home", href: "/" },
              { label: "季節特集", href: "/seasons/golden-week" },
              { label: "ゴールデンウィーク" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Sun className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Golden Week Travel 2026
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            GWの旅行予約
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            4月末〜5月初旬のピーク・底値カレンダー、最安タイミング、人気目的地まで完全網羅。
            早期予約と日程ずらしで GW の旅費を賢く抑えるためのガイドです。
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* ピーク時期カレンダー */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                GW ピーク時期カレンダー
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                5/1〜5/5 が最高値。前後の平日を絡めると料金が大きく下がります。
              </p>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {CALENDAR.map((c) => (
                    <div
                      key={c.range}
                      className="flex items-start gap-4 px-5 py-3"
                    >
                      <div className="w-36 flex-shrink-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                          {c.range}
                        </p>
                        <span
                          className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${levelStyle[c.level]}`}
                        >
                          {levelLabel[c.level]}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                        {c.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 予約のコツ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                GW 予約のコツ
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

            {/* 人気目的地 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                GW 人気目的地
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                国内2つ・海外4つの定番。気候とコスパで選ぶ GW の鉄板。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DESTINATIONS.map((d) => (
                  <div
                    key={d.area}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">{d.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {d.area}
                          </h3>
                          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-300">
                            {d.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                          {d.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                GW 旅行のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* GW 人気のおすすめホテル */}
            <CompactHotelsRecommendation
              citySlugs={["okinawa", "sapporo", "taipei", "seoul"]}
              title="GW に人気のホテル"
              subtitle="国内リゾートからアジアの王道まで、代表的なホテル。"
              maxHotels={4}
            />

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/okinawa"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    GWの沖縄
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    海開き直後のベストシーズン
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    沖縄ガイドを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/seasons/summer"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    次は夏休みの予約準備
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    7〜8月のピーク回避と早期予約
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    夏休みガイドを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="GWの予約・比較"
              subtitle="航空券・ホテル・ツアーをまとめて比較"
              categories={[
                "flight-domestic",
                "flight-overseas",
                "hotel-domestic",
                "tour-package",
              ]}
              source="seasons-golden-week"
            />

            <JapanesePartnersPanel
              title="海外・現地手配"
              subtitle="海外ホテル・ツアー・レンタカー"
              categories={["hotel-overseas", "tour-overseas", "rental-car"]}
              source="seasons-golden-week"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
