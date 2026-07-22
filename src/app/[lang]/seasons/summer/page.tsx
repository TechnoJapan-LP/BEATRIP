import type { Metadata } from "next";
import Link from "next/link";
import {
  Umbrella,
  Calendar,
  Plane,
  Hotel,
  Clock,
  ArrowRight,
} from "lucide-react";
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
    ? "Summer & Obon travel from Japan — July–August booking guide"
    : "夏休み・お盆の航空券・ホテル予約完全ガイド｜7月〜8月の最安タイミング";
  const description = isEn
    ? "How to book summer-vacation and Obon flights and hotels at the lowest price. Top beach and resort destinations, how to avoid the peak, plus picks for family trips and couples getaways."
    : "夏休み・お盆の航空券・ホテルを最安で取る方法、人気ビーチ・リゾート目的地、ピーク回避テクニック、家族・カップル別おすすめを網羅。";
  const path = isEn ? "/en/seasons/summer" : "/seasons/summer";
  return {
    title,
    description,
    keywords: isEn
      ? [
          "Japan summer travel",
          "Obon travel",
          "August flights Japan",
          "summer beach Japan",
          "Japan summer destinations",
          "family travel Japan summer",
        ]
      : [
          "夏休み 航空券",
          "お盆 航空券",
          "夏休み 旅行",
          "お盆 旅行",
          "夏休み 海外",
          "夏休み ビーチ",
          "8月 航空券 安い",
          "夏休み 家族旅行",
          "お盆 最安",
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
        ja: "https://beatrip.jp/seasons/summer",
        "x-default": "https://beatrip.jp/seasons/summer",
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
    range: "7/1 〜 7/19",
    level: "low",
    note: "夏休み突入前の通年水準。狙い目シーズン。",
  },
  {
    range: "7/20 〜 8/7",
    level: "mid",
    note: "夏休み前半。週末は高めだが平日は比較的安定。",
  },
  {
    range: "8/8 〜 8/16",
    level: "peak",
    note: "お盆ピーク。航空券・ホテルとも年間最高値クラス。",
  },
  {
    range: "8/17 〜 8/25",
    level: "high",
    note: "学生・家族の戻り需要で高値継続。",
  },
  {
    range: "8/26 以降",
    level: "low",
    note: "新学期入りで急落。9月にかけて通年水準へ。",
  },
];

const TIPS: { icon: typeof Calendar; title: string; body: string }[] = [
  {
    icon: Calendar,
    title: "6ヶ月前から早期予約",
    body: "夏休みは需要のピークが読みやすく早割の効きが大きい。海外リゾートは前年12月〜2月、国内は3〜4月までに押さえると最安帯。",
  },
  {
    icon: Plane,
    title: "お盆ピークを1週ずらす",
    body: "7月後半 or 8/20 以降にずらすだけで航空券が半額近くなることも。学校行事と要相談だが効果は絶大。",
  },
  {
    icon: Clock,
    title: "深夜便・早朝便を活用",
    body: "ピーク日でも深夜0時台・早朝5時台便は需要が落ちて安め。家族連れは現地到着時間とのトレードオフを検討。",
  },
  {
    icon: Hotel,
    title: "ホテルは仮押さえ→比較",
    body: "夏休みリゾートは早期に在庫が枯渇。キャンセル無料プランで複数候補を仮押さえ→直前で最安1つに絞るのが鉄則。",
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
    emoji: "🏖️",
    highlight: "国内ビーチ最大の選択肢。離島も含めて夏休み定番。",
  },
  {
    area: "ハワイ",
    type: "海外",
    emoji: "🌺",
    highlight: "夏休みの王道。乾季で天気安定・家族・カップル両対応。",
  },
  {
    area: "グアム",
    type: "海外",
    emoji: "🌴",
    highlight: "短時間フライトで南国。ピーク料金でも5日以内なら現実的。",
  },
  {
    area: "バリ",
    type: "海外",
    emoji: "🌅",
    highlight: "乾季ベストシーズン。ヴィラステイで非日常感を満喫。",
  },
  {
    area: "シンガポール",
    type: "海外",
    emoji: "🇸🇬",
    highlight: "通年気候安定。家族・都市派・短期日程に最適。",
  },
  {
    area: "プーケット",
    type: "海外",
    emoji: "🏝️",
    highlight: "雨季ながら短時間のスコールが多く実用上は問題小。コスパ高め。",
  },
];

