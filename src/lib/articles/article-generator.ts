import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { AirlineSale } from "@/lib/scrapers/types";
import type { PriceChange } from "@/lib/store/sale-store";
import type { Article } from "@/data/mock-articles";
import { cityNameJa } from "@/lib/airport-names";
import { routeLinkMd } from "./route-link";
import { getDestinationImage } from "@/lib/deals/destination-images";
import { isDomesticRoute } from "@/lib/airports/domestic";
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
    // 路線名から該当路線のセールページへ直接飛べるようにする (回遊率向上)
    return `- **${routeLinkMd(r.originCode, r.destinationCode)}（${r.originCode}→${r.destinationCode}・${r.cabin}）**: ¥${formatPrice(r.price)}${discountText}${seatsText}`;
  });

  const cheapest = routes[0];
  // routes が空でも -Infinity にならないよう reduce で初期値 0
  const highestDiscount = routes.reduce(
    (acc, r) => Math.max(acc, r.discount ?? 0),
    0
  );

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

/** 値下げ速報に載せる最大路線数 (多すぎると読まれないため) */
const MAX_DROP_ROUTES = 10;
/** 掲載する最低値下げ額: 国内線 (¥3,000 未満は誤差レベルなので載せない) */
const MIN_DROP_DOMESTIC = 3000;
/** 掲載する最低値下げ額: 国際線 (単価が高いので閾値も上げる) */
const MIN_DROP_INTERNATIONAL = 10000;

/** routeKey ("HND→FUK(Economy)") を分解。壊れていれば null。 */
function parseRouteKey(
  routeKey: string
): { origin: string; dest: string; cabin: string } | null {
  const m = routeKey.match(/^([A-Z]{3})→([A-Z]{3})(?:\(([^)]+)\))?/);
  if (!m) return null;
  return { origin: m[1], dest: m[2], cabin: m[3] ?? "Economy" };
}

/** キャビンの日本語表記 */
function cabinJa(cabin: string): string {
  if (/business/i.test(cabin)) return "ビジネス";
  if (/first/i.test(cabin)) return "ファースト";
  if (/premium/i.test(cabin)) return "プレエコ";
  return "エコノミー";
}

