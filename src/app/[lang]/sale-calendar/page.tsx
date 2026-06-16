import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, TrendingDown, ArrowRight, Plane, Bell } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/ui/section-heading";
import { FAQAccordion, type FAQItem } from "@/components/ui/faq-accordion";
import { CATEGORY_GRADIENTS } from "@/lib/theme/category-gradients";
import { airlines } from "@/data/airlines";
import {
  saleHistory,
  getAirlineSaleStats,
  type SaleRecord,
} from "@/data/sale-history";

// ISR: 1日キャッシュ (予測は履歴ベースで日次更新)
export const revalidate = 86400;

const MONTHS_JA = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const path = isEn ? "/en/sale-calendar" : "/sale-calendar";
  const title = isEn
    ? "Airline sale calendar — when do Japan flight sales happen?"
    : "航空券セールカレンダー｜各社の次回セール時期・予測一覧";
  const description = isEn
    ? "When do ANA, JAL, Peach and other airline sales happen? Month-by-month sale frequency, next-sale forecasts, average discounts and record-low fares, analyzed from real past sales."
    : "ANA・JAL・Peach など各社の航空券セールはいつ開催される？過去の実セール履歴から、開催が多い月・次回セールの予測時期・平均割引率・過去最安値を一覧で分析。セールを逃さないための時期の目安に。";
  return {
    title,
    description,
    keywords: isEn
      ? ["flight sale calendar", "when are flight sales", "Japan airline sales", "ANA JAL sale dates"]
      : ["航空券 セール 時期", "航空券 セール いつ", "格安航空券 セール", "ANA セール 時期", "JAL セール いつ", "航空券セールカレンダー"],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/sale-calendar",
        "x-default": "https://beatrip.jp/sale-calendar",
      },
    },
  };
}

type AirlineCard = {
  code: string;
  name: string;
  nameEn: string;
  totalSales: number;
  avgDiscount: number;
  lowestPrice: number;
  peakMonthLabel: string;
  lastSale: SaleRecord;
  nextPredicted: Date | null;
  avgIntervalDays: number | null;
};

/** 直近開催日 + 平均間隔から、今日以降で最も近い次回開催見込み日を返す。 */
function predictNext(lastStart: string, avgIntervalDays: number | null): Date | null {
  if (!avgIntervalDays || avgIntervalDays <= 0) return null;
  const step = avgIntervalDays * 86_400_000;
  let t = new Date(lastStart).getTime() + step;
  const now = Date.now();
  // 履歴が古い場合は平均間隔ぶん未来へ送って「次の見込み」にする
  let guard = 0;
  while (t < now && guard < 100) {
    t += step;
    guard++;
  }
  return new Date(t);
}

