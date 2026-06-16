/**
 * /seasons — シーズン特集のインデックス
 *
 * 1. 恒常的な連休ガイド (/seasons/{year-end,golden-week,summer})
 *    — 毎年使える「いつ予約するか」の攻略ページ
 * 2. 年号付きシーズン記事 (/articles/seasonal/{autumn-2026,winter-2026})
 *    — その年の具体的な行き先・月別プランを扱う特集記事
 * の 2 つを役割を明示してセクション分けする。
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CalendarRange,
  Leaf,
  Snowflake,
  Sun,
  Flower2,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { localizeHref, type Locale } from "@/lib/i18n/locale";

type Props = { params: Promise<{ lang: string }> };

// ISR: 21600 秒 (6 時間)
export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = isEn
    ? "Seasonal travel guides — year-end, Golden Week, summer and more"
    : "シーズン特集一覧｜年末年始・GW・夏休みの最安予約ガイド";
  const description = isEn
    ? "All of BEATRIP's seasonal travel guides in one place: evergreen booking playbooks for Japan's big holiday periods (year-end, Golden Week, summer/Obon) plus dated seasonal features with destination ideas for the current year."
    : "年末年始・ゴールデンウィーク・夏休みなど連休シーズンの航空券・ホテル最安予約ガイドと、年号付きの季節特集 (秋・冬の旅行計画) をまとめたインデックス。旅行時期からガイドを探せます。";
  const path = isEn ? "/en/seasons" : "/seasons";
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/seasons",
        "x-default": "https://beatrip.jp/seasons",
      },
    },
  };
}

const EVERGREEN_GUIDES = [
  {
    href: "/seasons/year-end",
    title: "年末年始",
    period: "12 月後半 - 1 月初旬",
    description:
      "ピークと底値のタイミング、早期予約割引、国内・海外のおすすめ目的地。",
    Icon: Snowflake,
  },
  {
    href: "/seasons/golden-week",
    title: "ゴールデンウィーク",
    period: "4 月末 - 5 月初旬",
    description:
      "GW の航空券・ホテルを最安で取るコツと、ピーク回避の日程ずらし戦略。",
    Icon: Flower2,
  },
  {
    href: "/seasons/summer",
    title: "夏休み・お盆",
    period: "7 月 - 8 月",
    description:
      "ビーチ・リゾートの人気目的地と、お盆ピークを避ける予約テクニック。",
    Icon: Sun,
  },
];

const DATED_FEATURES = [
  {
    href: "/articles/seasonal/autumn-2026",
    title: "2026 秋の旅行計画",
    period: "2026 年 9 月 - 11 月",
    description: "紅葉・温泉・秋グルメを月別に整理した今年の秋向けガイド。",
    Icon: Leaf,
  },
  {
    href: "/articles/seasonal/winter-2026",
    title: "2026 冬の旅行計画",
    period: "2026 年 12 月 - 2027 年 2 月",
    description: "雪国・温泉・避寒地から選ぶ、今年の冬の行き先ガイド。",
    Icon: Snowflake,
  },
];

export default async function SeasonsIndexPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = lang === "en" ? "en" : "ja";
  const lh = (href: string) => localizeHref(href, locale);

  const sections = [
    {
      key: "evergreen",
      label: "連休シーズン攻略ガイド",
      note: "毎年使える恒常ガイド。連休ごとの最安予約タイミングと戦略を解説します。",
      Icon: CalendarRange,
      items: EVERGREEN_GUIDES,
    },
    {
      key: "dated",
      label: "年号付きシーズン特集",
      note: "その年・その季節の行き先や月別プランを扱う特集記事です。",
      Icon: Calendar,
      items: DATED_FEATURES,
    },
  ];

  return (
    <>
      <Header />

      <section className="border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
          <Breadcrumbs
            currentPath={lh("/seasons")}
            items={[
              { label: "Home", href: lh("/") },
              { label: "シーズン特集" },
            ]}
          />
          <h1 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl tracking-wide text-zinc-900 dark:text-zinc-100 leading-tight">
            シーズン特集
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            旅行する時期が決まっているなら、シーズンから探すのが最短です。年末年始・GW・夏休みの「いつ予約すれば最安か」と、季節ごとの行き先特集をまとめました。
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 py-8 sm:py-10 space-y-10"
      >
        {sections.map((section) => (
          <section key={section.key}>
            <h2 className="flex items-center gap-2 font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
              <section.Icon
                className="h-5 w-5 text-zinc-400"
                aria-hidden="true"
              />
              {section.label}
            </h2>
            <p className="mt-1.5 mb-4 text-xs text-zinc-500 dark:text-zinc-400">
              {section.note}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={lh(item.href)}
                  className="group rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      <item.Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <ArrowRight
                      className="h-3.5 w-3.5 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-zinc-400">
                    {item.period}
                  </p>
                  <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {item.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 sm:p-6">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            時期が未定の方へ
          </h2>
          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            セールの開催時期から逆算して旅程を決めたい場合は、セールカレンダーと
            2027 年のセール予測が役立ちます。
          </p>
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            <Link
              href={lh("/#calendar")}
              className="group inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-300 hover:underline"
            >
              セールカレンダー
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href={lh("/articles/sale-prediction-2027")}
              className="group inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-300 hover:underline"
            >
              2027 セール予測
              <ArrowRight
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