/** 値下げ速報記事を組み立てる (保存はしない)。掲載に値する値下げが無ければ null。 */
export function generatePriceDropArticle(
  airlineCode: string,
  priceChanges: PriceChange[]
): Article | null {
  // 値下げのうち「読者にとって意味のある幅」だけに絞る。
  // 国内¥3,000 / 国際¥10,000 未満の変動はノイズとして載せない。
  const candidates = priceChanges
    .filter((p) => p.direction === "down")
    .map((p) => {
      const parsed = parseRouteKey(p.routeKey);
      if (!parsed) return null;
      const diff = p.oldPrice - p.newPrice;
      const domestic = isDomesticRoute(parsed.origin, parsed.dest);
      const threshold = domestic ? MIN_DROP_DOMESTIC : MIN_DROP_INTERNATIONAL;
      if (diff < threshold) return null;
      const percent =
        p.oldPrice > 0 ? Math.round((diff / p.oldPrice) * 100) : 0;
      return { ...p, ...parsed, diff, percent };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    // 値下げ額の大きい順 = 読者の関心が高い順
    .sort((a, b) => b.diff - a.diff);

  // 閾値を超える値下げが無ければ記事化しない (薄い記事を量産しない)
  if (candidates.length === 0) return null;

  const drops = candidates.slice(0, MAX_DROP_ROUTES);
  const omitted = candidates.length - drops.length;

  const slug = slugify(
    `price-drop-${airlineCode}-${new Date().toISOString().split("T")[0]}`
  );

  // 「東京→福岡（HND→FUK・エコノミー）: ¥12,210（-¥3,000 / 20%OFF）」形式。
  // IATA の羅列では読者に伝わらないため、日本語の都市名を主役にする。
  const lines = drops.map((p) => {
    return `- **${routeLinkMd(p.origin, p.dest)}**（${p.origin}→${p.dest}・${cabinJa(p.cabin)}）: ¥${formatPrice(p.newPrice)}（-¥${formatPrice(p.diff)}${p.percent > 0 ? ` / ${p.percent}%OFF` : ""}）`;
  });

  const biggestDrop = drops[0];
  const bigRouteJa = `${cityNameJa(biggestDrop.origin)}→${cityNameJa(biggestDrop.dest)}`;

  const body = `${airlineCode}が対象の路線で、まとまった値下げを検出しました。国内線は¥${formatPrice(MIN_DROP_DOMESTIC)}以上、国際線は¥${formatPrice(MIN_DROP_INTERNATIONAL)}以上の値下げのみを掲載しています。

## 値下げが大きい路線

${lines.join("\n")}
${omitted > 0 ? `\n※ 上記のほか${omitted}路線でも値下げを検出しています。\n` : ""}
## 注目

最も値下げ幅が大きいのは**[${bigRouteJa}](/routes/${biggestDrop.origin}-${biggestDrop.dest})**。¥${formatPrice(biggestDrop.oldPrice)}から**¥${formatPrice(biggestDrop.newPrice)}**へ、¥${formatPrice(biggestDrop.diff)}${biggestDrop.percent > 0 ? `（${biggestDrop.percent}%OFF）` : ""}の値下がりです。

各路線名をタップすると、その路線のセール情報・価格推移を確認できます。

なお掲載価格は検出時点のものです。実際の価格・空席は予約サイトでご確認ください。`;

  return {
    slug,
    title: `【値下げ速報】${airlineCode} ${bigRouteJa} が¥${formatPrice(biggestDrop.diff)}値下げ`,
    excerpt: `${airlineCode}の${drops.length}路線で値下げを検出。最大は${bigRouteJa}の¥${formatPrice(biggestDrop.diff)}${biggestDrop.percent > 0 ? `（${biggestDrop.percent}%OFF）` : ""}。`,
    body,
    // 最も値下げ幅が大きい路線の目的地写真を採用 (記事の主役と一致させる)
    image_url: findDealImage(
      airlineCode,
      drops.map((p) => ({ originCode: p.origin, destinationCode: p.dest })),
      slug
    ),
    category: "セール速報",
    airline_tags: [airlineCode],
    route_tags: drops.map((p) => `${p.origin}-${p.dest}`),
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

/**
 * 月次トレンドレポート (YYYY-MM 単位) を生成。
 * 同月に既存があれば null を返す (毎月 1 本だけ生成)。
 */
export async function generateAndSaveMonthlyTrend(
  sales: AirlineSale[]
): Promise<Article | null> {
  const { buildMonthlyTrendArticle } = await import("./trend-report-generator");
  const article = buildMonthlyTrendArticle(sales);
  if (!article) return null;
  const existing = await loadGeneratedArticles();
  if (existing.some((a) => a.slug === article.slug)) return null;
  const updated = [article, ...existing].slice(0, 200);
  await saveGeneratedArticles(updated);
  return article;
}

/**
 * 「セール終了予告」記事 (YYYY-MM-DD 単位) を生成。
 * 7 日以内に終了するセールがなければ null。
 * 同日に既存があれば null (1 日 1 本まで)。
 */
export async function generateAndSaveEndingSoon(
  sales: AirlineSale[]
): Promise<Article | null> {
  const { buildEndingSoonArticle } = await import("./ending-soon-generator");
  const article = buildEndingSoonArticle(sales);
  if (!article) return null;
  const existing = await loadGeneratedArticles();
  if (existing.some((a) => a.slug === article.slug)) return null;
  const updated = [article, ...existing].slice(0, 200);
  await saveGeneratedArticles(updated);
  return article;
}
