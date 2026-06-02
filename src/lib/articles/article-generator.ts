import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { AirlineSale } from "@/lib/scrapers/types";
import type { PriceChange } from "@/lib/store/sale-store";
import type { Article } from "@/data/mock-articles";
import { deals } from "@/data/mock-deals-v2";
import { cityNameJa } from "@/lib/airport-names";
import { getDestinationImage } from "@/lib/deals/destination-images";
import { getKV } from "@/lib/store/kv";

const KV_ARTICLES_KEY = "beatrip:articles:generated";

/**
 * 記事サムネイル取得：必ず「目的地ごとに異なる都市別画像」を返す。
 * - destinationCode があれば destination-images の都市別画像を最優先（HIJ→
 *   原爆ドーム、CTS→札幌スカイライン 等。被りなし）
 * - 目的地が分からない場合（priceChangeで未指定など）、航空会社ハッシュで
 *   curated画像セットから決定論的に選択（同じ航空会社でも複数枚から散る）
 * - 最終フォールバックも同様にハッシュで散らす
 */
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80",
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80",
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800&q=80",
  "https://images.unsplash.com/photo-1559686043-aef1bb40b03d?w=800&q=80",
  "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&q=80",
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80",
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickFallback(seed: string): string {
  return FALLBACK_IMAGES[hashCode(seed) % FALLBACK_IMAGES.length];
}

function findDealImage(
  airlineCode: string,
  routes: { originCode: string; destinationCode: string }[],
  /** ハッシュseedの追加要素（sale名やslug等を渡すと記事ごとに散る） */
  seed?: string
): string {
  // 1. 目的地コード優先（必ず都市別画像を返す）
  for (const route of routes) {
    if (route.destinationCode) return getDestinationImage(route.destinationCode);
  }
  // 2. 航空会社ハッシュで curated set から散らす
  return pickFallback(`${airlineCode}:${seed ?? ""}`);
}

const READ_DIR = join(process.cwd(), "data", "articles");
const DATA_DIR =
  process.env.VERCEL === "1" ? "/tmp/beatrip-articles" : READ_DIR;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function generateSaleArticle(sale: AirlineSale): Article {
  const slug = slugify(`${sale.airlineCode}-${sale.saleName}-${sale.startDate}`);
  const routes = sale.routes
    .sort((a, b) => a.price - b.price)
    .slice(0, 5);

  const routeLines = routes.map((r) => {
    const discountText = r.discount ? `（${r.discount}%OFF）` : "";
    const seatsText =
      r.seatsRemaining !== undefined ? ` — 残${r.seatsRemaining}席` : "";
    return `- **${cityNameJa(r.originCode)}→${cityNameJa(r.destinationCode)}（${r.originCode}→${r.destinationCode}・${r.cabin}）**: ¥${formatPrice(r.price)}${discountText}${seatsText}`;
  });

  const cheapest = routes[0];
  const highestDiscount = Math.max(...routes.map((r) => r.discount ?? 0));

  const body = `${sale.airlineName}が「${sale.saleName}」を開始しました。${sale.description}

## セール概要

- **販売期間**: ${sale.startDate}〜${sale.endDate}
- **予約期限**: ${sale.bookingDeadline}
- **搭乗期間**: ${sale.travelPeriodStart}〜${sale.travelPeriodEnd}
- **対象路線数**: ${sale.routes.length}路線

## 対象路線・価格

${routeLines.join("\n")}

## 予約のポイント

${cheapest ? `最安値は**${cheapest.originCode}→${cheapest.destinationCode}の¥${formatPrice(cheapest.price)}**${cheapest.discount ? `（${cheapest.discount}%OFF）` : ""}です。` : ""}${highestDiscount > 0 ? `最大割引率は**${highestDiscount}%OFF**。` : ""}

座席数に限りがあるセールのため、気になる路線は早めの予約がおすすめです。BEATRIPのディール一覧から詳細を確認し、そのまま予約サイトへ進めます。`;

  const routeTags = routes.map(
    (r) => `${r.originCode}-${r.destinationCode}`
  );

  return {
    slug,
    title: `${sale.airlineName}「${sale.saleName}」開始${cheapest ? ` ${cityNameJa(cheapest.originCode)}→${cityNameJa(cheapest.destinationCode)} ¥${formatPrice(cheapest.price)}〜` : ""}`,
    excerpt: `${sale.airlineName}が${sale.saleName}を開催${highestDiscount > 0 ? `。最大${highestDiscount}%OFF` : ""}。${sale.routes.length}路線が対象${cheapest ? `、最安¥${formatPrice(cheapest.price)}〜` : ""}。`,
    body,
    image_url: findDealImage(sale.airlineCode, sale.routes, sale.id),
    category: "セール速報",
    airline_tags: [sale.airlineName],
    route_tags: routeTags,
    published_at: new Date().toISOString(),
    source: `${sale.airlineName}公式`,
    source_url: sale.sourceUrl,
  };
}

