import { getKV } from "@/lib/store/kv";
import { buildAffiliateLink } from "@/lib/affiliate/url-builder";
import { ROUTE_BASELINES } from "@/data/route-baselines";
import type { AirlineSale, SaleRoute } from "@/lib/scrapers/types";

/**
 * 超お買い得券 (価格急落) 検出
 *
 * TravelPayouts の日次価格ウォッチを素材に、「前回観測から急落した運賃」を
 * エラーフェア/フラッシュセール候補として検出する。セール (公式発表) とは別軸の
 * 「観測ベースの掘り出し物」。
 *
 * 仕組み:
 *   1. 毎回の取得価格を KV にスナップショット保存 (routeKey+cabin → price)
 *   2. 今回価格が前回比 -25% 以上下落 (かつ ¥3,000 以上の差) → HotDeal として検出
 *   3. 既検出の HotDeal は、価格が戻った (検出価格の +20% 超) or 消えたら
 *      status="gone" (売り切れ表示)。gone から 72h でリストから掃除
 *
 * 景表法配慮: 検出価格は「観測した最安運賃の目安」であり予約可能性を保証しない。
 * UI 側は「検出」「〜で消滅」という事実ベースの表現を使うこと。
 */

export type HotDeal = {
  id: string;
  origin: string;
  origin_code: string;
  destination: string;
  destination_code: string;
  cabin: "Economy" | "Business";
  /** 検出時の価格 (その後さらに下がれば更新) */
  price: number;
  /** 急落の根拠: 直前の観測価格 */
  previous_price: number;
  /** 前回比の下落率 (%) */
  drop_percent: number;
  /** 相場 (ROUTE_BASELINES avgPrice)。無い路線は null */
  baseline_price: number | null;
  detected_at: string;
  last_seen_at: string;
  status: "active" | "gone";
  gone_at?: string;
  booking_url: string;
};

const SNAPSHOT_KEY = "beatrip:hotdeals:snapshot";
const LIST_KEY = "beatrip:hotdeals:list";

/** 検出しきい値: 前回比 25% 以上の下落 + 絶対額 ¥3,000 以上 (ノイズ除去) */
const DROP_THRESHOLD = 0.25;
const MIN_DROP_YEN = 3000;
/** 売り切れ判定: 検出価格の +20% 超に戻ったら gone */
const GONE_THRESHOLD = 1.2;
/** gone のまま残す時間 (悔しさ演出 → メルマガ/X 導線)。超えたら削除 */
const GONE_TTL_MS = 72 * 60 * 60 * 1000;
/** active が更新されないまま放置されたら安全側で gone (データ欠落対策) */
const STALE_ACTIVE_MS = 48 * 60 * 60 * 1000;

type Snapshot = Record<string, number>;

function routeKey(r: { originCode: string; destinationCode: string; cabin: string }): string {
  return `${r.originCode}-${r.destinationCode}-${r.cabin}`;
}

async function loadSnapshot(): Promise<Snapshot> {
  const kv = getKV();
  if (!kv) return {};
  try {
    return ((await kv.get(SNAPSHOT_KEY)) as Snapshot | null) ?? {};
  } catch {
    return {};
  }
}

export async function loadHotDeals(): Promise<HotDeal[]> {
  const kv = getKV();
  if (!kv) return [];
  try {
    return ((await kv.get(LIST_KEY)) as HotDeal[] | null) ?? [];
  } catch {
    return [];
  }
}

export type HotDealScanResult = {
  /** 今回新たに検出された HotDeal (SNS 速報の対象) */
  detected: HotDeal[];
  /** 今回 gone (売り切れ) になった件数 */
  wentGone: number;
  active: number;
};

/**
 * TP 価格ウォッチの結果から急落を検出し、KV のリスト/スナップショットを更新する。
 * KV 無効時は no-op。
 */
