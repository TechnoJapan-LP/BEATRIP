import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { AirlineSale } from "@/lib/scrapers/types";
import type { PriceChange } from "@/lib/store/sale-store";
import type { Article } from "@/data/mock-articles";
import { deals } from "@/data/mock-deals-v2";
import { cityNameJa } from "@/lib/airport-names";
import { getKV } from "@/lib/store/kv";

const KV_ARTICLES_KEY = "beatrip:articles:generated";

function findDealImage(airlineCode: string, routes: { originCode: string; destinationCode: string }[]): string {
  for (const route of routes) {
    const match = deals.find(
      (d) => d.origin_code === route.originCode && d.destination_code === route.destinationCode
    );
    if (match) return match.image_url;
  }
  const airlineMatch = deals.find((d) => d.airline_id === airlineCode);
  if (airlineMatch) return airlineMatch.image_url;
  return "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80";
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
    image_url: findDealImage(sale.airlineCode, sale.routes),
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
    image_url: findDealImage(airlineCode, []),
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
