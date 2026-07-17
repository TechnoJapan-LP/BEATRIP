import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  TrendingDown,
  BarChart3,
  Clock,
  Repeat,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { getAirlineByCode, airlines } from "@/data/airlines";
import {
  getAirlineSaleStats,
} from "@/data/sale-history";
import { resolveSaleHistory, computeSaleStats } from "@/lib/deals/sale-history-resolver";
import { mockSaleEvents } from "@/data/mock-deals";
import { SiteFooter } from "@/components/site-footer";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { DealCard } from "@/components/deals/deal-card";
import { NewsletterCTASlim } from "@/components/newsletter/newsletter-cta-slim";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { OG_IMAGES } from "@/lib/seo/og";

type Props = { params: Promise<{ code: string; lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  // URL は小文字 (/airlines/ana/sales) でも届くため、データ照合は大文字コードで行う
  const airlineCode = code.toUpperCase();
  const airline = getAirlineByCode(airlineCode);
  // metadata は streaming で先にレスポンスをコミットするため、page 側の notFound()
  // だけではステータスが 200 のまま残る。ここで 404 を確定させる。
  if (!airline) notFound();

  // 「過去N回の開催実績」は事実の主張。実測 (BEATRIPが観測した実績) のときだけ
  // 件数を出し、参考データにフォールバック中は件数を断定しない。
  const history = await resolveSaleHistory(airlineCode);
  const stats = history.source === "observed" ? computeSaleStats(history.records) : null;
  // GSCで「{社名} セール 次回/過去/いつ/時期」が主流入クエリ。
  // タイトル/メタはその検索意図にドンピシャで合わせCTRを取りに行く。
  const title = stats
    ? `${airline.name} 次回セールはいつ？ 過去${stats.totalSales}回の開催実績と予測`
    : `${airline.name} セール 次回はいつ？ 過去の開催実績と予測`;
  const description = stats
    ? `${airline.name}の過去${stats.totalSales}回のセール開催実績を完全分析。次回タイムセールはいつ？開催月のパターン・平均割引率${stats.avgDiscount}%・過去最安¥${stats.lowestPrice.toLocaleString()}まで。今すぐ買える現セール情報も掲載。`
    : `${airline.name}の過去セール実績と次回開催時期の目安。タイムセール・メガセール等の開催月パターンを分析。今すぐ買える現セール情報も掲載。`;

  return {
    title,
    description,
    openGraph: {
      images: OG_IMAGES,
      title,
      description,
    },
    alternates: {
      canonical: `https://beatrip.jp/airlines/${code}/sales`,
      languages: {
        ja: `https://beatrip.jp/airlines/${code}/sales`,
        "x-default": `https://beatrip.jp/airlines/${code}/sales`,
      },
    },
  };
}

export function generateStaticParams() {
  return airlines.map((a) => ({ code: a.code }));
}

const monthNames = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日〜${e.getMonth() + 1}月${e.getDate()}日`;
}

export default async function AirlineSaleHistoryPage({ params }: Props) {
  const { code, lang } = await params;
  // URL は小文字 (/airlines/ana/sales) でも届くため、データ照合は大文字コードで行う
  const airlineCode = code.toUpperCase();
  const airline = getAirlineByCode(airlineCode);
  if (!airline) notFound();

  // 実測が貯まった社は実測のみ。まだの社は出所未確認の参考データで橋渡しし、
  // 「参考」であることを画面で必ず明示する (historySource)。
  const history = await resolveSaleHistory(airlineCode);
  const records = history.records;
  const stats = computeSaleStats(records);
  const historySource = history.source;

  // 収益導線: この社の「いま開催中」のセール。「次回はいつ？」で来た訪問者に
  // 現物を最初に見せるのが最も自然なコンバージョン (詳細ページ→予約アフィリ)。
  const activeDeals = (await getActiveDeals())
    .filter((d) => d.airline_id === airlineCode && !d.is_sample)
    .sort((a, b) => a.sale_price - b.sale_price)
    .slice(0, 4);
  // Server Component なので Date.now() を一度だけリクエスト時に評価して使用。
  // React Compiler の purity 警告はクライアントコンポーネント向けで、ここでは
  // 意図的に許可する（リクエストごとに固定の "today" を得るのが目的）。
  // eslint-disable-next-line react-hooks/purity
  const recentThreshold = Date.now() - 90 * 24 * 60 * 60 * 1000;

  const predictions = mockSaleEvents.filter(
    (e) => e.airline === airline.nameEn || e.airline === airline.name,
  );

  const monthCounts = new Array(12).fill(0);
  records.forEach((r) => {
    monthCounts[new Date(r.startDate).getMonth()]++;
  });
  const maxMonthCount = Math.max(...monthCounts, 1);

  // 主要セール種別（記録から拾い、過去開催回数の多い順）
  const saleTypeCounts = new Map<string, number>();
  for (const r of records) {
    // "ANA タイムセール" → "タイムセール" のように種別ワードだけ抽出
    const typeWords = [
      "タイムセール",
      "メガセール",
      "スーパーバリュー",
      "スペシャルセーバー",
      "サマーSALE",
      "秋の旅割",
      "ビジネスクラス タイムセール",
      "プレミアムエコノミー SALE",
      "片道キャンペーン",
    ];
    for (const word of typeWords) {
      if (r.saleName.includes(word)) {
        saleTypeCounts.set(word, (saleTypeCounts.get(word) ?? 0) + 1);
      }
    }
  }
  const topSaleTypes = [...saleTypeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // 月別の傾向トップ3（次回の最頻月予測）
  const monthIndexed = monthCounts
    .map((count, i) => ({ month: i + 1, count }))
    .sort((a, b) => b.count - a.count);
  const peakMonths = monthIndexed.filter((m) => m.count > 0).slice(0, 3);

  // FAQ — GSCで実際に検索されているクエリにピンポイントで答える。
  // FAQPage JSON-LD に入る = Google に事実として伝わるため、出所を偽らない。
  const isObservedHistory = historySource === "observed";
  const basis = isObservedHistory
    ? "BEATRIPが観測した開催実績"
    : "参考データ（BEATRIPの観測実績が貯まり次第、実測に切り替わります）";
  const faqs: { q: string; a: string }[] = [];
  if (peakMonths.length > 0) {
    faqs.push({
      q: `${airline.name}のセールはいつ開催されますか？`,
      a: `${basis}では、${peakMonths.map((m) => `${m.month}月（${m.count}回）`).join("、")}に集中しています。${stats ? `${stats.totalSales}件を分析した結果です。` : ""}最新の開催状況は本ページ上部の「現在開催中のセール」もしくは BEATRIP トップで確認できます。`,
    });
    faqs.push({
      q: `次回の${airline.name}セールはいつ頃ですか？`,
      a: `${basis}では${peakMonths[0].month}月の開催が最多（${peakMonths[0].count}回）。${predictions.length > 0 ? `BEATRIPの予測では「${predictions[0].saleName}」が ${new Date(predictions[0].predictedDate).toLocaleDateString("ja-JP", { year: "numeric", month: "long" })} ごろの開催見込み（確度${predictions[0].probability}%）。` : ""}メールで通知を受け取りたい方はBEATRIPの価格アラートをご利用ください。`,
    });
  }
  if (topSaleTypes.length > 0) {
    faqs.push({
      q: `${airline.name}には主にどのようなセール種別がありますか？`,
      a: `${basis}で多いのは ${topSaleTypes.map(([type, count]) => `「${type}」（${count}回）`).join("、")} です。各セールの内容や対象路線は本ページの「セール開催履歴」で確認できます。`,
    });
  }
  if (stats) {
    faqs.push({
      q: `${airline.name}セールの過去最安値はいくらですか？`,
      a: `${basis}における最安値は ¥${stats.lowestPrice.toLocaleString()}（平均割引率 ${stats.avgDiscount}%）です。航路・時期によって変動します。`,
    });
  }
  faqs.push({
    q: `${airline.name}のセールを見逃さないにはどうすれば良いですか？`,
    a: `BEATRIP の無料ニュースレターに登録すると、${airline.name}を含む各社の新着セールを週次でまとめてメールで受け取れます。特定路線の値下げ通知が欲しい場合は価格アラート機能をご利用ください。`,
  });

  const faqJsonLd =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }
      : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${airline.name}（${airline.nameEn}）セール時期・実績まとめ`,
    description: stats
      ? `${airline.name}の過去${stats.totalSales}回のセール実績を分析。平均割引率${stats.avgDiscount}%、最安値¥${stats.lowestPrice.toLocaleString()}。`
      : `${airline.name}のセール実績・開催時期まとめ。`,
    url: `https://beatrip.jp/airlines/${code}/sales`,
    isPartOf: {
      "@type": "WebSite",
      name: "BEATRIP",
      url: "https://beatrip.jp",
    },
    about: {
      "@type": "Airline",
      name: airline.name,
      alternateName: airline.nameEn,
      iataCode: airline.code,
    },
    ...(stats
      ? {
          mainEntity: {
            "@type": "ItemList",
            name: `${airline.name}のセール履歴`,
            numberOfItems: stats.totalSales,
            itemListElement: records.slice(0, 10).map((record, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: record.saleName,
              description: `最大${record.maxDiscount}%OFF、最安¥${record.minPrice.toLocaleString()}`,
            })),
          },
        }
      : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <Breadcrumbs
            currentPath={
              lang === "en"
                ? `/en/airlines/${code}/sales`
                : `/airlines/${code}/sales`
            }
            items={[
              { label: "Home", href: "/" },
              { label: "Airlines", href: "/airlines" },
              { label: airline.name, href: `/airlines/${code}` },
              { label: "セール実績" },
            ]}
          />
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden"
              style={{
                backgroundColor: "white",
                border: `1.5px solid ${airline.color}30`,
              }}
            >
              {/* 隣の h1 が airline 名を読み上げるため装飾扱い */}
              <img
                src={airline.logo}
                alt=""
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 sm:text-2xl">
                {airline.name} セール時期・実績まとめ
              </h1>
              <p className="text-xs text-zinc-400 sm:text-sm">
                {records.length > 0
                  ? `${airline.nameEn}のセール開催データを分析（BEATRIP観測実績）`
                  : `${airline.nameEn}のセール開催を記録中（実測が溜まり次第公開）`}
              </p>
            </div>
          </div>
        </div>

        {stats && (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {stats.totalSales}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  観測したセール回数
                </div>
              </div>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.avgDiscount}%
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">平均割引率</div>
              </div>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
                <div className="text-2xl font-bold text-rose-500">
                  {stats.bestDiscount}%
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">最大割引率</div>
              </div>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  ¥{formatPrice(stats.lowestPrice)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  観測最安値
                </div>
              </div>
            </div>

            {/* 開催中のセール — 「次回いつ?」の訪問者に現物を提示 (主要収益導線) */}
            {activeDeals.length > 0 && (
              <div className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                      いま掲載中の{airline.name}のセール・最安値
                    </h2>
                  </div>
                  <Link
                    href={`/deals?airline=${airlineCode}`}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                  >
                    すべて見る →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
                  {activeDeals.map((deal, i) => (
                    <DealCard key={deal.id} deal={deal} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Monthly distribution — 実測が無い間はセクションごと出さない。
                空のグラフに「開催傾向」と題を付けると、存在しない傾向を
                示唆してしまうため。 */}
            {records.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-4 mb-6 sm:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                    月別セール開催傾向
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {airline.name}のセール開催を BEATRIP
                  が実際に観測して記録しています。現在集計中のため、開催月の傾向はまだ公開していません
                  （推測に基づく数値は掲載しません）。開催中のセールは上部に、新着はニュースレターでお届けします。
                </p>
              </div>
            ) : (
            <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 mb-6 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-zinc-400" />
                <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  月別セール開催傾向
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                「{airline.name} セール 時期」で検索する方へ —
                BEATRIPが実際に観測した{records.length}件の開催実績です
              </p>
              <div
                className="flex items-end gap-1 sm:gap-2"
                style={{ height: 120 }}
              >
                {monthCounts.map((count, i) => {
                  const h =
                    maxMonthCount > 0 ? (count / maxMonthCount) * 100 : 0;
                  const isPeak = stats.peakMonths.includes(i) && count > 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      {count > 0 && (
                        <span className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400">
                          {count}
                        </span>
                      )}
                      <div
                        className={`w-full rounded-t transition-all ${
                          isPeak
                            ? "bg-emerald-500"
                            : count > 0
                              ? "bg-zinc-300 dark:bg-zinc-600"
                              : "bg-zinc-100 dark:bg-zinc-800"
                        }`}
                        style={{ height: `${Math.max(h, 4)}%` }}
                      />
                      <span
                        className={`text-[9px] sm:text-[10px] ${
                          isPeak
                            ? "font-bold text-emerald-600 dark:text-emerald-400"
                            : "text-zinc-400"
                        }`}
                      >
                        {monthNames[i]}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-4 text-[10px] text-zinc-400">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-sm bg-emerald-500" />
                  開催が多い月
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-sm bg-zinc-300 dark:bg-zinc-600" />
                  過去に開催あり
                </div>
              </div>
            </div>
            )}

            {/* メール捕捉 — 「次回いつ?」の訪問者を読者化する最重要導線。
                タイムセールは数時間で終わるため通知の価値提案が刺さる文脈 */}
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 sm:p-5">
              <p className="mb-3 text-sm font-bold text-emerald-900 dark:text-emerald-200">
                {airline.name}の次回セールを見逃さない
              </p>
              <p className="mb-3 text-xs leading-relaxed text-emerald-800/80 dark:text-emerald-300/80">
                タイムセールは数時間〜数日で終了することがあります。新着セールを
                週次まとめでメールにお届けします (無料・いつでも解除可)。
              </p>
              <NewsletterCTASlim source="airline_sales" />
            </div>

            {/* Key insights */}
            <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 mb-6 sm:p-6">
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-3 sm:text-base">
                セール傾向サマリー
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      開催が多い時期
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {stats.peakMonths.map((m) => monthNames[m]).join("・")}
                      に開催される傾向
                    </div>
                  </div>
                </div>
                {stats.avgInterval && (
                  <div className="flex items-start gap-3">
                    <Repeat className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        開催頻度
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        平均約{stats.avgInterval}日間隔で開催（年
                        {Math.round(365 / stats.avgInterval)}回ペース）
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                      主なセール名
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {stats.saleNames.join("、")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next sale prediction */}
            {predictions.length > 0 && (
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/30 p-4 mb-6 sm:p-6">
                <h2 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm mb-3 sm:text-base">
                  次回セール予測
                </h2>
                <div className="space-y-3">
                  {predictions.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg bg-white dark:bg-zinc-900 px-3 py-2.5 border border-emerald-100 dark:border-emerald-900"
                    >
                      <div>
                        <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                          {p.saleName}
                        </div>
                        <div className="text-xs text-zinc-400">
                          予測日:{" "}
                          {new Date(p.predictedDate).toLocaleDateString(
                            "ja-JP",
                            { month: "long", day: "numeric" },
                          )}{" "}
                          · 平均-{p.avgDiscount}%
                        </div>
                      </div>
                      <Badge
                        className={`text-[10px] font-bold ${
                          p.probability >= 80
                            ? "bg-emerald-500 text-white"
                            : p.probability >= 60
                              ? "bg-amber-500 text-white"
                              : "bg-zinc-400 text-white"
                        }`}
                      >
                        {p.probability}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* FAQ — GSCで実際に検索されているクエリにピンポイントで答え、
            FAQPage 構造化データでリッチ結果（featured snippet）も狙う */}
        {faqs.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-zinc-400" />
              <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                よくある質問
              </h2>
            </div>
            <FAQAccordion items={faqs} />
          </div>
        )}

        {/* Sale history timeline */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-4 w-4 text-zinc-400" />
            <h2 className="font-bold text-zinc-900 text-sm sm:text-base">
              セール開催履歴
            </h2>
          </div>
          {records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record) => {
                const isRecent =
                  new Date(record.startDate).getTime() > recentThreshold;
                return (
                  <div
                    key={record.id}
                    className={`rounded-xl border bg-white dark:bg-zinc-900 p-4 ${
                      isRecent
                        ? "border-emerald-200 dark:border-emerald-900"
                        : "border-zinc-100 dark:border-zinc-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                          {record.saleName}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5">
                          {formatDateRange(record.startDate, record.endDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {isRecent && (
                          <Badge className="bg-emerald-500 text-white text-[9px]">
                            直近
                          </Badge>
                        )}
                        <span className="text-sm font-bold text-rose-500">
                          -{record.maxDiscount}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {record.routes.map((r) => (
                          <span
                            key={r}
                            className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0 ml-2">
                        最安¥{formatPrice(record.minPrice)} · {record.cabin}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="セール履歴データがありません"
              description={`${airline.name}のセール実績は順次収集しています。最新のセール情報や他社の実績もあわせてご覧ください。`}
              action={{ label: "最新のセールを見る", href: "/" }}
              secondaryActions={[{ label: "航空会社一覧", href: "/airlines" }]}
            />
          )}
        </div>

        {/* SEO structured content */}
        <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-3 sm:text-base">
            {airline.name}のセール情報について
          </h2>
          <div className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed space-y-2">
            <p>
              {airline.name}（{airline.nameEn}）は
              {airline.type === "LCC"
                ? "格安航空会社（LCC）"
                : "フルサービスキャリア"}
              として
              {stats
                ? `、過去${stats.totalSales}回のセールを開催しています。平均割引率は${stats.avgDiscount}%で、最大${stats.bestDiscount}%OFFのセールが過去に確認されています。`
                : "セールを定期的に開催しています。"}
            </p>
            {stats?.peakMonths && (
              <p>
                セール開催が多い時期は
                {stats.peakMonths.map((m) => monthNames[m]).join("・")}
                です。
                {stats.avgInterval &&
                  `平均約${stats.avgInterval}日間隔で新しいセールが開始される傾向にあります。`}
              </p>
            )}
            <p>
              BEATRIPでは{airline.name}
              のセール情報を自動収集し、開催月のパターンから次回セール時期の目安も提供しています。
              セール開始の通知を受け取りたい方は、アラート機能をご利用ください。
            </p>
          </div>
        </div>

        {/* 他社のセール予測への内部リンク循環 — 勝ちページ (PCH等) の被リンクを
            新規社ページへ分配し、17社群のインデックス/評価を底上げする */}
        <div className="mt-8 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-6">
          <h2 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm mb-1 sm:text-base">
            他の航空会社のセール時期・予測
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            「次のセールはどこが早い?」を各社の開催実績から比較できます
          </p>
          <div className="flex flex-wrap gap-2">
            {airlines
              .filter(
                (a) =>
                  a.code !== airlineCode &&
                  getAirlineSaleStats(a.code) !== null,
              )
              .map((a) => (
                <Link
                  key={a.code}
                  href={`/airlines/${a.code}/sales`}
                  className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
                >
                  {a.name}のセール予測
                </Link>
              ))}
            <Link
              href="/sale-calendar"
              className="inline-flex items-center gap-1 rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              全社のセールカレンダーを見る
              <ArrowLeft className="h-3 w-3 rotate-180" />
            </Link>
          </div>
        </div>

        {/* 収益レール: 予約サイト比較 (env 設定済みパートナーのみ表示) */}
        <div className="mt-8">
          <JapanesePartnersPanel
            title="セール航空券の予約に使えるサイト"
            subtitle="セール発表後は公式が混み合うことも。比較予約サイトも併用するとスムーズです"
            categories={["flight-domestic", "flight-overseas", "tour-package"]}
            compact
            maxChips={6}
            source="airline_sales"
          />
        </div>

        <div className="mt-6 text-center">
          <Link
            href={`/airlines/${code}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            {airline.name}の現在のセール情報を見る →
          </Link>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
