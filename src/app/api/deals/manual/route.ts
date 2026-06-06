import { NextRequest, NextResponse } from "next/server";
import { saveSalesAndDetectChanges } from "@/lib/store/sale-store";
import { dispatchNotifications } from "@/lib/notifications/notifier";
import { generateArticlesFromChanges } from "@/lib/articles/article-generator";
import type { AirlineSale } from "@/lib/scrapers/types";

/**
 * POST /api/deals/manual
 *
 * 手動でセール情報を登録する管理API
 * 環境変数 ADMIN_API_KEY で認証
 *
 * Body:
 * {
 *   airlineCode: "ANA",
 *   sale: AirlineSale
 * }
 */
export async function POST(request: NextRequest) {
  // 認証チェック (本番では ADMIN_API_KEY 必須、未設定なら 500 fail-safe)
  const authHeader = request.headers.get("authorization");
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Server misconfigured: ADMIN_API_KEY required" },
        { status: 500 }
      );
    }
  } else if (authHeader !== `Bearer ${adminKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ペイロード上限 (1 MB) で DoS 防止
    const contentLength = parseInt(
      request.headers.get("content-length") ?? "0",
      10
    );
    if (contentLength > 1024 * 1024) {
      return NextResponse.json(
        { error: "Payload too large" },
        { status: 413 }
      );
    }
    const body = await request.json();
    const { airlineCode, sale } = body as {
      airlineCode: string;
      sale: AirlineSale;
    };

    if (!airlineCode || !sale) {
      return NextResponse.json(
        { error: "airlineCode and sale are required" },
        { status: 400 }
      );
    }

    // 必須フィールドの検証
    if (!sale.id || !sale.saleName || !sale.routes?.length) {
      return NextResponse.json(
        { error: "sale must have id, saleName, and at least one route" },
        { status: 400 }
      );
    }

    // ストアに保存 & 変更検知
    const change = await saveSalesAndDetectChanges({
      airlineCode,
      sales: [sale],
      scrapedAt: new Date().toISOString(),
      success: true,
    });

    // 新セールがあれば通知 & 記事生成
    if (change.hasChanges) {
      await dispatchNotifications([change]);
      await generateArticlesFromChanges(change);
    }

    return NextResponse.json({
      success: true,
      change: {
        newSales: change.newSales.length,
        endedSales: change.endedSales.length,
        priceChanges: change.priceChanges.length,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
