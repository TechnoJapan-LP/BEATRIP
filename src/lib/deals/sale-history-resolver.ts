import {
  getSaleHistoryByAirline as getReferenceHistory,
  saleHistory as referenceHistory,
  type SaleRecord,
} from "@/data/sale-history";
import {
  loadObservedSaleRecords,
  MIN_OBSERVED_RECORDS,
} from "@/lib/deals/sale-records";

/**
 * セール実績の解決層 — 実測を優先し、貯まるまでは参考データで橋渡しする
 *
 * data/sale-history.ts の手書き95件は出所未確認で、「ANAが2024-05-15に開催」
 * のような具体的な過去イベントの主張は「推計」ラベルでは救済できない
 * （事実は推定できない）。かといって今すぐ全部消すとセール予測カレンダーが
 * 空になるため、実測が貯まるまでの繋ぎとして残しつつ、UI に「参考データ」
 * であることを必ず伝える。
 *
 * 航空会社ごとに実測が MIN_OBSERVED_RECORDS 件貯まった時点で、その社は
 * 自動的に実測のみへ切り替わる（参考データは混ぜない = 混ぜると実測の
 * 信頼性まで参考データに引きずられるため）。
 */

export type ResolvedSaleHistory = {
  records: SaleRecord[];
  /** observed = 実測のみ / reference = 出所未確認の参考データ / empty = データ無し */
  source: "observed" | "reference" | "empty";
  /** 実測の件数（参考にフォールバック中でも、あと何件で切り替わるか分かる） */
  observedCount: number;
};

function sortByStartDesc(records: SaleRecord[]): SaleRecord[] {
  return [...records].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
}

/** 航空会社1社ぶんのセール実績を解決する */
export async function resolveSaleHistory(
  airlineCode: string
): Promise<ResolvedSaleHistory> {
  const observed = (await loadObservedSaleRecords()).filter(
    (r) => r.airlineCode === airlineCode
  );

  if (observed.length >= MIN_OBSERVED_RECORDS) {
    return {
      records: sortByStartDesc(observed),
      source: "observed",
      observedCount: observed.length,
    };
  }

  const reference = getReferenceHistory(airlineCode);
  return {
    records: reference,
    source: reference.length > 0 ? "reference" : "empty",
    observedCount: observed.length,
  };
}

/** 全社ぶん（セール予測カレンダー用） */
export async function resolveAllSaleHistory(): Promise<ResolvedSaleHistory> {
  const observed = await loadObservedSaleRecords();

  // 1社でも実測が揃った社があれば、その社は実測、残りは参考。
  // 全体の source は「参考が1件でも混ざれば reference」とし、表示は保守側に倒す。
  const readyAirlines = new Set<string>();
  const counts = new Map<string, number>();
  for (const r of observed) counts.set(r.airlineCode, (counts.get(r.airlineCode) ?? 0) + 1);
  for (const [code, n] of counts) if (n >= MIN_OBSERVED_RECORDS) readyAirlines.add(code);

  const records: SaleRecord[] = [
    ...observed.filter((r) => readyAirlines.has(r.airlineCode)),
    ...referenceHistory.filter((r) => !readyAirlines.has(r.airlineCode)),
  ];

  const usesReference = records.some((r) => r.source !== "observed");
  return {
    records: sortByStartDesc(records),
    source: records.length === 0 ? "empty" : usesReference ? "reference" : "observed",
    observedCount: observed.length,
  };
}

/**
 * 実績から統計を出す（純粋関数）。
 * 従来 data/sale-history.ts に閉じていたロジックを、出所を問わず使えるように
 * レコード受け取りへ切り出したもの。
 */
export function computeSaleStats(records: SaleRecord[]) {
  if (records.length === 0) return null;

  const sorted = sortByStartDesc(records);
  const avgDiscount = Math.round(
    sorted.reduce((s, r) => s + r.maxDiscount, 0) / sorted.length
  );
  const lowestPrice = Math.min(...sorted.map((r) => r.minPrice));
  const bestDiscount = Math.max(...sorted.map((r) => r.maxDiscount));

  const monthCounts = new Array(12).fill(0);
  for (const r of sorted) {
    const m = new Date(r.startDate).getMonth();
    if (!Number.isNaN(m)) monthCounts[m]++;
  }
  const peakMonths = monthCounts
    .map((count, i) => ({ month: i, count }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((m) => m.month);

  const saleNames = [...new Set(sorted.map((r) => r.saleName))];

  const intervals: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const diff =
      new Date(sorted[i - 1].startDate).getTime() -
      new Date(sorted[i].startDate).getTime();
    if (Number.isFinite(diff)) intervals.push(Math.round(diff / 86400_000));
  }
  const avgInterval =
    intervals.length > 0
      ? Math.round(intervals.reduce((s, d) => s + d, 0) / intervals.length)
      : null;

  return {
    totalSales: sorted.length,
    avgDiscount,
    lowestPrice,
    bestDiscount,
    peakMonths,
    saleNames,
    avgInterval,
    monthCounts,
    records: sorted,
  };
}
