import { loadAllSales } from "@/lib/store/sale-store";
import { airlines, getAirlineByCode } from "@/data/airlines";
import { getDestinationImage } from "./destination-images";
import { deals as mockDeals, historicalPrices as mockHistoricalPrices } from "@/data/mock-deals-v2";
import { generateHistoricalPrices } from "@/lib/predictions/historical-generator";
import { ROUTE_BASELINES } from "@/data/route-baselines";
import type { DealSchema, DealHistoricalPrice } from "@/data/deal-schema";
import type { AirlineSale, SaleRoute } from "@/lib/scrapers/types";

// ── 日本の空港コード（国内線判定用） ──
const JP_AIRPORT_CODES = new Set([
  "NRT", "HND", "KIX", "ITM", "NGO", "CTS", "FUK", "OKA",
  "KOJ", "HIJ", "SDJ", "KMQ", "NGS", "OIT", "MYJ", "KCZ",
  "TAK", "TKS", "KMJ", "AOJ", "AKJ", "MMB", "OBO", "HKD",
  "GAJ", "SHM", "UBJ", "IZO", "TTJ", "KMI", "ASJ", "ISG", "MMY",
]);

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

  if (daysFromStart <= 2) {
    badge = "NEW";
  } else if (daysUntilDeadline <= 3 && daysUntilDeadline > 0) {
    badge = "ENDING_SOON";
  } else if (route.discount >= 50) {
    badge = "LOWEST_IN_2_YEARS";
  }

  // Skyscanner アフィリエイトURL生成
  const affiliateUrl =
    sale.sourceUrl ||
    `https://www.skyscanner.jp/transport/flights/${route.originCode.toLowerCase()}/${route.destinationCode.toLowerCase()}/?ref=beatrip`;

  const affiliateProvider = sale.sourceUrl.includes("ana.co.jp")
    ? "ANA公式"
    : sale.sourceUrl.includes("jal.co.jp")
      ? "JAL公式"
      : sale.sourceUrl.includes("flypeach")
        ? "Peach公式"
        : sale.sourceUrl.includes("jetstar")
          ? "Jetstar公式"
          : sale.sourceUrl.includes("ch.com")
            ? "Spring Japan公式"
            : sale.sourceUrl.includes("twayair")
              ? "T'way Air公式"
              : sale.sourceUrl.includes("vietjetair")
                ? "VietJet公式"
                : sale.sourceUrl.includes("emirates")
                  ? "Emirates公式"
                  : sale.sourceUrl.includes("singaporeair")
                    ? "Singapore Airlines公式"
                    : sale.sourceUrl.includes("cathaypacific")
                      ? "Cathay Pacific公式"
                      : "Skyscanner";

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
  };
}

/**
 * ストアからアクティブなディールを取得し、DealSchema[] に変換
 * ストアが空の場合はモックデータにフォールバック
 */
export async function getActiveDeals(): Promise<DealSchema[]> {
  try {
    const allSales = await loadAllSales();
    const airlineCodes = Object.keys(allSales);

    if (airlineCodes.length === 0) {
      console.log("[DealService] Store is empty, using mock data");
      return mockDeals;
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
      console.log("[DealService] No active deals in store, using mock data");
      return mockDeals;
    }

    console.log(`[DealService] Loaded ${deals.length} deals from store`);
    return deals;
  } catch (error) {
    console.error("[DealService] Error loading from store, using mock data:", error);
    return mockDeals;
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
  // 1. 静的データを優先
  const staticData = mockHistoricalPrices.filter((p) => p.route_key === routeKey);
  if (staticData.length > 0) return staticData;

  // 2. ベースラインから自動生成
  if (ROUTE_BASELINES[routeKey]) {
    return generateHistoricalPrices(routeKey);
  }

  // 3. データなし
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
