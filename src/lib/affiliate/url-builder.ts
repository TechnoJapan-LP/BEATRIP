/**
 * アフィリエイトURLビルダー
 *
 * 複数のプロバイダー（Skyscanner / Trip.com / 各航空会社直販）に対応し、
 * 路線・航空会社・予約条件に応じて最適なリンク先を生成する。
 *
 * ## 環境変数（任意・本番でのみ収益発生）
 *
 * - `SKYSCANNER_ASSOCIATE_ID`: Skyscanner Partners の associate ID
 * - `TRIP_COM_AFFILIATE_ID`: Trip.com Affiliate Program のID
 * - `TRAVELPAYOUTS_MARKER`: TravelPayouts のマーカーID（推奨）
 * - `A8_NET_*_AFF_ID`: A8.net の各広告主アフィリエイトID
 *
 * 未設定でも URL は生成され、検索ページにジャンプする（収益は発生しない）。
 */

import type { AirlineSale, SaleRoute } from "@/lib/scrapers/types";
import type { DealSchema } from "@/data/deal-schema";

export type AffiliateProvider =
  | "skyscanner"
  | "trip"
  | "airline-direct"
  | "travelpayouts"
  | "official-source";

export type AffiliateLink = {
  /** ジャンプ先URL */
  url: string;
  /** 表示プロバイダー名（ボタン下に表示） */
  provider: string;
  /** ロジックの説明（デバッグ用） */
  strategy: AffiliateProvider;
};

// ── 各航空会社の予約検索ページのテンプレート ──
// {ORIGIN} {DEST} {YYYYMMDD} などのプレースホルダを置換する
const AIRLINE_BOOKING_TEMPLATES: Record<
  string,
  { name: string; build: (route: SaleRoute, sale: AirlineSale) => string }
> = {
  ANA: {
    name: "ANA公式",
    build: (r) =>
      `https://aswbe-i.ana.co.jp/internet_app/pr/itnry_air?lang=JP&CONNECTION_KIND=JPN&DEP_CITY_CODE=${r.originCode}&ARR_CITY_CODE=${r.destinationCode}&ADULT_PASSENGER_NUMBER=1`,
  },
  JAL: {
    name: "JAL公式",
    build: (r) =>
      `https://www.jal.co.jp/jp/ja/dom/?ks=${r.originCode}&kf=${r.destinationCode}`,
  },
  APJ: {
    name: "Peach公式",
    build: (r) =>
      `https://www.flypeach.com/jp/book-a-flight?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  PCH: {
    name: "Peach公式",
    build: (r) =>
      `https://www.flypeach.com/jp/book-a-flight?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  JJP: {
    name: "Jetstar公式",
    build: (r) =>
      `https://www.jetstar.com/jp/ja/home?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  IJ: {
    name: "Spring Japan公式",
    build: () => "https://jp.ch.com/",
  },
  TW: {
    name: "T'way Air公式",
    build: () => "https://www.twayair.com/app/serviceInfo/contents/1228",
  },
  VJ: {
    name: "VietJet Air公式",
    build: (r) =>
      `https://www.vietjetair.com/ja/Pages/booking.aspx?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  EK: {
    name: "Emirates公式",
    build: (r) =>
      `https://www.emirates.com/jp/japanese/book/flight-search/?originAirport=${r.originCode}&destinationAirport=${r.destinationCode}`,
  },
  SQ: {
    name: "Singapore Airlines公式",
    build: (r) =>
      `https://www.singaporeair.com/jp_JP/jp/plan-and-book/?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  CX: {
    name: "Cathay Pacific公式",
    build: (r) =>
      `https://www.cathaypacific.com/cx/ja_JP/book-a-trip.html?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  BV: {
    name: "トキエア公式",
    build: () => "https://www.tokiair.com/",
  },
  HD: {
    name: "AIRDO公式",
    build: () => "https://www.airdo.jp/",
  },
  "6J": {
    name: "ソラシドエア公式",
    build: () => "https://www.solaseedair.jp/",
  },
  "7G": {
    name: "StarFlyer公式",
    build: () => "https://www.starflyer.jp/",
  },
  BC: {
    name: "スカイマーク公式",
    build: () => "https://www.skymark.co.jp/",
  },
  JH: {
    name: "FDA公式",
    build: () => "https://www.fujidream.co.jp/",
  },
  ZG: {
    name: "ZIPAIR公式",
    build: () => "https://www.zipair.net/ja",
  },
};

