import { NextResponse } from "next/server";
import { isKVEnabled } from "@/lib/store/kv";
import { loadAllSales } from "@/lib/store/sale-store";
import { loadHotDeals } from "@/lib/deals/hot-deals";
import { getObservationStats } from "@/lib/deals/price-observations";
import { getSaleRecordStats } from "@/lib/deals/sale-records";

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

  // アフィリエイト: program ID が env に届いているか (値は出さず boolean のみ)。
  // 未設定だと buildPartnerUrl が tp.media wrap せず素のリンクを返す = 報酬ゼロ。
  const affiliate = {
    airalo: Boolean(process.env.TP_AIRALO_PROGRAM_ID?.trim()),
    gigsky: Boolean(process.env.TP_GIGSKY_PROGRAM_ID?.trim()),
    yesim: Boolean(process.env.TP_YESIM_PROGRAM_ID?.trim()),
    kiwitaxi: Boolean(process.env.TP_KIWITAXI_PROGRAM_ID?.trim()),
    insurance: Boolean(process.env.TP_INSURANCE_PROGRAM_ID?.trim()),
    localrent: Boolean(process.env.TP_LOCALRENT_PROGRAM_ID?.trim()),
    getrentacar: Boolean(process.env.TP_GETRENTACAR_PROGRAM_ID?.trim()),
    klook: Boolean(process.env.TP_KLOOK_PROGRAM_ID?.trim()),
    kkday: Boolean(process.env.TP_KKDAY_PROGRAM_ID?.trim()),
    airhelp: Boolean(process.env.TP_AIRHELP_PROGRAM_ID?.trim()),
    booking: Boolean(process.env.TP_BOOKING_PROGRAM_ID?.trim()),
    agoda: Boolean(process.env.TP_AGODA_PROGRAM_ID?.trim()),
    tripHotel: Boolean(process.env.TP_TRIP_HOTEL_PROGRAM_ID?.trim()),
  };

  // 超お買い得 (価格急落) の稼働状況
  // 実測運賃の蓄積状況。routesReadyForReal が増えるほど「推計」表示が実測に変わる。
  let priceObservations = { routes: 0, points: 0, routesReadyForReal: 0 };
  try {
    priceObservations = await getObservationStats();
  } catch {
    // KV 未設定・未蓄積時は既定値のまま
  }

  // 実セール実績の蓄積状況。airlinesReadyForReal が増えるほど参考データが実測に変わる。
  let saleRecords = { total: 0, airlines: 0, airlinesReadyForReal: 0 };
  try {
    saleRecords = await getSaleRecordStats();
  } catch {
    // KV 未設定・未蓄積時は既定値のまま
  }

  let hotDeals = { active: 0, gone: 0 };
  try {
    const list = await loadHotDeals();
    hotDeals = {
      active: list.filter((h) => h.status === "active").length,
      gone: list.filter((h) => h.status === "gone").length,
    };
  } catch {
    // health は常に 200 を返す
  }

  return NextResponse.json({
    ready,
    scraperMode,
    kvEnabled,
    storeSalesCount,
    latestScrapedAt,
    social: { xConfigured, blueskyConfigured },
    analytics,
    affiliate,
    hotDeals,
    priceObservations,
    saleRecords,
    hint: ready
      ? "A 設定OK。latestScrapedAt が直近なら cron も稼働中。"
      : "本番稼働には SCRAPER_MODE=hybrid と KV 接続 (kvEnabled=true) が必要。",
  });
}
