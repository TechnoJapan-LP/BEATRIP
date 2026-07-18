import { NextRequest, NextResponse } from "next/server";
import { getObservationStats } from "@/lib/deals/price-observations";
import { getSaleRecordStats } from "@/lib/deals/sale-records";
import { loadHotDeals } from "@/lib/deals/hot-deals";
import { loadAllClickStats } from "@/lib/store/click-store";
import { listSubscribers } from "@/lib/newsletter/store";
import { getActiveDeals } from "@/lib/deals/deal-service";

/**
 * GET /api/kpi/snapshot  (ADMIN_API_KEY 必須)
 *
 * 月次KPIスナップショット用に、機械取得できる指標を1レスポンスにまとめる。
 *
 * 目的: 事業の時系列を「自社が保有する」状態にすること。
 * トラフィックは GA4、収益は各 ASP の管理画面に散在しており、GA4 の無料枠は
 * データ保持期間に上限があるため、1〜2年後に過去の月次推移を再現できなくなる。
 * 売却・資金調達のデューデリでは「◯ヶ月分の月次推移」を求められるので、
 * ここで取れる分を毎月 git に追記して永続化する
 * (.github/workflows/kpi-snapshot.yml が実行し kpi/YYYY-MM.json にコミット)。
 *
 * ここで返すのは「自社システムが持っている事実」のみ。GA4/GSC/収益額は
 * 外部にあり自動取得に認証が要るため、ワークフロー側で manual 欄を null で
 * 用意し、運用者が後から手入力する (推測値で埋めない)。
 */
export const dynamic = "force-dynamic";

function isAdmin(req: NextRequest): boolean {
  // ADMIN_API_KEY と CRON_SECRET の **どちらでも** 通す。
  // `??` で片方だけを期待値にすると、Vercel に両方あり GitHub Actions 側には
  // CRON_SECRET しか無い場合に 401 になる (実際に起きた: ワークフローは成功
  // したのに auto 項目が全て null で記録される「静かな失敗」)。
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  const keys = [process.env.ADMIN_API_KEY, process.env.CRON_SECRET].filter(
    (k): k is string => typeof k === "string" && k.length > 0
  );
  return keys.some((k) => auth === `Bearer ${k}`);
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const month = now.toISOString().slice(0, 7); // YYYY-MM

  // 独自データ資産 (買い手が最も評価する「他社が買えない時系列」)
  let priceObservations = { routes: 0, points: 0, routesReadyForReal: 0 };
  try {
    priceObservations = await getObservationStats();
  } catch {
    /* KV 未接続時は既定値 */
  }

  let saleRecords = { total: 0, airlines: 0, airlinesReadyForReal: 0 };
  try {
    saleRecords = await getSaleRecordStats();
  } catch {
    /* 同上 */
  }

  let hotDeals = { active: 0, gone: 0 };
  try {
    const list = await loadHotDeals();
    hotDeals = {
      active: list.filter((h) => h.status === "active").length,
      gone: list.filter((h) => h.status === "gone").length,
    };
  } catch {
    /* 同上 */
  }

  // 送客実績 (累計クリック数。KV の INCR カウンタで欠損しない)
  let clicks = { totalClicks: 0, dealsWithClicks: 0 };
  try {
    const stats = await loadAllClickStats();
    clicks = {
      totalClicks: stats.reduce((n, s) => n + s.total_clicks, 0),
      dealsWithClicks: stats.filter((s) => s.total_clicks > 0).length,
    };
  } catch {
    /* 同上 */
  }

  // オーディエンス資産 (譲渡対象になる)
  let subscribers = 0;
  try {
    subscribers = (await listSubscribers()).length;
  } catch {
    /* 同上 */
  }

  // 在庫規模 (掲載ディール数)
  let activeDeals = 0;
  try {
    activeDeals = (await getActiveDeals()).length;
  } catch {
    /* 同上 */
  }

  return NextResponse.json({
    month,
    capturedAt: now.toISOString(),
    // 自社システムが保有する事実のみ
    assets: {
      priceObservations,
      saleRecords,
      hotDeals,
      activeDeals,
    },
    audience: { newsletterSubscribers: subscribers },
    traffic: { totalAffiliateClicks: clicks.totalClicks, dealsWithClicks: clicks.dealsWithClicks },
  });
}
