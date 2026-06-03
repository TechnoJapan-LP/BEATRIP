/**
 * TravelPayouts 系アフィリエイトパートナー定義
 *
 * 各パートナーの program ID は環境変数で持つ。env が未設定のパートナーは
 * 自動的にサイトに出ない（リンク切れを防ぐ）。承認 + ID取得後に env を
 * 入れるだけで本番に反映される。
 *
 * 一般URLパターン（tp.media 経由・marker帰属）:
 *   https://tp.media/r?marker=MARKER&p=PROGRAM_ID&u=ENCODED_DESTINATION_URL
 *
 * MARKER は TRAVELPAYOUTS_MARKER（既存）。
 * PROGRAM_ID は各パートナー承認後に TravelPayouts 管理画面で確認できる値。
 */

export type PartnerCategory = "hotel" | "esim" | "transfer" | "insurance" | "tour";

export type PartnerContext = {
  /** 目的地の英語都市名（例 "Tokyo"） */
  cityNameEn?: string;
  /** 目的地の日本語都市名（表示用） */
  cityNameJa?: string;
  /** 目的地の英語国名（Airalo等で表示用） */
  countryNameEn?: string;
  /** 目的地の国slug（Airalo URL: {slug}-esim 用、kebab-case） */
  countrySlug?: string;
  /** 目的地IATA（送迎などで使う） */
  destinationIata?: string;
  /** 出発IATA */
  originIata?: string;
  /** チェックイン YYYY-MM-DD */
  checkIn?: string;
  /** チェックアウト YYYY-MM-DD */
  checkOut?: string;
};

export type Partner = {
  id: string;
  name: string;
  category: PartnerCategory;
  /** どの env 変数を見るか */
  programEnvVar: string;
  /** 表示用の短い説明 */
  description: string;
  /** ボタン文言（CTA） */
  ctaLabel: (ctx: PartnerContext) => string;
  /** 遷移先（生のパートナーURL。tp.mediaで wrap される） */
  destinationUrl: (ctx: PartnerContext) => string | null;
  /** アイコン（lucide-react のキー名） */
  iconKey: string;
  /** リンクの rel 属性 */
  rel?: string;
};

const MARKER_ENV = "TRAVELPAYOUTS_MARKER";

/** marker と program ID が揃って初めて有効。tp.media で wrap した最終URLを返す。 */
export function buildPartnerUrl(p: Partner, ctx: PartnerContext): string | null {
  const marker = process.env[MARKER_ENV];
  const programId = process.env[p.programEnvVar];
  const dest = p.destinationUrl(ctx);
  if (!dest) return null;
  if (!marker || !programId) {
    // 開発時など: tp.media wrapを使わずに直接の遷移先URLを返す
    return dest;
  }
  return `https://tp.media/r?marker=${marker}&p=${programId}&u=${encodeURIComponent(dest)}`;
}

/** その env が本番で有効か */
export function isPartnerEnabled(p: Partner): boolean {
  return Boolean(process.env[MARKER_ENV] && process.env[p.programEnvVar]);
}

/**
 * Booking.com 検索URL（日本語サイト・都市検索）
 * 受付後 TravelPayouts ダッシュボード の Booking.com で program ID を取得し
 * 環境変数 TP_BOOKING_PROGRAM_ID にセット。
 */
const BOOKING: Partner = {
  id: "booking",
  name: "Booking.com",
  category: "hotel",
  programEnvVar: "TP_BOOKING_PROGRAM_ID",
  description: "ホテル予約最大手・口コミ多数",
  ctaLabel: (ctx) =>
    `${ctx.cityNameJa ?? ctx.cityNameEn ?? "ホテル"}をBooking.comで`,
  destinationUrl: (ctx) => {
    if (!ctx.cityNameEn) return null;
    const params = new URLSearchParams({
      ss: ctx.cityNameEn,
      group_adults: "2",
      no_rooms: "1",
      lang: "ja",
    });
    if (ctx.checkIn && /^\d{4}-\d{2}-\d{2}$/.test(ctx.checkIn)) {
      const [y, m, d] = ctx.checkIn.split("-");
      params.set("checkin_year", y);
      params.set("checkin_month", String(parseInt(m, 10)));
      params.set("checkin_monthday", String(parseInt(d, 10)));
    }
    if (ctx.checkOut && /^\d{4}-\d{2}-\d{2}$/.test(ctx.checkOut)) {
      const [y, m, d] = ctx.checkOut.split("-");
      params.set("checkout_year", y);
      params.set("checkout_month", String(parseInt(m, 10)));
      params.set("checkout_monthday", String(parseInt(d, 10)));
    }
    return `https://www.booking.com/searchresults.ja.html?${params.toString()}`;
  },
  iconKey: "BedDouble",
  rel: "sponsored noopener noreferrer",
};

