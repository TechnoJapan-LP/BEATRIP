/**
 * /articles/sale-prediction-2027
 * 「2027 年航空券セール スケジュール予測 — JAL/ANA/LCC 主要キャリア完全網羅」
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  TrendingDown,
  Calendar,
  Plane,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";

export const revalidate = 86400;

const PUBLISHED = "2026-06-01";

export async function generateMetadata(): Promise<Metadata> {
  const title =
    "2027 航空券セール スケジュール予測 — JAL/ANA/Peach/Jetstar 完全網羅 | BEATRIP";
  const description =
    "2027 年の航空券セール時期を主要キャリア (JAL / ANA / Peach / Jetstar / ZIPAIR / Skymark) 別に予測。過去 5 年分の傾向から月別セール開催確率と狙い目時期を整理した完全予測ガイド。";
  return {
    title,
    description,
    keywords: [
      "2027 航空券 セール",
      "2027 航空券 安い",
      "セール 予測 2027",
      "JAL セール 2027",
      "ANA セール 2027",
      "Peach セール 2027",
      "LCC セール スケジュール",
      "航空券 セール いつ",
      "航空券 最安",
    ],
    openGraph: { title, description, type: "article" },
    alternates: {
      canonical: "https://beatrip.jp/articles/sale-prediction-2027",
      languages: {
        ja: "https://beatrip.jp/articles/sale-prediction-2027",
        en: "https://beatrip.jp/en/articles/sale-prediction-2027",
        "x-default": "https://beatrip.jp/articles/sale-prediction-2027",
      },
    },
  };
}

const QUARTERLY: { quarter: string; expectations: string[]; tip: string }[] = [
  {
    quarter: "Q1 (1-3 月)",
    expectations: [
      "1 月: ANA / JAL の「タイムセール」が定例化。GW・夏休み売出し開始",
      "2 月: 春の旅セール (3-5 月搭乗分) が LCC 各社から続発",
      "3 月: 年度末セール — Peach / Jetstar / Skymark の値下げ集中",
    ],
    tip: "Q1 は「GW・夏休みの早期予約」枠が安く出る時期。3-6 ヶ月先を狙う仕込みのタイミング。",
  },
  {
    quarter: "Q2 (4-6 月)",
    expectations: [
      "4 月: GW 直後は新年度需要が落ち着き、夏休み売出しがピーク",
      "5 月: LCC 各社の「6-8 月搭乗分」セールが頻発",
      "6 月: 梅雨入りで需要減 — 8-10 月搭乗分のセールが安め",
    ],
    tip: "Q2 は夏休み・お盆の確保期。6 月セールで秋の早期予約も視野に。",
  },
  {
    quarter: "Q3 (7-9 月)",
    expectations: [
      "7 月: 夏休みピーク中はセール少なめ、年末年始売出し開始",
      "8 月: お盆明けに年末年始セール本格化、冬休み枠が動き出す",
      "9 月: シルバーウィーク後にハロウィン/冬休みセール頻発",
    ],
    tip: "Q3 は年末年始・冬休みの早期確保期。8-9 月の早割を逃すと年末価格が一気に高騰。",
  },
  {
    quarter: "Q4 (10-12 月)",
    expectations: [
      "10 月: Black Friday 前の「越年セール」が ANA / JAL から続発",
      "11 月: Black Friday / Cyber Monday — LCC 各社の年間最安帯",
      "12 月: 年末年始ピーク中はセール少なめ、翌年 GW 売出し開始",
    ],
    tip: "11 月の Black Friday 周辺が年間で最も底値が出やすい時期。年間 1 回のメイン仕込み期。",
  },
];

const CARRIERS: { name: string; frequency: string; bestSales: string; tip: string }[] = [
  {
    name: "ANA",
    frequency: "月 2-3 回",
    bestSales: "「ANA SUPER VALUE」(75/55/45 日前) と「タイムセール」(月初不定期)",
    tip: "国内線は SUPER VALUE 75 日前が最安帯。国際線は会員限定タイムセールが見逃せない。",
  },
  {
    name: "JAL",
    frequency: "月 2-3 回",
    bestSales: "「JAL SUPER 先得 / 先得割引」と「特便割引」シリーズ",
    tip: "ANA とほぼ同水準・同タイミングで動く傾向。両社を毎月比較するのが定石。",
  },
  {
    name: "Peach",
    frequency: "月 3-5 回",
    bestSales: "「Peach Festival」(年 4-6 回) と週末タイムセール",
    tip: "メルマガ会員限定先行が多数。早朝発表のセールが多く朝のチェックを習慣化。",
  },
  {
    name: "Jetstar",
    frequency: "月 3-5 回",
    bestSales: "「フライドフライデー」(毎週金曜) と「年末年始セール」",
    tip: "週次セールがあるため毎週金曜の朝にチェック。直前 (1-2 週前) でも底値が出ることも。",
  },
  {
    name: "ZIPAIR",
    frequency: "月 1-2 回",
    bestSales: "「ZIPAIR ANNIVERSARY SALE」(年 1-2 回) と季節セール",
    tip: "国際線 LCC のため希少だが底値インパクトが大きい。年 2 回の大型セールを逃さない。",
  },
  {
    name: "Skymark",
    frequency: "月 2-3 回",
    bestSales: "「ANA SUPER VALUE」相当の早期割引と「タイムセール」",
    tip: "羽田/神戸/福岡/那覇路線の競争が激しく、ANA / JAL より安いケースも多い。",
  },
];

const FAQS = [
  {
    q: "2027 年航空券で最も安いのはいつごろ予想されますか？",
    a: "Black Friday / Cyber Monday (11 月最終週) が年間で最も底値が出やすい時期。年末年始や GW の航空券もこの時期にセール対象になることが多く、半年〜1 年先の予約でも適用されます。次点は LCC 各社の周年セール (Peach Festival / ZIPAIR Anniversary 等) 開催月。",
  },
  {
    q: "GW・夏休み・年末年始の航空券はいつ予約すべき？",
    a: "GW (4-5 月) は前年 12 月〜1 月、夏休み (7-8 月) は 2-4 月、年末年始 (12-1 月) は 8-9 月が早期予約のスタートライン。各キャリアの 75/55/45 日前割引より先に「早期売出し直後」が一番安いことが多いです。",
  },
  {
    q: "セール情報を見逃さないコツは？",
    a: "(1) 主要キャリアのメルマガ登録、(2) Twitter/X 公式アカウントのフォロー、(3) 当サイトのフラッシュディール定期チェック、の 3 点が基本。LCC は朝発表が多いため朝のメールチェックを習慣化、ANA/JAL は「月初の月曜午前」発表パターンが定例化しています。",
  },
  {
    q: "セールで予約してもキャンセル可能ですか？",
    a: "セール価格は基本的に「変更不可・払い戻し不可」が標準。日程確定後の予約推奨。日程未確定なら、ホテルだけ「無料キャンセル可」プランで先押さえし、航空券は確定後にセール待ちで取るのが現実的です。",
  },
  {
    q: "LCC と FSC (ANA/JAL) はどちらが安いですか？",
    a: "国内線セール時の価格はほぼ同水準まで近づくケースが多いですが、平均的には LCC (Peach/Jetstar/Skymark/ZIPAIR) の方が 20-40% 安い傾向。ただし預け荷物・座席指定・変更等のオプション料金を合算すると差が縮まることも。総額比較が重要です。",
  },
  {
    q: "本予測の精度はどの程度ですか？",
    a: "過去 5 年分のセール開催パターンに基づく傾向予測です。航空会社の経営判断・需給状況・燃油サーチャージ等で変動するため、実際の開催時期・割引率は変わる可能性があります。最新情報は各キャリア公式と当サイトのフラッシュディールで随時確認推奨。",
  },
];

export default async function SalePrediction2027Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "2027 航空券セール スケジュール予測 — JAL/ANA/LCC 主要キャリア完全網羅",
    description:
      "2027 年の主要キャリア別セール時期予測。四半期別カレンダーとキャリア別セール特性を網羅。",
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
    mainEntityOfPage: "https://beatrip.jp/articles/sale-prediction-2027",
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

      <section className="relative bg-gradient-to-br from-emerald-600 via-teal-600 to-sky-700 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/articles" },
              { label: "セール予測 2027" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <TrendingDown className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              2027 Airfare Sale Schedule
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            2027 航空券セール 予測カレンダー
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            主要キャリア (JAL / ANA / Peach / Jetstar / ZIPAIR / Skymark) のセール時期を
            過去 5 年分の傾向から四半期別に予測。年間で最も安い時期と狙い目を整理した予測ガイドです。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* 四半期予測 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                2027 四半期別セール予測
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                過去 5 年分の傾向から導出した 2027 年セール時期の予測カレンダー。
              </p>
              <div className="space-y-4">
                {QUARTERLY.map((q) => (
                  <div
                    key={q.quarter}
                    className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-5 w-5 text-emerald-500" />
                      <h3 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100">
                        {q.quarter}
                      </h3>
                    </div>
                    <ul className="space-y-1.5 mb-3">
                      {q.expectations.map((e, i) => (
                        <li key={i} className="text-sm text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
                          <span className="text-emerald-500 mt-1">-</span>
                          <span>{e}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed border-l-2 border-emerald-300 pl-3">
                      <span className="font-bold text-zinc-700 dark:text-zinc-200">編集部メモ:</span> {q.tip}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* キャリア別セール特性 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                キャリア別セール特性
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                主要 6 社のセール頻度と狙い目のセール種別。
              </p>
              <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                      <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">キャリア</th>
                      <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">頻度</th>
                      <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200">代表セール</th>
                      <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200">編集部メモ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {CARRIERS.map((c) => (
                      <tr key={c.name} className="align-top">
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <Plane className="h-3.5 w-3.5 text-zinc-400" />
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                          {c.frequency}
                        </td>
                        <td className="px-3 py-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed min-w-[220px]">
                          {c.bestSales}
                        </td>
                        <td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed min-w-[260px]">
                          {c.tip}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 信頼性パネル */}
            <section>
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-heading text-base tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    予測の見方
                  </h2>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    本予測は過去 5 年分のセール開催パターンに基づく傾向予測であり、
                    確定スケジュールではありません。実際の開催時期・割引率は航空会社の判断・
                    需給状況・燃油サーチャージ等で変動します。最新情報は各キャリア公式と当サイトの
                    フラッシュディール・空港別ハブで随時確認してください。
                  </p>
                  <p className="mt-2 text-[11px] text-zinc-400">
                    本記事のリンクの一部はアフィリエイト広告を含みます。
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-3xl">
                よくある質問
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
                  href="/airlines"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    航空会社別セール一覧
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">ANA / JAL / Peach / Jetstar 等</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    航空会社一覧へ <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/articles/miles-booking-guide"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    マイルで予約 完全ガイド
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">JAL/ANA マイル特典航空券の取り方</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    マイルガイドを見る <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="航空券 予約・比較"
              subtitle="国内・海外航空券をまとめて比較"
              categories={["flight-domestic", "flight-overseas", "tour-package"]}
              source="sale-prediction-2027"
            />
            <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  クレカでマイル貯蓄
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                セール価格 + マイル付帯で実質割引を最大化。年会費無料カードも比較。
              </p>
              <Link
                href="/credit-cards"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                クレカ比較を見る <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
