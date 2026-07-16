import { getKV } from "@/lib/store/kv";
import type { AirlineSale } from "@/lib/scrapers/types";
import type { DealHistoricalPrice } from "@/data/deal-schema";

/**
 * 実測運賃の観測ログ（append-only）
 *
 * TravelPayouts (Aviasales) の価格ウォッチは「実際の検索で得られた最安運賃」
 * という本物の観測値だが、従来は都度のセール表示に使うだけで捨てていた。
 * その結果サイトに出る「価格推移」は ROUTE_BASELINES からの合成値しか無く、
 * 実測を装う表示になっていた（景表法・E-E-A-T 両面で危険）。
 *
 * ここでは毎回のスキャンで観測した最安値を日次で1点だけ積む。十分に貯まった
 * 路線から順に、合成の推計を実測へ置き換える（getHistoricalPrices が優先）。
 *
 * 設計上の約束:
 *   - 観測していない値は絶対に作らない。埋めない。補間しない。
 *   - sample_count は「実際に観測した日数」。0 は実測なしを意味する（UI は
 *     これを見て「実測 / 推計」を出し分ける）。
 */

const KEY_PREFIX = "beatrip:price-obs:";
const INDEX_KEY = "beatrip:price-obs:index";

/** 保持期間。季節性を見るには 1 年 + 余白が要る */
const RETENTION_DAYS = 400;

/** 実測として「価格推移」を名乗るための最低条件 */
const MIN_OBSERVED_DAYS = 20;
const MIN_OBSERVED_MONTHS = 3;

/** 1観測 = ある日・ある路線・あるキャビンの最安値。キーを短くして KV 容量を節約 */
export type Observation = {
  /** 観測日 (YYYY-MM-DD, UTC) */
  d: string;
  /** その日観測した最安値 (円) */
  p: number;
  /** キャビン */
  c: "Economy" | "Business";
};

export function observationKey(originCode: string, destCode: string): string {
  return `${originCode}→${destCode}`;
}

