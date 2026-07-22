/**
 * /articles/seasonal/winter-2026
 * 「2026 冬の旅行計画 — 雪国・温泉・冬グルメの月別ガイド (年末年始除く)」
 *
 * /seasons/year-end (12-1 月の大型休暇予約攻略) と棲み分け、
 * 本記事は「平常時の冬旅行」 (12 月平日 / 1 月後半 / 2 月) のアイデア集。
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  Snowflake,
  Calendar,
  MapPin,
  Hotel,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";
import { OG_IMAGES } from "@/lib/seo/og";

export const revalidate = 86400;

const PUBLISHED = "2026-06-01";

export async function generateMetadata(): Promise<Metadata> {
  const title =
    "2026 冬の旅行計画 完全ガイド — 12月・1月・2月の雪国・温泉・冬グルメ";
  const description =
    "2026 年冬 (12-2 月) の国内・海外旅行アイデア。年末年始を避けた狙い目時期の雪国・温泉・冬グルメ・予約タイミングを月別に整理した完全シーズンガイド。";
  return {
    title,
    description,
    keywords: [
      "2026 冬 旅行",
      "冬 旅行 おすすめ",
      "雪国 旅行",
      "温泉 冬 旅行",
      "12月 旅行",
      "1月 旅行",
      "2月 旅行",
      "冬 旅行 国内",
      "冬 旅行 海外",
      "スキー 旅行",
    ],
    openGraph: {
      images: OG_IMAGES,
      title,
      description,
      type: "article",
    },
    alternates: {
      canonical: "https://beatrip.jp/articles/seasonal/winter-2026",
      languages: {
        ja: "https://beatrip.jp/articles/seasonal/winter-2026",
        "x-default": "https://beatrip.jp/articles/seasonal/winter-2026",
      },
    },
  };
}

const MONTHS: {
  month: string;
  theme: string;
  highlights: string[];
  bestFor: string;
}[] = [
  {
    month: "12 月 (年末除く)",
    theme: "イルミネーション + 早冬の温泉",
    highlights: [
      "12 月前半は航空券・ホテル共に通年水準で狙い目",
      "東京・大阪・神戸のイルミネーション巡り",
      "雪化粧前の温泉地 (箱根・湯布院・別府) で混雑少なめ",
    ],
    bestFor: "12 月 1-15 日は冬旅の隠れベスト期間。年末ピーク前の駆け込み旅。",
  },
  {
    month: "1 月後半",
    theme: "雪国 + ウィンタースポーツ",
    highlights: [
      "年末年始ピーク終了後は航空券 50% 以上安に",
      "ニセコ・白馬・志賀高原がスキーベスト期",
      "札幌・小樽の雪景色 (1 月後半が降雪量ピーク)",
    ],
    bestFor:
      "1/8 以降は航空券・ホテル共に大幅安。スキー目的なら 1 月後半が雪質ベスト。",
  },
  {
    month: "2 月",
    theme: "雪まつり + 寒地温泉",
    highlights: [
      "さっぽろ雪まつり (2 月上旬) — 予約は前年 11 月から推奨",
      "草津・登別・蔵王の樹氷シーズン",
      "東南アジア (タイ・ベトナム) は乾季ピークで気候ベスト",
    ],
    bestFor: "雪まつり・樹氷を狙うなら 2 月上旬、寒さ回避なら東南アジア。",
  },
];

const DOMESTIC_DESTINATIONS = [
  {
    area: "ニセコ",
    best: "1 月中旬〜2 月",
    note: "パウダースノーで世界的人気。1 ヶ月前予約推奨。",
  },
  {
    area: "白馬",
    best: "1 月〜3 月上旬",
    note: "東京から新幹線 + バスで 3.5 時間。日帰り〜2 泊が定番。",
  },
  {
    area: "札幌・小樽",
    best: "1 月後半〜2 月",
    note: "雪まつり前後は航空券・ホテル高め。前後 1 週間ずらしで節約。",
  },
  {
    area: "草津温泉",
    best: "12 月〜2 月",
    note: "雪見露天が名物。冬期は道路凍結注意、バス利用推奨。",
  },
  {
    area: "湯布院・別府",
    best: "12 月〜2 月",
    note: "九州の冬温泉は寒さも穏やか。福岡空港から 2 時間。",
  },
  {
    area: "蔵王",
    best: "1 月後半〜2 月中旬",
    note: "樹氷ライトアップが圧巻。山形空港または仙台駅から。",
  },
];

const OVERSEAS_DESTINATIONS = [
  {
    area: "バンコク",
    best: "12 月〜2 月",
    note: "乾季ピーク。気候ベストで日本の冬から避寒に最適。",
  },
  {
    area: "ベトナム",
    best: "12 月〜2 月",
    note: "ハノイ・ホイアン・ホーチミン共に乾季で気候安定。",
  },
  {
    area: "シンガポール",
    best: "通年安定 (1-2 月やや雨少なめ)",
    note: "1 泊単価高めだがマリーナベイは冬でも楽しめる。",
  },
  {
    area: "オーストラリア",
    best: "12 月〜2 月",
    note: "南半球の夏。シドニー・メルボルン・ケアンズが快適。",
  },
];

const FAQS = [
  {
    q: "年末年始を避けた狙い目の冬旅行時期は？",
    a: "12 月 1-15 日 と 1 月 8 日以降〜2 月が最大の狙い目。年末年始ピーク (12/28-1/5) と比べて航空券は 40-60% 安く、ホテルも繁忙期料金から平常料金に戻ります。雪国旅行なら 1 月後半が雪質ベスト + 価格安の両立期間。",
  },
  {
    q: "冬の国内旅行で予約はいつから？",
    a: "スキー場併設ホテル (ニセコ・白馬・志賀高原) は 2-3 ヶ月前から人気宿が埋まります。温泉旅館は 1-2 ヶ月前、都市部ホテルは 1 ヶ月前でも十分間に合うことが多いです。さっぽろ雪まつり期間は前年 10-11 月から予約スタート推奨。",
  },
  {
    q: "冬に海外なら避寒地はどこ？",
    a: "東南アジア (バンコク・ベトナム・シンガポール) が定番。乾季の 12-2 月は雨が少なく気候快適。航空券は東南アジアなら 4-6 万円台が一般的で、ホテルもバンコクなら 5 つ星が 1-2 万円台。家族でも気軽に行ける価格帯です。",
  },
  {
    q: "スキー旅行は何泊ぐらいがいい？",
    a: "ニセコ・白馬等の本格スキー場なら最低 2 泊 3 日 (1 日目移動、2 日目滑走、3 日目帰着)。3 泊 4 日が理想。日帰りは時間効率が悪く、レンタル装備の費用も無駄が多い。スキー場併設ホテルなら朝一リフトが取れて満足度が高いです。",
  },
  {
    q: "冬の温泉旅行で注意することは？",
    a: "雪国温泉地への移動は道路凍結に注意。スタッドレスタイヤがない場合は公共交通機関 + 旅館送迎を推奨。露天風呂はヒートショック対策で水分補給と段階的入浴が大事。冬期休業の小規模旅館もあるため、予約前に営業状況確認推奨。",
  },
];

export default async function WinterSeasonalPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "2026 冬の旅行計画 完全ガイド — 12月・1月・2月の雪国・温泉・冬グルメ",
    description:
      "2026 年冬の月別おすすめ目的地・雪国旅・冬温泉・避寒地・予約タイミングを完全網羅。",
    inLanguage: "ja-JP",
    datePublished: PUBLISHED,
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
    mainEntityOfPage: "https://beatrip.jp/articles/seasonal/winter-2026",
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

      <section className="relative bg-gradient-to-br from-sky-600 via-indigo-600 to-blue-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            currentPath={
              lang === "en"
                ? "/en/articles/seasonal/winter-2026"
                : "/articles/seasonal/winter-2026"
            }
            items={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/articles" },
              { label: "シーズン" },
              { label: "2026 冬" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Snowflake className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Winter 2026 Travel Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            2026 冬の旅行計画
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            12 月・1 月・2
            月の雪国旅・温泉・避寒地アイデアを月別に整理。年末年始ピークを避けた
            狙い目時期の活用法と予約タイミングまでを完全網羅した冬旅ガイドです。
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* 月別ガイド */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                月別 旅行カレンダー
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                年末年始 (12/28-1/5)
                はピーク料金。それを避けた狙い目時期を整理。
              </p>
              <div className="space-y-4">
                {MONTHS.map((m) => (
                  <div
                    key={m.month}
                    className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-5 w-5 text-sky-500" />
                      <h3 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100">
                        {m.month} — {m.theme}
                      </h3>
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {m.highlights.map((h, i) => (
                        <li
                          key={i}
                          className="text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2"
                        >
                          <span className="text-sky-500 mt-1">-</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-l-2 border-sky-300 pl-3">
                      <span className="font-bold text-zinc-700 dark:text-zinc-200">
                        編集部メモ:
                      </span>{" "}
                      {m.bestFor}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 国内 雪国・温泉 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                国内 雪国・温泉スポット
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                エリア別のベストシーズンと編集部メモ。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOMESTIC_DESTINATIONS.map((d) => (
                  <div
                    key={d.area}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-sky-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {d.area}
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          ベストシーズン: {d.best}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                          {d.note}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 海外 避寒地 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                海外 冬の避寒地
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                日本の冬から逃げて気候が快適な海外目的地。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OVERSEAS_DESTINATIONS.map((d) => (
                  <div
                    key={d.area}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {d.area}
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          ベストシーズン: {d.best}
                        </p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                          {d.note}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 冬に人気のホテル */}
            <CompactHotelsRecommendation
              citySlugs={["sapporo", "bangkok", "tokyo", "taipei"]}
              title="2026 冬の旅行で人気のホテル"
              subtitle="雪国・温泉・避寒地に便利な編集部選定ホテル。"
              maxHotels={4}
            />

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-3xl">
                2026 冬の旅行のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* 関連 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/seasons/year-end"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    年末年始の予約攻略
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    12-1 月のピーク予約タイミング
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-zinc-100">
                    年末年始ガイドを見る <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/articles/seasonal/autumn-2026"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    2026 秋の旅行計画
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    紅葉・温泉・秋グルメ
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:text-zinc-100 dark:group-hover:text-zinc-100">
                    秋ガイドを見る <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="冬の旅行 予約・比較"
              subtitle="航空券・ホテル・ツアーをまとめて比較"
              categories={[
                "flight-domestic",
                "flight-overseas",
                "hotel-domestic",
                "tour-package",
              ]}
              source="seasonal-winter-2026"
            />
            <JapanesePartnersPanel
              title="海外・現地手配"
              subtitle="海外ホテル・ツアー・eSIM"
              categories={["hotel-overseas", "tour-overseas", "esim-wifi"]}
              source="seasonal-winter-2026"
            />
            <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Hotel className="h-4 w-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  ホテル比較
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Booking / Agoda / Trip.com / Hotellook
                の使い分けで冬の人気エリアを最安予約。
              </p>
              <Link
                href="/ota-sales"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                OTA 比較を見る <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
