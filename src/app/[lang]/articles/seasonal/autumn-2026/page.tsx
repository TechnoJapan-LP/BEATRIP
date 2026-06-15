/**
 * /articles/seasonal/autumn-2026
 * 「2026 秋の旅行計画 — 紅葉・温泉・グルメの月別ガイド」
 *
 * 既存 /seasons/* (year-end/golden-week/summer) は「大型休暇の予約攻略」型。
 * 本記事は「月別の旅行アイデア」型として棲み分ける。
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  Leaf,
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

export const revalidate = 86400;

const PUBLISHED = "2026-06-01";

export async function generateMetadata(): Promise<Metadata> {
  const title =
    "2026 秋の旅行計画 完全ガイド — 9月・10月・11月の紅葉・温泉・グルメ | BEATRIP";
  const description =
    "2026 年秋 (9-11月) の国内・海外旅行アイデアを月別に整理。紅葉名所・温泉旅館・秋グルメ・予約タイミング・人気エリア別おすすめホテルを網羅したシーズンガイド。";
  return {
    title,
    description,
    keywords: [
      "2026 秋 旅行",
      "秋 旅行 おすすめ",
      "紅葉 旅行 2026",
      "温泉 秋 旅行",
      "9月 旅行",
      "10月 旅行",
      "11月 旅行",
      "秋 旅行 国内",
      "秋 旅行 海外",
      "紅葉 ホテル",
    ],
    openGraph: { title, description, type: "article" },
    alternates: {
      canonical: "https://beatrip.jp/articles/seasonal/autumn-2026",
      languages: {
        ja: "https://beatrip.jp/articles/seasonal/autumn-2026",
        "x-default": "https://beatrip.jp/articles/seasonal/autumn-2026",
      },
    },
  };
}

const MONTHS: { month: string; theme: string; highlights: string[]; bestFor: string }[] = [
  {
    month: "9 月",
    theme: "残暑 + 初秋のグルメ",
    highlights: [
      "シルバーウィーク (連休) — 早期予約で航空券 30-40% 安",
      "北海道・東北の収穫期 (新米・サンマ・ぶどう)",
      "国内ビーチ最終週 (沖縄離島は 9 月後半まで快適)",
    ],
    bestFor: "残暑を避けたいなら高原・北海道。連休利用で 3-4 泊が最適。",
  },
  {
    month: "10 月",
    theme: "紅葉スタート + 秋祭り",
    highlights: [
      "北海道・東北の紅葉 (10 月中旬がピーク)",
      "京都・奈良の社寺特別公開 (秋限定)",
      "ヨーロッパ・台湾・韓国がベストシーズン",
    ],
    bestFor: "気候が最も安定。海外も国内も「行きやすさ」がピークの月。",
  },
  {
    month: "11 月",
    theme: "紅葉ピーク + 温泉",
    highlights: [
      "京都・日光・箱根の紅葉ピーク (11 月中旬〜下旬)",
      "温泉旅館の繁忙期入口 — 1 ヶ月前予約推奨",
      "東南アジア (バンコク・バリ) が乾季入り",
    ],
    bestFor: "国内なら紅葉 + 温泉、海外なら東南アジア乾季が定番。",
  },
];

const DOMESTIC_DESTINATIONS = [
  { area: "京都", best: "11 月中旬〜下旬", note: "嵐山・清水寺・東福寺の紅葉ピーク。早朝拝観で混雑回避。" },
  { area: "日光", best: "10 月中旬〜11 月上旬", note: "いろは坂・中禅寺湖の紅葉。日帰り or 1 泊が定番。" },
  { area: "箱根", best: "11 月中旬〜下旬", note: "強羅・芦ノ湖周辺の紅葉 + 温泉。週末は混雑必至。" },
  { area: "北海道", best: "9 月下旬〜10 月中旬", note: "大雪山・知床の紅葉。10 月下旬で初雪のエリアも。" },
  { area: "東北", best: "10 月中旬〜11 月上旬", note: "奥入瀬・八幡平・蔵王の紅葉ロードトリップ。" },
  { area: "高山・白川郷", best: "11 月上旬〜中旬", note: "合掌造りと紅葉の組合せ。早朝が最も写真映え。" },
];

const OVERSEAS_DESTINATIONS = [
  { area: "ソウル", best: "10 月中旬〜11 月上旬", note: "南山・徳寿宮の紅葉 + コスメ・グルメ。LCC 4 時間圏。" },
  { area: "台北", best: "10 月〜11 月", note: "雨季明けで気候安定。陽明山・烏来温泉。" },
  { area: "バンコク", best: "11 月〜2 月", note: "乾季入りで気候ベスト。ホテルコスパも最強帯。" },
  { area: "パリ", best: "9 月〜10 月", note: "夏のピーク後で観光地が落ち着く。気候も穏やか。" },
];

const FAQS = [
  {
    q: "2026 年秋の旅行はいつ予約するのがベスト？",
    a: "国内紅葉旅 (京都・日光・箱根) は 3-4 ヶ月前 (7-8 月) が予約スタートライン。温泉旅館は 2 ヶ月前で人気宿が埋まり始めます。海外 (ヨーロッパ・台湾・韓国) は 4-6 ヶ月前の早期予約で航空券 30% 以上安くなることが多いです。",
  },
  {
    q: "シルバーウィーク (9 月連休) の最安タイミングは？",
    a: "国内は連休初日と最終日のフライトが最高値。1 日ずらして「連休前日出発 + 連休翌日帰着」にすると 30-50% 安くなります。海外は連休全体に渡って高値が続くので、早期予約と LCC 活用が鍵。",
  },
  {
    q: "紅葉旅行で混雑を避けるコツは？",
    a: "週末を避けて平日泊、早朝 (7-9 時) 拝観、午後遅め (15 時以降) の名所訪問が定番。京都の場合、東福寺・嵐山は朝 8 時前に入ると人混みなく撮影できます。週末しか取れない場合は、ピーク 1 週間前 or 1 週間後にずらすだけでも混雑は半減します。",
  },
  {
    q: "秋に海外なら、どこがコスパ良い？",
    a: "東南アジア (バンコク・台北・ソウル) は航空券もホテルも夏より安く、気候も快適なベストシーズン。ヨーロッパは航空券は高めですが現地物価が落ち着き、観光地の混雑も夏ピーク後で快適です。",
  },
  {
    q: "温泉宿の予約はいつから？",
    a: "11 月の人気温泉地 (箱根・草津・有馬等) は 2-3 ヶ月前で人気宿が埋まります。週末予約は 3 ヶ月前推奨。直前予約 (1-2 週間前) は楽天/じゃらんのキャンセル戻りを毎日チェックする方法もあります。",
  },
];

export default async function AutumnSeasonalPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "2026 秋の旅行計画 完全ガイド — 9月・10月・11月の紅葉・温泉・グルメ",
    description:
      "2026 年秋の月別おすすめ目的地・紅葉スポット・温泉・秋グルメ・予約タイミングを完全網羅。",
    inLanguage: "ja-JP",
    datePublished: PUBLISHED,
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: "BEATRIP", url: "https://beatrip.jp" },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    mainEntityOfPage: "https://beatrip.jp/articles/seasonal/autumn-2026",
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

      <section className="relative bg-gradient-to-br from-orange-600 via-rose-600 to-amber-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            currentPath={lang === "en" ? "/en/articles/seasonal/autumn-2026" : "/articles/seasonal/autumn-2026"}
            items={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/articles" },
              { label: "シーズン" },
              { label: "2026 秋" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Leaf className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Autumn 2026 Travel Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            2026 秋の旅行計画
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            9 月・10 月・11 月の月別おすすめ目的地、紅葉スポット、温泉、秋グルメ、
            予約タイミングまでを完全網羅。気候が最も安定する秋を最大限活用するためのガイドです。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* 月別ガイド */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                月別 旅行カレンダー
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                月別のテーマ・ハイライト・おすすめ用途を整理。
              </p>
              <div className="space-y-4">
                {MONTHS.map((m) => (
                  <div
                    key={m.month}
                    className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-5 w-5 text-rose-500" />
                      <h3 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100">
                        {m.month} — {m.theme}
                      </h3>
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {m.highlights.map((h, i) => (
                        <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                          <span className="text-rose-500 mt-1">-</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-l-2 border-rose-300 pl-3">
                      <span className="font-bold text-zinc-700 dark:text-zinc-200">編集部メモ:</span> {m.bestFor}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 国内 紅葉スポット */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                国内 紅葉スポット
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                エリア別の紅葉ピーク時期と編集部メモ。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DOMESTIC_DESTINATIONS.map((d) => (
                  <div
                    key={d.area}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {d.area}
                        </h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">
                          ピーク: {d.best}
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

            {/* 海外 秋シーズン */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                海外 秋ベストシーズン
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                日本の秋に合わせて気候が良い海外目的地。
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

            {/* 秋に人気のホテル */}
            <CompactHotelsRecommendation
              citySlugs={["tokyo", "osaka", "seoul", "taipei"]}
              title="2026 秋の旅行で人気のホテル"
              subtitle="紅葉観光・秋グルメに便利な編集部選定ホテル。"
              maxHotels={4}
            />

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-3xl">
                2026 秋の旅行のよくある質問
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
                  href="/articles/seasonal/winter-2026"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    2026 冬の旅行計画
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">雪国・温泉・冬グルメ</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    冬ガイドを見る <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/seasons/year-end"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    年末年始の予約攻略
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">12-1 月のセール・予約タイミング</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    年末年始ガイドを見る <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="秋の旅行 予約・比較"
              subtitle="航空券・ホテル・ツアーをまとめて比較"
              categories={["flight-domestic", "flight-overseas", "hotel-domestic", "tour-package"]}
              source="seasonal-autumn-2026"
            />
            <JapanesePartnersPanel
              title="海外・現地手配"
              subtitle="海外ホテル・ツアー・eSIM"
              categories={["hotel-overseas", "tour-overseas", "esim-wifi"]}
              source="seasonal-autumn-2026"
            />
            <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Hotel className="h-4 w-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  ホテル比較
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Booking / Agoda / Trip.com / Hotellook の使い分けで秋の人気エリアを最安予約。
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