/**
 * Trip.com ホテル検索URL（日本語サイト・テキスト検索）
 * Trip.com 承認後 TP_TRIP_HOTEL_PROGRAM_ID にセット。
 * (Flight 用の TP_TRIP_FLIGHT_PROGRAM_ID とは別物の可能性が高い)
 */
const TRIP_HOTEL: Partner = {
  id: "trip-hotel",
  name: "Trip.com ホテル",
  category: "hotel",
  programEnvVar: "TP_TRIP_HOTEL_PROGRAM_ID",
  description: "アジア圏に強い・LCCホテルも豊富",
  ctaLabel: (ctx) =>
    `${ctx.cityNameJa ?? ctx.cityNameEn ?? "ホテル"}をTrip.comで`,
  destinationUrl: (ctx) => {
    if (!ctx.cityNameEn) return null;
    const params = new URLSearchParams({
      keyword: ctx.cityNameEn,
      locale: "ja-JP",
      curr: "JPY",
    });
    if (ctx.checkIn) params.set("checkin", ctx.checkIn.replace(/-/g, "/"));
    if (ctx.checkOut) params.set("checkout", ctx.checkOut.replace(/-/g, "/"));
    return `https://jp.trip.com/hotels/?${params.toString()}`;
  },
  iconKey: "BedDouble",
  rel: "sponsored noopener noreferrer",
};

/**
 * Airalo eSIM（国別ページ）
 * 承認後 TP_AIRALO_PROGRAM_ID にセット。
 */
const AIRALO: Partner = {
  id: "airalo",
  name: "Airalo eSIM",
  category: "esim",
  programEnvVar: "TP_AIRALO_PROGRAM_ID",
  description: "現地SIM不要・到着前にスマホで設定完了",
  ctaLabel: (ctx) =>
    ctx.countryNameEn
      ? `${ctx.countryNameEn} で使える eSIM を見る`
      : "海外用 eSIM を見る",
  destinationUrl: (ctx) => {
    const slug =
      ctx.countrySlug ??
      ctx.countryNameEn?.toLowerCase().replace(/\s+/g, "-");
    if (!slug) return "https://www.airalo.com/ja/store";
    return `https://www.airalo.com/ja/${slug}-esim`;
  },
  iconKey: "Signal",
  rel: "sponsored noopener noreferrer",
};

/**
 * KiwiTaxi 空港送迎（出発空港IATA 〜 目的地空港IATA）
 * 承認後 TP_KIWITAXI_PROGRAM_ID にセット。
 */
const KIWITAXI: Partner = {
  id: "kiwitaxi",
  name: "KiwiTaxi 空港送迎",
  category: "transfer",
  programEnvVar: "TP_KIWITAXI_PROGRAM_ID",
  description: "空港〜ホテルの確実な送迎・事前予約で安心",
  ctaLabel: (ctx) =>
    ctx.destinationIata
      ? `${ctx.cityNameJa ?? ctx.destinationIata} の空港送迎を予約`
      : "現地の空港送迎を予約",
  destinationUrl: (ctx) => {
    const params = new URLSearchParams({ lang: "ja" });
    if (ctx.destinationIata) params.set("to_iata", ctx.destinationIata);
    if (ctx.originIata) params.set("from_iata", ctx.originIata);
    return `https://kiwitaxi.com/?${params.toString()}`;
  },
  iconKey: "Car",
  rel: "sponsored noopener noreferrer",
};

/**
 * 旅行保険（汎用枠）。TravelPayoutsで取り扱う保険プログラムが承認されたら
 * TP_INSURANCE_PROGRAM_ID + TP_INSURANCE_URL を env にセット。
 * 直接URLを env で指定するパターンも兼ねる（一般化）。
 */
const INSURANCE: Partner = {
  id: "insurance",
  name: "海外旅行保険",
  category: "insurance",
  programEnvVar: "TP_INSURANCE_PROGRAM_ID",
  description: "短期旅行でも加入推奨・キャッシュレス受診対応",
  ctaLabel: () => "海外旅行保険をチェック",
  destinationUrl: () =>
    process.env.TP_INSURANCE_URL ?? "https://www.cherehapa.ru/",
  iconKey: "Shield",
  rel: "sponsored noopener noreferrer",
};

export const PARTNERS: Partner[] = [
  BOOKING,
  TRIP_HOTEL,
  AIRALO,
  KIWITAXI,
  INSURANCE,
];

/** 指定カテゴリの有効なパートナーだけ返す */
export function getEnabledPartners(category?: PartnerCategory): Partner[] {
  return PARTNERS.filter(
    (p) => isPartnerEnabled(p) && (!category || p.category === category)
  );
}
