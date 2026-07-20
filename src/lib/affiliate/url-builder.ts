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
 * - `AFFILIATE_URL_AIRLINE_{CODE}`: 航空会社直販 ASP のクリック URL
 *   （設定すると該当航空会社の予約 CTA が ASP 経由になり収益化される）
 *
 * 未設定でも URL は生成され、検索ページにジャンプする（収益は発生しない）。
 */

import type { AirlineSale, SaleRoute } from "@/lib/scrapers/types";
import type { DealSchema } from "@/data/deal-schema";
import { getTravelPayoutsMarker } from "./partners";

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
  // airlines.ts の定義に一致させる: SJO=Spring Japan, PCH=Peach
  SJO: {
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

// ── 航空会社直販 ASP オーバーライド ──
//
// env `AFFILIATE_URL_AIRLINE_{CODE}` に ASP (A8 / アクセストレード /
// バリューコマース等) で発行されたクリック URL 全文を設定すると、
// その航空会社の予約 CTA が ASP 経由になり収益化される。
// 検証規約は asp-partners.ts の network='external_url' と同一
// (https?:// で始まる文字列のみ有効。それ以外は未設定扱い)。
//
// 【トレードオフに関する注意】
// ASP のクリック URL は経路パラメータ (出発地 / 目的地 / 日付) を
// 引き継げないことが多く、着地は「公式サイトのトップ or キャンペーン LP」
// になる。つまり routeAware な公式 deep link (路線プリフィル済み予約画面)
// の UX 優位性と引き換えに収益が立つ。
// どちらを取るかは env 設定者 (サイト運用者) の判断に委ねる設計:
// env を設定した航空会社のみ ASP 経由になり、未設定なら従来挙動
// (routeAware 公式 deep link or Skyscanner フォールバック) を完全維持する。

/**
 * 内部 airlineCode と env サフィックスの別名対応。
 * 内部コードが直感的でない会社は人間に分かりやすい別名でも設定できる
 * (例: Peach は AFFILIATE_URL_AIRLINE_PCH でも AFFILIATE_URL_AIRLINE_PEACH でも可)。
 */
const AIRLINE_AFFILIATE_ENV_ALIASES: Record<string, string[]> = {
  PCH: ["PEACH"],
  JJP: ["JETSTAR"],
  // SJO は旧内部コード APJ から改名。既存の AFFILIATE_URL_AIRLINE_APJ が
  // 設定済みでも引き続き引けるよう別名に残す。
  SJO: ["SPRING", "APJ"],
};

/**
 * 航空会社直販 ASP のクリック URL を env から引く。
 *
 * @param airlineCode 内部航空会社コード (sale.airlineCode / deal.airline_id)
 * @returns 有効な ASP クリック URL。未設定 / 不正値なら null (= 従来挙動)
 */
export function getAirlineAffiliateUrl(airlineCode: string): string | null {
  if (!airlineCode) return null;
  // env 名として安全な形に正規化 (例 "6J" はそのまま、小文字は大文字化)
  const code = airlineCode.toUpperCase().replace(/[^A-Z0-9]/g, "_");
  const suffixes = [code, ...(AIRLINE_AFFILIATE_ENV_ALIASES[code] ?? [])];
  for (const suffix of suffixes) {
    const v = process.env[`AFFILIATE_URL_AIRLINE_${suffix}`];
    // asp-partners.ts の external_url と同じ検証: http(s):// で始まる URL 全文のみ
    if (typeof v === "string" && /^https?:\/\//.test(v.trim())) {
      return v.trim();
    }
  }
  return null;
}

/**
 * admin ダッシュボード可視化用: 主要航空会社の ASP env 設定状況。
 * envKey は .env.example に記載している推奨キー名 (別名側を採用している場合あり)。
 */
export const AIRLINE_AFFILIATE_ENV_VARS: {
  code: string;
  name: string;
  envKey: string;
}[] = [
  { code: "JAL", name: "JAL", envKey: "AFFILIATE_URL_AIRLINE_JAL" },
  { code: "ANA", name: "ANA", envKey: "AFFILIATE_URL_AIRLINE_ANA" },
  { code: "PCH", name: "Peach", envKey: "AFFILIATE_URL_AIRLINE_PEACH" },
  { code: "JJP", name: "Jetstar", envKey: "AFFILIATE_URL_AIRLINE_JETSTAR" },
  { code: "SQ", name: "Singapore Airlines", envKey: "AFFILIATE_URL_AIRLINE_SQ" },
  { code: "CX", name: "Cathay Pacific", envKey: "AFFILIATE_URL_AIRLINE_CX" },
  { code: "VJ", name: "VietJet Air", envKey: "AFFILIATE_URL_AIRLINE_VJ" },
  { code: "QR", name: "Qatar Airways", envKey: "AFFILIATE_URL_AIRLINE_QR" },
];

/** 各航空会社の ASP env が設定済みかどうか (値そのものは返さない) */
export function getAirlineAffiliateEnvStatus(): {
  code: string;
  name: string;
  envKey: string;
  set: boolean;
}[] {
  return AIRLINE_AFFILIATE_ENV_VARS.map((v) => ({
    ...v,
    set: getAirlineAffiliateUrl(v.code) !== null,
  }));
}

// ── Skyscanner deep link ──
function buildSkyscannerUrl(route: SaleRoute, sale: AirlineSale): string {
  // 観測した便の実日付があれば最優先。TP 価格ウォッチの travelPeriod は
  // 「今日〜60日後」の汎用値のため、それで開くと利用者が観測価格の便に
  // 辿り着けない (実際に苦情が出た UX 問題)。
  const dep = formatDateForSkyscanner(route.departDate ?? sale.travelPeriodStart);
  const retSrc = route.returnDate ?? (route.departDate ? "" : sale.travelPeriodEnd);
  const ret = retSrc ? formatDateForSkyscanner(retSrc) : "";

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
  const dep = formatDateForTripCom(route.departDate ?? sale.travelPeriodStart);
  // 復路を観測している運賃は往復で検索する。triptype=ow 固定だと、往復で
  // 観測した価格を片道検索で開くことになり、表示価格が噛み合わない
  // (TP の価格ウォッチは one_way=false = 往復運賃を返している)。
  // 往復書式は 2026-07-17 にブラウザで実地検証済み。
  const ret = route.returnDate ? formatDateForTripCom(route.returnDate) : "";
  const base = "https://jp.trip.com/flights/showfarefirst";
  const params = new URLSearchParams({
    dcity: route.originCode.toLowerCase(),
    acity: route.destinationCode.toLowerCase(),
    ddate: dep,
    ...(ret ? { rdate: ret } : {}),
    triptype: ret ? "rt" : "ow",
    class: route.cabin === "Business" ? "c" : "y",
    locale: "ja-jp",
    curr: "JPY",
  });

  // アフィリエイト帰属。パラメータ名は大文字小文字を区別する (SID は大文字)。
  //
  // Allianceid = アカウントID / SID = 管理画面 "Manage My Sites" で発行される
  // **サイトID (数値)**。2026-07-19 まで SID に "BEATRIP" という文字列を
  // 入れており、登録済みサイトに紐づかないため管理画面のクリックが 0 のまま
  // だった (Allianceid 側は正しかった)。**SID は任意の識別子ではない。**
  //
  // どちらも未設定なら素の検索リンク (無報酬) として成立させる。誤った値を
  // 埋めるより、付けない方が原因を追いやすい。
  const affiliateId = process.env.TRIP_COM_AFFILIATE_ID;
  const siteId = process.env.TRIP_COM_SITE_ID;
  if (affiliateId) {
    params.set("Allianceid", affiliateId);
    if (siteId) params.set("SID", siteId);
  }

  return `${base}?${params.toString()}`;
}

// ── TravelPayouts (aggregator) ──
// marker は env 優先 + 共通フォールバック (partners.ts の getTravelPayoutsMarker)。
// subId は {pageType}_{placement} 形式。呼び出し元が渡さない場合は flight_cta。
function buildTravelPayoutsUrl(
  route: SaleRoute,
  sale: AirlineSale,
  subId: string = "flight_cta"
): string {
  const marker = getTravelPayoutsMarker();

  // Aviasales の検索 URL 書式 (2026-07-17 にブラウザで実地検証):
  //   往復: {ORIGIN}{DDMM}{DEST}{DDMM_return}{人数}  例 HND0509KIX15091
  //   片道: {ORIGIN}{DDMM}{DEST}{人数}              例 HND0509KIX1
  // 開くと検索がプリフィルされた状態で結果一覧まで出る (Skyscanner のように
  // 検索フォームで止まらない)。通貨は利用者の地域から自動判定されるため
  // 日本からのアクセスは JPY 表示になる (UI 言語は英語のみ)。
  const dep = formatDateForAviasales(route.departDate ?? sale.travelPeriodStart);
  const ret = route.returnDate
    ? formatDateForAviasales(route.returnDate)
    : "";
  const search = `${route.originCode}${dep}${route.destinationCode}${ret}1`;
  const searchUrl = encodeURIComponent(`https://www.aviasales.com/search/${search}`);

  // 注: `trs=` (空) を付けると tp.media が "traffic_source is not valid" を返して
  // リンクが機能しない (実地検証済み)。空パラメータは絶対に足さないこと。
  return `https://tp.media/r?marker=${marker}&p=4114&sub_id=${encodeURIComponent(subId)}&u=${searchUrl}`;
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
 * @param subId      アトリビューション用 sub_id（{pageType}_{placement} 形式）。
 *                   呼び出し元が渡さない場合は hotel_link が付く。
 */
export function buildHotelLink(
  cityNameEn: string,
  checkIn?: string,
  checkOut?: string,
  subId: string = "hotel_link"
): string {
  const marker = getTravelPayoutsMarker();
  const params = new URLSearchParams({
    destination: cityNameEn,
    adults: "2",
    locale: "ja",
    currency: "jpy",
    marker,
    sub_id: subId,
  });
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (checkIn && isoDate.test(checkIn)) params.set("checkIn", checkIn);
  if (checkOut && isoDate.test(checkOut)) params.set("checkOut", checkOut);
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
  options: {
    preferProvider?: AffiliateProvider;
    /** tp.media 経由リンクの sub_id（{pageType}_{placement} 形式）。省略時 flight_cta */
    subId?: string;
  } = {}
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
      url: buildTravelPayoutsUrl(route, sale, options.subId),
      provider: "Aviasales",
      strategy: "travelpayouts",
    };
  }
  const template = AIRLINE_BOOKING_TEMPLATES[sale.airlineCode];
  // 航空会社直販 ASP オーバーライド (env 設定時のみ非 null)。
  // 注: ASP クリック URL は経路パラメータを引き継げないことが多く、
  // 公式トップ or キャンペーンページ着地になる (詳細は getAirlineAffiliateUrl 上部)。
  const airlineAspUrl = getAirlineAffiliateUrl(sale.airlineCode);
  const airlineProviderName = template?.name ?? `${sale.airlineName}公式`;

  if (options.preferProvider === "airline-direct") {
    if (airlineAspUrl) {
      return {
        url: airlineAspUrl,
        provider: airlineProviderName,
        strategy: "airline-direct",
      };
    }
    if (template) {
      return {
        url: template.build(route, sale),
        provider: template.name,
        strategy: "airline-direct",
      };
    }
  }

  // 主CTA優先度:
  // 0. 航空会社直販 ASP オーバーライド (env AFFILIATE_URL_AIRLINE_{CODE})。
  //    route 深リンクの UX 優位 vs ASP 収益のトレードオフは env 設定者の判断。
  //    env 未設定なら従来挙動 (1 → 2) と完全一致。
  if (airlineAspUrl) {
    return {
      url: airlineAspUrl,
      provider: airlineProviderName,
      strategy: "airline-direct",
    };
  }

  // 1. 路線対応の航空会社直予約（ユーザーが見たセール航空会社の予約画面に
  //    路線プリフィルで直行 → 見た特価がそのまま表示される最良の体験）
  if (template && template.routeAware) {
    return {
      url: template.build(route, sale),
      provider: template.name,
      strategy: "airline-direct",
    };
  }

  // 2. フォールバック: Trip.com の路線+日付プリフィル (Allianceid = 収益化)
  //
  //    主CTA の変遷と理由:
  //      Skyscanner → SKYSCANNER_ASSOCIATE_ID 未設定で帰属が付かず、最もクリック
  //                   される導線が無報酬で流出していた (実測で判明)。
  //      Aviasales  → 稼働中の marker で即収益化できたが UI が英語のみ。
  //      Trip.com   → 日本語 + JPY + 往復プリフィル + 収益化 が全て揃う。日本人
  //                   向けサイトとして体験が最も良く、報酬率も航空券で同水準。
  //
  //    TRIP_COM_AFFILIATE_ID が未設定の環境では帰属なしの素リンクになるため、
  //    その場合は収益化済みの Aviasales を主CTAにフォールバックする。
  //    Aviasales / Skyscanner は比較リンクとして常に併記される。
  if (process.env.TRIP_COM_AFFILIATE_ID) {
    return {
      url: buildTripComUrl(route, sale),
      provider: "Trip.com",
      strategy: "trip",
    };
  }
  return {
    url: buildTravelPayoutsUrl(route, sale, options.subId),
    provider: "Aviasales",
    strategy: "travelpayouts",
  };
}

