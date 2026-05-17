import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { AirlineSale, ScrapeResult } from "@/lib/scrapers/types";

// Vercel本番環境では `data/sales/` は読み取り専用
// 書き込みは /tmp に行い、読み込みは両方を試す
const READ_DIR = join(process.cwd(), "data", "sales");
const WRITE_DIR =
  process.env.VERCEL === "1"
    ? "/tmp/beatrip-sales"
    : READ_DIR;
const DATA_DIR = WRITE_DIR;

export type StoredSaleData = {
  sales: AirlineSale[];
  lastScraped: string;
  history: ScrapeLogEntry[];
};

export type ScrapeLogEntry = {
  timestamp: string;
  success: boolean;
  salesCount: number;
  newSales: string[];
  endedSales: string[];
  error?: string;
};

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

function filePath(airlineCode: string, dir = DATA_DIR) {
  return join(dir, `${airlineCode.toLowerCase()}.json`);
}

export async function loadSales(airlineCode: string): Promise<StoredSaleData> {
  // 書き込み先（/tmp など）を先に試し、なければ読み取り専用の同梱データから
  try {
    const raw = await readFile(filePath(airlineCode, WRITE_DIR), "utf-8");
    return JSON.parse(raw);
  } catch {
    // フォールバック: ビルド時に同梱されたデータ
    try {
      const raw = await readFile(filePath(airlineCode, READ_DIR), "utf-8");
      return JSON.parse(raw);
    } catch {
      return { sales: [], lastScraped: "", history: [] };
    }
  }
}

export async function loadAllSales(): Promise<Record<string, StoredSaleData>> {
  const { readdir } = await import("fs/promises");

  // /tmpと同梱データの両方から航空会社コードを収集
  const codes = new Set<string>();
  for (const dir of [WRITE_DIR, READ_DIR]) {
    try {
      const files = await readdir(dir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          codes.add(file.replace(".json", "").toUpperCase());
        }
      }
    } catch {
      // ディレクトリが存在しない場合はスキップ
    }
  }

  const result: Record<string, StoredSaleData> = {};
  for (const code of codes) {
    result[code] = await loadSales(code);
  }
  return result;
}

export type ChangeDetectionResult = {
  airlineCode: string;
  newSales: AirlineSale[];
  endedSales: AirlineSale[];
  priceChanges: PriceChange[];
  hasChanges: boolean;
};

export type PriceChange = {
  saleId: string;
  saleName: string;
  routeKey: string;
  oldPrice: number;
  newPrice: number;
  direction: "down" | "up";
};

export async function saveSalesAndDetectChanges(
  result: ScrapeResult
): Promise<ChangeDetectionResult> {
  await ensureDir();
  const existing = await loadSales(result.airlineCode);
  const oldSaleIds = new Set(existing.sales.map((s) => s.id));
  const newSaleIds = new Set(result.sales.map((s) => s.id));

  const newSales = result.sales.filter((s) => !oldSaleIds.has(s.id));
  const endedSales = existing.sales.filter((s) => !newSaleIds.has(s.id));

  const priceChanges: PriceChange[] = [];
  for (const sale of result.sales) {
    const oldSale = existing.sales.find((s) => s.id === sale.id);
    if (!oldSale) continue;
    for (const route of sale.routes) {
      const routeKey = `${route.originCode}→${route.destinationCode}(${route.cabin})`;
      const oldRoute = oldSale.routes.find(
        (r) =>
          r.originCode === route.originCode &&
          r.destinationCode === route.destinationCode &&
          r.cabin === route.cabin
      );
      if (oldRoute && oldRoute.price !== route.price) {
        priceChanges.push({
          saleId: sale.id,
          saleName: sale.saleName,
          routeKey,
          oldPrice: oldRoute.price,
          newPrice: route.price,
          direction: route.price < oldRoute.price ? "down" : "up",
        });
      }
    }
  }

  const logEntry: ScrapeLogEntry = {
    timestamp: result.scrapedAt,
    success: result.success,
    salesCount: result.sales.length,
    newSales: newSales.map((s) => s.id),
    endedSales: endedSales.map((s) => s.id),
    error: result.error,
  };

  const updated: StoredSaleData = {
    sales: result.sales,
    lastScraped: result.scrapedAt,
    history: [logEntry, ...existing.history].slice(0, 100),
  };

  // 書き込みは /tmp (Vercel) または data/sales (ローカル) に
  try {
    await writeFile(filePath(result.airlineCode), JSON.stringify(updated, null, 2));
  } catch (e) {
    // Vercel本番で書き込みが失敗してもエラーにはしない（読み取りは同梱データから動作する）
    console.warn(`[SaleStore] Failed to persist ${result.airlineCode}:`, e);
  }

  return {
    airlineCode: result.airlineCode,
    newSales,
    endedSales,
    priceChanges,
    hasChanges: newSales.length > 0 || endedSales.length > 0 || priceChanges.length > 0,
  };
}
