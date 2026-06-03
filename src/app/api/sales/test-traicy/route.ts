import { NextRequest, NextResponse } from "next/server";
import { TraicyScraper } from "@/lib/scrapers/traicy-scraper";
import { AirlinePageScraper } from "@/lib/scrapers/airline-page-scraper";
import { airlines } from "@/data/airlines";

/**
 * GET /api/sales/test-traicy
 *
 * 実スクレイパーをテストするエンドポイント（ストアには保存しない）
 *
 * クエリパラメータ:
 *   - source: "traicy" | "airline-page" | "all"（デフォルト: traicy）
 *   - airline: 特定の航空会社コード（airline-pageソース時）
 *   - verbose: "true" で詳細ログ
 */
export async function GET(request: NextRequest) {
  // 管理用デバッグエンドポイント: CRON_SECRET の Bearer 必須。
  // スクレイパー内部の詳細を晒すため、認証を強制する。
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const source = searchParams.get("source") ?? "traicy";
  const airlineCode = searchParams.get("airline");
  const verbose = searchParams.get("verbose") === "true";

  const startTime = Date.now();

  try {
    if (source === "traicy") {
      const scraper = new TraicyScraper(airlineCode ?? "ALL");
      const result = await scraper.scrape();
      const elapsed = Date.now() - startTime;

      return NextResponse.json({
        source: "Traicy RSS",
        elapsed: `${elapsed}ms`,
        success: result.success,
        error: result.error,
        totalSales: result.sales.length,
        airlinesCovered: [...new Set(result.sales.map((s) => s.airlineCode))],
        routesCount: result.sales.reduce((sum, s) => sum + s.routes.length, 0),
        sales: verbose
          ? result.sales
          : result.sales.map((s) => ({
              id: s.id,
              airlineCode: s.airlineCode,
              airlineName: s.airlineName,
              saleName: s.saleName,
              routesCount: s.routes.length,
              routes: s.routes.map((r) => ({
                route: `${r.originCode}→${r.destinationCode}`,
                price: r.price,
                cabin: r.cabin,
              })),
              sourceUrl: s.sourceUrl,
              startDate: s.startDate,
              endDate: s.endDate,
            })),
      });
    }

    if (source === "airline-page") {
      const code = airlineCode ?? "ANA";
      const airline = airlines.find((a) => a.code === code);
      if (!airline) {
        return NextResponse.json({ error: `Airline ${code} not found` }, { status: 404 });
      }

      const scraper = new AirlinePageScraper(
        code,
        airline.nameEn || airline.name,
        airline.scrapeSources
      );
      const result = await scraper.scrape();
      const elapsed = Date.now() - startTime;

      return NextResponse.json({
        source: `${airline.name} 公式ページ`,
        sourceUrls: airline.scrapeSources.map((s) => s.url),
        elapsed: `${elapsed}ms`,
        success: result.success,
        error: result.error,
        totalSales: result.sales.length,
        routesCount: result.sales.reduce((sum, s) => sum + s.routes.length, 0),
        sales: verbose
          ? result.sales
          : result.sales.map((s) => ({
              saleName: s.saleName,
              routesCount: s.routes.length,
              routes: s.routes.map((r) => ({
                route: `${r.originCode}→${r.destinationCode}`,
                price: r.price,
              })),
            })),
      });
    }

    return NextResponse.json({ error: "Invalid source" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    // 本番ではスタックトレースを返さない（実装詳細の漏洩防止）
    const stack =
      process.env.NODE_ENV === "development" && error instanceof Error
        ? error.stack
        : undefined;
    return NextResponse.json(
      { success: false, error: message, stack, elapsed: `${Date.now() - startTime}ms` },
      { status: 500 }
    );
  }
}
