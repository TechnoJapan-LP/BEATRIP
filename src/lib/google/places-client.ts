/**
 * Google Places API (New) クライアント
 *
 * ホテルの実物写真を取得するためのラッパー。Wikimedia Commons でカバーしきれない
 * ホテル (Wave 4 時点で 154 件中 102 件) のために使う。
 *
 * 認証: 環境変数 GOOGLE_PLACES_API_KEY (REST key, Places API (New) を有効化したもの)。
 * 未設定時は全関数が null を返し、呼び出し側は fallback (グラデーション) に倒れる。
 *
 * コスト: Text Search + Place Details (photos.name のみ) の 2 リクエストで
 * 1 ホテル特定。Google は月 $200 無料クレジット (~10k 件規模) — 154 件なら数 $
 * 程度で初回キャッシュ完了。以後は KV / 静的データに保存して 0 円運用。
 *
 * docs: https://developers.google.com/maps/documentation/places/web-service/text-search
 */

const TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places";

function getApiKey(): string | null {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key || key.trim() === "") return null;
  return key.trim();
}

/**
 * Text Search で hotel + city 名から placeId を 1 件取得する。
 * 失敗 / 未設定 / 一致なしは null。
 */
export async function findPlaceId(
  hotelName: string,
  cityName: string
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    const res = await fetch(TEXT_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // FieldMask 必須 — 必要最小フィールドのみ要求して課金 SKU を抑える
        "X-Goog-FieldMask": "places.id,places.displayName",
      },
      body: JSON.stringify({
        textQuery: `${hotelName} ${cityName}`,
        // ホテル種別に絞ることで一致精度向上
        includedType: "lodging",
        maxResultCount: 1,
        languageCode: "ja",
      }),
      // Next.js fetch cache を無効化 (admin バッチからのみ呼ぶ)
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`[places] findPlaceId failed ${res.status} for "${hotelName}"`);
      return null;
    }
    const json = (await res.json()) as {
      places?: Array<{ id?: string }>;
    };
    return json.places?.[0]?.id ?? null;
  } catch (e) {
    console.warn(`[places] findPlaceId exception for "${hotelName}":`, e);
    return null;
  }
}

/**
 * Place Details で photos[0].name (photo reference) を取得する。
 * photos.name は "places/XXX/photos/YYY" 形式で、photo media endpoint に
 * そのまま流し込める。失敗 / 未設定 / photos 無しは null。
 */
export async function getPlacePhotoName(
  placeId: string
): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  try {
    const res = await fetch(
      `${PLACE_DETAILS_URL}/${encodeURIComponent(placeId)}?languageCode=ja`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "photos.name",
        },
        cache: "no-store",
      }
    );
    if (!res.ok) {
      console.warn(`[places] getPlacePhotoName failed ${res.status} for ${placeId}`);
      return null;
    }
    const json = (await res.json()) as {
      photos?: Array<{ name?: string }>;
    };
    return json.photos?.[0]?.name ?? null;
  } catch (e) {
    console.warn(`[places] getPlacePhotoName exception for ${placeId}:`, e);
    return null;
  }
}

/**
 * photo name + maxWidthPx から **クライアント安全な** photo URL を構築する。
 *
 * API key を URL に埋めると HTML/JS に露出するため、ここでは key を付けず
 * /api/hotel-photo proxy への相対 URL を返す。proxy がサーバー側で
 * GOOGLE_PLACES_API_KEY を付与して Google Places Photo Media を取得する。
 *
 * photoName は "places/XXX/photos/YYY" 形式を想定。
 */
export function buildPhotoUrl(photoName: string, maxWidthPx: number = 600): string {
  return `/api/hotel-photo?ref=${encodeURIComponent(photoName)}&w=${maxWidthPx}`;
}

export function isPlacesEnabled(): boolean {
  return getApiKey() !== null;
}

/**
 * 診断: 1 件のテストクエリを投げて Google Places API の生レスポンスを返す。
 * API key の権限・有効化状態・課金エラー等を切り分けるための admin デバッグ用途。
 */
export async function diagnosePlaces(
  hotelName = "Park Hyatt Tokyo",
  cityName = "東京"
): Promise<{
  hasKey: boolean;
  keyLength: number;
  textSearch: { status: number; ok: boolean; body: unknown };
  placeDetails?: { status: number; ok: boolean; body: unknown };
}> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return {
      hasKey: false,
      keyLength: 0,
      textSearch: { status: 0, ok: false, body: "no api key" },
    };
  }

  const tsRes = await fetch(TEXT_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({
      textQuery: `${hotelName} ${cityName}`,
      includedType: "lodging",
      maxResultCount: 1,
      languageCode: "ja",
    }),
    cache: "no-store",
  });
  const tsBody = await tsRes.json().catch(() => "non-json response");
  const result: {
    hasKey: boolean;
    keyLength: number;
    textSearch: { status: number; ok: boolean; body: unknown };
    placeDetails?: { status: number; ok: boolean; body: unknown };
  } = {
    hasKey: true,
    keyLength: apiKey.length,
    textSearch: { status: tsRes.status, ok: tsRes.ok, body: tsBody },
  };

  const placeId =
    (tsBody as { places?: Array<{ id?: string }> })?.places?.[0]?.id ?? null;
  if (placeId) {
    const pdRes = await fetch(
      `${PLACE_DETAILS_URL}/${encodeURIComponent(placeId)}?languageCode=ja`,
      {
        method: "GET",
        headers: {
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "photos.name",
        },
        cache: "no-store",
      }
    );
    const pdBody = await pdRes.json().catch(() => "non-json response");
    result.placeDetails = { status: pdRes.status, ok: pdRes.ok, body: pdBody };
  }

  return result;
}
