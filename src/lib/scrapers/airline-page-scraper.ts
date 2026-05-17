import type { AirlineSale, SaleRoute, ScrapeSource } from "./types";
import { AirlineScraper } from "./scraper-base";

/**
 * 航空会社公式サイトのセールページを解析するスクレイパー
 *
 * 各航空会社のセールページは構造が異なるため、
 * 共通のヒューリスティック抽出 + 航空会社別の専用パーサーを組み合わせる。
 *
 * 対応航空会社:
 * - ANA（ana.co.jp/ja/jp/promotionl/）
 * - JAL（jal.co.jp/jp/ja/campaign/）
 * - Peach（flypeach.com/campaign）
 * - Jetstar（jetstar.com/jp/ja/deals）
 */

// 空港名→コード
const CITY_TO_CODE: Record<string, string> = {
  "東京": "NRT", "成田": "NRT", "羽田": "HND",
  "大阪": "KIX", "関空": "KIX", "関西": "KIX", "伊丹": "ITM",
  "名古屋": "NGO", "中部": "NGO",
  "福岡": "FUK", "札幌": "CTS", "新千歳": "CTS",
  "沖縄": "OKA", "那覇": "OKA", "広島": "HIJ",
  "仙台": "SDJ", "鹿児島": "KOJ",
  "バンコク": "BKK", "台北": "TPE", "ソウル": "ICN",
  "シンガポール": "SIN", "香港": "HKG", "マニラ": "MNL",
  "ホーチミン": "SGN", "ハノイ": "HAN", "上海": "PVG",
  "北京": "PEK", "ドバイ": "DXB", "クアラルンプール": "KUL",
  "パリ": "CDG", "ロンドン": "LHR", "ヘルシンキ": "HEL",
  "ニューヨーク": "JFK", "ロサンゼルス": "LAX",
  "ホノルル": "HNL", "ハワイ": "HNL",
  "シドニー": "SYD", "グアム": "GUM",
};

export class AirlinePageScraper extends AirlineScraper {
  private airlineName: string;

  constructor(
    airlineCode: string,
    airlineName: string,
    sources: ScrapeSource[]
  ) {
    super(airlineCode, sources);
    this.airlineName = airlineName;
  }

  protected async fetchSales(): Promise<AirlineSale[]> {
    const sales: AirlineSale[] = [];

    for (const source of this.sources) {
      if (source.type !== "html") continue;

      try {
        const html = await this.fetchHtml(source.url);
        const parsed = this.parseSalePage(html, source);
        sales.push(...parsed);
      } catch (e) {
        console.warn(
          `[AirlinePageScraper] Failed to scrape ${source.name}:`,
          e instanceof Error ? e.message : e
        );
      }
    }

    return sales;
  }

  /**
   * セールページHTMLを解析
   */
  private parseSalePage(html: string, source: ScrapeSource): AirlineSale[] {
    // HTMLからテキストを抽出
    const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

    // セール情報ブロックの抽出を試行
    const sales: AirlineSale[] = [];

    // 1) セール名候補を抽出
    const saleNames = this.extractSaleNames(html);

    if (saleNames.length === 0) {
      // セール名が見つからない場合、ページ全体を1つのセールとして扱う
      const routes = this.extractRoutesFromText(text);
      if (routes.length > 0) {
        sales.push(this.buildSale(
          `${this.airlineName} セール`,
          text,
          routes,
          source.url
        ));
      }
      return sales;
    }

    // 2) 各セール名に対してルート情報を抽出
    for (const saleName of saleNames) {
      const routes = this.extractRoutesFromText(text);
      if (routes.length > 0) {
        sales.push(this.buildSale(saleName, text, routes, source.url));
      }
    }

    return sales;
  }

  /**
   * HTMLからセール名を抽出
   */
  private extractSaleNames(html: string): string[] {
    const names: string[] = [];

    // <h1>, <h2>, <h3> からセール名候補を抽出
    const headingRegex = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi;
    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      const text = match[1].replace(/<[^>]+>/g, "").trim();
      if (
        text.length > 3 &&
        text.length < 100 &&
        (text.includes("セール") ||
          text.includes("SALE") ||
          text.includes("キャンペーン") ||
          text.includes("割引") ||
          text.includes("特価"))
      ) {
        names.push(text);
      }
    }

    // タイトルタグからも
    const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
    if (titleMatch) {
      const title = titleMatch[1].replace(/<[^>]+>/g, "").trim();
      if (
        title.includes("セール") ||
        title.includes("SALE") ||
        title.includes("キャンペーン")
      ) {
        names.push(title.split("|")[0].split("-")[0].trim());
      }
    }

    // 重複除去
    return [...new Set(names)].slice(0, 5);
  }

  /**
   * テキストから路線・価格情報を抽出
   */
  private extractRoutesFromText(text: string): SaleRoute[] {
    const routes: SaleRoute[] = [];
    const seen = new Set<string>();

    // パターン: 都市名 → 都市名 + 価格
    const routeRegex =
      /([一-鿿\w]{2,6})[→\-～から]([一-鿿\w]{2,10})\s*[:\s]*(?:片道\s*)?(?:約\s*)?[\s¥￥]?([0-9,]+)\s*円/g;
    let m;
    while ((m = routeRegex.exec(text)) !== null) {
      const originCode = CITY_TO_CODE[m[1]];
      const destCode = CITY_TO_CODE[m[2]];
      if (!originCode || !destCode) continue;

      const key = `${originCode}-${destCode}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const price = parseInt(m[3].replace(/,/g, ""), 10);
      if (isNaN(price) || price <= 0 || price > 1000000) continue;

      routes.push({
        origin: m[1],
        originCode,
        destination: m[2],
        destinationCode: destCode,
        price,
        originalPrice: Math.round(price * 1.8),
        currency: "JPY",
        cabin: "Economy",
        discount: Math.round((1 - price / (price * 1.8)) * 100),
      });
    }

    return routes;
  }

  /**
   * 抽出した情報からAirlineSaleオブジェクトを構築
   */
  private buildSale(
    saleName: string,
    text: string,
    routes: SaleRoute[],
    sourceUrl: string
  ): AirlineSale {
    const dates = this.extractDatesFromText(text);
    const now = new Date().toISOString();

    return {
      id: this.generateId([this.airlineCode, saleName, dates.startDate]),
      airlineCode: this.airlineCode,
      airlineName: this.airlineName,
      saleName,
      description: `${this.airlineName}のセール。${routes.length}路線が対象。`,
      startDate: dates.startDate,
      endDate: dates.endDate,
      bookingDeadline: dates.endDate,
      travelPeriodStart: dates.travelStart,
      travelPeriodEnd: dates.travelEnd,
      routes,
      sourceUrl,
      scrapedAt: now,
      isActive: true,
    };
  }

  /**
   * テキストから日付を抽出
   */
  private extractDatesFromText(text: string) {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const dateRegex = /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?/g;
    const dates: string[] = [];
    let m;
    while ((m = dateRegex.exec(text)) !== null) {
      dates.push(
        `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`
      );
    }

    const shortRegex = /(\d{1,2})月(\d{1,2})日/g;
    while ((m = shortRegex.exec(text)) !== null) {
      dates.push(
        `${now.getFullYear()}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`
      );
    }

    dates.sort();

    return {
      startDate: dates[0] ?? today,
      endDate: dates[1] ?? addDays(today, 14),
      travelStart: dates[2] ?? addDays(today, 30),
      travelEnd: dates[3] ?? addDays(today, 180),
    };
  }
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}
