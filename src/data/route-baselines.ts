/**
 * 路線ごとのベースライン価格と季節性プロファイル
 *
 * `historical-generator.ts` で12ヶ月分の履歴データを動的生成する元データ。
 * 既存の手動入力データ（mock-deals-v2.ts の historicalPrices）にない路線をカバーする。
 */

export type SeasonalityType =
  | "domestic"        // 国内線（GW・お盆・年末年始ピーク強め）
  | "shortHaul"       // 短距離国際線（アジア近郊）
  | "mediumHaul"      // 中距離国際線（東南アジア・中華圏）
  | "longHaul"        // 長距離国際線（欧米・中東）
  | "hawaii"          // ハワイ（年中安定+夏冬ピーク）
  | "europe";         // 欧州（オフシーズン顕著）

export type RouteBaseline = {
  /** ベースとなる年間平均価格（往復、エコノミー想定） */
  avgPrice: number;
  /** ベースとなる年間最安価格 */
  minPrice: number;
  /** 季節性タイプ */
  seasonality: SeasonalityType;
};

// 月別の季節性係数（1.0 = 年平均）
export const SEASONALITY_MULTIPLIERS: Record<SeasonalityType, Record<number, number>> = {
  domestic: {
    1: 1.20,  // 年明け（連休明けで下落）
    2: 0.80,  // 最安シーズン
    3: 1.05,  // 春休み
    4: 1.55,  // GW
    5: 0.95,  // GW後の谷
    6: 0.85,  // 梅雨閑散
    7: 1.40,  // 夏休み開始
    8: 1.65,  // お盆ピーク
    9: 0.90,  // シーズン終わり
    10: 1.00, // 紅葉シーズン
    11: 0.85, // 平月
    12: 1.50, // 年末年始
  },
  shortHaul: {
    1: 1.25,
    2: 0.85,
    3: 0.95,
    4: 1.30,  // GW
    5: 0.90,
    6: 0.90,
    7: 1.45,
    8: 1.55,  // お盆
    9: 0.90,
    10: 1.05,
    11: 0.95,
    12: 1.40,
  },
  mediumHaul: {
    1: 1.20,
    2: 0.85,
    3: 0.95,
    4: 1.20,
    5: 0.90,
    6: 1.00,
    7: 1.45,
    8: 1.55,
    9: 0.95,
    10: 1.05,
    11: 0.90,
    12: 1.30,
  },
  longHaul: {
    1: 1.15,
    2: 0.85,
    3: 0.90,
    4: 1.05,
    5: 0.90,
    6: 1.00,
    7: 1.40,
    8: 1.50,
    9: 0.95,
    10: 1.05,
    11: 0.90,
    12: 1.30,
  },
  hawaii: {
    1: 1.15,
    2: 0.90,
    3: 1.10,
    4: 1.10,  // GW手前
    5: 0.95,
    6: 0.95,
    7: 1.45,
    8: 1.55,
    9: 0.90,
    10: 0.95,
    11: 0.95,
    12: 1.50,
  },
  europe: {
    1: 1.00,
    2: 0.80,  // ベストシーズン
    3: 0.85,
    4: 1.00,
    5: 0.90,
    6: 1.15,
    7: 1.50,  // 夏休みピーク
    8: 1.55,
    9: 1.00,
    10: 0.95,
    11: 0.85,
    12: 1.25,
  },
};

