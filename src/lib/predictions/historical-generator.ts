import type { DealHistoricalPrice } from "@/data/deal-schema";
import {
  ROUTE_BASELINES,
  SEASONALITY_MULTIPLIERS,
} from "@/data/route-baselines";

const CURRENT_YEAR = new Date().getFullYear();

/**
 * 路線ベースラインから12ヶ月分の価格履歴データを生成
 *
 * 月次の平均価格・最安価格を `seasonality` プロファイルに基づいて算出。
 * 統計的なバラつきを加えるためにわずかなランダム要素を入れる
 * （ただし routeKey ごとに決定的になるよう疑似乱数を使用）。
 */
export function generateHistoricalPrices(
  routeKey: string,
  year: number = CURRENT_YEAR
): DealHistoricalPrice[] {
  const baseline = ROUTE_BASELINES[routeKey];
  if (!baseline) return [];

  const seasonality = SEASONALITY_MULTIPLIERS[baseline.seasonality];
  const result: DealHistoricalPrice[] = [];

  // routeKey から決定的なseed生成（同じrouteで毎回同じ値）
  const seed = hashCode(routeKey);

  for (let month = 1; month <= 12; month++) {
    const multiplier = seasonality[month];

    // ±5%の決定的なノイズで自然さを出す
    const noiseAvg = pseudoRandom(seed + month) * 0.10 - 0.05;
    const noiseMin = pseudoRandom(seed + month + 100) * 0.10 - 0.05;

    const avgPrice = Math.round(
      (baseline.avgPrice * multiplier * (1 + noiseAvg)) / 100
    ) * 100;
    const minPrice = Math.round(
      (baseline.minPrice * multiplier * (1 + noiseMin)) / 100
    ) * 100;

    // 月ごとの観測サンプル数（季節性に応じて変動）
    const sampleCount = Math.round(8 + multiplier * 8);

    result.push({
      deal_id: `generated-${routeKey}-${month}`,
      route_key: routeKey,
      month,
      year,
      avg_price: avgPrice,
      min_price: Math.min(minPrice, avgPrice), // 念のため最安 <= 平均
      sample_count: sampleCount,
    });
  }

  return result;
}

/**
 * ベースラインに存在する全路線の履歴データを返す（管理用）
 */
export function generateAllHistoricalPrices(): DealHistoricalPrice[] {
  const all: DealHistoricalPrice[] = [];
  for (const routeKey of Object.keys(ROUTE_BASELINES)) {
    all.push(...generateHistoricalPrices(routeKey));
  }
  return all;
}

/**
 * 文字列の簡易ハッシュ関数（決定的な疑似乱数のseed用）
 */
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * 疑似乱数（0-1）。同じseedなら同じ値を返す。
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
