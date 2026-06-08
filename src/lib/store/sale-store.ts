import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { unstable_cache } from "next/cache";
import type { AirlineSale, ScrapeResult } from "@/lib/scrapers/types";
import { getKV, KV_KEYS } from "./kv";

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

const EMPTY: StoredSaleData = { sales: [], lastScraped: "", history: [] };

async function loadFromFs(airlineCode: string): Promise<StoredSaleData | null> {
  for (const dir of [WRITE_DIR, READ_DIR]) {
    try {
      const raw = await readFile(filePath(airlineCode, dir), "utf-8");
      return JSON.parse(raw);
    } catch {
      // 次を試す
    }
  }
  return null;
}

/**
 * KV (Upstash Redis) は内部で no-store fetch を使うため、ISR ページから
 * 直接呼ぶと「Dynamic server usage」エラーで static generation に失敗する。
 * unstable_cache で wrap して fetch を Next の data cache に乗せ、
 * 60 秒キャッシュ + tag invalidation を可能にする。
 */
const loadSalesCached = unstable_cache(
  async (airlineCode: string): Promise<StoredSaleData> => {
    const kv = getKV();
    if (kv) {
      try {
        const data = await kv.get<StoredSaleData>(KV_KEYS.sale(airlineCode));
        if (data && Array.isArray(data.sales)) return data;
        const seed = await loadFromFs(airlineCode);
        return seed ?? EMPTY;
      } catch (e) {
        console.warn(`[SaleStore] KV read failed for ${airlineCode}:`, e);
      }
    }
    return (await loadFromFs(airlineCode)) ?? EMPTY;
  },
  ["sale-store-load"],
  { revalidate: 60, tags: ["sales"] }
);

export async function loadSales(airlineCode: string): Promise<StoredSaleData> {
  return loadSalesCached(airlineCode);
}

/** KV index 読み取りも unstable_cache 化して static generation 対応 */
const loadKvIndexCached = unstable_cache(
  async (): Promise<string[]> => {
    const kv = getKV();
    if (!kv) return [];
    try {
      const indexed = await kv.smembers(KV_KEYS.index);
      return indexed.map((c) => String(c).toUpperCase());
    } catch (e) {
      console.warn("[SaleStore] KV index read failed:", e);
      return [];
    }
  },
  ["sale-store-index"],
  { revalidate: 60, tags: ["sales"] }
);

export async function loadAllSales(): Promise<Record<string, StoredSaleData>> {
  const codes = new Set<string>();

  // KVのインデックスから航空会社コードを収集 (cache 経由)
  for (const c of await loadKvIndexCached()) codes.add(c);

  // 同梱データ + /tmp のコードも収集（KV未導入/初回でも動くように）
  const { readdir } = await import("fs/promises");
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

  // 航空会社コードごとに並列で読み込む (KV / FS の I/O を直列に行うと
  // 航空会社数 × レイテンシ になり管理ダッシュボードや generateStaticParams
  // が遅くなる)。
  const entries = await Promise.all(
    [...codes].map(async (code) => [code, await loadSales(code)] as const)
  );
  return Object.fromEntries(entries);
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

  // 永続化: KVがあればKVへ（本番で永続反映）、無ければ /tmp / data/sales へ
  const kv = getKV();
  if (kv) {
    try {
      await kv.set(KV_KEYS.sale(result.airlineCode), updated);
      await kv.sadd(KV_KEYS.index, result.airlineCode.toUpperCase());
    } catch (e) {
      console.warn(`[SaleStore] KV write failed for ${result.airlineCode}:`, e);
    }
  } else {
    try {
      await writeFile(filePath(result.airlineCode), JSON.stringify(updated, null, 2));
    } catch (e) {
      // Vercel本番(KV未設定)で書き込み失敗してもエラーにしない（同梱データで動作）
      console.warn(`[SaleStore] FS persist failed for ${result.airlineCode}:`, e);
    }
  }

  return {
    airlineCode: result.airlineCode,
    newSales,
    endedSales,
    priceChanges,
    hasChanges: newSales.length > 0 || endedSales.length > 0 || priceChanges.length > 0,
  };
}