function generatePriceDropArticle(
  airlineCode: string,
  priceChanges: PriceChange[]
): Article | null {
  const drops = priceChanges.filter((p) => p.direction === "down");
  if (drops.length === 0) return null;

  const slug = slugify(
    `price-drop-${airlineCode}-${new Date().toISOString().split("T")[0]}`
  );

  const lines = drops.map(
    (p) =>
      `- **${p.routeKey}**: ¥${formatPrice(p.oldPrice)} → **¥${formatPrice(p.newPrice)}**（¥${formatPrice(p.oldPrice - p.newPrice)}値下げ）`
  );

  const biggestDrop = drops.reduce((max, p) =>
    p.oldPrice - p.newPrice > max.oldPrice - max.newPrice ? p : max
  );

  const body = `${airlineCode}の以下の路線で値下げが検出されました。

## 値下げ路線

${lines.join("\n")}

## 注目

最大の値下げは**${biggestDrop.routeKey}**で、¥${formatPrice(biggestDrop.oldPrice)}から**¥${formatPrice(biggestDrop.newPrice)}**に値下がり。¥${formatPrice(biggestDrop.oldPrice - biggestDrop.newPrice)}のお得です。

セール価格はいつ元に戻るか分かりません。気になる路線は早めにチェックしましょう。`;

  return {
    slug,
    title: `【値下げ速報】${airlineCode} ${drops.length}路線で価格ダウン`,
    excerpt: `${airlineCode}の${drops.length}路線で値下げを検出。最大¥${formatPrice(biggestDrop.oldPrice - biggestDrop.newPrice)}の値下げ。`,
    body,
    image_url: findDealImage(
      airlineCode,
      // routeKey ("NRT→BKK(Economy)") から目的地コードを取り出し、
      // 都市別画像を優先採用
      drops.map((p) => {
        const m = p.routeKey.match(/^([A-Z]{3})→([A-Z]{3})/);
        return {
          originCode: m?.[1] ?? "",
          destinationCode: m?.[2] ?? "",
        };
      }),
      slug
    ),
    category: "セール速報",
    airline_tags: [airlineCode],
    route_tags: drops.map((p) =>
      p.routeKey.replace("→", "-").replace(/\(.+\)$/, "")
    ),
    published_at: new Date().toISOString(),
  };
}

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function loadGeneratedArticles(): Promise<Article[]> {
  // 本番（Vercel）では Redis がSource of truth。/tmpはインスタンス間で
  // 共有されないため、Cronで生成しても次のリクエストが見えない問題があった。
  const kv = getKV();
  if (kv) {
    try {
      const fromKv = await kv.get<Article[]>(KV_ARTICLES_KEY);
      if (fromKv && fromKv.length > 0) return fromKv;
    } catch (e) {
      console.warn("[Articles] KV read failed, falling back to FS:", e);
    }
  }
  // KV未設定/未投入時のフォールバック: /tmp → ビルド時同梱
  for (const dir of [DATA_DIR, READ_DIR]) {
    try {
      const raw = await readFile(join(dir, "generated.json"), "utf-8");
      return JSON.parse(raw);
    } catch {
      // 次のディレクトリを試す
    }
  }
  return [];
}

async function saveGeneratedArticles(articles: Article[]) {
  const kv = getKV();
  if (kv) {
    try {
      await kv.set(KV_ARTICLES_KEY, articles);
    } catch (e) {
      console.warn("[Articles] KV persist failed:", e);
    }
  }
  // ローカル/フォールバック用に /tmp にも書く（KV未設定時に有効）
  try {
    await ensureDir();
    await writeFile(
      join(DATA_DIR, "generated.json"),
      JSON.stringify(articles, null, 2)
    );
  } catch (e) {
    if (!kv) console.warn("[Articles] Failed to persist:", e);
  }
}

export async function generateArticlesFromChanges(changes: {
  airlineCode: string;
  newSales: AirlineSale[];
  priceChanges: PriceChange[];
}): Promise<Article[]> {
  const existing = await loadGeneratedArticles();
  const existingSlugs = new Set(existing.map((a) => a.slug));
  const newArticles: Article[] = [];

  for (const sale of changes.newSales) {
    const article = generateSaleArticle(sale);
    if (!existingSlugs.has(article.slug)) {
      newArticles.push(article);
    }
  }

  if (changes.priceChanges.length > 0) {
    const article = generatePriceDropArticle(
      changes.airlineCode,
      changes.priceChanges
    );
    if (article && !existingSlugs.has(article.slug)) {
      newArticles.push(article);
    }
  }

  if (newArticles.length > 0) {
    const updated = [...newArticles, ...existing].slice(0, 200);
    await saveGeneratedArticles(updated);
  }

  return newArticles;
}

/**
 * 今あるアクティブセールから「今週のセールまとめ」記事を1本生成する。
 * slug は ISO 週番号で一意なので、同じ週に何度叩いても dedup される。
 * 週が変われば新しい slug になり、サイトに新着として並ぶ。
 *
 * sales が空、または既に同週の記事が存在する場合は null を返す。
 */
export async function generateAndSaveWeeklyRoundup(
  sales: AirlineSale[]
): Promise<Article | null> {
  // 動的importで循環の心配をなくしつつロジックは別モジュールに分離
  const { buildWeeklyRoundupArticle } = await import("./weekly-roundup-generator");
  const article = buildWeeklyRoundupArticle(sales);
  if (!article) return null;

  const existing = await loadGeneratedArticles();
  if (existing.some((a) => a.slug === article.slug)) return null;

  const updated = [article, ...existing].slice(0, 200);
  await saveGeneratedArticles(updated);
  return article;
}
