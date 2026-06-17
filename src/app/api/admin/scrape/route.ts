import { NextRequest, NextResponse } from "next/server";
import { scrapeAllAirlines } from "@/lib/scrapers";
import { saveSalesAndDetectChanges } from "@/lib/store/sale-store";

/**
 * Admin 用: 手動スクレイプ実行エンドポイント
 *
 * 認証: Bearer ${ADMIN_API_KEY} (admin 画面のボタンから token で叩く)
 * 動作: 全航空会社をスクレイプ → KV に保存 → 航空会社別の取得件数を返す
 * 用途: パーサー改修後などに即時更新して、件数を画面で確認するため
 *
 * cron/scrape と違いニュースレター/SNS/価格アラートは走らせない
 * (件数確認・KV更新に特化して高速・安全に)。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthed(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const header = req.headers.get("authorization") ?? "";
  if (header === `Bearer ${adminKey}`) return true;
  return req.nextUrl.searchParams.get("token") === adminKey;
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json(
      { success: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  const startedAt = Date.now();
  try {
    const results = await scrapeAllAirlines();

    let totalSales = 0;
    let newSales = 0;
    const details: {
      airline: string;
      scraped: number;
      success: boolean;
      error?: string;
    }[] = [];

    for (const r of results) {
      const change = await saveSalesAndDetectChanges(r);
      totalSales += r.sales.length;
      newSales += change.newSales.length;
      details.push({
        airline: r.airlineCode,
        scraped: r.sales.length,
        success: r.success,
        error: r.error,
      });
    }

    details.sort((a, b) => b.scraped - a.scraped);

    return NextResponse.json({
      success: true,
      scraperMode: process.env.SCRAPER_MODE ?? "mock",
      elapsedMs: Date.now() - startedAt,
      airlines: results.length,
      totalSales,
      newSales,
      details,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "unknown" },
      { status: 500 }
    );
  }
}
