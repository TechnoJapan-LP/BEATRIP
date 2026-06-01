import { NextRequest, NextResponse } from "next/server";
import { loadAllSales } from "@/lib/store/sale-store";
import { generateArticlesFromChanges } from "@/lib/articles/article-generator";

/**
 * 管理用エンドポイント：現在ストアにあるアクティブセールから記事を再生成する。
 *
 * Cron の差分検出に依存せず、ストア状態をスナップショットで「全部新着」として
 * 記事化することで、即座にサイト記事を更新できる。slug 単位で重複排除される
 * ため、同じセールが2度記事化されることはない（安全に何度でも実行可能）。
 *
 * 認証: CRON_SECRET を Bearer で必須。
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const allSales = await loadAllSales();
    const now = new Date();

    let totalGenerated = 0;
    const perAirline: Array<{ airline: string; generated: number; salesConsidered: number }> = [];

    for (const [code, data] of Object.entries(allSales)) {
      // 期限切れ・非アクティブを除外して新着候補として渡す
      const activeSales = data.sales.filter((s) => {
        if (!s.isActive) return false;
        const deadline = new Date(s.bookingDeadline);
        return deadline >= now;
      });

      if (activeSales.length === 0) {
        perAirline.push({ airline: code, generated: 0, salesConsidered: 0 });
        continue;
      }

      const generated = await generateArticlesFromChanges({
        airlineCode: code,
        newSales: activeSales,
        priceChanges: [], // スナップショットなので値下げ系は対象外
      });
      totalGenerated += generated.length;
      perAirline.push({
        airline: code,
        generated: generated.length,
        salesConsidered: activeSales.length,
      });
    }

    return NextResponse.json({
      success: true,
      totalGenerated,
      perAirline,
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("[regenerate] failed:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
