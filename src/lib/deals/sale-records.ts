import { getKV } from "@/lib/store/kv";
import type { AirlineSale } from "@/lib/scrapers/types";
import type { SaleRecord } from "@/data/sale-history";

/**
 * 実観測セール実績の archive（append-only）
 *
 * sale-store は `sales: result.sales` で毎回のスクレイプ結果に全置換するため、
 * 終了したセールは endedSales として ID がログに残るだけで本体は捨てられていた。
 * その結果「セール実績」が永久に貯まらず、出所不明の手書き履歴
 * (data/sale-history.ts) に頼る構造になっていた。
 *
 * ここでは観測したセールを消さずに積む。BEATRIP が実際に観測した事実
 * （いつ初めて見たか / いつまで見えていたか）だけを記録する。
 *
 * 設計上の約束:
 *   - 観測していないセールは作らない。開催を推測して埋めない。
 *   - startDate/endDate は「各社が告知した期間」（スクレイプ値）。
 *     firstSeenAt/lastSeenAt は「BEATRIP が実際に観測した期間」。両者は別物。
 *   - source="observed" が実測の証拠。手書きの参考データは "reference"。
 */

const KEY = "beatrip:sale-records";
const INDEX_LIMIT = 2000;

/** 実測として「セール実績」を名乗るための最低件数（航空会社ごと） */
export const MIN_OBSERVED_RECORDS = 5;

export type ObservedSaleRecord = SaleRecord & {
  source: "observed";
  /** BEATRIP が最初にこのセールを観測した時刻 */
  firstSeenAt: string;
  /** BEATRIP が最後にこのセールを観測した時刻（消えたらここで止まる） */
  lastSeenAt: string;
};

function toRecord(sale: AirlineSale, nowIso: string): ObservedSaleRecord | null {
  if (sale.routes.length === 0) return null;
  const prices = sale.routes.map((r) => r.price).filter((p) => Number.isFinite(p) && p > 0);
  if (prices.length === 0) return null;

  return {
    id: sale.id,
    airlineCode: sale.airlineCode,
    airlineName: sale.airlineName,
    saleName: sale.saleName,
    startDate: sale.startDate,
    endDate: sale.endDate,
    routes: sale.routes.map((r) => `${r.originCode}→${r.destinationCode}`),
    minPrice: Math.min(...prices),
    maxDiscount: Math.max(0, ...sale.routes.map((r) => r.discount ?? 0)),
    cabin: sale.routes[0].cabin ?? "Economy",
    source: "observed",
    firstSeenAt: nowIso,
    lastSeenAt: nowIso,
  };
}

export async function loadObservedSaleRecords(): Promise<ObservedSaleRecord[]> {
  const kv = getKV();
  if (!kv) return [];
  const raw = await kv.get<ObservedSaleRecord[]>(KEY);
  return Array.isArray(raw) ? raw : [];
}

/**
 * 観測したセールを archive にマージする（純粋関数）。
 *
 * - 未知のセールは追加（firstSeenAt = 今）
 * - 既知のセールは lastSeenAt を更新し、最安値は観測した最小値に更新
 * - 消えたセールは触らない（lastSeenAt がそのまま観測終了時刻になる）
 */
export function mergeSaleRecords(
  existing: ObservedSaleRecord[],
  observed: ObservedSaleRecord[]
): { records: ObservedSaleRecord[]; added: number; updated: number } {
  const byId = new Map(existing.map((r) => [r.id, { ...r }]));
  let added = 0;
  let updated = 0;

  for (const rec of observed) {
    const prev = byId.get(rec.id);
    if (!prev) {
      byId.set(rec.id, rec);
      added++;
      continue;
    }
    byId.set(rec.id, {
      ...prev,
      // 告知内容は最新のスクレイプ値を正とする（期間延長・路線追加に追随）
      saleName: rec.saleName,
      startDate: rec.startDate,
      endDate: rec.endDate,
      routes: Array.from(new Set([...prev.routes, ...rec.routes])),
      minPrice: Math.min(prev.minPrice, rec.minPrice),
      maxDiscount: Math.max(prev.maxDiscount, rec.maxDiscount),
      lastSeenAt: rec.lastSeenAt,
    });
    updated++;
  }

  // 新しい観測を優先して上限を超えた分だけ落とす
  const records = Array.from(byId.values()).sort((a, b) =>
    a.firstSeenAt < b.firstSeenAt ? 1 : a.firstSeenAt > b.firstSeenAt ? -1 : 0
  );
  return { records: records.slice(0, INDEX_LIMIT), added, updated };
}

/** スキャン結果からセール実績を記録する */
export async function recordObservedSales(
  sales: AirlineSale[]
): Promise<{ added: number; updated: number; total: number }> {
  const kv = getKV();
  if (!kv) return { added: 0, updated: 0, total: 0 };

  const nowIso = new Date().toISOString();
  const observed = sales
    .map((s) => toRecord(s, nowIso))
    .filter((r): r is ObservedSaleRecord => r !== null);
  if (observed.length === 0) {
    const existing = await loadObservedSaleRecords();
    return { added: 0, updated: 0, total: existing.length };
  }

  const existing = await loadObservedSaleRecords();
  const merged = mergeSaleRecords(existing, observed);
  await kv.set(KEY, merged.records);
  return { added: merged.added, updated: merged.updated, total: merged.records.length };
}

/** 管理・診断用 */
export async function getSaleRecordStats(): Promise<{
  total: number;
  airlines: number;
  airlinesReadyForReal: number;
}> {
  const records = await loadObservedSaleRecords();
  const byAirline = new Map<string, number>();
  for (const r of records) {
    byAirline.set(r.airlineCode, (byAirline.get(r.airlineCode) ?? 0) + 1);
  }
  let ready = 0;
  for (const n of byAirline.values()) if (n >= MIN_OBSERVED_RECORDS) ready++;
  return { total: records.length, airlines: byAirline.size, airlinesReadyForReal: ready };
}