function kvKey(routeKey: string): string {
  return `${KEY_PREFIX}${routeKey}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function isFresh(d: string, now: number): boolean {
  const t = new Date(`${d}T00:00:00Z`).getTime();
  if (!Number.isFinite(t)) return false;
  return now - t <= RETENTION_DAYS * 86400_000;
}

export async function loadObservations(routeKey: string): Promise<Observation[]> {
  const kv = getKV();
  if (!kv) return [];
  const raw = await kv.get<Observation[]>(kvKey(routeKey));
  return Array.isArray(raw) ? raw : [];
}

/** 観測済み路線の一覧 */
export async function loadObservedRoutes(): Promise<string[]> {
  const kv = getKV();
  if (!kv) return [];
  const raw = await kv.get<string[]>(INDEX_KEY);
  return Array.isArray(raw) ? raw : [];
}

/**
 * 既存の観測列に、その日の観測をマージする (純粋関数)。
 *
 * - 保持期間外は落とす
 * - 同日・同キャビンが既にあれば「その日の最安」だけを残す (1日1点)
 * - 観測していない日は作らない
 */
export function mergeObservations(
  existing: Observation[],
  day: string,
  entries: { cabin: Observation["c"]; price: number }[],
  now: number = Date.now()
): { observations: Observation[]; added: number } {
  const kept = existing.filter((o) => isFresh(o.d, now));
  let added = 0;

  for (const { cabin, price } of entries) {
    const idx = kept.findIndex((o) => o.d === day && o.c === cabin);
    if (idx >= 0) {
      if (price < kept[idx].p) kept[idx] = { d: day, p: price, c: cabin };
    } else {
      kept.push({ d: day, p: price, c: cabin });
      added++;
    }
  }

  kept.sort((a, b) => (a.d < b.d ? -1 : a.d > b.d ? 1 : 0));
  return { observations: kept, added };
}

/**
 * スキャン結果から観測を記録する。
 * 同じ日・同じ路線・同じキャビンは「その日の最安」に集約（1日1点）。
 *
 * @returns 記録した路線数と観測点数
 */
export async function recordPriceObservations(
  sales: AirlineSale[]
): Promise<{ routes: number; points: number }> {
  const kv = getKV();
  if (!kv) return { routes: 0, points: 0 };

  const day = today();
  const now = Date.now();

  // 今回のスキャンで観測した「路線+キャビン」ごとの最安値
  const cheapest = new Map<string, { routeKey: string; cabin: Observation["c"]; price: number }>();
  for (const sale of sales) {
    for (const r of sale.routes) {
      if (!Number.isFinite(r.price) || r.price <= 0) continue;
      const cabin: Observation["c"] = /business/i.test(r.cabin ?? "")
        ? "Business"
        : "Economy";
      const rk = observationKey(r.originCode, r.destinationCode);
      const k = `${rk}|${cabin}`;
      const prev = cheapest.get(k);
      if (!prev || r.price < prev.price) {
        cheapest.set(k, { routeKey: rk, cabin, price: r.price });
      }
    }
  }
  if (cheapest.size === 0) return { routes: 0, points: 0 };

  // 路線ごとにまとめて 1 回だけ読み書きする
  const byRoute = new Map<string, { cabin: Observation["c"]; price: number }[]>();
  for (const { routeKey, cabin, price } of cheapest.values()) {
    const arr = byRoute.get(routeKey) ?? [];
    arr.push({ cabin, price });
    byRoute.set(routeKey, arr);
  }

  const index = new Set(await loadObservedRoutes());
  let points = 0;

  for (const [routeKey, entries] of byRoute) {
    const existing = await loadObservations(routeKey);
    const merged = mergeObservations(existing, day, entries, now);
    points += merged.added;
    await kv.set(kvKey(routeKey), merged.observations);
    index.add(routeKey);
  }

  await kv.set(INDEX_KEY, Array.from(index));
  return { routes: byRoute.size, points };
}

/**
 * 実測から月次の価格履歴を作る。
 *
 * 実測が薄いうちは null を返す（呼び出し側は推計にフォールバックし、UI は
 * 「推計」と明示する）。観測していない月は埋めない — 存在しない月は返さない。
 */
export async function getObservedMonthly(
  routeKey: string
): Promise<DealHistoricalPrice[] | null> {
  return aggregateMonthly(routeKey, await loadObservations(routeKey));
}

/**
 * 観測列から月次履歴を作る (純粋関数)。
 * 実測が薄ければ null。観測していない月は埋めない。
 */
export function aggregateMonthly(
  routeKey: string,
  all: Observation[]
): DealHistoricalPrice[] | null {
  const obs = all.filter((o) => o.c === "Economy");
  if (obs.length < MIN_OBSERVED_DAYS) return null;

  const byMonth = new Map<string, number[]>();
  for (const o of obs) {
    const [y, m] = o.d.split("-");
    const k = `${y}-${m}`;
    const arr = byMonth.get(k) ?? [];
    arr.push(o.p);
    byMonth.set(k, arr);
  }
  if (byMonth.size < MIN_OBSERVED_MONTHS) return null;

  const out: DealHistoricalPrice[] = [];
  for (const [k, prices] of byMonth) {
    const [y, m] = k.split("-").map(Number);
    out.push({
      deal_id: `observed-${routeKey}-${k}`,
      route_key: routeKey,
      month: m,
      year: y,
      avg_price: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      min_price: Math.min(...prices),
      // 実際に観測した日数。これが >0 であることが「実測」の証拠になる
      sample_count: prices.length,
    });
  }
  return out.sort((a, b) => a.year - b.year || a.month - b.month);
}

/** 管理・診断用 */
export async function getObservationStats(): Promise<{
  routes: number;
  points: number;
  routesReadyForReal: number;
}> {
  const routes = await loadObservedRoutes();
  let points = 0;
  let ready = 0;
  for (const rk of routes) {
    const obs = await loadObservations(rk);
    points += obs.length;
    if ((await getObservedMonthly(rk)) !== null) ready++;
  }
  return { routes: routes.length, points, routesReadyForReal: ready };
}
