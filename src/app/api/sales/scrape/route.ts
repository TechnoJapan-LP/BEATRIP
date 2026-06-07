import { NextRequest, NextResponse } from "next/server";
import { scrapeAirline, scrapeAllAirlines } from "@/lib/scrapers";

/**
 * /api/sales/scrape は scrape を直接トリガーする重い endpoint。
 * 本番では CRON_SECRET / ADMIN_API_KEY 必須にして public DoS を防ぐ。
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET ?? process.env.ADMIN_API_KEY;
  if (!expected) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Server misconfigured: CRON_SECRET or ADMIN_API_KEY required" },
        { status: 500 }
      );
    }
  } else if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const code = request.nextUrl.searchParams.get("airline");

  if (code) {
    const result = await scrapeAirline(code);
    return NextResponse.json(result);
  }

  const results = await scrapeAllAirlines();
  return NextResponse.json({
    results,
    totalSales: results.reduce((sum, r) => sum + r.sales.length, 0),
    scrapedAt: new Date().toISOString(),
  });
}
