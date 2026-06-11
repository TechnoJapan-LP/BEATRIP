/**
 * ランディング Hero グラデーションのカテゴリ体系。
 *
 * 監査指摘: Hero グラデが 18 種すべてユニークで色がカテゴリ意味を持たない。
 * アクセント色 (rose=割引 / emerald=ホテル / amber=おすすめ) と同様に、
 * Hero も「同カテゴリなら同グラデ」に統一する。
 *
 * 値は既存ページで最も使われている色系統から抽出 (現行の見た目を大きく外さない):
 * - destination: airports / local-flights / hotels/[city] で多数派の sky 系
 * - finance:     credit-cards 現行
 * - insurance:   insurance 現行
 * - telecom:     esim 現行
 * - tour:        package-tour 現行
 * - season:      seasons 3 種 (summer/golden-week/year-end) の暖色系の中間
 * - knowledge:   ガイド/用語集向けのニュートラル zinc
 *
 * 使い方: `bg-gradient-to-br ${CATEGORY_GRADIENTS[category]} text-white`
 * (クラス名は完全な文字列リテラルなので Tailwind のソース検出対象になる)
 */
export type LandingCategory =
  | "destination"
  | "finance"
  | "insurance"
  | "telecom"
  | "tour"
  | "season"
  | "knowledge";

export const CATEGORY_GRADIENTS: Record<LandingCategory, string> = {
  destination: "from-sky-900 via-sky-700 to-blue-600", // 目的地 (クルーズ/空港/都市)
  finance: "from-amber-900 via-amber-700 to-rose-600", // クレカ/マイル
  insurance: "from-blue-900 via-blue-700 to-emerald-600", // 海外旅行保険
  telecom: "from-violet-900 via-violet-700 to-blue-600", // eSIM/WiFi
  tour: "from-emerald-700 via-emerald-500 to-sky-600", // ツアー/パッケージ
  season: "from-rose-600 via-rose-500 to-amber-500", // シーズン特集
  knowledge: "from-zinc-700 via-zinc-800 to-zinc-900", // ガイド/用語集
};
