import { NextRequest, NextResponse } from "next/server";
import { scrapeAllAirlines, scrapeAirline } from "@/lib/scrapers";
import { saveSalesAndDetectChanges } from "@/lib/store/sale-store";
import { dispatchNotifications } from "@/lib/notifications/notifier";
import {
  generateArticlesFromChanges,
  generateAndSaveWeeklyRoundup,
} from "@/lib/articles/article-generator";
import { listSubscribers } from "@/lib/newsletter/store";
import { sendSaleDigest } from "@/lib/newsletter/email";
import {
  appendPendingSales,
  getPendingSales,
  getLastDigestAt,
  markDigestSent,
  ensureAnchor,
  MIN_DIGEST_INTERVAL_MS,
  DIGEST_MIN_SALES,
} from "@/lib/newsletter/digest-state";
import { listAlerts, removeAlertsByIds } from "@/lib/price-alerts/store";
import {
  sendPriceAlertEmails,
  type AlertMatch,
} from "@/lib/price-alerts/email";
import { postSalesToBluesky, postHotDealsToBluesky } from "@/lib/social/bluesky";
import { postSalesToX, postHotDealsToX } from "@/lib/social/x";
import { getPostedIds, markPosted } from "@/lib/social/posted-store";
import { scanHotDeals } from "@/lib/deals/hot-deals";
import { recordPriceObservations } from "@/lib/deals/price-observations";
import { recordObservedSales } from "@/lib/deals/sale-records";
import { fetchBusinessWatchSales } from "@/lib/flights/travelpayouts-prices";
import type { ChangeDetectionResult } from "@/lib/store/sale-store";
import type { AirlineSale } from "@/lib/scrapers/types";
import { writeAuditLog } from "@/lib/audit/audit-log";

