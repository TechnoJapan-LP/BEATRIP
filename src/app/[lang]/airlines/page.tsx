import type { Metadata } from "next";
import { Header } from "@/components/header";

export const metadata: Metadata = {
  title: "航空会社セール一覧",
  description:
    "「ANA セール」「JAL セール」「Peach タイムセール」「Jetstar セール」で検索する方へ。日本発着の主要キャリア／LCC の最新セール・キャンペーン・割引情報を自動収集してまとめて掲載。次回開催時期の予測も。",
  openGraph: {
    title: "航空会社セール一覧",
    description:
      "ANA・JAL・Peach・Jetstar など日本発着の航空会社セールをリアルタイムで自動収集・横断比較。",
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

  // CollectionPage + ItemList — 航空会社一覧の構造を検索エンジンに明示
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "航空会社セール一覧",
    description:
      "日本発着の航空会社セール情報を自動収集・横断比較。",
    url: "https://beatrip.jp/airlines",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: airlines.length,
      itemListElement: airlines.map((a, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://beatrip.jp/airlines/${a.code}`,
        name: a.name,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
