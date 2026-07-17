export type SaleRecord = {
  id: string;
  airlineCode: string;
  airlineName: string;
  saleName: string;
  startDate: string;
  endDate: string;
  routes: string[];
  minPrice: number;
  maxDiscount: number;
  cabin: string;
  /**
   * データの出所。
   *   observed  = BEATRIP が実際に観測したセール (lib/deals/sale-records.ts)
   *   reference = 下の手書きデータ。出所未確認のため事実として提示してはならない
   */
  source?: "observed" | "reference";
};

/**
 * セール実績データ（現在は空）
 *
 * かつてここに手書きの「過去セール実績」95件があったが、2026-07-17 の調査で
 * **捏造と確定した**ため全件削除した。根拠:
 *   - 「ANA 秋の旅割 2025-09-15」— 旅割は 2018-10-28 搭乗分で名称廃止済み。
 *     7年前に消えた名前のセールが 2025 年に開催されたことになっていた。
 *   - ANA SUPER VALUE SALE は実在するが公式は「毎月1〜2回」開催。データは
 *     2年で5件 (約6ヶ月間隔・日付もほぼ規則的) と頻度が桁違い。
 *   - JAL スペシャルセイバーは国内線の運賃プランだが、HND→CDG / NRT→LHR の
 *     国際線セール名として流用されていた。
 *   - 17社中14社がぴったり5件という不自然な均一分布。
 *
 * 「参考データ」ラベルでは救済できない。存在しないイベントは参考ですらなく
 * 虚偽であり、事実は推定できないため (景表法・E-E-A-T 両面で危険)。
 *
 * 実測は lib/deals/sale-records.ts が観測のたびに積んでいる。航空会社ごとに
 * MIN_OBSERVED_RECORDS 件貯まると sale-history-resolver がその社を実測へ
 * 切り替える。**ここに手書きでレコードを足さないこと。**
 */
export const saleHistory: SaleRecord[] = [];

export function getSaleHistoryByAirline(airlineCode: string): SaleRecord[] {
  return saleHistory
    .filter((s) => s.airlineCode === airlineCode)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export function getAirlineSaleStats(airlineCode: string) {
  const records = getSaleHistoryByAirline(airlineCode);
  if (records.length === 0) return null;

  const avgDiscount = Math.round(
    records.reduce((s, r) => s + r.maxDiscount, 0) / records.length
  );
  const lowestPrice = Math.min(...records.map((r) => r.minPrice));
  const bestDiscount = Math.max(...records.map((r) => r.maxDiscount));

  const months = records.map((r) => new Date(r.startDate).getMonth());
  const monthCounts = new Array(12).fill(0);
  months.forEach((m) => monthCounts[m]++);
  const peakMonths = monthCounts
    .map((count, i) => ({ month: i, count }))
    .filter((m) => m.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((m) => m.month);

  const saleNames = [...new Set(records.map((r) => r.saleName))];

  const intervals: number[] = [];
  for (let i = 1; i < records.length; i++) {
    const diff =
      new Date(records[i - 1].startDate).getTime() -
      new Date(records[i].startDate).getTime();
    intervals.push(Math.round(diff / (1000 * 60 * 60 * 24)));
  }
  const avgInterval =
    intervals.length > 0
      ? Math.round(intervals.reduce((s, d) => s + d, 0) / intervals.length)
      : null;

  return {
    totalSales: records.length,
    avgDiscount,
    lowestPrice,
    bestDiscount,
    peakMonths,
    saleNames,
    avgInterval,
    records,
  };
}
