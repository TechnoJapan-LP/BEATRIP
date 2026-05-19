import { NextRequest, NextResponse } from "next/server";
import { scrapeAllAirlines, scrapeAirline } from "@/lib/scrapers";
import { saveSalesAndDetectChanges } from "@/lib/store/sale-store";
import { dispatchNotifications } from "@/lib/notifications/notifier";
import { generateArticlesFromChanges } from "@/lib/articles/article-generator";
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
import type { ChangeDetectionResult } from "@/lib/store/sale-store";
import type { AirlineSale } from "@/lib/scrapers/types";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
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

    const { sent, errors } = await dispatchNotifications(changes);

    let generatedArticles = 0;
    for (const change of changes) {
      if (!change.hasChanges) continue;
      const newArticles = await generateArticlesFromChanges(change);
      generatedArticles += newArticles.length;
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
      newsletter: {
        status: newsletterStatus,
        sent: newsletterSent,
        pending: newsletterPending,
      },
      priceAlertsSent,
      generatedArticles,
      details: changes.map((c) => ({
        airline: c.airlineCode,
        hasChanges: c.hasChanges,
        newSales: c.newSales.map((s) => s.saleName),
        endedSales: c.endedSales.map((s) => s.saleName),
        priceChanges: c.priceChanges.map((p) => ({
          route: p.routeKey,
          from: p.oldPrice,
          to: p.newPrice,
        })),
      })),
      timestamp: new Date().toISOString(),
    };

    console.log(`[CRON] Scrape complete:`, JSON.stringify(summary, null, 2));
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