export async function scanHotDeals(sales: AirlineSale[]): Promise<HotDealScanResult> {
  const kv = getKV();
  const empty: HotDealScanResult = { detected: [], wentGone: 0, active: 0 };
  if (!kv) return empty;

  const prevSnapshot = await loadSnapshot();
  const list = await loadHotDeals();
  const now = Date.now();
  const nowIso = new Date(now).toISOString();

  // 今回観測の全価格 (routeKey → {route, sale})
  const seen = new Map<string, { route: SaleRoute; sale: AirlineSale }>();
  for (const sale of sales) {
    for (const route of sale.routes) {
      const key = routeKey(route);
      const prev = seen.get(key);
      if (!prev || route.price < prev.route.price) seen.set(key, { route, sale });
    }
  }

  const byKey = new Map(list.map((h) => [routeKey({ originCode: h.origin_code, destinationCode: h.destination_code, cabin: h.cabin }), h]));
  const detected: HotDeal[] = [];
  let wentGone = 0;

  // 1) 新規検出 + 既存 active の更新
  for (const [key, { route, sale }] of seen) {
    const prevPrice = prevSnapshot[key];
    const existing = byKey.get(key);

    if (existing && existing.status === "active") {
      // 価格がさらに下がったら更新、戻ったら売り切れ
      if (route.price > existing.price * GONE_THRESHOLD) {
        existing.status = "gone";
        existing.gone_at = nowIso;
        wentGone++;
      } else {
        existing.price = Math.min(existing.price, route.price);
        existing.last_seen_at = nowIso;
      }
      continue;
    }

    // 新規検出: 前回観測があり、大幅下落
    if (
      typeof prevPrice === "number" &&
      prevPrice - route.price >= MIN_DROP_YEN &&
      route.price <= prevPrice * (1 - DROP_THRESHOLD)
    ) {
      const baseline =
        ROUTE_BASELINES[`${route.originCode}→${route.destinationCode}`]?.avgPrice ?? null;
      const hot: HotDeal = {
        id: `hot-${key}-${now}`,
        origin: route.origin,
        origin_code: route.originCode,
        destination: route.destination,
        destination_code: route.destinationCode,
        cabin: route.cabin === "Business" ? "Business" : "Economy",
        price: route.price,
        previous_price: prevPrice,
        drop_percent: Math.round((1 - route.price / prevPrice) * 100),
        baseline_price: baseline,
        detected_at: nowIso,
        last_seen_at: nowIso,
        status: "active",
        booking_url: buildAffiliateLink(route, sale).url,
      };
      detected.push(hot);
      // 同一路線の過去の gone は置き換え (再検出)
      const idx = list.findIndex(
        (h) => routeKey({ originCode: h.origin_code, destinationCode: h.destination_code, cabin: h.cabin }) === key
      );
      if (idx >= 0) list.splice(idx, 1);
      list.push(hot);
    }
  }

  // 2) 今回データに現れなかった active → 売り切れ / 古い gone の掃除
  const cleaned: HotDeal[] = [];
  for (const h of list) {
    const key = routeKey({ originCode: h.origin_code, destinationCode: h.destination_code, cabin: h.cabin });
    if (h.status === "active" && !seen.has(key)) {
      const staleMs = now - new Date(h.last_seen_at).getTime();
      if (staleMs > STALE_ACTIVE_MS) {
        h.status = "gone";
        h.gone_at = nowIso;
        wentGone++;
      }
    }
    if (h.status === "gone" && h.gone_at && now - new Date(h.gone_at).getTime() > GONE_TTL_MS) {
      continue; // TTL 超過 → 削除
    }
    cleaned.push(h);
  }

  // 3) スナップショット更新 (今回の全観測価格)
  const nextSnapshot: Snapshot = {};
  for (const [key, { route }] of seen) nextSnapshot[key] = route.price;

  try {
    await kv.set(SNAPSHOT_KEY, nextSnapshot);
    await kv.set(LIST_KEY, cleaned);
  } catch (e) {
    console.error("[hot-deals] KV write failed:", e);
  }

  return {
    detected,
    wentGone,
    active: cleaned.filter((h) => h.status === "active").length,
  };
}
