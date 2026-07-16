import { loadAllSales } from "@/lib/store/sale-store";
import { airlines, getAirlineByCode } from "@/data/airlines";
import { getDestinationImage } from "./destination-images";
import { JP_AIRPORT_CODES } from "@/lib/airports/domestic";
import { deals as mockDeals, historicalPrices as mockHistoricalPrices } from "@/data/mock-deals-v2";
import { generateHistoricalPrices } from "@/lib/predictions/historical-generator";
import { getObservedMonthly } from "@/lib/deals/price-observations";
import { ROUTE_BASELINES } from "@/data/route-baselines";
import { buildAffiliateLink, buildAffiliateLinkFromDeal } from "@/lib/affiliate/url-builder";
import type { DealSchema, DealHistoricalPrice } from "@/data/deal-schema";
import type { AirlineSale, SaleRoute } from "@/lib/scrapers/types";

// ── 日本の空港コード（国内線判定用） ──

// ── 目的地コード → 日本語名 ──
const DESTINATION_NAMES: Record<string, string> = {
  BKK: "バンコク", TPE: "台北", ICN: "ソウル", SIN: "シンガポール",
  HKG: "香港", MNL: "マニラ", SGN: "ホーチミン", HAN: "ハノイ",
  PVG: "上海", PEK: "北京", DXB: "ドバイ", DEL: "デリー",
  KUL: "クアラルンプール", CDG: "パリ", LHR: "ロンドン",
  HEL: "ヘルシンキ", FCO: "ローマ", BCN: "バルセロナ",
  FRA: "フランクフルト", AMS: "アムステルダム", IST: "イスタンブール",
  JFK: "ニューヨーク", LAX: "ロサンゼルス", SFO: "サンフランシスコ",
  ORD: "シカゴ", YVR: "バンクーバー", SYD: "シドニー",
  HNL: "ホノルル", AKL: "オークランド", GUM: "グアム",
  CTS: "札幌", OKA: "沖縄", FUK: "福岡", KIX: "大阪",
  ITM: "大阪", NGO: "名古屋", HIJ: "広島", KOJ: "鹿児島",
  SDJ: "仙台", KMJ: "熊本", NRT: "東京", HND: "東京",
  HRB: "ハルビン", BOM: "ムンバイ",
};

const ORIGIN_NAMES: Record<string, string> = {
  NRT: "東京", HND: "東京", KIX: "大阪", ITM: "大阪",
  NGO: "名古屋", FUK: "福岡", CTS: "札幌",
};

// ── 燃油サーチャージ推定値（2026年目安） ──
function estimateFuelSurcharge(
  originCode: string,
  destCode: string,
  cabin: string
): number {
  const isDomestic =
    JP_AIRPORT_CODES.has(originCode) && JP_AIRPORT_CODES.has(destCode);
  if (isDomestic) return 0;

  const base = cabin === "Business" || cabin === "First" ? 2.0 : 1.0;

  // 距離帯ごとの概算
  const shortHaul = new Set(["ICN", "PVG", "TPE", "HKG", "BKK", "SGN", "HAN", "MNL", "KUL"]);
  const midHaul = new Set(["SIN", "DXB", "DEL", "BOM", "GUM", "HNL"]);
  // それ以外は長距離

  if (shortHaul.has(destCode) || shortHaul.has(originCode)) {
    return Math.round(3500 * base);
  }
  if (midHaul.has(destCode) || midHaul.has(originCode)) {
    return Math.round(8000 * base);
  }
  return Math.round(18000 * base);
}

function estimateTaxes(
  originCode: string,
  destCode: string
): number {
  const isDomestic =
    JP_AIRPORT_CODES.has(originCode) && JP_AIRPORT_CODES.has(destCode);
  if (isDomestic) return 370; // 国内旅客施設使用料
  return 3500; // 国際線：出国税 + 施設使用料概算
}

// ── mock データの取扱い ──
// mock-deals は架空の価格・残席を含むデモデータ。実スクレイプの在庫が無いとき
// (セール端境期・store 空) は本番でも「参考事例」として表示するが、
// is_sample: true を立てて UI で明示ラベリングし、Product JSON-LD 等
// 「現在のオファーの事実表明」は出力しない (isMockDeal で抑止)。
// 完全非表示にするとサイトの中核コンテンツが消えるため、誠実な開示との両立を取る。

const MOCK_DEAL_IDS = new Set(mockDeals.map((d) => d.id));

