import type { Article } from "@/data/mock-articles";
import { loadGeneratedArticles } from "./article-generator";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getKV } from "@/lib/store/kv";

/**
 * Traicy RSS から OTA (Trip.com / Agoda / Booking / 楽天トラベル / じゃらん 等)
 * のセール・キャンペーン記事を自動検出して Article として生成する。
 *
 * AirlineSale 流用ではなく直接 Article 化する理由:
 *   - OTA セールは「路線×価格」構造を持たない (ホテル/パッケージ中心)
 *   - 速報的価値は本文要約 + 元記事リンクで十分
 *   - 既存 AirlineSale 経路に OTA を混ぜると routes=0 で全部 skip されてしまう
 *
 * dedup: slug を `ota-news-{YYYY-MM-DD}-{ota_code}-{title-hash}` 形式で固定。
 *         同じ記事を何度叩いても 1 度しか保存されない。
 */

const KV_ARTICLES_KEY = "beatrip:articles:generated";

const READ_DIR = join(process.cwd(), "data", "articles");
const DATA_DIR =
  process.env.VERCEL === "1" ? "/tmp/beatrip-articles" : READ_DIR;

// OTA keyword と表示用ラベル
const OTA_PATTERNS: Array<{ keyword: RegExp; label: string; code: string }> = [
  { keyword: /Trip\.?com|トリップドットコム|シートリップ/i, label: "Trip.com", code: "tripcom" },
  { keyword: /Agoda|アゴダ/i, label: "Agoda", code: "agoda" },
  { keyword: /Booking\.?com|ブッキングドットコム|ブッキング\.com/i, label: "Booking.com", code: "booking" },
  { keyword: /Expedia|エクスペディア/i, label: "Expedia", code: "expedia" },
  { keyword: /Hotels\.?com|ホテルズドットコム/i, label: "Hotels.com", code: "hotelscom" },
  { keyword: /楽天トラベル/i, label: "楽天トラベル", code: "rakuten" },
  { keyword: /じゃらん/i, label: "じゃらん", code: "jalan" },
  { keyword: /Yahoo!?トラベル|ヤフートラベル/i, label: "Yahoo!トラベル", code: "yahoo" },
  { keyword: /一休\.com|一休/i, label: "一休.com", code: "ichikyu" },
  { keyword: /JTB/i, label: "JTB", code: "jtb" },
  { keyword: /HIS/i, label: "HIS", code: "his" },
];

const SALE_KEYWORDS =
  /(セール|キャンペーン|タイムセール|割引|期間限定|特別|スーパーセール|ポイント.{0,10}倍|.{0,10}OFF|%OFF)/;

// 既定の RSS フィード (Traicy の sale カテゴリ)。OTA 系もここに混在する。
const DEFAULT_FEEDS = [
  "https://www.traicy.com/category/sale/feed/",
];

const OTA_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80", // hotel
  "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&q=80", // hotel lobby
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",   // hotel room
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",   // resort
];

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function shortHash(s: string): string {
  return hashCode(s).toString(36).slice(0, 6);
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#[0-9]+;/g, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(xml: string, tag: string): string | null {
  const cdataRegex = new RegExp(
    `<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`
  );
  const cdataMatch = cdataRegex.exec(xml);
  if (cdataMatch) return cdataMatch[1].trim();

  const simpleRegex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
  const simpleMatch = simpleRegex.exec(xml);
  return simpleMatch ? simpleMatch[1].trim() : null;
}

function parseRssXml(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, "title");
    const link = extractTag(itemXml, "link");
    const description = extractTag(itemXml, "description");
    const pubDate = extractTag(itemXml, "pubDate");
    if (title && link) {
      items.push({
        title: decodeHtmlEntities(title),
        link,
        description: decodeHtmlEntities(description ?? ""),
        pubDate: pubDate ?? new Date().toISOString(),
      });
    }
  }
  return items;
}

async function fetchRssText(url: string, timeoutMs = 8000): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept-Language": "ja,en;q=0.9",
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

function detectOta(text: string): { label: string; code: string } | null {
  for (const p of OTA_PATTERNS) {
    if (p.keyword.test(text)) return { label: p.label, code: p.code };
  }
  return null;
}

function isSaleArticle(text: string): boolean {
  return SALE_KEYWORDS.test(text);
}

function pickImage(seed: string): string {
  return OTA_FALLBACK_IMAGES[hashCode(seed) % OTA_FALLBACK_IMAGES.length];
}

