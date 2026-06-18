import { NextRequest, NextResponse } from "next/server";
import { scrapeTravelPayoutsPrices } from "@/lib/flights/travelpayouts-prices";

/**
 * TravelPayouts フライトデータAPI の動作確認用エンドポイント (admin デバッグ)
 *
 * 認証: Bearer ${CRON_SECRET}
 * 動作: (1) HND 発の生APIレスポンスの先頭数件 (実データ形状の確認用)
 *       (2) パイプライン変換後の件数 + サンプル
 * KV には保存しない (純粋な確認)。
 */
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = process.env.TRAVELPAYOUTS_API_TOKEN;
  if (!token) {
    return NextResponse.json(
      { success: false, error: "TRAVELPAYOUTS_API_TOKEN が未設定" },
      { status: 400 }
    );
  }

  // (1) 生レスポンスの形状確認 (HND 発)
  let rawSample: unknown = null;
  let rawError: string | null = null;
  try {
    const url =
      "https://api.travelpayouts.com/v2/prices/latest?currency=jpy&origin=HND" +
      "&period_type=year&one_way=false&page=1&limit=5&show_to_affiliates=true&sorting=price";
    const res = await fetch(url, {
      headers: { "X-Access-Token": token, Accept: "application/json" },
      cache: "no-store",
    });
    const json = (await res.json()) as { data?: unknown[] };
    rawSample = {
      httpStatus: res.status,
      firstItems: Array.isArray(json?.data) ? json.data.slice(0, 3) : json,
    };
  } catch (e) {
    rawError = e instanceof Error ? e.message : "fetch error";
  }

  // (2) パイプライン変換後
  const results = await scrapeTravelPayoutsPrices();
  const totalRoutes = results.reduce(
    (sum, r) => sum + r.sales.reduce((s, sale) => s + sale.routes.length, 0),
    0
  );
  const sampleRoutes = results
    .flatMap((r) => r.sales.flatMap((s) => s.routes))
    .slice(0, 8)
    .map((rt) => ({
      route: `${rt.originCode}→${rt.destinationCode}`,
      price: rt.price,
      originalPrice: rt.originalPrice,
      discount: rt.discount,
    }));

  return NextResponse.json({
    success: true,
    rawSample,
    rawError,
    parsed: {
      origins: results[0]?.sales.length ?? 0,
      totalRoutes,
      sampleRoutes,
    },
  });
}
