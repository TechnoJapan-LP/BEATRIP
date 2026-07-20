/**
 * 表示用フォーマッタの共通置き場。
 *
 * 作った理由: 同じ実装が formatPrice で18箇所、yen で5箇所、計23箇所に
 * コピーされていた (2026-07-18 時点、全て中身は同一)。数字の見せ方を
 * 変えたいとき23ファイルを直す必要があり、直し漏れると同じ画面の中で
 * 桁区切りが揃わなくなる。
 *
 * **日付は意図的にここへ集約していない。** formatDate は6箇所にあるが
 * month:"short" と "long"、ISO切り出し、"M/D" など出力が全部違い、
 * 文脈ごとに使い分けている。無理に1つにすると呼び出し側の表示が変わる。
 */

/** 12345 → "12,345" (通貨記号なし) */
export function formatPrice(n: number): string {
  return new Intl.NumberFormat("ja-JP").format(n);
}

/** 12345 → "¥12,345" */
export function formatYen(n: number): string {
  return `¥${formatPrice(n)}`;
}
