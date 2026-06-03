/**
 * ホテル名または都市名のみで各OTAへ深リンクするためのURLビルダー
 *
 * - curated hotels の各カード → hotelName 指定でホテル名一致検索ページへ
 * - city-level cross-sell → hotelName="" で都市検索ページへ
 *
 * 必要に応じて tp.media 経由で marker 帰属させる。
 * TP_*_PROGRAM_ID が未設定のOTAは直接URL（収益は発生しないが動作する）。
 */

const MARKER_ENV = "TRAVELPAYOUTS_MARKER";

function wrapWithTpMedia(programEnv: string, destinationUrl: string): string {
  const marker = process.env[MARKER_ENV];
  const programId = process.env[programEnv];
  if (!marker || !programId) return destinationUrl;
  return `https://tp.media/r?marker=${marker}&p=${programId}&u=${encodeURIComponent(destinationUrl)}`;
}

export type HotelSearchOpts = {
  /** YYYY-MM-DD */
  checkIn?: string;
  /** YYYY-MM-DD */
  checkOut?: string;
};

export type HotelSearchProvider = {
  id: string;
  label: string;
  /** ボタン色のキー (Tailwind の色) */
  accent: "blue" | "sky" | "rose" | "emerald" | "violet" | "amber";
  /** hotelName が空文字列なら都市検索として扱う */
  url: (hotelName: string, cityNameEn: string, opts?: HotelSearchOpts) => string;
};

/** "Hotel City" or just "City" — hotelName が空なら city のみ */
function searchQuery(hotelName: string, cityNameEn: string): string {
  return [hotelName, cityNameEn].filter(Boolean).join(" ").trim();
}

/** Booking.com — 部分一致検索（dates 対応） */
const BOOKING: HotelSearchProvider = {
  id: "booking",
  label: "Booking.com",
  accent: "blue",
  url: (hotelName, cityNameEn, opts) => {
    const params = new URLSearchParams({
      ss: searchQuery(hotelName, cityNameEn),
      group_adults: "2",
      no_rooms: "1",
      lang: "ja",
    });
    if (opts?.checkIn) params.set("checkin", opts.checkIn);
    if (opts?.checkOut) params.set("checkout", opts.checkOut);
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
    const params = new URLSearchParams({
      keyword: searchQuery(hotelName, cityNameEn),
      locale: "ja-JP",
      curr: "JPY",
    });
    return wrapWithTpMedia(
      "TP_TRIP_HOTEL_PROGRAM_ID",
      `https://jp.trip.com/hotels/?${params.toString()}`
    );
  },
};

/** Agoda — 都市 + テキスト検索（dates 対応） */
const AGODA: HotelSearchProvider = {
  id: "agoda",
  label: "Agoda",
  accent: "rose",
  url: (hotelName, cityNameEn, opts) => {
    const params = new URLSearchParams({
      searchText: searchQuery(hotelName, cityNameEn),
      hl: "ja-jp",
    });
    if (opts?.checkIn) params.set("checkIn", opts.checkIn);
    if (opts?.checkOut) params.set("checkOut", opts.checkOut);
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
  url: (hotelName, cityNameEn, opts) => {
    const marker = process.env[MARKER_ENV];
    const params = new URLSearchParams({
      destination: cityNameEn,
      adults: "2",
      locale: "ja",
      currency: "jpy",
    });
    if (opts?.checkIn) params.set("checkIn", opts.checkIn);
    if (opts?.checkOut) params.set("checkOut", opts.checkOut);
    if (marker) {
      params.set("marker", marker);
      // hotel name は Hotellook 側の自由検索パラメータでは効きづらいため、
      // 都市検索＋ホテル名（指定時のみ）を SubID として渡し計測に使う
      if (hotelName) {
        params.set("sub_id", `h_${hotelName.replace(/\W+/g, "_").slice(0, 40)}`);
      } else {
        params.set("sub_id", "city");
      }
    }
    return `https://search.hotellook.com/?${params.toString()}`;
  },
};

export const HOTEL_SEARCH_PROVIDERS: HotelSearchProvider[] = [
  BOOKING,
  TRIP,
  AGODA,
  HOTELLOOK,
];
