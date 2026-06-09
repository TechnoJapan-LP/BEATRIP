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
 * Google Places の photoName を key 露出のない proxy URL に変換する。
 * 既に http(s) の絶対 URL ならそのまま返す (後方互換)。
 */
export function buildHotelPhotoProxyUrl(
  value: string,
  maxWidthPx = 600
): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  return `/api/hotel-photo?ref=${encodeURIComponent(value)}&w=${maxWidthPx}`;
}

export function getHotelImageUrl(
  citySlug: string,
  hotel: Pick<CuratedHotel, "name" | "imageUrl">
): string | null {
  // 1. 手動設定 (Wikimedia 等) を最優先 — 122 件の実物写真は絶対に上書きしない
  if (hotel.imageUrl) return hotel.imageUrl;

  // 2. Google Places の photoName → proxy URL
  const key = buildHotelSlug(citySlug, hotel.name);
  const photo = HOTEL_PHOTOS[key];
  if (photo) {
    // photoName 形式なら proxy URL に変換、絶対 URL ならそのまま (後方互換)
    if (PHOTO_NAME_RE.test(photo)) return buildHotelPhotoProxyUrl(photo);
    return photo;
  }

  // 3. fallback (tier グラデーション)
  return null;
}
