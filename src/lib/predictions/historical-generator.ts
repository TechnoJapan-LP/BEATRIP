import type { DealHistoricalPrice } from "@/data/deal-schema";
import {
  ROUTE_BASELINES,
  SEASONALITY_MULTIPLIERS,
} from "@/data/route-baselines";

const CURRENT_YEAR = new Date().getFullYear();

/**
 * 路線ベースラインから12ヶ月分の価格「推計」を生成する。
 *
 * 重要: これは観測データではない。ROUTE_BASELINES の想定価格に季節係数と
 * 疑似乱数ノイズを掛けた合成値であり、実際に計測した運賃履歴ではない。
 * UI では必ず「推計」と明示すること。実測と誤認させる表示 (「過去データでは」
 * 「2年で最安」等) は景表法上の有利誤認にあたり得るため禁止。
 *
 * 実測が貯まったら (lib/deals/price-observations.ts) そちらを優先し、
 * この推計はフォールバックに後退させる。
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

    // 注: 観測件数ではない。合成値なので実サンプル数は 0。
    // 誤って「信頼度」等の根拠に使われないよう 0 を入れる。
    const sampleCount = 0;

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