// ── Skyscanner deep link ──
function buildSkyscannerUrl(route: SaleRoute, sale: AirlineSale): string {
  const dep = formatDateForSkyscanner(sale.travelPeriodStart);
  const ret = sale.travelPeriodEnd
    ? formatDateForSkyscanner(sale.travelPeriodEnd)
    : "";

  const base = `https://www.skyscanner.jp/transport/flights/${route.originCode.toLowerCase()}/${route.destinationCode.toLowerCase()}/${dep}${ret ? "/" + ret : ""}/`;

  const associateId = process.env.SKYSCANNER_ASSOCIATE_ID;
  const params = new URLSearchParams();
  if (associateId) params.set("associateid", associateId);
  params.set("adults", "1");
  params.set("cabinclass", route.cabin === "Business" ? "business" : "economy");
  params.set("currency", "JPY");
  params.set("locale", "ja-JP");
  params.set("market", "JP");

  return `${base}?${params.toString()}`;
}

// ── Trip.com deep link ──
function buildTripComUrl(route: SaleRoute, sale: AirlineSale): string {
  const dep = formatDateForTripCom(sale.travelPeriodStart);
  const base = "https://jp.trip.com/flights/showfarefirst";
  const params = new URLSearchParams({
    dcity: route.originCode.toLowerCase(),
    acity: route.destinationCode.toLowerCase(),
    ddate: dep,
    triptype: "ow",
    class: route.cabin === "Business" ? "c" : "y",
    locale: "ja-jp",
    curr: "JPY",
  });

  const affiliateId = process.env.TRIP_COM_AFFILIATE_ID;
  if (affiliateId) {
    params.set("Allianceid", affiliateId);
    params.set("Sid", "BEATRIP");
  }

  return `${base}?${params.toString()}`;
}

// ── TravelPayouts (aggregator) ──
function buildTravelPayoutsUrl(route: SaleRoute, sale: AirlineSale): string {
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  if (!marker) {
    // Marker未設定時は Aviasales 直接リンク
    return `https://www.aviasales.com/search/${route.originCode}${formatDateForAviasales(sale.travelPeriodStart)}${route.destinationCode}1`;
  }

  // tp.media リダイレクター経由（収益発生）
  const searchUrl = encodeURIComponent(
    `https://www.aviasales.com/search/${route.originCode}${formatDateForAviasales(sale.travelPeriodStart)}${route.destinationCode}1`
  );
  return `https://tp.media/r?marker=${marker}&trs=&p=4114&u=${searchUrl}`;
}

// ── 公式ソースURL（スクレイプ元）が信頼できる場合は優先 ──
function isUsableOfficialUrl(url: string | undefined): boolean {
  if (!url) return false;
  // RSS記事へのリンクは予約導線にならないので除外
  if (url.includes("traicy.com")) return false;
  if (url.includes("/news/") || url.includes("/blog/")) return false;
  return true;
}

/**
 * 路線・セール情報から最適なアフィリエイトリンクを生成
 *
 * 優先順:
 * 1. セールページ（航空会社公式の specific URL）が信頼できればそれを使う
 * 2. その航空会社の予約フォーム deep link
 * 3. Skyscanner deep link（万能フォールバック、affiliate IDあれば収益化）
 */
