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

export type PartnerCategory =
  | "hotel"
  | "esim"
  | "transfer"
  | "insurance"
  | "tour"
  | "car"
  | "compensation";

export type PartnerContext = {
  /**
   * ページ自体が海外旅行の文脈であることを明示する。
   *
   * isOverseas は destinationIata から判定するが、ガイド記事のように目的地を
   * 持たないページでは判定できず「国内扱い」に倒れて eSIM 等が消えてしまう。
   * 「文脈が無い」と「国内」は別物なので、ページ側から宣言できるようにする。
   */
  overseas?: boolean;
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
  /**
   * ページ文脈に合うときだけ出す判定（任意）。
   * 未指定なら常に対象（従来の挙動）。ここで false を返すと枠自体に出ない。
   *
   * 例: レンタカーは「クルマが要る目的地」だけ、AirHelp は「EU路線」だけ。
   * 無関係なページに出して情報過多にしないための絞り込み。
   */
  isRelevant?: (ctx: PartnerContext) => boolean;
};

const MARKER_ENV = "TRAVELPAYOUTS_MARKER";

/**
 * TravelPayouts 既定 marker（環境変数未設定時の共通フォールバック）。
 * url-builder.ts / hotel-search.ts / partners.ts の 3 ファイルで共用する。
 */
export const TRAVELPAYOUTS_FALLBACK_MARKER = "729387";

/** marker は env 優先 + 共通フォールバック。tp.media 系 URL 生成の唯一の取得経路。 */
export function getTravelPayoutsMarker(): string {
  return process.env[MARKER_ENV] || TRAVELPAYOUTS_FALLBACK_MARKER;
}

/**
 * program ID が揃って初めて有効。tp.media で wrap した最終URLを返す。
 *
 * @param subId アトリビューション用 sub_id（{pageType}_{placement} 形式）。
 *              呼び出し元が渡さない場合は partner_cta が付く。
 */
export function buildPartnerUrl(
  p: Partner,
  ctx: PartnerContext,
  subId: string = "partner_cta"
): string | null {
  const marker = getTravelPayoutsMarker();
  const programId = process.env[p.programEnvVar];
  const dest = p.destinationUrl(ctx);
  if (!dest) return null;
  if (!programId) {
    // 開発時など: tp.media wrapを使わずに直接の遷移先URLを返す
    return dest;
  }
  return `https://tp.media/r?marker=${marker}&p=${programId}&sub_id=${encodeURIComponent(subId)}&u=${encodeURIComponent(dest)}`;
}

/** その env が本番で有効か（marker はフォールバックがあるため program ID のみ見る） */
export function isPartnerEnabled(p: Partner): boolean {
  return Boolean(process.env[p.programEnvVar]);
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
  // eSIM は海外旅行の課題。国内線ディールに出しても意味がないので抑制。
  isRelevant: isOverseas,
};

/**
 * GigSky eSIM（Airalo より高料率。並べて選択肢にする）
 */
const GIGSKY: Partner = {
  id: "gigsky",
  name: "GigSky eSIM",
  category: "esim",
  programEnvVar: "TP_GIGSKY_PROGRAM_ID",
  description: "190以上の国と地域で使えるデータプラン",
  ctaLabel: (ctx) =>
    ctx.countryNameEn ? `${ctx.countryNameEn} の eSIM プランを見る` : "eSIM プランを見る",
  destinationUrl: () => "https://www.gigsky.com/",
  iconKey: "Signal",
  rel: "sponsored noopener noreferrer",
  isRelevant: isOverseas,
};

/**
 * Yesim eSIM（高料率。国別プランに対応）
 */
const YESIM: Partner = {
  id: "yesim",
  name: "Yesim eSIM",
  category: "esim",
  programEnvVar: "TP_YESIM_PROGRAM_ID",
  description: "アプリで即開通・国別/周遊プランが豊富",
  ctaLabel: () => "eSIM の料金を比較する",
  destinationUrl: () => "https://yesim.tech/",
  iconKey: "Signal",
  rel: "sponsored noopener noreferrer",
  isRelevant: isOverseas,
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
  // 海外旅行保険。国内線ディールでは不要なので出さない。
  isRelevant: isOverseas,
};

