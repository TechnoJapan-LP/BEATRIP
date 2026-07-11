import { NextResponse } from "next/server";
import { isKVEnabled } from "@/lib/store/kv";
import { loadAllSales } from "@/lib/store/sale-store";

/**
 * スクレイパー稼働の公開ヘルスチェック (機密情報は出さない)。
 *
 * 返すもの:
 *   scraperMode      "mock" | "live" | "hybrid"  (本番稼働には "hybrid" 推奨)
 *   kvEnabled        KV(Upstash/Vercel KV) が接続されているか (永続化に必須)
 *   storeSalesCount  ストアに載っているセール総数 (同梱seed含む)
 *   latestScrapedAt  最も新しい取得日時 (鮮度。最近なら cron が動いている)
 *
 * 判定の目安:
 *   - scraperMode==="hybrid" かつ kvEnabled===true なら A の設定は正しい
 *   - latestScrapedAt が直近24-48hなら cron も正常稼働
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  let storeSalesCount = 0;
  let latestScrapedAt: string | null = null;

  try {
    const all = await loadAllSales();
    for (const data of Object.values(all)) {
      const sales = Array.isArray(
        (data as { sales?: unknown[] })?.sales
      )
        ? (data as { sales: unknown[] }).sales
        : [];
      storeSalesCount += sales.length;
      const ts =
        (data as { lastScraped?: string; timestamp?: string })?.lastScraped ??
        (data as { timestamp?: string })?.timestamp ??
        null;
      if (ts && (!latestScrapedAt || ts > latestScrapedAt)) {
        latestScrapedAt = ts;
      }
    }
  } catch {
    // ストア読み込み失敗時も health は 200 で返す (状態が分かることが目的)
  }

  const scraperMode = process.env.SCRAPER_MODE ?? "mock";
  const kvEnabled = isKVEnabled();
  const ready = scraperMode === "hybrid" && kvEnabled;

  // SNS 自動投稿の設定状況 (値は出さず boolean のみ)。新着セール発生時に投稿される。
  const xConfigured = Boolean(
    process.env.X_API_KEY &&
      process.env.X_API_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_SECRET
  );
  const blueskyConfigured = Boolean(
    process.env.BLUESKY_HANDLE && process.env.BLUESKY_APP_PASSWORD
  );

  // 計測タグの設定状況 (値は出さず boolean + 長さのみ)。
  // NEXT_PUBLIC_ 変数はビルド時に焼き込まれるため、この true/false で
  // 「env が Vercel に届いているか」を切り分けられる。
  const clarityRaw = process.env.NEXT_PUBLIC_CLARITY_ID ?? "";
  const gaRaw = process.env.NEXT_PUBLIC_GA_ID ?? "";
  const analytics = {
    clarityConfigured: clarityRaw.trim().length > 0,
    clarityIdLength: clarityRaw.trim().length,
    gaConfigured: gaRaw.trim().length > 0,
  };

  return NextResponse.json({
    ready,
    scraperMode,
    kvEnabled,
    storeSalesCount,
    latestScrapedAt,
    social: { xConfigured, blueskyConfigured },
    analytics,
    hint: ready
      ? "A 設定OK。latestScrapedAt が直近なら cron も稼働中。"
      : "本番稼働には SCRAPER_MODE=hybrid と KV 接続 (kvEnabled=true) が必要。",
  });
}