// スクレイプ + 記事生成 + 通知 + 実測蓄積まで行うため既定値では足りない。
// Hobby の上限は 60 秒。
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  // 本番では CRON_SECRET 必須。未設定なら 500 で fail-safe。
  if (!cronSecret) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Server misconfigured: CRON_SECRET required" },
        { status: 500 }
      );
    }
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const airlineCode = request.nextUrl.searchParams.get("airline");
  const startTime = Date.now();

  try {
    let results;
    if (airlineCode) {
      const result = await scrapeAirline(airlineCode);
      results = [result];
    } else {
      results = await scrapeAllAirlines();
    }

    const changes: ChangeDetectionResult[] = [];
    for (const result of results) {
      const change = await saveSalesAndDetectChanges(result);
      changes.push(change);
    }

    // 実セール実績の蓄積 (sale-store は毎回全置換で終了セールを捨てるため別途 archive)
    let saleRecordSummary = { added: 0, updated: 0, total: 0 };
    // 実セール実績を archive に積む。sale-store は毎回全置換で終了セールを
    // 捨てるため、ここで貯めないと「セール実績」が永久に溜まらない。
    // TP は価格ウォッチであり航空会社の告知セールではないので実績には含めない。
    try {
      saleRecordSummary = await recordObservedSales(
        results.filter((r) => r.airlineCode !== "TP").flatMap((r) => r.sales)
      );
    } catch (e) {
      console.warn("[CRON] sale record archive failed:", e);
    }

    const { sent, errors } = await dispatchNotifications(changes);

    let generatedArticles = 0;
    for (const change of changes) {
      if (!change.hasChanges) continue;
      const newArticles = await generateArticlesFromChanges(change);
      generatedArticles += newArticles.length;
    }

    // 週次まとめ記事: 今あるアクティブセール全体を1本にまとめる。
    // ISO週番号で slug 一意なので、同じ週に何度叩いても dedup される。
    let weeklyRoundup = "skipped";
    try {
      const allCurrentSales: AirlineSale[] = results.flatMap((r) => r.sales);
      const roundup = await generateAndSaveWeeklyRoundup(allCurrentSales);
      if (roundup) {
        weeklyRoundup = "generated";
        generatedArticles += 1;
      } else {
        weeklyRoundup = allCurrentSales.length === 0 ? "no_sales" : "already_exists";
      }
    } catch (e) {
      console.error("[CRON] 週次まとめ記事生成に失敗:", e);
      weeklyRoundup = "error";
    }

    // ニュースレター: 新着セールを累積し、週1かつ累積4件以上のときだけ配信
    const allNewSales: AirlineSale[] = changes.flatMap((c) => c.newSales);
    let newsletterSent = 0;
    let newsletterPending = 0;
    let newsletterStatus = "skipped";
    try {
      await appendPendingSales(allNewSales);

      const now = Date.now();
      const anchored = await ensureAnchor(now);
      const pending = await getPendingSales();
      newsletterPending = pending.length;

      if (anchored) {
        // 初回実行: 週次の起点を確立。今回は配信しない。
        newsletterStatus = "anchored";
      } else {
        const lastAt = (await getLastDigestAt()) ?? 0;
        const elapsed = now - lastAt;
        if (elapsed < MIN_DIGEST_INTERVAL_MS) {
          newsletterStatus = "waiting_interval";
        } else if (pending.length <= DIGEST_MIN_SALES) {
          // 4件未満: 配信せず翌週へ持ち越し（pendingは保持）
          newsletterStatus = "below_threshold";
        } else {
          const subscribers = await listSubscribers();
          newsletterSent = await sendSaleDigest(subscribers, pending);
          if (newsletterSent > 0) {
            await markDigestSent(now);
            newsletterStatus = "sent";
          } else {
            // 購読者ゼロ/送信不可: pending を保持し次回再試行
            newsletterStatus = "no_recipients";
          }
        }
      }
    } catch (e) {
      console.error("[CRON] ニュースレター処理に失敗:", e);
      newsletterStatus = "error";
    }

    // 価格アラート: 現在の最安値とユーザー設定を照合し、達成したら通知
    let priceAlertsSent = 0;
    try {
      const minByRoute = new Map<string, number>();
      for (const r of results) {
        for (const sale of r.sales) {
          for (const route of sale.routes) {
            const key = `${route.originCode}→${route.destinationCode}`;
            const prev = minByRoute.get(key);
            if (prev === undefined || route.price < prev) {
              minByRoute.set(key, route.price);
            }
          }
        }
      }

      const alerts = await listAlerts();
      const matches: AlertMatch[] = [];
      for (const a of alerts) {
        const price = minByRoute.get(a.routeKey);
        if (price !== undefined && price <= a.threshold) {
          matches.push({
            alertId: a.id,
            email: a.email,
            routeKey: a.routeKey,
            originCode: a.originCode,
            destinationCode: a.destinationCode,
            threshold: a.threshold,
            price,
            dealId: a.dealId,
          });
        }
      }

      if (matches.length > 0) {
        const delivered = await sendPriceAlertEmails(matches);
        priceAlertsSent = delivered.length;
        // ワンショット: 送信できたアラートは削除（毎日同じ通知を送らない）
        await removeAlertsByIds(delivered.map((m) => m.alertId));
      }
    } catch (e) {
      console.error("[CRON] 価格アラート処理に失敗:", e);
    }

    // Bluesky 自動投稿: 新着セールのうち、まだポストしていないものを最大5件
    let blueskyPosted = 0;
    try {
      const posted = await getPostedIds("bluesky");
      const fresh = allNewSales.filter((s) => !posted.has(s.id));
      if (fresh.length > 0) {
        const sent = await postSalesToBluesky(fresh, 5);
        if (sent.length > 0) {
          await markPosted("bluesky", sent);
          blueskyPosted = sent.length;
        }
      }
    } catch (e) {
      console.error("[CRON] Bluesky 投稿に失敗:", e);
    }

    // X (旧Twitter) 自動投稿: Bluesky と同様、新着のうち未投稿を最大5件
    // X 用の投稿台帳 (platform "x") で独立に dedup するため、Bluesky と
    // 同じセールでも X 側に未投稿なら投稿される。
    let xPosted = 0;
    try {
      const posted = await getPostedIds("x");
      const fresh = allNewSales.filter((s) => !posted.has(s.id));
      if (fresh.length > 0) {
        const sent = await postSalesToX(fresh, 5);
        if (sent.length > 0) {
          await markPosted("x", sent);
          xPosted = sent.length;
        }
      }
    } catch (e) {
      console.error("[CRON] X 投稿に失敗:", e);
    }

    // 超お買い得 (価格急落) 検出: TP 最安値ウォッチ (エコノミー) + ビジネスクラスの
    // 前回スナップショット比較で急落を検出し、新規検出分を X/Bluesky に速報する。
    // hot deal の id は検出ごとに一意なので、投稿台帳の dedup がそのまま効く。
    const hotDealSummary = { detected: 0, active: 0, gone: 0, posted: 0 };
    // 実測運賃の蓄積状況 (価格推移を推計→実測へ切り替える燃料)
    let observedSummary = { routes: 0, points: 0 };
    try {
      const tpEconomySales: AirlineSale[] = results
        .filter((r) => r.airlineCode === "TP")
        .flatMap((r) => r.sales);
      const bizSales = await fetchBusinessWatchSales();
      const watched = [...tpEconomySales, ...bizSales];
      // 観測した実運賃を蓄積する。これが貯まると「価格推移」が推計から実測に
      // 切り替わる (price-observations.ts)。捨てると永久に実測ゼロのままになる。
      observedSummary = await recordPriceObservations(watched);
      const scan = await scanHotDeals(watched);
      hotDealSummary.detected = scan.detected.length;
      hotDealSummary.active = scan.active;
      hotDealSummary.gone = scan.wentGone;

      if (scan.detected.length > 0) {
        const postedX = await getPostedIds("x");
        const freshHot = scan.detected.filter((h) => !postedX.has(h.id));
        if (freshHot.length > 0) {
          const sentX = await postHotDealsToX(freshHot, 3);
          if (sentX.length > 0) await markPosted("x", sentX);
          const sentBsky = await postHotDealsToBluesky(freshHot, 3);
          if (sentBsky.length > 0) await markPosted("bluesky", sentBsky);
          hotDealSummary.posted = sentX.length;
        }
      }
    } catch (e) {
      console.error("[CRON] 超お買い得検出に失敗:", e);
    }

    const elapsed = Date.now() - startTime;

    const summary = {
      success: true,
      elapsed: `${elapsed}ms`,
      airlines: results.length,
      totalSales: results.reduce((sum, r) => sum + r.sales.length, 0),
      changes: {
        newSales: changes.reduce((sum, c) => sum + c.newSales.length, 0),
        endedSales: changes.reduce((sum, c) => sum + c.endedSales.length, 0),
        priceChanges: changes.reduce((sum, c) => sum + c.priceChanges.length, 0),
      },
      notifications: { sent, errors },
      hotDeals: hotDealSummary,
      priceObservations: observedSummary,
      saleRecords: saleRecordSummary,
      newsletter: {
        status: newsletterStatus,
        sent: newsletterSent,
        pending: newsletterPending,
      },
      priceAlertsSent,
      blueskyPosted,
      xPosted,
      generatedArticles,
      weeklyRoundup,
      details: changes.map((c) => {
        // 生スクレイプ結果（results）と差分（changes）を突き合わせて、
        // 各社が「何件拾ったか／成功失敗／エラー要因」まで可視化する。
        const raw = results.find((r) => r.airlineCode === c.airlineCode);
        return {
          airline: c.airlineCode,
          scraped: raw?.sales.length ?? 0,
          success: raw?.success ?? false,
          error: raw?.error,
          hasChanges: c.hasChanges,
          newSales: c.newSales.map((s) => s.saleName),
          endedSales: c.endedSales.map((s) => s.saleName),
          priceChanges: c.priceChanges.map((p) => ({
            route: p.routeKey,
            from: p.oldPrice,
            to: p.newPrice,
          })),
        };
      }),
      timestamp: new Date().toISOString(),
    };

    console.log(`[CRON] Scrape complete:`, JSON.stringify(summary, null, 2));
    await writeAuditLog(request, {
      action: "cron.scrape.complete",
      target: airlineCode ?? "all",
      metadata: {
        airlines: results.length,
        totalSales: summary.totalSales,
        newSales: summary.changes.newSales,
        generatedArticles,
        elapsedMs: elapsed,
      },
    });
    return NextResponse.json(summary);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[CRON] Scrape failed:`, message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