/**
 * 欧州の主要空港 (EU/英国)。AirHelp の補償請求 (EU261) が現実的に効く範囲。
 * 日本国内線や米国路線は対象外のため、ここでしか出さない。
 */
const EU_IATA = new Set([
  "LHR", "LGW", "CDG", "ORY", "FRA", "MUC", "AMS", "MAD", "BCN", "FCO",
  "MXP", "VIE", "ZRH", "GVA", "BRU", "CPH", "ARN", "OSL", "HEL", "DUB",
  "LIS", "OPO", "PRG", "WAW", "BUD", "ATH", "IST", "MAN", "EDI", "DUS",
  "HAM", "TXL", "BER", "STR", "NCE", "LYS", "VCE", "NAP", "AGP", "PMI",
]);

/**
 * AirHelp — 遅延・欠航の補償請求 (最大 €600)。
 * 「航空券特化サイト」と最も相性が良い一方、EU261 が主戦場なので
 * 欧州路線でだけ出す (国内線に出すと誤解を招くため)。
 */
const AIRHELP: Partner = {
  id: "airhelp",
  name: "AirHelp 遅延・欠航の補償請求",
  category: "compensation",
  programEnvVar: "TP_AIRHELP_PROGRAM_ID",
  description: "欧州路線の遅延・欠航は最大€600の補償対象になることも",
  ctaLabel: () => "補償の対象か無料でチェック",
  destinationUrl: () => "https://www.airhelp.com/ja/",
  iconKey: "Plane",
  rel: "sponsored noopener noreferrer",
  // 欧州発着のみ (出発・到着どちらかが EU/UK 圏)
  isRelevant: (ctx) =>
    (!!ctx.destinationIata && EU_IATA.has(ctx.destinationIata)) ||
    (!!ctx.originIata && EU_IATA.has(ctx.originIata)),
};

/** 国内線の主要空港。eSIM/保険など「海外向け」の枠を国内旅行で出さないための判定に使う。 */
const DOMESTIC_IATA = new Set([
  "HND", "NRT", "KIX", "ITM", "UKB", "NGO", "FUK", "CTS", "OKD", "OKA",
  "ISG", "MMY", "HKD", "AKJ", "KUH", "MMB", "SDJ", "AOJ", "AXT", "HIJ",
  "OKJ", "TAK", "MYJ", "KCZ", "TKS", "KOJ", "KMJ", "KMI", "OIT", "NGS",
  "TOY", "KMQ", "ASJ", "IWJ", "TTJ", "IZO", "YGJ", "FSZ", "KIJ", "HAC",
]);

/** 海外の目的地か (eSIM/保険はここでだけ出す)。IATA 不明時は出さない安全側。 */
function isOverseas(ctx: PartnerContext): boolean {
  // ページが海外文脈だと宣言していればそれを優先 (目的地を持たないガイド記事用)
  if (ctx.overseas !== undefined) return ctx.overseas;
  return !!ctx.destinationIata && !DOMESTIC_IATA.has(ctx.destinationIata);
}

/**
 * レンタカーを出す目的地 (IATA)。
 * 「公共交通だけだと厳しく、実際に多くの旅行者がクルマを借りる」場所に限定する。
 * 東京・大阪・ソウル等の都市型目的地には出さない (地下鉄で足りるため情報過多になる)。
 */
const CAR_RENTAL_IATA = new Set([
  // 沖縄・離島
  "OKA", "ISG", "MMY",
  // 北海道
  "CTS", "HKD", "OKD", "AKJ", "KUH", "MMB",
  // 九州 (阿蘇・湯布院など車前提の観光地を抱える)
  "KOJ", "KMJ", "KMI", "OIT",
  // 四国・山陰
  "MYJ", "KCZ", "TAK", "TTJ", "IZO",
  // リゾート (海外)
  "HNL", "OGG", "KOA", "GUM", "SPN", "DPS", "CNS", "ZQN",
]);

/**
 * レンタカー (Localrent)。現地の中小業者を含む比較。
 * リゾート・地方限定で出す。
 */
