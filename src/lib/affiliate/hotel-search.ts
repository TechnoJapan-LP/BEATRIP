/**
 * ホテル名または都市名のみで各OTAへ深リンクするためのURLビルダー
 *
 * - curated hotels の各カード → hotelName 指定でホテル名一致検索ページへ
 * - city-level cross-sell → hotelName="" で都市検索ページへ
 *
 * 必要に応じて tp.media 経由で marker 帰属させる。
 * TP_*_PROGRAM_ID が未設定のOTAは直接URL（収益は発生しないが動作する）。
 *
 * directUrls (optional, 4th arg) が provider 別に与えられていれば
 * 検索結果ページではなく OTA 固有の「ホテル詳細ページ」へ直接遷移する。
 * 設定が無い provider は従来通り検索 URL に fallback。
 */

const MARKER_ENV = "TRAVELPAYOUTS_MARKER";
/** TravelPayouts 既定 marker (環境変数未設定時の fallback)。Hotellook 用 */
const FALLBACK_MARKER = "729387";

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

/**
 * provider 別の「ホテル詳細ページ」フル URL。
 * 与えられていれば検索 URL より優先される。
 */
export type HotelDirectUrls = {
  booking?: string;
  trip?: string;
  agoda?: string;
};

export type HotelSearchProvider = {
  id: string;
  label: string;
  /** ボタン色のキー (Tailwind の色) */
  accent: "blue" | "sky" | "rose" | "emerald" | "violet" | "amber";
  /**
   * hotelName が空文字列なら都市検索として扱う。
   * directUrls が与えられかつ provider 一致時は検索 URL を捨てて直リンクを返す。
   */
  url: (
    hotelName: string,
    cityNameEn: string,
    opts?: HotelSearchOpts,
    directUrls?: HotelDirectUrls
  ) => string;
};

/** "Hotel City" or just "City" — hotelName が空なら city のみ */
function searchQuery(hotelName: string, cityNameEn: string): string {
  return [hotelName, cityNameEn].filter(Boolean).join(" ").trim();
}

/** Booking.com — 部分一致検索（dates 対応）。directUrls.booking があれば詳細ページ優先 */
const BOOKING: HotelSearchProvider = {
  id: "booking",
  label: "Booking.com",
  accent: "blue",
  url: (hotelName, cityNameEn, opts, directUrls) => {
    if (directUrls?.booking) {
      return wrapWithTpMedia("TP_BOOKING_PROGRAM_ID", directUrls.booking);
    }
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

/** Trip.com — keyword 検索。directUrls.trip があれば詳細ページ優先 */
const TRIP: HotelSearchProvider = {
  id: "trip",
  label: "Trip.com",
  accent: "sky",
  url: (hotelName, cityNameEn, _opts, directUrls) => {
    if (directUrls?.trip) {
      return wrapWithTpMedia("TP_TRIP_HOTEL_PROGRAM_ID", directUrls.trip);
    }
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

/** Agoda — 都市 + テキスト検索（dates 対応）。directUrls.agoda があれば詳細ページ優先 */
const AGODA: HotelSearchProvider = {
  id: "agoda",
  label: "Agoda",
  accent: "rose",
  url: (hotelName, cityNameEn, opts, directUrls) => {
    if (directUrls?.agoda) {
      return wrapWithTpMedia("TP_AGODA_PROGRAM_ID", directUrls.agoda);
    }
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

/**
 * Hotellook — hotelName 指定時は hotelName パラメータでホテル単体表示に近づける。
 * 都市検索のみ（hotelName 空）の場合は従来通り destination で都市結果。
 */
const HOTELLOOK: HotelSearchProvider = {
  id: "hotellook",
  label: "Hotellook で比較",
  accent: "violet",
  url: (hotelName, cityNameEn, opts) => {
    const marker = process.env[MARKER_ENV] ?? FALLBACK_MARKER;
    const params = new URLSearchParams({
      destination: cityNameEn,
      adults: "2",
      locale: "ja",
      currency: "jpy",
      marker,
    });
    if (hotelName) {
      // hotelName フィルタで該当ホテル単体表示に近づける
      params.set("hotelName", hotelName);
      params.set("sub_id", `h_${hotelName.replace(/\W+/g, "_").slice(0, 40)}`);
    } else {
      params.set("sub_id", "city");
    }
    if (opts?.checkIn) params.set("checkIn", opts.checkIn);
    if (opts?.checkOut) params.set("checkOut", opts.checkOut);
    return `https://search.hotellook.com/hotels?${params.toString()}`;
  },
};

export const HOTEL_SEARCH_PROVIDERS: HotelSearchProvider[] = [
  BOOKING,
  TRIP,
  AGODA,
  HOTELLOOK,
];
