import { airlines } from "@/data/airlines";
import { MockScraper } from "./mock-scraper";
import { TraicyScraper, AviationWireAllScraper } from "./traicy-scraper";
import { AirlinePageScraper } from "./airline-page-scraper";
import { PeachOfficialScraper } from "./peach-official-scraper";
import type { ScrapeResult, AirlineSale } from "./types";
import type { AirlineScraper } from "./scraper-base";

/**
 * スクレイパーモード
 * - "mock": モックデータを返す（開発用）
 * - "live": 実データをスクレイプする（本番用）
 * - "hybrid": Traicy RSS + 公式サイト（推奨）
 */
type ScraperMode = "mock" | "live" | "hybrid";

function getMode(): ScraperMode {
  return (process.env.SCRAPER_MODE as ScraperMode) ?? "mock";
}

/**
 * 航空会社コードに応じたスクレイパーを生成
 */
function createScraper(code: string): AirlineScraper {
  const airline = airlines.find((a) => a.code === code);
  if (!airline) {
    throw new Error(`Airline ${code} not found`);
  }

  const mode = getMode();

  if (mode === "mock") {
    return new MockScraper(code, airline.scrapeSources);
  }

  if (mode === "live" || mode === "hybrid") {
    // Peach は news ベースの専用パーサーを使用 (公式 HTML は WAF/JS で取りづらいため)
    if (code === "PCH") {
      return new PeachOfficialScraper(code, airline.scrapeSources);
    }

    // 公式サイトスクレイパーを優先、フォールバックにTraicyを使用
    const hasHtmlSource = airline.scrapeSources.some((s) => s.type === "html");

    if (hasHtmlSource) {
      return new AirlinePageScraper(
        code,
        airline.nameEn || airline.name,
        airline.scrapeSources
      );
    }

    // 公式サイトソースがない場合、Traicy RSSを使用
    return new TraicyScraper(code);
  }

  // デフォルト: モック
  return new MockScraper(code, airline.scrapeSources);
}

/**
 * Promise を指定ミリ秒でタイムアウトさせる
 * （タイムアウト時は reject せず空の成功扱いにして全体を止めない）
 */
function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export async function scrapeAirline(code: string): Promise<ScrapeResult> {
  const airline = airlines.find((a) => a.code === code);
  if (!airline) {
    return {
      airlineCode: code,
      sales: [],
      scrapedAt: new Date().toISOString(),
      success: false,
      error: `Airline ${code} not found`,
    };
  }

  const fallback: ScrapeResult = {
    airlineCode: code,
    sales: [],
    scrapedAt: new Date().toISOString(),
    success: false,
    error: "Scrape timeout",
  };

  try {
    const scraper = createScraper(code);
    // 1社あたり最大10秒。遅いサイトは諦めて全体を止めない
    return await withTimeout(scraper.scrape(), 10000, fallback);
  } catch (error) {
    return {
      airlineCode: code,
      sales: [],
      scrapedAt: new Date().toISOString(),
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function scrapeAllAirlines(): Promise<ScrapeResult[]> {
  const mode = getMode();

  // hybridモードでは 複数RSS + 各社ページを並列実行
  if (mode === "hybrid") {
    const [traicyResults, aviationWireResults, ...airlineResults] =
      await Promise.allSettled([
        // Traicy RSS — 主力ソース、最大15秒
        withTimeout(scrapeViaTraicy(), 15000, [] as ScrapeResult[]),
        // Aviation Wire RSS — 補助ソース、最大15秒
        withTimeout(scrapeViaAviationWire(), 15000, [] as ScrapeResult[]),
        // 各航空会社の公式ページも並列スクレイプ（各社10秒で打ち切り済み）
        ...airlines.map((a) => scrapeAirline(a.code)),
      ]);

    const results: ScrapeResult[] = [];

    if (traicyResults.status === "fulfilled") {
      results.push(...traicyResults.value);
    }
    if (aviationWireResults.status === "fulfilled") {
      results.push(...aviationWireResults.value);
    }

    // 各社ページの結果をマージ（重複はIDで排除）
    for (const r of airlineResults) {
      if (r.status === "fulfilled") {
        results.push(r.value);
      }
    }

    // 航空会社コードごとにマージ
    return mergeResults(results);
  }

  // mock / live モード
  const results = await Promise.allSettled(
    airlines.map((a) => scrapeAirline(a.code))
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<ScrapeResult> =>
        r.status === "fulfilled"
    )
    .map((r) => r.value);
}

/**
 * Traicy RSS から全航空会社のセールを一括取得
 */
async function scrapeViaTraicy(): Promise<ScrapeResult[]> {
  return splitByAirline(await new TraicyScraper("ALL").scrape());
}

/**
 * Aviation Wire RSS から全航空会社のセールを一括取得
 */
async function scrapeViaAviationWire(): Promise<ScrapeResult[]> {
  return splitByAirline(await new AviationWireAllScraper().scrape());
}

/** スクレイプ結果（全航空会社混在）を航空会社コードごとに分割 */
function splitByAirline(
  result: ScrapeResult
): ScrapeResult[] {
  const byAirline: Record<string, ScrapeResult> = {};
  for (const sale of (result.sales as AirlineSale[])) {
    if (!byAirline[sale.airlineCode]) {
      byAirline[sale.airlineCode] = {
        airlineCode: sale.airlineCode,
        sales: [],
        scrapedAt: result.scrapedAt,
        success: true,
      };
    }
    byAirline[sale.airlineCode].sales.push(sale);
  }
  return Object.values(byAirline);
}

/**
 * 同じ航空会社コードの結果をマージ（ID重複排除）
 */
function mergeResults(results: ScrapeResult[]): ScrapeResult[] {
  const byAirline: Record<string, ScrapeResult> = {};

  for (const result of results) {
    if (!byAirline[result.airlineCode]) {
      byAirline[result.airlineCode] = {
        ...result,
        sales: [...result.sales],
      };
      continue;
    }

    const existing = byAirline[result.airlineCode];
    const existingIds = new Set(existing.sales.map((s) => s.id));

    for (const sale of result.sales) {
      if (!existingIds.has(sale.id)) {
        existing.sales.push(sale);
        existingIds.add(sale.id);
      }
    }

    existing.success = existing.success || result.success;
  }

  return Object.values(byAirline);
}
