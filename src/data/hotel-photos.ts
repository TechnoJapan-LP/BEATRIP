/**
 * Google Places API で取得したホテル実物写真の静的マップ
 *
 * 値は Google Places の **photoName** ("places/XXX/photos/YYY" 形式) のみを保持する。
 * API key はここには入れない — 描画時に getHotelImageUrl が
 *   /api/hotel-photo?ref={photoName}&w=600
 * という proxy URL に変換し、proxy route がサーバー側で
 * GOOGLE_PLACES_API_KEY を付与して画像を取得する。
 * これにより key がクライアント (HTML/JS) に一切露出しない。
 *
 * 生成手順:
 *   1. /admin から「ホテル写真リフレッシュ (Google Places)」ボタンで
 *      /api/admin/hotels/refresh-photos?all=1 を POST
 *      (CURATED_HOTELS のうち imageUrl 未設定のホテルだけが対象。
 *       Wikimedia 等で imageUrl 済みの 122 件は skip される)
 *   2. KV (Upstash) に photoName が 30 日 TTL でキャッシュされる
 *   3. 「KV キャッシュ確認」ボタン (= ?dump=1) で photoName マップ JSON を取得
 *   4. その JSON を下記 HOTEL_PHOTOS にマージして commit
 *
 * key は buildHotelSlug(citySlug, name) と同じ "{citySlug}:{name}" 形式。
 * 未エントリのホテルは hotel.imageUrl (Wikimedia) → グラデーション fallback の順で解決される。
 *
 * 注: 静的 export とした理由
 *   - Server Component の render 時に KV を都度 await すると build 時間が増える
 *   - Google Places の photoName は 1 度取得すれば長期間変わらない
 *   - 30 日に 1 回 refresh して再 commit する運用で十分
 *   - photoName だけを持てば key は runtime で proxy が付けるため静的化不要
 */

export const HOTEL_PHOTOS: Record<string, string> = {
  // 例 (実 photoName は admin バッチ実行後にマージ):
  // "tokyo:Hotel Gracery Shinjuku": "places/ChIJXXXX/photos/YYYY",
};
