import { NextRequest, NextResponse } from "next/server";
import { scrapeAirline, scrapeAllAirlines } from "@/lib/scrapers";

export async function GET(request: NextRequest) {
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
