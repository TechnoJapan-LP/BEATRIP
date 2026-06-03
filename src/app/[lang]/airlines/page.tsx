import type { Metadata } from "next";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "航空会社セール一覧",
  description: "ANA・JAL・Peach・Jetstarなど、日本発着の航空会社セール情報を自動収集。最新のフライトキャンペーン・割引情報をまとめてチェック。",
  openGraph: {
    title: "航空会社セール一覧",
    description: "日本発着の全航空会社セール情報をリアルタイムで収集・表示",
  },
  alternates: {
    canonical: "https://beatrip.jp/airlines",
    languages: {
      ja: "https://beatrip.jp/airlines",
      en: "https://beatrip.jp/en/airlines",
      "x-default": "https://beatrip.jp/airlines",
    },
  },
};
import { AirlineCard } from "@/components/airlines/airline-card";
import { airlines } from "@/data/airlines";
import { loadAllSales } from "@/lib/store/sale-store";
import { scrapeAllAirlines } from "@/lib/scrapers";
import { saveSalesAndDetectChanges } from "@/lib/store/sale-store";
import { mockSaleEvents } from "@/data/mock-deals";
import { SiteFooter } from "@/components/site-footer";

async function getSalesData() {
  const stored = await loadAllSales();
  if (Object.keys(stored).length > 0) {
    return {
      salesByAirline: Object.fromEntries(
        Object.entries(stored).map(([code, data]) => [code, data.sales])
      ),
      lastScraped: Object.values(stored)
        .map((d) => d.lastScraped)
        .sort()
        .pop() || null,
    };
  }

  const results = await scrapeAllAirlines();
  for (const result of results) {
    await saveSalesAndDetectChanges(result);
  }
  return {
    salesByAirline: Object.fromEntries(
      results.map((r) => [r.airlineCode, r.sales])
    ),
    lastScraped: results[0]?.scrapedAt || null,
  };
}

export default async function AirlinesPage() {
  const { salesByAirline, lastScraped } = await getSalesData();

  const formattedTime = lastScraped
    ? new Date(lastScraped).toLocaleString("ja-JP", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl lg:text-4xl">
              航空会社セール
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              各航空会社のセール情報を自動収集・一覧表示
            </p>
          </div>
          {formattedTime && (
            <span className="text-xs text-zinc-400">
              最終取得: {formattedTime}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {airlines.map((airline, i) => (
            <AirlineCard
              key={airline.code}
              airline={airline}
              sales={salesByAirline[airline.code] ?? []}
              index={i}
              upcomingEvents={mockSaleEvents.filter(
                (e) => e.airline === airline.nameEn || e.airline === airline.name
              )}
            />
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
