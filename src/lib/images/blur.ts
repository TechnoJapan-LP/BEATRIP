/**
 * next/image 用のシンプルな blur placeholder データ URL ヘルパー
 *
 * Unsplash / Wikimedia 等の外部画像は静的 blurDataURL 生成ができないため、
 * 共通の薄グレー (旅サイト向け落ち着いた zinc トーン) base64 を使う。
 * LCP / CLS が改善し、コンテンツ load 前の白フラッシュを防ぐ。
 *
 * 旅行用途では絵柄が多様なので、画像ごとに固有色を計算する代わりに
 * 統一感のあるニュートラルプレースホルダで十分。
 */

// 8x6 ピクセル、薄い zinc グラデーション (light card 用)
export const BLUR_PLACEHOLDER_LIGHT =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 6"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e4e4e7"/><stop offset="1" stop-color="#a1a1aa"/></linearGradient></defs><rect width="8" height="6" fill="url(#g)"/></svg>`
  ).toString("base64");

// ダーク背景用 (hero など、上に dark gradient が重なるケース)
export const BLUR_PLACEHOLDER_DARK =
  "data:image/svg+xml;base64," +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 6"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f3f46"/><stop offset="1" stop-color="#18181b"/></linearGradient></defs><rect width="8" height="6" fill="url(#g)"/></svg>`
  ).toString("base64");
