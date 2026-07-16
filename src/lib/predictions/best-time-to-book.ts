import type { BestTimeToBook, MonthlyAverage } from "@/data/deal-schema";
import type { DealHistoricalPrice } from "@/data/deal-schema";

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

export function calculateBestTimeToBook(
  routeKey: string,
  historicalData: DealHistoricalPrice[]
): BestTimeToBook {
  const routeData = historicalData.filter((d) => d.route_key === routeKey);

  if (routeData.length === 0) {
    return {
      route_key: routeKey,
      best_month: 0,
      best_month_name: "データ不足",
      avg_saving_percent: 0,
      confidence_score: 0,
      historical_prices: [],
    };
  }

  const monthlyMap = new Map<number, { prices: number[]; mins: number[]; counts: number[] }>();

  for (const entry of routeData) {
    const existing = monthlyMap.get(entry.month) || { prices: [], mins: [], counts: [] };
    existing.prices.push(entry.avg_price);
    existing.mins.push(entry.min_price);
    existing.counts.push(entry.sample_count);
    monthlyMap.set(entry.month, existing);
  }

  const yearlyAvg =
    routeData.reduce((sum, d) => sum + d.avg_price, 0) / routeData.length;

  const monthlyAverages: MonthlyAverage[] = [];
  let bestMonth = 1;
  let bestAvgPrice = Infinity;

  for (let month = 1; month <= 12; month++) {
    const data = monthlyMap.get(month);
    if (!data) {
      monthlyAverages.push({
        month,
        month_name: MONTH_NAMES[month - 1],
        avg_price: yearlyAvg,
        min_price: yearlyAvg,
        is_best: false,
      });
      continue;
    }

    const avgPrice = data.prices.reduce((a, b) => a + b, 0) / data.prices.length;
    const minPrice = Math.min(...data.mins);

    if (avgPrice < bestAvgPrice) {
      bestAvgPrice = avgPrice;
      bestMonth = month;
    }

    monthlyAverages.push({
      month,
      month_name: MONTH_NAMES[month - 1],
      avg_price: Math.round(avgPrice),
      min_price: Math.round(minPrice),
      is_best: false,
    });
  }

  for (const ma of monthlyAverages) {
    ma.is_best = ma.month === bestMonth;
  }

  const avgSaving = ((yearlyAvg - bestAvgPrice) / yearlyAvg) * 100;

  // confidence_score は「実測サンプル数」を根拠にしていたが、履歴は合成値で
  // sample_count は実体が無い。実測が貯まるまで信頼度は算出しない (0 = 非表示)。
  const totalSamples = routeData.reduce((sum, d) => sum + d.sample_count, 0);
  const confidenceScore = totalSamples > 0
    ? Math.min(100, Math.round((monthlyMap.size / 12) * 60 + Math.min(totalSamples / 2, 40)))
    : 0;

  return {
    route_key: routeKey,
    best_month: bestMonth,
    best_month_name: MONTH_NAMES[bestMonth - 1],
    avg_saving_percent: Math.round(avgSaving),
    confidence_score: confidenceScore,
    historical_prices: monthlyAverages,
  };
}