const FAQS = [
  {
    q: "夏休み・お盆の航空券はいつから安くなりますか？",
    a: "復路は8月26日以降、往路は7月後半までは通常料金帯。8/8〜8/16のお盆ピークは6ヶ月以上前の早期予約割引が最も有効。直前(出発2週間以内)はピーク日除けば LCC で残席が出ることもあります。",
  },
  {
    q: "夏休みは国内と海外どちらがコスパ良いですか？",
    a: "5日以内なら国内(沖縄)・近距離アジア(グアム・台北・ソウル)、6日以上なら中距離(ハワイ・バリ・シンガポール)が定番。海外は早期予約での航空券差額が国内より大きいので、行き先選び以上に「いつ予約するか」が総額に効きます。",
  },
  {
    q: "家族連れにおすすめの夏休み目的地は？",
    a: "プール・キッズプログラム完備のリゾートホテルがあるグアム・ハワイ・沖縄が定番。フライト時間と時差で選ぶなら、グアム(3.5h・時差1h)＞沖縄(2.5h・時差なし)＞ハワイ(7h・時差19h)の順で子連れ負担小。離乳食対応や送迎も予約時に確認を。",
  },
  {
    q: "カップル向けの夏休み目的地は？",
    a: "プライベートヴィラのバリ、都市＋ビーチ両方楽しめるシンガポール+周辺アイランド、コスパとラグジュアリーを両立できるプーケットがおすすめ。サンセットディナーや専用プール付きヴィラなど、特別感重視の宿選びがポイントです。",
  },
  {
    q: "夏休みの直前予約でも間に合いますか？",
    a: "お盆ピーク(8/10〜15)はほぼ満席・残席最高値。一方、7月後半や8/20以降にずらせる人は直前でもキャンセル戻りが出ます。LCC や OTA セールの再販在庫を毎日チェック、キャンセル無料ホテルで仮押さえしつつ価格を待つのが現実的です。",
  },
];

export default async function SummerSeasonPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "夏休み・お盆の航空券・ホテル予約完全ガイド｜7月〜8月の最安タイミング",
    description:
      "夏休み・お盆のピーク・底値カレンダー、予約のコツ、人気ビーチ・リゾート目的地、FAQ までを完全網羅した予約ガイド。",
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
    mainEntityOfPage: "https://beatrip.jp/seasons/summer",
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
              lang === "en" ? "/en/seasons/summer" : "/seasons/summer"
            }
            items={[
              { label: "Home", href: "/" },
              { label: "季節特集", href: "/seasons/summer" },
              { label: "夏休み・お盆" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Umbrella className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Summer & Obon Travel
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            夏休み・お盆の旅行予約
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            7月〜8月のピーク・底値カレンダー、最安タイミング、人気ビーチ・リゾート目的地まで完全網羅。
            早期予約と日程ずらしで夏休みの旅費を賢く抑えるためのガイドです。
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
                夏休み ピーク時期カレンダー
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                8/8〜8/16 お盆が最高値。7月前半と8月末は通年水準で狙い目。
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
                夏休み 予約のコツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIPS.map((t) => (
                  <div
                    key={t.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <t.icon className="h-4 w-4 text-amber-500" />
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
                夏休み 人気目的地
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                ビーチ・リゾート系の定番6選。家族向け・カップル向けに分けて選定。
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
                夏休み旅行のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* 夏休み人気のおすすめホテル */}
            <CompactHotelsRecommendation
              citySlugs={["okinawa", "honolulu", "guam", "bangkok"]}
              title="夏休みに人気のホテル"
              subtitle="ビーチリゾートと南国エリアの代表的なホテル。"
              maxHotels={4}
            />

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/hawaii"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    夏のハワイ
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    乾季ベストシーズンのハワイガイド
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-zinc-100">
                    ハワイガイドを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/okinawa"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    夏の沖縄
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    本島と離島の選び方・夏のベストシーズン
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-zinc-100">
                    沖縄ガイドを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="夏休みの予約・比較"
              subtitle="航空券・ホテル・ツアーをまとめて比較"
              categories={[
                "flight-domestic",
                "flight-overseas",
                "hotel-domestic",
                "tour-package",
              ]}
              source="seasons-summer"
            />

            <JapanesePartnersPanel
              title="海外・現地手配"
              subtitle="海外ホテル・ツアー・レンタカー"
              categories={["hotel-overseas", "tour-overseas", "rental-car"]}
              source="seasons-summer"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