/**
 * deal が mock-deals 由来 (架空データ) かどうか。
 * Product JSON-LD など「事実の表明」になる出力を抑止する判定に使う。
 */
export function isMockDeal(
  deal: Pick<DealSchema, "id"> & { is_sample?: boolean }
): boolean {
  return MOCK_DEAL_IDS.has(deal.id) || deal.is_sample === true;
}

/** 実在庫が無いとき mock に「参考事例」フラグ付きでフォールバック。 */
function mockFallback(reason: string): DealSchema[] {
  console.log(`[DealService] ${reason}, using sample data (labeled as 参考事例)`);
  return withDestinationImages(withReliableAffiliate(mockDeals)).map((d) => ({
    ...d,
    is_sample: true,
  }));
}

/**
 * AirlineSale + SaleRoute → DealSchema に変換
 */
function convertToDeal(
  sale: AirlineSale,
  route: SaleRoute,
  index: number
): DealSchema {
  const fuelSurcharge = estimateFuelSurcharge(
    route.originCode,
    route.destinationCode,
    route.cabin
  );
  const taxes = estimateTaxes(route.originCode, route.destinationCode);
  const totalCost = route.price + fuelSurcharge + taxes;

  const airline = getAirlineByCode(sale.airlineCode);
  const isLCC = airline?.type === "LCC";

  // バッジ判定
  let badge: DealSchema["badge"] = null;
  const now = Date.now();
  const saleStart = new Date(sale.startDate).getTime();
  const bookingDeadline = new Date(sale.bookingDeadline).getTime();
  const daysFromStart = (now - saleStart) / (1000 * 60 * 60 * 24);
  const daysUntilDeadline = (bookingDeadline - now) / (1000 * 60 * 60 * 24);

  // TP「最安値ウォッチ」は常時更新の目安データなので、毎日 startDate=now で
  // 全件 NEW/ENDING_SOON になるのは誤認を招く。相場比50%超のときだけ LOWEST を出す。
  const isWatch = sale.airlineCode === "TP";
  if (isWatch) {
    badge = route.discount >= 50 ? "BIG_DISCOUNT" : null;
  } else if (daysFromStart <= 2) {
    badge = "NEW";
  } else if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
    badge = "ENDING_SOON";
  } else if (route.discount >= 50) {
    badge = "BIG_DISCOUNT";
  }

  // アフィリエイトURL生成（公式 → 航空会社直販 → Skyscanner の優先順）
  const affiliateLink = buildAffiliateLink(route, sale);
  const affiliateUrl = affiliateLink.url;
  const affiliateProvider = affiliateLink.provider;

  return {
    id: `${sale.id}-${route.originCode}-${route.destinationCode}-${route.cabin.toLowerCase()}`.replace(/\s+/g, "-"),
    airline_id: sale.airlineCode,
    airline_name: airline?.nameEn ?? sale.airlineName,
    origin: ORIGIN_NAMES[route.originCode] ?? route.origin ?? route.originCode,
    origin_code: route.originCode,
    destination:
      DESTINATION_NAMES[route.destinationCode] ??
      route.destination ??
      route.destinationCode,
    destination_code: route.destinationCode,
    original_price: route.originalPrice,
    sale_price: route.price,
    fuel_surcharge: fuelSurcharge,
    taxes,
    total_cost: totalCost,
    is_total_cost: false,
    currency: route.currency ?? "JPY",
    discount_percent: route.discount ?? Math.round((1 - route.price / route.originalPrice) * 100),
    confidence_score: 80,
    cabin: route.cabin,
    badge,
    image_url: getDestinationImage(route.destinationCode),
    is_niche_lcc: isLCC,
    is_hidden_gem: isLCC && route.discount >= 50,
    departure_date: sale.travelPeriodStart,
    return_date: sale.travelPeriodEnd,
    booking_deadline: sale.bookingDeadline,
    sale_id: sale.id,
    sale_name: sale.saleName,
    seats_remaining: route.seatsRemaining,
    created_at: sale.scrapedAt,
    updated_at: sale.scrapedAt,
    affiliate_url: affiliateUrl,
    affiliate_provider: affiliateProvider,
    // TP「最安値ウォッチ」はキャッシュ価格の目安 → 確定情報風の表示/schema を抑制
    is_estimate: isWatch,
  };
}

/**
 * ストアからアクティブなディールを取得し、DealSchema[] に変換
 * ストアが空の場合はモックデータにフォールバック
 */
