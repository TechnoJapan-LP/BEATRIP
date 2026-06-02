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
import { Badge } from "@/components/ui/badge";
import { getAirlineByCode, airlines } from "@/data/airlines";
import {
  getSaleHistoryByAirline,
  getAirlineSaleStats,
} from "@/data/sale-history";
import { mockSaleEvents } from "@/data/mock-deals";
import { SiteFooter } from "@/components/site-footer";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const airline = getAirlineByCode(code);
  if (!airline) return { title: "Not Found" };

  const stats = getAirlineSaleStats(code);
  // GSCで「{社名} セール 次回/過去/いつ/時期」が主流入クエリ。
  // タイトル/メタはその検索意図にドンピシャで合わせCTRを取りに行く。
  const title = stats
    ? `${airline.name} 次回セールはいつ？ 過去${stats.totalSales}回の開催実績と予測 | BEATRIP`
    : `${airline.name} セール 次回はいつ？ 過去の開催実績と予測 | BEATRIP`;
  const description = stats
    ? `${airline.name}の過去${stats.totalSales}回のセール開催実績を完全分析。次回タイムセールはいつ？開催月のパターン・平均割引率${stats.avgDiscount}%・過去最安¥${stats.lowestPrice.toLocaleString()}まで。今すぐ買える現セール情報も掲載。`
    : `${airline.name}の過去セール実績と次回開催時期の予測。タイムセール・メガセール等の開催月パターンを分析。`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://beatrip.jp/airlines/${code}/sales`,
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
  const { code } = await params;
  const airline = getAirlineByCode(code);
  if (!airline) notFound();

  const stats = getAirlineSaleStats(code);
  const records = getSaleHistoryByAirline(code);

  const predictions = mockSaleEvents.filter(
    (e) => e.airline === airline.nameEn || e.airline === airline.name
  );

  const monthCounts = new Array(12).fill(0);
  records.forEach((r) => {
    monthCounts[new Date(r.startDate).getMonth()]++;
  });
  const maxMonthCount = Math.max(...monthCounts, 1);

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
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6">
          <Breadcrumbs
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
              <img
                src={airline.logo}
                alt={airline.nameEn}
                className="h-7 w-7 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">
                {airline.name} セール時期・実績まとめ
              </h1>
              <p className="text-xs text-zinc-400 sm:text-sm">
                {airline.nameEn}の過去のセール開催データを分析
              </p>
            </div>
          </div>
        </div>

        {stats && (
          <>
            {/* Stats overview */}
            <div className="grid grid-cols-2 gap-3 mb-8 sm:grid-cols-4">
              <div className="rounded-xl border border-zinc-100 bg-white p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900">
                  {stats.totalSales}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  過去のセール回数
                </div>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {stats.avgDiscount}%
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  平均割引率
                </div>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white p-4 text-center">
                <div className="text-2xl font-bold text-rose-500">
                  {stats.bestDiscount}%
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  最大割引率
                </div>
              </div>
              <div className="rounded-xl border border-zinc-100 bg-white p-4 text-center">
                <div className="text-2xl font-bold text-zinc-900">
                  ¥{formatPrice(stats.lowestPrice)}
                </div>
                <div className="text-[11px] text-zinc-400 mt-1">
                  過去最安値
                </div>
              </div>
            </div>

            {/* Monthly distribution */}
            <div className="rounded-xl border border-zinc-100 bg-white p-4 mb-6 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4 text-zinc-400" />
                <h2 className="font-bold text-zinc-900 text-sm sm:text-base">
                  月別セール開催傾向
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mb-4">
                「{airline.name} セール 時期」で検索する方へ —
                過去データに基づく開催月の傾向です
              </p>
              <div className="flex items-end gap-1 sm:gap-2" style={{ height: 120 }}>
                {monthCounts.map((count, i) => {
                  const h = maxMonthCount > 0 ? (count / maxMonthCount) * 100 : 0;
                  const isPeak =
                    stats.peakMonths.includes(i) && count > 0;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      {count > 0 && (
                        <span className="text-[9px] font-bold text-zinc-500">
                          {count}
                        </span>
                      )}
                      <div
                        className={`w-full rounded-t transition-all ${
                          isPeak ? "bg-emerald-500" : count > 0 ? "bg-zinc-300" : "bg-zinc-100"
                        }`}
                        style={{ height: `${Math.max(h, 4)}%` }}
                      />
                      <span
                        className={`text-[9px] sm:text-[10px] ${
                          isPeak
                            ? "font-bold text-emerald-600"
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
                  <div className="h-2 w-2 rounded-sm bg-zinc-300" />
                  過去に開催あり
                </div>
              </div>
            </div>

            {/* Key insights */}
            <div className="rounded-xl border border-zinc-100 bg-white p-4 mb-6 sm:p-6">
              <h2 className="font-bold text-zinc-900 text-sm mb-3 sm:text-base">
                セール傾向サマリー
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-zinc-700">
                      開催が多い時期
                    </div>
                    <div className="text-xs text-zinc-500">
                      {stats.peakMonths.map((m) => monthNames[m]).join("・")}
                      に開催される傾向
                    </div>
                  </div>
                </div>
                {stats.avgInterval && (
                  <div className="flex items-start gap-3">
                    <Repeat className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-zinc-700">
                        開催頻度
                      </div>
                      <div className="text-xs text-zinc-500">
                        平均約{stats.avgInterval}日間隔で開催（年
                        {Math.round(365 / stats.avgInterval)}回ペース）
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <TrendingDown className="h-4 w-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-zinc-700">
                      主なセール名
                    </div>
                    <div className="text-xs text-zinc-500">
                      {stats.saleNames.join("、")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next sale prediction */}
            {predictions.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 mb-6 sm:p-6">
                <h2 className="font-bold text-emerald-800 text-sm mb-3 sm:text-base">
                  次回セール予測
                </h2>
                <div className="space-y-3">
                  {predictions.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5 border border-emerald-100"
                    >
                      <div>
                        <div className="text-sm font-medium text-zinc-800">
                          {p.saleName}
                        </div>
                        <div className="text-xs text-zinc-400">
                          予測日:{" "}
                          {new Date(p.predictedDate).toLocaleDateString(
                            "ja-JP",
                            { month: "long", day: "numeric" }
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
                  new Date(record.startDate).getTime() >
                  Date.now() - 90 * 24 * 60 * 60 * 1000;
                return (
                  <div
                    key={record.id}
                    className={`rounded-xl border bg-white p-4 ${
                      isRecent ? "border-emerald-200" : "border-zinc-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="text-sm font-bold text-zinc-800">
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
                            className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-zinc-500 flex-shrink-0 ml-2">
                        最安¥{formatPrice(record.minPrice)} · {record.cabin}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-100 bg-white py-12 text-center">
              <p className="text-zinc-400 text-sm">
                セール履歴データがありません
              </p>
            </div>
          )}
        </div>

        {/* SEO structured content */}
        <div className="rounded-xl border border-zinc-100 bg-white p-4 sm:p-6">
          <h2 className="font-bold text-zinc-900 text-sm mb-3 sm:text-base">
            {airline.name}のセール情報について
          </h2>
          <div className="text-xs text-zinc-500 leading-relaxed space-y-2">
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
              のセール情報を自動収集し、過去データに基づいた次回セール予測も提供しています。
              セール開始の通知を受け取りたい方は、アラート機能をご利用ください。
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href={`/airlines/${code}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            {airline.name}の現在のセール情報を見る →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