/**
 * DealSchema から予約CTAリンクを生成
 * （mockディール等、AirlineSale を持たない経路用）
 */
/**
 * DealSchema → SaleRoute の復元。
 *
 * 主CTAと比較リンクで別々に組み立てていたため、departDate/returnDate の
 * 引き継ぎが比較リンク側だけ漏れ、往復運賃が片道検索で開く不具合が出た。
 * 復元は必ずこの1箇所を通すこと (フィールドを増やしたときの直し忘れ防止)。
 */
function routeFromDeal(deal: DealSchema): SaleRoute {
  return {
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
    // 観測便の日付。これが無いと予約リンクが「今日発」や片道で開き、
    // 利用者が掲載価格の便に辿り着けない。
    departDate: deal.departure_date,
    returnDate: deal.return_date,
  };
}

export function buildAffiliateLinkFromDeal(deal: DealSchema): AffiliateLink {
  const route: SaleRoute = routeFromDeal(deal);
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

  // 公式 (ASP env 設定済みなら ASP クリック URL を優先 → 収益化。
  //  未設定なら従来どおり公式テンプレート URL)
  const template = AIRLINE_BOOKING_TEMPLATES[sale.airlineCode];
  const airlineAspUrl = getAirlineAffiliateUrl(sale.airlineCode);
  if (airlineAspUrl) {
    links.push({
      url: airlineAspUrl,
      provider: template?.name ?? `${sale.airlineName}公式`,
      strategy: "airline-direct",
    });
  } else if (template) {
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

  // Aviasales (tp.media = 収益化)。主CTA が Trip.com になったため、比較側にも
  // 収益化リンクを1本置く。UI 側が主CTA と同一プロバイダーを除外するので、
  // 主CTA が Aviasales の環境 (Trip.com 未設定) では自動的に重複表示されない。
  links.push({
    url: buildTravelPayoutsUrl(route, sale, "flight_compare"),
    provider: "Aviasales",
    strategy: "travelpayouts",
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
  const route: SaleRoute = routeFromDeal(deal);

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