/**
 * mockディールの壊れたハードコードaffiliate_url（/campaign等で404）を
 * 確実に予約できるSkyscanner導線に置き換える
 */
function withReliableAffiliate(deals: DealSchema[]): DealSchema[] {
  return deals.map((d) => {
    const link = buildAffiliateLinkFromDeal(d);
    return {
      ...d,
      affiliate_url: link.url,
      affiliate_provider: link.provider,
    };
  });
}

/**
 * 目的地コードに応じた都市別画像を常に適用する。
 * モック経路（Store空・エラー時のフォールバック）はモック側に古い任意の
 * Unsplash URLが残っており、都市と一致しない問題があった。スクレイプ経路の
 * convertToDeal でも同じ関数を使っているため、ここで再適用しても無害（冪等）。
 */
function withDestinationImages(deals: DealSchema[]): DealSchema[] {
  return deals.map((d) => ({
    ...d,
    image_url: getDestinationImage(d.destination_code),
  }));
}

export async function getActiveDeals(): Promise<DealSchema[]> {
  try {
    const allSales = await loadAllSales();
    const airlineCodes = Object.keys(allSales);

    if (airlineCodes.length === 0) {
      return mockFallback("Store is empty");
    }

    const now = new Date();
    const deals: DealSchema[] = [];
    let index = 0;

    for (const code of airlineCodes) {
      const { sales } = allSales[code];
      for (const sale of sales) {
        // 非アクティブ or 期限切れのセールをスキップ
        if (!sale.isActive) continue;
        const deadline = new Date(sale.bookingDeadline);
        if (deadline < now) continue;

        for (const route of sale.routes) {
          deals.push(convertToDeal(sale, route, index++));
        }
      }
    }

    if (deals.length === 0) {
      return mockFallback("No active deals in store");
    }

    console.log(`[DealService] Loaded ${deals.length} deals from store`);
    return withDestinationImages(deals);
  } catch (error) {
    console.error("[DealService] Error loading from store:", error);
    return mockFallback("Store load error");
  }
}

/**
 * 特定のディールを取得
 */
export async function getDealById(id: string): Promise<DealSchema | undefined> {
  const deals = await getActiveDeals();
  return deals.find((d) => d.id === id);
}

/**
 * 価格履歴を取得
 *
 * 優先順:
 * 1. 手動入力された静的データ（mock-deals-v2.ts の historicalPrices）
 * 2. ROUTE_BASELINES から自動生成（季節性モデル）
 * 3. 空配列（route_baselines に未登録の路線）
 */
export async function getHistoricalPrices(routeKey: string): Promise<DealHistoricalPrice[]> {
  // キー正規化: route スラッグ ("NRT-BKK") と ROUTE_BASELINES/履歴 ("NRT→BKK") で
  // セパレータが異なるため矢印に統一する。これを怠ると routes/[route] のメタ判定や
  // sitemap がハイフンで照会して常に空になり、中身のある路線まで noindex になる。
  const key = routeKey.includes("→") ? routeKey : routeKey.replace("-", "→");

  // 1. 実測 (TravelPayouts の観測ログ) を最優先。sample_count > 0 が実測の証。
  const observed = await getObservedMonthly(key);
  if (observed && observed.length > 0) return observed;

  // 2. 手入力の想定値 (実測ではない。sample_count は 0)
  const staticData = mockHistoricalPrices.filter((p) => p.route_key === key);
  if (staticData.length > 0) return staticData;

  // 3. ベースラインからの推計 (実測ではない。sample_count は 0)
  if (ROUTE_BASELINES[key]) {
    return generateHistoricalPrices(key);
  }

  // 4. データなし
  return [];
}

/**
 * ストアの状態を返す（管理用）
 */
export async function getStoreStatus() {
  const allSales = await loadAllSales();
  const status: Record<string, {
    salesCount: number;
    lastScraped: string;
    activeSales: number;
  }> = {};

  for (const [code, data] of Object.entries(allSales)) {
    status[code] = {
      salesCount: data.sales.length,
      lastScraped: data.lastScraped,
      activeSales: data.sales.filter((s) => s.isActive).length,
    };
  }

  return {
    airlines: status,
    totalAirlines: Object.keys(status).length,
    totalSales: Object.values(status).reduce((sum, s) => sum + s.salesCount, 0),
    totalActive: Object.values(status).reduce((sum, s) => sum + s.activeSales, 0),
  };
}
