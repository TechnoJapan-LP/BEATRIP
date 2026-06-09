/**
 * ホテル画像 URL 解決ヘルパー
 *
 * 優先順:
 *   1. hotel.imageUrl (CURATED_HOTELS で明示された Wikimedia などの URL)
 *   2. HOTEL_PHOTOS[buildHotelSlug(citySlug, name)] (Google Places 由来の静的データ)
 *   3. null (呼び出し側で tier グラデーション fallback)
 *
 * Server Component / Client Component の両方から呼べる pure 関数。
 */

import { HOTEL_PHOTOS } from "@/data/hotel-photos";
import { buildHotelSlug } from "@/lib/comparison/hotel-slug";
import type { CuratedHotel } from "@/data/hotel-curated";

export function getHotelImageUrl(
  citySlug: string,
  hotel: Pick<CuratedHotel, "name" | "imageUrl">
): string | null {
  if (hotel.imageUrl) return hotel.imageUrl;
  const key = buildHotelSlug(citySlug, hotel.name);
  const photo = HOTEL_PHOTOS[key];
  if (photo) return photo;
  return null;
}
