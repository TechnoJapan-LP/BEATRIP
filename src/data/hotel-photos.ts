/**
 * Google Places API で取得したホテル実物写真の静的 URL マップ
 *
 * このファイルは admin の "ホテル写真リフレッシュ (Google Places)" バッチで
 * 取得した結果を、ビルド時静的データとしてマージしたもの。生成手順:
 *
 *   1. /admin から「ホテル写真リフレッシュ」ボタンで /api/admin/hotels/refresh-photos?all=1 を POST
 *   2. KV に結果がキャッシュされる (30 日 TTL)
 *   3. /api/admin/hotels/refresh-photos?dump=1 で全件を JSON として取得
 *   4. その中から photoName が非 null の項目を抽出し、Google Places photo media URL
 *      ("https://places.googleapis.com/v1/{photoName}/media?key=...&maxWidthPx=600") を
 *      このファイルに書き出す
 *
 * key は buildHotelSlug(citySlug, name) と同じ "{citySlug}:{name}" 形式。
 * 未エントリのホテルは hotel.imageUrl (Wikimedia) → グラデーション fallback の順で解決される。
 *
 * 注: 静的 export とした理由
 *   - Server Component の render 時に KV を都度 await すると build 時間が増える
 *   - Google Places の写真は静的 URL なので 1 度取得すれば変わらない
 *   - 30 日に 1 回 refresh して再 commit する運用で十分
 */

export const HOTEL_PHOTOS: Record<string, string> = {
  // 例 (実 URL は admin バッチ実行後にマージ):
  // "tokyo:Hotel Gracery Shinjuku": "https://places.googleapis.com/v1/places/XXXX/photos/YYYY/media?key=...&maxWidthPx=600",
};
