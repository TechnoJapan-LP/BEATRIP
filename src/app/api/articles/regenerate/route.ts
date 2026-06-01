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
    const now = Date.now();
    // 「最近60日以内に取得したセール」は予約期限切れでも記事化する。
    // 記事は速報的価値があり、期限切れでも振り返り・予測材料になるため、
    // "active" ではなく "recent" を採用する。
    const SIXTY_DAYS = 60 * 24 * 60 * 60 * 1000;

    let totalGenerated = 0;
    const perAirline: Array<{ airline: string; generated: number; salesConsidered: number; totalInStore: number }> = [];

    for (const [code, data] of Object.entries(allSales)) {
      const recentSales = data.sales.filter((s) => {
        if (!s.scrapedAt) return false;
        const scrapedAt = new Date(s.scrapedAt).getTime();
        return now - scrapedAt <= SIXTY_DAYS;
      });

      if (recentSales.length === 0) {
        perAirline.push({
          airline: code,
          generated: 0,
          salesConsidered: 0,
          totalInStore: data.sales.length,
        });
        continue;
      }

      const generated = await generateArticlesFromChanges({
        airlineCode: code,
        newSales: recentSales,
        priceChanges: [], // スナップショットなので値下げ系は対象外
      });
      totalGenerated += generated.length;
      perAirline.push({
        airline: code,
        generated: generated.length,
        salesConsidered: recentSales.length,
        totalInStore: data.sales.length,
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