function toIsoDate(pubDate: string): string {
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return new Date().toISOString();
  return d.toISOString();
}

function buildArticle(item: RSSItem, ota: { label: string; code: string }): Article {
  const publishedIso = toIsoDate(item.pubDate);
  const dateStr = publishedIso.slice(0, 10);
  const slug = `ota-news-${dateStr}-${ota.code}-${shortHash(item.link)}`;

  const excerpt = item.description.slice(0, 200).trim();

  const cleanTitle = item.title.replace(/【[^】]+】/g, "").trim();

  const body = `${ota.label} が「${cleanTitle}」を発表しました。

## 概要

${excerpt || `${ota.label} のセール・キャンペーン情報です。`}

## 詳細・予約

セール詳細・予約条件は元記事および ${ota.label} 公式サイトでご確認ください。

- 元記事 (Traicy): [${item.title}](${item.link})

---

掲載内容は取得時点のものです。価格・期間・対象条件は変更される可能性があるため、最新は ${ota.label} 公式サイトで必ずご確認ください。`;

  return {
    slug,
    title: `【${ota.label}】${cleanTitle}`,
    excerpt:
      excerpt ||
      `${ota.label} がセール・キャンペーンを開催。詳細・予約条件をチェック。`,
    body,
    image_url: pickImage(`${ota.code}:${item.link}`),
    category: "セール速報",
    airline_tags: [ota.label],
    route_tags: [],
    published_at: publishedIso,
    source: "Traicy",
    source_url: item.link,
  };
}

async function saveGeneratedArticles(articles: Article[]) {
  const kv = getKV();
  if (kv) {
    try {
      await kv.set(KV_ARTICLES_KEY, articles);
    } catch (e) {
      console.warn("[OTA News] KV persist failed:", e);
    }
  }
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
      join(DATA_DIR, "generated.json"),
      JSON.stringify(articles, null, 2)
    );
  } catch (e) {
    if (!kv) console.warn("[OTA News] Failed to persist:", e);
  }
}

export type OtaNewsResult = {
  /** 新規生成された Article */
  generated: Article[];
  /** RSS から検出された OTA セール記事の総数 (重複保存スキップ含む) */
  totalDetected: number;
};

/**
 * Traicy 系 RSS フィードから OTA セール記事を検出し、Article として永続化。
 *
 * - title + description に OTA 名 と セール keyword の両方を含むものだけ通す
 * - slug 重複は loadGeneratedArticles() の既存セットで dedup
 * - 失敗フィードはスキップ (個別の例外で全停止しない)
 *
 * @param opts.maxItems   1 回の実行で生成する最大記事数 (デフォルト 10)
 * @param opts.feedUrls   テスト用に上書き可能
 */
export async function generateOtaNewsArticles(opts?: {
  maxItems?: number;
  feedUrls?: string[];
}): Promise<OtaNewsResult> {
  const maxItems = opts?.maxItems ?? 10;
  const feedUrls = opts?.feedUrls ?? DEFAULT_FEEDS;

  // RSS 取得 + パース
  const allItems: RSSItem[] = [];
  for (const url of feedUrls) {
    try {
      const xml = await fetchRssText(url);
      allItems.push(...parseRssXml(xml));
    } catch (e) {
      console.warn(`[OTA News] feed fetch failed: ${url}`, e);
    }
  }

  // OTA + セールキーワードで filter
  type Hit = { item: RSSItem; ota: { label: string; code: string } };
  const hits: Hit[] = [];
  for (const item of allItems) {
    const text = `${item.title} ${item.description}`;
    if (!isSaleArticle(text)) continue;
    const ota = detectOta(text);
    if (!ota) continue;
    hits.push({ item, ota });
  }

  const totalDetected = hits.length;

  // 既存記事ロード → slug dedup
  const existing = await loadGeneratedArticles();
  const existingSlugs = new Set(existing.map((a) => a.slug));

  const newArticles: Article[] = [];
  for (const { item, ota } of hits) {
    if (newArticles.length >= maxItems) break;
    const article = buildArticle(item, ota);
    if (existingSlugs.has(article.slug)) continue;
    existingSlugs.add(article.slug);
    newArticles.push(article);
  }

  if (newArticles.length > 0) {
    const updated = [...newArticles, ...existing].slice(0, 200);
    await saveGeneratedArticles(updated);
  }

  return { generated: newArticles, totalDetected };
}
