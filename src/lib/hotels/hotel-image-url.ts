/**
 * ホテル画像 URL 解決ヘルパー
 *
 * 優先順:
 *   1. hotel.imageUrl (CURATED_HOTELS で明示された Wikimedia などの URL) — 最優先
 *   2. HOTEL_PHOTOS[buildHotelSlug(citySlug, name)] (Google Places の photoName)
 *      → /api/hotel-photo proxy 経由の URL に変換 (API key はクライアントに出さない)
 *   3. null (呼び出し側で tier グラデーション fallback)
 *
 * Server Component / Client Component の両方から呼べる pure 関数。
 */

import { HOTEL_PHOTOS } from "@/data/hotel-photos";
import { buildHotelSlug } from "@/lib/comparison/hotel-slug";
import type { CuratedHotel } from "@/data/hotel-curated";

// places/{id}/photos/{id} 形式の photoName 判定 (proxy route と同一基準)。
const PHOTO_NAME_RE = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

/**
 * 用途別の推奨取得幅 (px)。/api/hotel-photo の w クランプ (100〜1600) 内。
 *
 * - DEFAULT (640): モバイル full-width 16:9 カード想定。CSS 幅 360〜430px
 *   なので DPR 1.5 までをカバーしつつ転送量を抑えるバランス値。
 * - CARD (480): 2〜4 カラムの小カード (DealHotelHighlights /
 *   compact-hotels-recommendation 等)。CSS 幅 150〜300px なので
 *   DPR 2 でも 480px で十分。Fast Origin Transfer 削減に寄与。
 */
export const HOTEL_PHOTO_WIDTH = {
  DEFAULT: 640,
  CARD: 480,
} as const;

/**
 * Google Places の photoName を key 露出のない proxy URL に変換する。
 * 既に http(s) の絶対 URL ならそのまま返す (後方互換)。
 */
export function buildHotelPhotoProxyUrl(
  value: string,
  maxWidthPx: number = HOTEL_PHOTO_WIDTH.DEFAULT
): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `/api/hotel-photo?ref=${encodeURIComponent(value)}&w=${maxWidthPx}`;
}

/**
 * その画像 URL が /api/hotel-photo proxy 経由かどうか。
 * proxy は Google Places 側で既に maxWidthPx リサイズ済みのため、
 * next/image の再最適化は不要 (かつ localPatterns 設定を避けられる)。
 * → 該当 Image には unoptimized を付ける。
 */
export function isProxyPhotoUrl(url: string | null | undefined): boolean {
  return typeof url === "string" && url.startsWith("/api/hotel-photo");
}

export function getHotelImageUrl(
  citySlug: string,
  hotel: Pick<CuratedHotel, "name" | "imageUrl">,
  /**
   * proxy 画像の取得幅 (px)。省略時は HOTEL_PHOTO_WIDTH.DEFAULT (640)。
   * curated の絶対 URL には影響しない (そのまま返す)。
   */
  maxWidthPx: number = HOTEL_PHOTO_WIDTH.DEFAULT
): string | null {
  // 1. 手動設定 (Wikimedia 等) を最優先 — 122 件の実物写真は絶対に上書きしない
  if (hotel.imageUrl) return hotel.imageUrl;

  // 2. Google Places の photoName → proxy URL
  const key = buildHotelSlug(citySlug, hotel.name);
  const photo = HOTEL_PHOTOS[key];
  if (photo) {
    // photoName 形式なら proxy URL に変換、絶対 URL ならそのまま (後方互換)
    if (PHOTO_NAME_RE.test(photo)) {
      return buildHotelPhotoProxyUrl(photo, maxWidthPx);
    }
    return photo;
  }

  // 3. fallback (tier グラデーション)
  return null;
}

/**
 * 小カード (2〜4 カラムのグリッド) 用。proxy 画像を w=480 で取得して
 * 転送量を抑える。DealHotelHighlights / compact-hotels-recommendation 等の
 * 呼び出しを getHotelImageUrl からこちらに置き換えるだけで効く。
 */
export function getHotelImageUrlForCard(
  citySlug: string,
  hotel: Pick<CuratedHotel, "name" | "imageUrl">
): string | null {
  return getHotelImageUrl(citySlug, hotel, HOTEL_PHOTO_WIDTH.CARD);
}
