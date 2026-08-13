import { loadObservations, observationKey, type Observation } from "./price-observations";

/**
 * 「今買うか待つか」のジャッジ — 実測観測値のパーセンタイル裁定
 *
 * 比較サイト離脱の王道理由「もっと安くなるかも」という迷いに、
 * 蓄積済みの実測データで説明可能な裁定を下す。AI や予測モデルは使わない:
 * 「直近の観測値が過去90日の観測レンジのどこに位置するか」という
 * 誰でも検算できる統計だけで構成する (捏造・ブラックボックス排除)。
 *
 * 正直さの規約:
 *   - 観測が薄い路線 (8日未満) は裁定しない (null)。無理に出すと嘘になる
 *   - 直近観測が7日より古い場合も null。「いまの価格」を名乗れないため
 *   - Economy のみ。Business を混ぜると分布が二峰化して裁定が壊れる
 */

export const JUDGE_WINDOW_DAYS = 90;
export const JUDGE_MIN_DAYS = 8;
export const JUDGE_MAX_STALE_DAYS = 7;
/** これ以下のパーセンタイルなら「安い」 */
export const CHEAP_PCT = 25;
/** これ以上のパーセンタイルなら「高い」 */
export const HIGH_PCT = 75;

export type PriceJudgement = {
  /** 直近の観測値 (円) */
  latestPrice: number;
  /** 直近観測日 (YYYY-MM-DD) */
  latestDate: string;
  /** 過去90日の観測分布に対する位置 (0=最安〜100=最高) */
  percentile: number;
  verdict: "cheap" | "normal" | "high";
  /** 根拠となった観測日数 */
  sampleDays: number;
  windowDays: number;
  /** 窓内の観測レンジ */
  min: number;
  max: number;
};

/**
 * 純関数版 (テスト対象)。now は判定基準時刻。
 */
export function computeJudgement(
  observations: Observation[],
  now: Date
): PriceJudgement | null {
  const windowStart = now.getTime() - JUDGE_WINDOW_DAYS * 86400_000;
  // Economy のみ・窓内のみ・日付昇順
  const eco = observations
    .filter((o) => o.c === "Economy" && o.p > 0)
    .filter((o) => {
      const t = new Date(`${o.d}T00:00:00Z`).getTime();
      return Number.isFinite(t) && t >= windowStart && t <= now.getTime();
    })
    .sort((a, b) => (a.d < b.d ? -1 : 1));

  if (eco.length < JUDGE_MIN_DAYS) return null;

  const latest = eco[eco.length - 1];
  const latestT = new Date(`${latest.d}T00:00:00Z`).getTime();
  if (now.getTime() - latestT > JUDGE_MAX_STALE_DAYS * 86400_000) return null;

  const prices = eco.map((o) => o.p);
  const below = prices.filter((p) => p < latest.p).length;
  const equal = prices.filter((p) => p === latest.p).length;
  // 中央値的パーセンタイル: 同値は半分だけ下と数える (境界の偏りを防ぐ)
  const percentile = Math.round(((below + equal / 2) / prices.length) * 100);

  return {
    latestPrice: latest.p,
    latestDate: latest.d,
    percentile,
    verdict:
      percentile <= CHEAP_PCT ? "cheap" : percentile >= HIGH_PCT ? "high" : "normal",
    sampleDays: eco.length,
    windowDays: JUDGE_WINDOW_DAYS,
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/** KV から観測を読み、裁定する。観測不足・鮮度切れは null */
export async function judgeRoutePrice(
  originCode: string,
  destCode: string
): Promise<PriceJudgement | null> {
  try {
    const obs = await loadObservations(observationKey(originCode, destCode));
    return computeJudgement(obs, new Date());
  } catch {
    // KV 障害時は裁定なし (ページ自体は落とさない)
    return null;
  }
}