const LOCALRENT: Partner = {
  id: "localrent",
  name: "Localrent レンタカー",
  category: "car",
  programEnvVar: "TP_LOCALRENT_PROGRAM_ID",
  description: "現地レンタカーを比較・空港受取に対応",
  ctaLabel: (ctx) =>
    ctx.cityNameJa ? `${ctx.cityNameJa}のレンタカーを探す` : "レンタカーを探す",
  destinationUrl: (ctx) => {
    const params = new URLSearchParams({ lang: "ja" });
    if (ctx.cityNameEn) params.set("q", ctx.cityNameEn);
    return `https://localrent.com/?${params.toString()}`;
  },
  iconKey: "Car",
  rel: "sponsored noopener noreferrer",
  isRelevant: (ctx) =>
    !!ctx.destinationIata && CAR_RENTAL_IATA.has(ctx.destinationIata),
};

/**
 * レンタカー (GetRentacar)。大手比較。Localrent と並べて選択肢にする。
 */
const GETRENTACAR: Partner = {
  id: "getrentacar",
  name: "GetRentacar",
  category: "car",
  programEnvVar: "TP_GETRENTACAR_PROGRAM_ID",
  description: "大手レンタカーを横断比較・当日受取も",
  ctaLabel: (ctx) =>
    ctx.cityNameJa ? `${ctx.cityNameJa}の料金を比較` : "レンタカー料金を比較",
  destinationUrl: (ctx) => {
    const params = new URLSearchParams({ lang: "ja" });
    if (ctx.cityNameEn) params.set("city", ctx.cityNameEn);
    return `https://getrentacar.com/?${params.toString()}`;
  },
  iconKey: "Car",
  rel: "sponsored noopener noreferrer",
  isRelevant: (ctx) =>
    !!ctx.destinationIata && CAR_RENTAL_IATA.has(ctx.destinationIata),
};

/**
 * Klook — アジア圏に強い現地アクティビティ。日本人の利用も多い。
 * (GetYourGuide/Viator は未参加のため、参加済みで実利のある Klook/KKday を使う)
 */
const KLOOK: Partner = {
  id: "klook",
  name: "Klook 現地ツアー・入場券",
  category: "tour",
  programEnvVar: "TP_KLOOK_PROGRAM_ID",
  description: "人気スポットの入場券・体験を事前予約",
  ctaLabel: (ctx) =>
    ctx.cityNameJa ? `${ctx.cityNameJa}の遊びを予約` : "現地の遊びを予約",
  destinationUrl: (ctx) =>
    ctx.cityNameEn
      ? `https://www.klook.com/ja/search/?query=${encodeURIComponent(ctx.cityNameEn)}`
      : "https://www.klook.com/ja/",
  iconKey: "Sparkles",
  rel: "sponsored noopener noreferrer",
};

/**
 * KKday — 台湾発。アジア路線と相性が良い現地体験。
 */
const KKDAY: Partner = {
  id: "kkday",
  name: "KKday 現地体験",
  category: "tour",
  programEnvVar: "TP_KKDAY_PROGRAM_ID",
  description: "現地ツアー・空港送迎・WiFiまで",
  ctaLabel: (ctx) =>
    ctx.cityNameJa ? `${ctx.cityNameJa}の体験を探す` : "現地体験を探す",
  destinationUrl: (ctx) =>
    ctx.cityNameEn
      ? `https://www.kkday.com/ja/product/ls?keyword=${encodeURIComponent(ctx.cityNameEn)}`
      : "https://www.kkday.com/ja",
  iconKey: "Sparkles",
  rel: "sponsored noopener noreferrer",
};

export const PARTNERS: Partner[] = [
  BOOKING,
  TRIP_HOTEL,
  AIRALO,
  GIGSKY,
  YESIM,
  KIWITAXI,
  INSURANCE,
  LOCALRENT,
  GETRENTACAR,
  KLOOK,
  KKDAY,
  AIRHELP,
];

/**
 * 指定カテゴリの有効なパートナーだけ返す。
 * ctx を渡すと isRelevant による文脈フィルタも適用する（無関係な枠を出さない）。
 */
export function getEnabledPartners(
  category?: PartnerCategory,
  ctx?: PartnerContext
): Partner[] {
  return PARTNERS.filter(
    (p) =>
      isPartnerEnabled(p) &&
      (!category || p.category === category) &&
      (!ctx || !p.isRelevant || p.isRelevant(ctx))
  );
}