function fmtMonthYear(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export default async function SaleCalendarPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isEn = lang === "en";
  const currentPath = isEn ? "/en/sale-calendar" : "/sale-calendar";

  // 全社統合の月別開催回数 (どの月にセールが多いか)
  const aggMonthCounts = new Array(12).fill(0);
  for (const r of saleHistory) {
    aggMonthCounts[new Date(r.startDate).getMonth()]++;
  }
  const maxAgg = Math.max(...aggMonthCounts, 1);
  const totalRecords = saleHistory.length;
  const topAggMonths = aggMonthCounts
    .map((count, i) => ({ month: i, count }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 航空会社別カード
  const cards: AirlineCard[] = airlines
    .map((a): AirlineCard | null => {
      const stats = getAirlineSaleStats(a.code);
      if (!stats || stats.records.length === 0) return null;
      const lastSale = stats.records[0];
      return {
        code: a.code,
        name: a.name,
        nameEn: a.nameEn,
        totalSales: stats.totalSales,
        avgDiscount: stats.avgDiscount,
        lowestPrice: stats.lowestPrice,
        peakMonthLabel: MONTHS_JA[stats.peakMonths[0] ?? 0],
        lastSale,
        nextPredicted: predictNext(lastSale.startDate, stats.avgInterval),
        avgIntervalDays: stats.avgInterval,
      };
    })
    .filter((c): c is AirlineCard => c !== null)
    // 次回見込みが近い順 (予測なしは末尾)
    .sort((a, b) => {
      const ta = a.nextPredicted?.getTime() ?? Infinity;
      const tb = b.nextPredicted?.getTime() ?? Infinity;
      return ta - tb;
    });

  const faqs: FAQItem[] = [
    {
      q: "航空券のセールが最も多い時期はいつですか？",
      a: `BEATRIP が収集した各社の過去セール ${totalRecords} 件を分析すると、開催が集中するのは ${topAggMonths
        .map((m) => `${MONTHS_JA[m.month]}（${m.count}件）`)
        .join("、")} です。航空会社の決算期（3月・9月）や大型連休前（GW前・夏休み前・年末年始前）にセールが集中する傾向があります。`,
    },
    {
      q: "次回のセール時期はどうやって予測していますか？",
      a: "各社の過去セールの「平均開催間隔」と「開催が多い月」から、統計的な目安として次回の見込み時期を算出しています。確定情報ではなく過去実績に基づく予測です。確実に逃したくない方は、ニュースレターや価格アラートの登録をおすすめします。",
    },
    {
      q: "LCC とフルサービス航空会社でセールの傾向は違いますか？",
      a: "LCC（Peach・Jetstar・Spring 等）はメガセール・タイムセールを年複数回開催し、割引率が高く最安値も数千円台になることがあります。フルサービス（ANA・JAL）は決算期や連休前のスペシャル運賃が中心で、長距離国際線でお得になりやすい傾向です。",
    },
    {
      q: "セールを見逃さないようにするには？",
      a: "BEATRIP の無料ニュースレターに登録すると、各社の新着セールを週次でまとめて受け取れます。本ページの各社カードから個別の「セール実績・予測」ページにも進めます。",
    },
  ];

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "航空会社別 セール時期・予測一覧",
    numberOfItems: cards.length,
    itemListElement: cards.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${c.name}のセール時期・予測`,
      url: `https://beatrip.jp/airlines/${c.code.toLowerCase()}/sales`,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: typeof f.a === "string" ? f.a : "",
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      {/* Hero */}
      <section
        className={`relative overflow-hidden bg-gradient-to-br ${CATEGORY_GRADIENTS.season}`}
      >
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <Breadcrumbs
            variant="dark"
            currentPath={currentPath}
            items={[
              { label: "Home", href: "/" },
              { label: "航空券セールカレンダー" },
            ]}
          />
          <div className="mt-4 flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-white/80" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-white/80">
              Flight Sale Calendar
            </p>
          </div>
          <h1 className="mt-3 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
            航空券セールカレンダー｜各社の次回セール時期・予測
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base">
            「航空券のセールはいつ？」に答える、各社の実セール履歴
            {totalRecords} 件の分析。開催が多い月・次回の見込み時期・平均割引率・
            過去最安値を一覧でチェックできます。
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6"
      >
        {/* 全社統合 月別ヒートマップ */}
        <section className="mb-12">
          <SectionHeading subtitle="各社のセール開催を月別に集計。最もセールが多い時期の目安に">
            1年で航空券セールが多い月
          </SectionHeading>
          <div className="mt-5 rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
            <div className="flex items-end justify-between gap-1 sm:gap-2">
              {aggMonthCounts.map((count, i) => {
                const h = Math.round((count / maxAgg) * 100);
                const isTop = topAggMonths.some((m) => m.month === i);
                return (
                  <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                    <div className="flex h-28 w-full items-end sm:h-36">
                      <div
                        className={`w-full rounded-t-md transition-all ${
                          isTop
                            ? "bg-gradient-to-t from-rose-500 to-amber-400"
                            : "bg-zinc-200 dark:bg-zinc-700"
                        }`}
                        style={{ height: `${Math.max(h, 4)}%` }}
                        aria-hidden
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-zinc-400 sm:text-xs">
                      {i + 1}
                    </span>
                    <span className="text-[10px] font-bold tabular-nums text-zinc-600 dark:text-zinc-300">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              過去実績では{" "}
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {topAggMonths.map((m) => MONTHS_JA[m.month]).join("・")}
              </span>{" "}
              にセールが集中。航空会社の決算期（3月・9月）や大型連休前が狙い目です。
              数値は各社の過去セール開催件数（縦軸 = 件数）。
            </p>
          </div>
        </section>

        {/* 航空会社別 予測カード */}
        <section className="mb-12">
          <SectionHeading subtitle="直近の開催から平均間隔を割り出し、次回の見込み時期を統計的に予測">
            航空会社別・次回セール予測
          </SectionHeading>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => (
              <Link
                key={c.code}
                href={`/airlines/${c.code.toLowerCase()}/sales`}
                className="group flex flex-col rounded-2xl border border-zinc-100 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-zinc-400" />
                    <h3 className="text-base font-bold text-zinc-900 group-hover:underline dark:text-zinc-100">
                      {c.name}
                    </h3>
                  </div>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    過去{c.totalSales}回
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50 p-3.5 dark:from-rose-950/30 dark:to-amber-950/20">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-rose-500 dark:text-rose-400">
                    次回セール予測
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {c.nextPredicted ? fmtMonthYear(c.nextPredicted) : `${c.peakMonthLabel}頃`}
                    <span className="ml-1 text-xs font-normal text-zinc-400">
                      ごろ見込み
                    </span>
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                    最頻 {c.peakMonthLabel}
                    {c.avgIntervalDays
                      ? ` ・ 平均 約${Math.round(c.avgIntervalDays / 30)}ヶ月間隔`
                      : ""}
                  </p>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-center">
                  <div className="rounded-lg bg-zinc-50 py-2 dark:bg-zinc-800/50">
                    <dt className="text-[10px] text-zinc-400">平均割引率</dt>
                    <dd className="flex items-center justify-center gap-0.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendingDown className="h-3 w-3" />
                      {c.avgDiscount}%
                    </dd>
                  </div>
                  <div className="rounded-lg bg-zinc-50 py-2 dark:bg-zinc-800/50">
                    <dt className="text-[10px] text-zinc-400">過去最安</dt>
                    <dd className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      ¥{c.lowestPrice.toLocaleString()}
                    </dd>
                  </div>
                </dl>

                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                  {c.name}のセール実績・予測を見る
                  <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-zinc-400">
            ※ 予測は過去のセール開催実績（平均間隔・最頻月）から算出した統計的な目安で、
            開催を保証するものではありません。確定情報は各航空会社の公式発表をご確認ください。
          </p>
        </section>

        {/* セールの狙い方 (独自エディトリアル) */}
        <section className="mb-12">
          <SectionHeading subtitle="履歴データから見える、お得に買うためのコツ">
            航空券セールの狙い方
          </SectionHeading>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                t: "決算期と連休前を狙う",
                d: "3月・9月の決算期、GW・夏休み・年末年始の前はセールが集中。旅行の2〜3ヶ月前から各社の動きをチェックしておくと取り逃しにくいです。",
              },
              {
                t: "LCC は割引率、FSC は長距離",
                d: "Peach・Jetstar などの LCC は数千円台の最安値が出やすく、ANA・JAL は長距離国際線のスペシャル運賃が狙い目。目的地で使い分けると効率的です。",
              },
              {
                t: "タイムセールは即断が鍵",
                d: "タイムセールは数時間〜数日で完売することも。事前に候補路線と予算を決め、通知を受け取れる状態にしておくと、開始直後に動けます。",
              },
            ].map((x) => (
              <div
                key={x.t}
                className="rounded-2xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {x.t}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {x.d}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <SectionHeading subtitle="航空券セールの時期・予測についてよくある質問">
            よくある質問
          </SectionHeading>
          <div className="mt-5">
            <FAQAccordion items={faqs} />
          </div>
        </section>

        {/* CTA */}
        <section className="rounded-2xl border border-zinc-100 bg-gradient-to-br from-zinc-50 to-white p-6 text-center dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950 sm:p-8">
          <Bell className="mx-auto h-6 w-6 text-rose-500" />
          <h2 className="mt-3 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            セールを逃さない
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
            各社の新着セールを週次でまとめてお届け。今週のディールもチェックできます。
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/deals"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              今週のディール一覧
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/airlines"
              className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              航空会社一覧
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
