import { AIRPORTS } from "@/data/airports";

/**
 * 日本国内の空港 IATA 一覧。
 *
 * 以前は deal-service.ts と deal-grid.tsx に同じ Set がハードコードで重複して
 * おり、地方空港を追加するたび二重メンテが必要だった。空港マスタ (AIRPORTS)
 * から導出して一元化する。
 */
/**
 * 空港マスタに未収録だが国内線判定には必要なコード。
 * (マスタは掲載ページを持つ空港のみ。ここは判定専用の補完)
 */
const EXTRA_JP_CODES = [
  "MMB", // 女満別
  "SHM", // 南紀白浜
];

export const JP_AIRPORT_CODES: ReadonlySet<string> = new Set([
  ...AIRPORTS.map((a) => a.iata),
  ...EXTRA_JP_CODES,
]);

/** 国内線か (出発・到着の両方が日本国内)。 */
export function isDomesticRoute(originCode: string, destCode: string): boolean {
  return JP_AIRPORT_CODES.has(originCode) && JP_AIRPORT_CODES.has(destCode);
}