export const ROUTE_BASELINES: Record<string, RouteBaseline> = {
  // ── 国内線 ──
  "HND→CTS": { avgPrice: 28000, minPrice: 12800, seasonality: "domestic" },
  "HND→OKA": { avgPrice: 32000, minPrice: 15800, seasonality: "domestic" },
  "HND→ITM": { avgPrice: 22000, minPrice: 9800, seasonality: "domestic" },
  "HND→KOJ": { avgPrice: 28000, minPrice: 11800, seasonality: "domestic" },
  "HND→FUK": { avgPrice: 25000, minPrice: 11500, seasonality: "domestic" },
  "HND→HIJ": { avgPrice: 22000, minPrice: 8800, seasonality: "domestic" },
  "HND→OKJ": { avgPrice: 22000, minPrice: 9500, seasonality: "domestic" },
  "HND→KMJ": { avgPrice: 26000, minPrice: 11000, seasonality: "domestic" },
  "HND→KMI": { avgPrice: 24000, minPrice: 10500, seasonality: "domestic" },
  "HND→NGS": { avgPrice: 26000, minPrice: 11800, seasonality: "domestic" },
  "HND→SDJ": { avgPrice: 19000, minPrice: 8500, seasonality: "domestic" },
  "HND→AOJ": { avgPrice: 22000, minPrice: 9500, seasonality: "domestic" },
  "HND→HKD": { avgPrice: 26000, minPrice: 12000, seasonality: "domestic" },
  "KIX→CTS": { avgPrice: 25000, minPrice: 3490, seasonality: "domestic" },
  "KIX→OKA": { avgPrice: 26000, minPrice: 11800, seasonality: "domestic" },
  "KIX→FUK": { avgPrice: 18000, minPrice: 6800, seasonality: "domestic" },
  "NRT→FUK": { avgPrice: 18000, minPrice: 4990, seasonality: "domestic" },
  "NRT→HIJ": { avgPrice: 16000, minPrice: 3980, seasonality: "domestic" },
  "NRT→OKA": { avgPrice: 24000, minPrice: 11000, seasonality: "domestic" },
  "NGO→OKA": { avgPrice: 26000, minPrice: 12500, seasonality: "domestic" },
  "FUK→OKA": { avgPrice: 19000, minPrice: 8500, seasonality: "domestic" },

  // ── 国際線 — 短距離（韓国・台湾） ──
  "NRT→ICN": { avgPrice: 35000, minPrice: 18000, seasonality: "shortHaul" },
  "HND→ICN": { avgPrice: 40000, minPrice: 22000, seasonality: "shortHaul" },
  "KIX→ICN": { avgPrice: 32000, minPrice: 13000, seasonality: "shortHaul" },
  "FUK→ICN": { avgPrice: 18000, minPrice: 6900, seasonality: "shortHaul" },
  "NGO→ICN": { avgPrice: 30000, minPrice: 14000, seasonality: "shortHaul" },
  "NRT→TPE": { avgPrice: 38000, minPrice: 19000, seasonality: "shortHaul" },
  "KIX→TPE": { avgPrice: 28000, minPrice: 9800, seasonality: "shortHaul" },
  "FUK→TPE": { avgPrice: 32000, minPrice: 16000, seasonality: "shortHaul" },

  // ── 国際線 — 中距離（東南アジア・中華圏） ──
  "NRT→BKK": { avgPrice: 58000, minPrice: 38000, seasonality: "mediumHaul" },
  "HND→BKK": { avgPrice: 62000, minPrice: 42000, seasonality: "mediumHaul" },
  "KIX→BKK": { avgPrice: 54000, minPrice: 35000, seasonality: "mediumHaul" },
  "NRT→SIN": { avgPrice: 68000, minPrice: 48000, seasonality: "mediumHaul" },
  "HND→SIN": { avgPrice: 240000, minPrice: 215000, seasonality: "longHaul" }, // ビジネスクラス想定
  "KIX→SIN": { avgPrice: 62000, minPrice: 42000, seasonality: "mediumHaul" },
  "NRT→HKG": { avgPrice: 50000, minPrice: 30000, seasonality: "mediumHaul" },
  "KIX→HKG": { avgPrice: 46000, minPrice: 28000, seasonality: "mediumHaul" },
  "NRT→MNL": { avgPrice: 32000, minPrice: 12800, seasonality: "mediumHaul" },
  "NRT→SGN": { avgPrice: 42000, minPrice: 22000, seasonality: "mediumHaul" },
  "NGO→SGN": { avgPrice: 32000, minPrice: 12800, seasonality: "mediumHaul" },
  "NRT→HAN": { avgPrice: 38000, minPrice: 18000, seasonality: "mediumHaul" },
  "NRT→KUL": { avgPrice: 55000, minPrice: 35000, seasonality: "mediumHaul" },
  "NRT→PVG": { avgPrice: 25000, minPrice: 8800, seasonality: "mediumHaul" },
  "NRT→HRB": { avgPrice: 32000, minPrice: 9900, seasonality: "mediumHaul" },
  "NRT→PEK": { avgPrice: 38000, minPrice: 18000, seasonality: "mediumHaul" },
  "FUK→PVG": { avgPrice: 22000, minPrice: 8800, seasonality: "mediumHaul" },

  // ── 国際線 — 長距離（欧米・中東） ──
  "NRT→DXB": { avgPrice: 105000, minPrice: 68000, seasonality: "longHaul" },
  "HND→DXB": { avgPrice: 110000, minPrice: 72000, seasonality: "longHaul" },
  "KIX→DXB": { avgPrice: 100000, minPrice: 65000, seasonality: "longHaul" },
  "HND→JFK": { avgPrice: 175000, minPrice: 128000, seasonality: "longHaul" },
  "NRT→JFK": { avgPrice: 165000, minPrice: 120000, seasonality: "longHaul" },
  "NRT→LAX": { avgPrice: 125000, minPrice: 78000, seasonality: "longHaul" },
  "HND→LAX": { avgPrice: 198000, minPrice: 165000, seasonality: "longHaul" }, // ビジネス想定
  "KIX→LAX": { avgPrice: 115000, minPrice: 75000, seasonality: "longHaul" },
  "NRT→SFO": { avgPrice: 130000, minPrice: 85000, seasonality: "longHaul" },
  "NRT→ORD": { avgPrice: 145000, minPrice: 95000, seasonality: "longHaul" },
  "HND→HNL": { avgPrice: 110000, minPrice: 68000, seasonality: "hawaii" },
  "KIX→HNL": { avgPrice: 95000, minPrice: 68000, seasonality: "hawaii" },
  "NRT→HNL": { avgPrice: 100000, minPrice: 65000, seasonality: "hawaii" },
  "NRT→GUM": { avgPrice: 55000, minPrice: 28000, seasonality: "shortHaul" },

  // ── 国際線 — 欧州 ──
  "HND→CDG": { avgPrice: 128000, minPrice: 89000, seasonality: "europe" },
  "NRT→CDG": { avgPrice: 125000, minPrice: 85000, seasonality: "europe" },
  "NRT→LHR": { avgPrice: 130000, minPrice: 78000, seasonality: "europe" },
  "HND→LHR": { avgPrice: 135000, minPrice: 95000, seasonality: "europe" },
  "NRT→HEL": { avgPrice: 115000, minPrice: 75000, seasonality: "europe" },
  "NRT→FRA": { avgPrice: 130000, minPrice: 88000, seasonality: "europe" },
  "NRT→FCO": { avgPrice: 135000, minPrice: 95000, seasonality: "europe" },
  "NRT→IST": { avgPrice: 110000, minPrice: 75000, seasonality: "europe" },
};