export function buildAffiliateLink(
  route: SaleRoute,
  sale: AirlineSale,
  options: { preferProvider?: AffiliateProvider } = {}
): AffiliateLink {
  // 1. 公式ソースURLが直リンクとして使える場合
  if (isUsableOfficialUrl(sale.sourceUrl) && !options.preferProvider) {
    return {
      url: sale.sourceUrl,
      provider: getAirlineLabel(sale.airlineCode),
      strategy: "official-source",
    };
  }

  // 2. プロバイダー優先指定がある場合
  if (options.preferProvider === "skyscanner") {
    return {
      url: buildSkyscannerUrl(route, sale),
      provider: "Skyscanner",
      strategy: "skyscanner",
    };
  }
  if (options.preferProvider === "trip") {
    return {
      url: buildTripComUrl(route, sale),
      provider: "Trip.com",
      strategy: "trip",
    };
  }
  if (options.preferProvider === "travelpayouts") {
    return {
      url: buildTravelPayoutsUrl(route, sale),
      provider: "Aviasales",
      strategy: "travelpayouts",
    };
  }

  // 3. その航空会社の予約フォーム
  const template = AIRLINE_BOOKING_TEMPLATES[sale.airlineCode];
  if (template) {
    return {
      url: template.build(route, sale),
      provider: template.name,
      strategy: "airline-direct",
    };
  }

  // 4. Skyscanner フォールバック
  return {
    url: buildSkyscannerUrl(route, sale),
    provider: "Skyscanner",
    strategy: "skyscanner",
  };
}

/**
 * 価格比較用に複数プロバイダーのリンクを返す（詳細ページで使用想定）
 */
export function buildCompareLinks(
  route: SaleRoute,
  sale: AirlineSale
): AffiliateLink[] {
  const links: AffiliateLink[] = [];

  // 公式
  const template = AIRLINE_BOOKING_TEMPLATES[sale.airlineCode];
  if (template) {
    links.push({
      url: template.build(route, sale),
      provider: template.name,
      strategy: "airline-direct",
    });
  }

  // Skyscanner
  links.push({
    url: buildSkyscannerUrl(route, sale),
    provider: "Skyscanner",
    strategy: "skyscanner",
  });

  // Trip.com
  links.push({
    url: buildTripComUrl(route, sale),
    provider: "Trip.com",
    strategy: "trip",
  });

  return links;
}

function getAirlineLabel(code: string): string {
  return AIRLINE_BOOKING_TEMPLATES[code]?.name ?? code;
}

/**
 * DealSchema から比較リンクを生成（詳細ページで使用）
 *
 * 自分自身の affiliate_url を除いた最大3つのプロバイダー検索URLを返す。
 */
export function buildCompareLinksFromDeal(deal: DealSchema): AffiliateLink[] {
  // DealSchemaから疑似的なSaleRoute/AirlineSaleを構築
  const route: SaleRoute = {
    origin: deal.origin,
    originCode: deal.origin_code,
    destination: deal.destination,
    destinationCode: deal.destination_code,
    price: deal.sale_price,
    originalPrice: deal.original_price,
    currency: deal.currency,
    cabin: deal.cabin,
    discount: deal.discount_percent,
    seatsRemaining: deal.seats_remaining,
  };

  const sale: AirlineSale = {
    id: deal.sale_id ?? deal.id,
    airlineCode: deal.airline_id,
    airlineName: deal.airline_name,
    saleName: deal.sale_name,
    description: deal.sale_name,
    sourceUrl: "",
    startDate: deal.created_at,
    endDate: deal.booking_deadline,
    bookingDeadline: deal.booking_deadline,
    travelPeriodStart: deal.departure_date,
    travelPeriodEnd: deal.return_date,
    routes: [route],
    isActive: true,
    scrapedAt: deal.updated_at,
  };

  return buildCompareLinks(route, sale);
}

// ── 日付フォーマット ──

/** Skyscanner: YYMMDD */
function formatDateForSkyscanner(dateStr: string): string {
  const d = new Date(dateStr);
  const yy = d.getFullYear().toString().slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}${mm}${dd}`;
}

/** Trip.com: YYYY-MM-DD */
function formatDateForTripCom(dateStr: string): string {
  return new Date(dateStr).toISOString().slice(0, 10);
}

/** Aviasales: DDMM */
function formatDateForAviasales(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}${mm}`;
}
