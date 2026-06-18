import type { AirlineSale, SaleRoute, ScrapeResult } from "@/lib/scrapers/types";
import { ROUTE_BASELINES } from "@/data/route-baselines";
import { cityNameJa } from "@/lib/airport-names";

/**
 * TravelPayouts (Aviasales) フライト価格データAPI 連携
 *
 * ニュースRSSの free-text 解析と違い、出発地・到着地・価格・日付が
 * 構造化された「最安運賃の目安」を取得できる。これを既存のセール
 * パイプライン (ScrapeResult → KV → サイト → SNS) に流す。
 *
 * env:
 *   TRAVELPAYOUTS_API_TOKEN  データAPI用トークン (Profile → API token)
 *   未設定なら no-op (空配列)。
 *
 * 重要 (景表法): このデータはキャッシュされた最安運賃の「目安」であり
 * 確定価格ではない。original_price は ROUTE_BASELINES の相場 (avgPrice) を
 * 基準にした honest な比較のみ。相場が無い路線は割引率 0 で「目安価格」として出す。
 */

const ENDPOINT = "https://api.travelpayouts.com/v2/prices/latest";

// 日本側の出発空港 (サイトが認識する IATA)。都市コードでなく空港コードで問い合わせる。
const JP_ORIGINS = ["HND", "NRT", "KIX", "NGO", "FUK", "CTS", "OKA"];

// TravelPayouts が返す都市コード → サイトが使う代表空港コードに正規化。
// (例: 東京=TYO→HND, ソウル=SEL→ICN)。未掲載コードはそのまま使う。
const CODE_NORMALIZE: Record<string, string> = {
  TYO: "HND",
  OSA: "KIX",
  SPK: "CTS",
  SEL: "ICN",
  LON: "LHR",
  PAR: "CDG",
  NYC: "JFK",
  MOW: "SVO",
  MIL: "MXP",
  ROM: "FCO",
  BJS: "PEK",
  SHA: "PVG",
};

function normalizeCode(code: string): string {
  return CODE_NORMALIZE[code] ?? code;
}

type LatestPriceItem = {
  origin?: string;
  destination?: string;
  value?: number;
  depart_date?: string;
  return_date?: string;
  number_of_changes?: number;
  trip_class?: number;
};

function getToken(): string | null {
  return process.env.TRAVELPAYOUTS_API_TOKEN ?? null;
}

async function fetchLatestForOrigin(
  origin: string,
  token: string
): Promise<LatestPriceItem[]> {
  const url =
    `${ENDPOINT}?currency=jpy&origin=${origin}` +
    `&period_type=year&one_way=false&page=1&limit=30` +
    `&show_to_affiliates=true&sorting=price`;
  try {
    const res = await fetch(url, {
      headers: { "X-Access-Token": token, Accept: "application/json" },
      // データは日次でしか変わらないため軽くキャッシュ可。サーバ実行なので no-store でもよい。
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[tp-prices] ${origin} HTTP ${res.status}`);
      return [];
    }
    const json = (await res.json()) as { success?: boolean; data?: LatestPriceItem[] };
    if (!json || json.success === false || !Array.isArray(json.data)) return [];
    return json.data;
  } catch (e) {
    console.error(`[tp-prices] ${origin} fetch error`, e);
    return [];
  }
}

/** 1件の API 価格 → SaleRoute。相場(avgPrice)があれば honest な割引率を付与。 */
function toRoute(item: LatestPriceItem): SaleRoute | null {
  const price = typeof item.value === "number" ? item.value : NaN;
  if (!item.origin || !item.destination || isNaN(price) || price < 1000) {
    return null;
  }
  const originCode = normalizeCode(item.origin);
  const destCode = normalizeCode(item.destination);
  if (originCode === destCode) return null;

  // 相場 (ROUTE_BASELINES のキーは "HND→CTS" 形式)。あれば原価=相場で honest 比較。
  const baseline = ROUTE_BASELINES[`${originCode}→${destCode}`]?.avgPrice;
  const originalPrice = baseline && baseline > price ? baseline : price;
  const discount =
    originalPrice > price
      ? Math.round((1 - price / originalPrice) * 100)
      : 0;

  return {
    origin: cityNameJa(originCode),
    originCode,
    destination: cityNameJa(destCode),
    destinationCode: destCode,
    price,
    originalPrice,
    currency: "JPY",
    cabin: "Economy",
    discount,
  };
}

/**
 * TravelPayouts から日本発の最安運賃を取得し、出発空港ごとに1 AirlineSale に
 * まとめて ScrapeResult[] を返す。airlineCode は合成コード "TP"。
 * トークン未設定・全件失敗時は空配列。
 */
export async function scrapeTravelPayoutsPrices(): Promise<ScrapeResult[]> {
  const token = getToken();
  if (!token) return [];

  const now = new Date();
  const nowIso = now.toISOString();
  // 取得運賃は時限キャンペーンではないので、期限切れフィルタに落ちないよう先の日付に。
  const deadline = new Date(now.getTime() + 60 * 86_400_000).toISOString();

  // 出発空港ごとに並列取得 (順次だと空港数×レイテンシで遅くなる)
  const perOrigin = await Promise.all(
    JP_ORIGINS.map(async (origin): Promise<AirlineSale | null> => {
      const items = await fetchLatestForOrigin(origin, token);
      if (items.length === 0) return null;

      // origin-dest で最安のみ残す
      const cheapestByDest = new Map<string, SaleRoute>();
      for (const item of items) {
        const route = toRoute(item);
        if (!route) continue;
        const key = `${route.originCode}-${route.destinationCode}`;
        const prev = cheapestByDest.get(key);
        if (!prev || route.price < prev.price) cheapestByDest.set(key, route);
      }
      const routes = [...cheapestByDest.values()].sort(
        (a, b) => a.price - b.price
      );
      if (routes.length === 0) return null;

      const originJa = cityNameJa(origin);
      return {
        id: `tp-latest-${origin}`,
        airlineCode: "TP",
        airlineName: "最安値ウォッチ",
        saleName: `${originJa}発 最安値ウォッチ`,
        description: `${originJa}発の各路線の最安運賃の目安 (TravelPayouts 価格データ)。実際の価格・空席は予約サイトでご確認ください。`,
        startDate: nowIso,
        endDate: deadline,
        bookingDeadline: deadline,
        travelPeriodStart: nowIso,
        travelPeriodEnd: deadline,
        routes,
        sourceUrl: "https://www.aviasales.com/",
        scrapedAt: nowIso,
        isActive: true,
      };
    })
  );

  const sales = perOrigin.filter((s): s is AirlineSale => s !== null);
  if (sales.length === 0) return [];

  // 全 origin をまとめて 1 ScrapeResult (airlineCode "TP") で返す。
  return [
    {
      airlineCode: "TP",
      sales,
      scrapedAt: nowIso,
      success: true,
    },
  ];
}
