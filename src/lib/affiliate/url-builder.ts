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
// routeAware=true: 路線プリフィル対応かつ検証済み（実ブラウザで該当路線の
//   予約画面に着地→ユーザーが見たセール特価がそのまま表示される）。主CTAに使う。
// routeAware=false: 汎用トップしか出せない（路線が伝わらず離脱を招く）。
//   主CTAには使わず Skyscanner にフォールバック。比較リンクには出す。
const AIRLINE_BOOKING_TEMPLATES: Record<
  string,
  {
    name: string;
    routeAware: boolean;
    build: (route: SaleRoute, sale: AirlineSale) => string;
  }
> = {
  ANA: {
    name: "ANA公式",
    routeAware: false, // aswbe-i deep linkが404のため予約トップのみ
    build: () => "https://www.ana.co.jp/ja/jp/",
  },
  JAL: {
    name: "JAL公式",
    routeAware: true,
    build: (r) =>
      `https://www.jal.co.jp/jp/ja/dom/?ks=${r.originCode}&kf=${r.destinationCode}`,
  },
  // airlines.ts の定義に一致させる: APJ=Spring Japan, PCH=Peach
  APJ: {
    name: "Spring Japan公式",
    routeAware: false, // jp.ch.com は路線プリフィル非対応 → Skyscannerにフォールバック
    build: () => "https://jp.ch.com/",
  },
  PCH: {
    name: "Peach公式",
    routeAware: true,
    build: (r) =>
      `https://www.flypeach.com/jp/book-a-flight?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  JJP: {
    name: "Jetstar公式",
    routeAware: true,
    build: (r) =>
      `https://www.jetstar.com/jp/ja/home?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  IJ: {
    name: "Spring Japan公式",
    routeAware: false,
    build: () => "https://jp.ch.com/",
  },
  TW: {
    name: "T'way Air公式",
    routeAware: false,
    build: () => "https://www.twayair.com/app/serviceInfo/contents/1228",
  },
  VJ: {
    name: "VietJet Air公式",
    routeAware: true,
    build: (r) =>
      `https://www.vietjetair.com/ja/Pages/booking.aspx?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  EK: {
    name: "Emirates公式",
    routeAware: false, // flight-search deep linkが404のため予約トップのみ
    build: () => "https://www.emirates.com/jp/japanese/book/",
  },
  SQ: {
    name: "Singapore Airlines公式",
    routeAware: true,
    build: (r) =>
      `https://www.singaporeair.com/jp_JP/jp/plan-and-book/?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  CX: {
    name: "Cathay Pacific公式",
    routeAware: true,
    build: (r) =>
      `https://www.cathaypacific.com/cx/ja_JP/book-a-trip.html?origin=${r.originCode}&destination=${r.destinationCode}`,
  },
  BV: {
    name: "トキエア公式",
    routeAware: false,
    build: () => "https://www.tokiair.com/",
  },
  HD: {
    name: "AIRDO公式",
    routeAware: false,
    build: () => "https://www.airdo.jp/",
  },
  "6J": {
    name: "ソラシドエア公式",
    routeAware: false,
    build: () => "https://www.solaseedair.jp/",
  },
  "7G": {
    name: "StarFlyer公式",
    routeAware: false,
    build: () => "https://www.starflyer.jp/",
  },
  BC: {
    name: "スカイマーク公式",
    routeAware: false,
    build: () => "https://www.skymark.co.jp/",
  },
  JH: {
    name: "FDA公式",
    routeAware: false,
    build: () => "https://www.fujidream.co.jp/",
  },
  ZG: {
    name: "ZIPAIR公式",
    routeAware: false,
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

/**
 * 目的地ホテル検索のアフィリエイトリンク（Hotellook 経由）。
 *
 * ホテルは航空券より高料率（数%）で、同じ訪問者の収益を底上げできる。
 * Hotellook はネイティブに `marker` クエリで TravelPayouts 帰属するため
 * 第三者スクリプト不要・URLのみで成立する（ページ軽量を維持）。
 * Marker 未設定（開発）でもリンクは成立する（収益は発生しない）。
 *
 * @param cityNameEn 英語都市名（例: "Bangkok"）。Hotellook が確実に解決する。
 * @param checkIn    YYYY-MM-DD（任意・無効なら省略）
 * @param checkOut   YYYY-MM-DD（任意・無効なら省略）
 */
export function buildHotelLink(
  cityNameEn: string,
  checkIn?: string,
  checkOut?: string
): string {
  const marker = process.env.TRAVELPAYOUTS_MARKER;
  const params = new URLSearchParams({
    destination: cityNameEn,
    adults: "2",
    locale: "ja",
    currency: "jpy",
  });
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (checkIn && isoDate.test(checkIn)) params.set("checkIn", checkIn);
  if (checkOut && isoDate.test(checkOut)) params.set("checkOut", checkOut);
  if (marker) params.set("marker", marker);
  return `https://search.hotellook.com/?${params.toString()}`;
}

/**
 * 路線・セール情報から最適なアフィリエイトリンクを生成
 *
 * 設計方針（コンバージョン最優先）:
 * 予約ボタンは必ず「その路線・日付で実際に予約できるページ」に着地させる。
 * 航空会社のキャンペーン/プロモページは期限切れで404になったり、
 * 路線情報のない汎用LPで離脱を招くため【予約CTAには使わない】。
 * メタサーチ（Skyscanner）の路線+日付プリフィルは:
 *   - 404にならない（常に検索結果が表示される）
 *   - 実在の便をそのまま予約できる
 *   - TravelPayouts/Skyscanner経由で収益化される
 * よって Skyscanner を予約CTAの第一候補にする。
 * 航空会社公式・Trip.com は「他サイトで価格比較」リンク側で提供する。
 */
export function buildAffiliateLink(
  route: SaleRoute,
  sale: AirlineSale,
  options: { preferProvider?: AffiliateProvider } = {}
): AffiliateLink {
  // プロバイダー明示指定がある場合はそれに従う
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
  const template = AIRLINE_BOOKING_TEMPLATES[sale.airlineCode];

  if (options.preferProvider === "airline-direct") {
    if (template) {
      return {
        url: template.build(route, sale),
        provider: template.name,
        strategy: "airline-direct",
      };
    }
  }

  // 主CTA優先度:
  // 1. 路線対応の航空会社直予約（ユーザーが見たセール航空会社の予約画面に
  //    路線プリフィルで直行 → 見た特価がそのまま表示される最良の体験）
  if (template && template.routeAware) {
    return {
      url: template.build(route, sale),
      provider: template.name,
      strategy: "airline-direct",
    };
  }

  // 2. フォールバック: Skyscanner の路線+日付プリフィル
  //    （汎用トップしか出せない航空会社・未対応キャリアはこちら。
  //     404にならず実在便を予約でき収益化もされる確実な導線）
  return {
    url: buildSkyscannerUrl(route, sale),
    provider: "Skyscanner",
    strategy: "skyscanner",
  };
}

/**
 * DealSchema から予約CTAリンクを生成
 * （mockディール等、AirlineSale を持たない経路用）
 */
export function buildAffiliateLinkFromDeal(deal: DealSchema): AffiliateLink {
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
  return buildAffiliateLink(route, sale);
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
