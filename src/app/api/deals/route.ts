import { NextRequest, NextResponse } from "next/server";
import { getActiveDeals, getStoreStatus } from "@/lib/deals/deal-service";

/**
 * GET /api/deals
 *
 * ストアからアクティブなディールを返す
 * クエリパラメータ:
 *   - airline: 航空会社コードでフィルタ（例: ANA, JAL）
 *   - type: "domestic" | "international" で路線タイプフィルタ
 *   - status: "status" を指定するとストアのステータスを返す
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const airline = searchParams.get("airline");
  const type = searchParams.get("type");
  const statusOnly = searchParams.get("status");

  // ストアステータス確認は内部情報のため CRON_SECRET / ADMIN_API_KEY 必須
  if (statusOnly === "true" || statusOnly === "status") {
    const authHeader = request.headers.get("authorization");
    const expected = process.env.CRON_SECRET ?? process.env.ADMIN_API_KEY;
    if (!expected || authHeader !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const status = await getStoreStatus();
    return NextResponse.json(status);
  }

  let deals = await getActiveDeals();

  // 航空会社フィルタ
  if (airline) {
    deals = deals.filter(
      (d) => d.airline_id.toLowerCase() === airline.toLowerCase()
    );
  }

  // 路線タイプフィルタ
  if (type === "domestic") {
    deals = deals.filter(
      (d) => isJapanAirport(d.origin_code) && isJapanAirport(d.destination_code)
    );
  } else if (type === "international") {
    deals = deals.filter(
      (d) => !(isJapanAirport(d.origin_code) && isJapanAirport(d.destination_code))
    );
  }

  return NextResponse.json({
    deals,
    total: deals.length,
    timestamp: new Date().toISOString(),
  });
}

const JP_CODES = new Set([
  "NRT", "HND", "KIX", "ITM", "NGO", "CTS", "FUK", "OKA",
  "KOJ", "HIJ", "SDJ", "KMQ", "NGS", "OIT", "MYJ", "KCZ",
  "TAK", "TKS", "KMJ", "AOJ", "AKJ", "MMB", "OBO", "HKD",
  "GAJ", "SHM", "UBJ", "IZO", "TTJ", "KMI", "ASJ", "ISG", "MMY",
]);

function isJapanAirport(code: string): boolean {
  return JP_CODES.has(code);
}
