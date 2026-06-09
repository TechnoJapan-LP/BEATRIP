/**
 * Google Places ホテル写真の KV キャッシュ層
 *
 * 各 (citySlug, hotelName) の placeId + photoName を Upstash Redis に
 * 30 日 TTL で永続化する。KV 未設定環境では get/set ともに no-op となり、
 * 呼び出し側は毎回 API を叩く動きにフォールバック。
 *
 * key format: beatrip:places:hotel:{citySlug}:{hotelSlug}
 *  - hotelSlug は buildHotelSlug の "citySlug:name" 形式から citySlug を
 *    取り除いて name 部分のみを使う (key 内の重複を避ける)
 */

import { getKV } from "@/lib/store/kv";

export type PlaceCacheEntry = {
  /** Google Places の place.id (null = lookup 失敗を学習し再試行を控える) */
  placeId: string | null;
  /** photo media reference "places/XXX/photos/YYY" (null = 写真無し) */
  photoName: string | null;
  /** キャッシュ書き込み時刻 ISO */
  fetchedAt: string;
};

const TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function keyOf(citySlug: string, hotelName: string): string {
  // hotelName 内の : と空白を保つ (Upstash Redis は : 含む key を許容)
  return `beatrip:places:hotel:${citySlug}:${hotelName}`;
}

export async function getCachedPlace(
  citySlug: string,
  hotelName: string
): Promise<PlaceCacheEntry | null> {
  const kv = getKV();
  if (!kv) return null;
  try {
    const v = await kv.get<PlaceCacheEntry>(keyOf(citySlug, hotelName));
    return v ?? null;
  } catch (e) {
    console.warn("[place-cache] get failed:", e);
    return null;
  }
}

export async function setCachedPlace(
  citySlug: string,
  hotelName: string,
  entry: PlaceCacheEntry
): Promise<boolean> {
  const kv = getKV();
  if (!kv) return false;
  try {
    await kv.set(keyOf(citySlug, hotelName), entry, { ex: TTL_SECONDS });
    return true;
  } catch (e) {
    console.warn("[place-cache] set failed:", e);
    return false;
  }
}

/**
 * 全エントリを読み出す (静的データへの export 用)。Upstash の SCAN を使う。
 * KV 未設定 / エラー時は空配列。
 */
export async function listAllCachedPlaces(): Promise<
  Array<{ citySlug: string; hotelName: string; entry: PlaceCacheEntry }>
> {
  const kv = getKV();
  if (!kv) return [];
  const out: Array<{ citySlug: string; hotelName: string; entry: PlaceCacheEntry }> = [];
  try {
    let cursor: string | number = 0;
    const prefix = "beatrip:places:hotel:";
    do {
      // @upstash/redis: scan(cursor, { match, count })
      const scanResult: [string | number, string[]] = await kv.scan(cursor, {
        match: `${prefix}*`,
        count: 200,
      });
      const [nextCursor, keys] = scanResult;
      cursor = nextCursor;
      if (keys.length > 0) {
        const values = await kv.mget<PlaceCacheEntry[]>(...keys);
        keys.forEach((k, i) => {
          const v = values[i];
          if (!v) return;
          const rest = k.slice(prefix.length);
          const firstColon = rest.indexOf(":");
          if (firstColon < 0) return;
          out.push({
            citySlug: rest.slice(0, firstColon),
            hotelName: rest.slice(firstColon + 1),
            entry: v,
          });
        });
      }
    } while (String(cursor) !== "0");
  } catch (e) {
    console.warn("[place-cache] list failed:", e);
  }
  return out;
}
