/**
 * ホテル名指定で各OTAへ深リンクするためのURLビルダー
 *
 * curated hotels の各カードから直接「Booking.com で予約」「Trip.comで予約」等を
 * 押してもらうための仕組み。OTA固有のキーワード検索エンドポイントに
 * ホテル名 + 都市名 を渡し、必要に応じて tp.media 経由で marker 帰属させる。
 *
 * TP_*_PROGRAM_ID が未設定のOTAは直接URL（収益は発生しないが動作する）。
 */

const MARKER_ENV = "TRAVELPAYOUTS_MARKER";

function wrapWithTpMedia(programEnv: string, destinationUrl: string): string {
  const marker = process.env[MARKER_ENV];
  const programId = process.env[programEnv];
  if (!marker || !programId) return destinationUrl;
  return `https://tp.media/r?marker=${marker}&p=${programId}&u=${encodeURIComponent(destinationUrl)}`;
}

export type HotelSearchProvider = {
  id: string;
  label: string;
  /** ボタン色のキー (Tailwind の色) */
  accent: "blue" | "sky" | "rose" | "emerald" | "violet" | "amber";
  url: (hotelName: string, cityNameEn: string) => string;
};

/** Booking.com — ホテル名で部分一致検索 */
const BOOKING: HotelSearchProvider = {
  id: "booking",
  label: "Booking.com",
  accent: "blue",
  url: (hotelName, cityNameEn) => {
    const q = `${hotelName} ${cityNameEn}`.trim();
    const params = new URLSearchParams({
      ss: q,
      group_adults: "2",
      no_rooms: "1",
      lang: "ja",
    });
    return wrapWithTpMedia(
      "TP_BOOKING_PROGRAM_ID",
      `https://www.booking.com/searchresults.ja.html?${params.toString()}`
    );
  },
};

/** Trip.com — keyword 検索 */
const TRIP: HotelSearchProvider = {
  id: "trip",
  label: "Trip.com",
  accent: "sky",
  url: (hotelName, cityNameEn) => {
    const q = `${hotelName} ${cityNameEn}`.trim();
    const params = new URLSearchParams({
      keyword: q,
      locale: "ja-JP",
      curr: "JPY",
    });
    return wrapWithTpMedia(
      "TP_TRIP_HOTEL_PROGRAM_ID",
      `https://jp.trip.com/hotels/?${params.toString()}`
    );
  },
};

/** Agoda — 都市 + テキスト検索 */
const AGODA: HotelSearchProvider = {
  id: "agoda",
  label: "Agoda",
  accent: "rose",
  url: (hotelName, cityNameEn) => {
    const params = new URLSearchParams({
      searchText: `${hotelName} ${cityNameEn}`,
      hl: "ja-jp",
    });
    return wrapWithTpMedia(
      "TP_AGODA_PROGRAM_ID",
      `https://www.agoda.com/search?${params.toString()}`
    );
  },
};

/** Hotellook — 都市検索（旧マーカー帰属、最後の比較・横断用） */
const HOTELLOOK: HotelSearchProvider = {
  id: "hotellook",
  label: "Hotellook で比較",
  accent: "violet",
  url: (hotelName, cityNameEn) => {
    const marker = process.env[MARKER_ENV];
    const params = new URLSearchParams({
      destination: cityNameEn,
      adults: "2",
      locale: "ja",
      currency: "jpy",
    });
    if (marker) params.set("marker", marker);
    // hotel name は Hotellook 側の自由検索パラメータでは効きづらいため、
    // 都市検索＋ホテル名を SubID にして識別子として渡す
    if (marker) params.set("sub_id", `h_${hotelName.replace(/\W+/g, "_").slice(0, 40)}`);
    return `https://search.hotellook.com/?${params.toString()}`;
  },
};

export const HOTEL_SEARCH_PROVIDERS: HotelSearchProvider[] = [
  BOOKING,
  TRIP,
  AGODA,
  HOTELLOOK,
];
