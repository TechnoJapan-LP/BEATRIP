import type { AirlineSale, SaleRoute } from "./types";
import { AirlineScraper } from "./scraper-base";

/**
 * Peach Aviation 公式サイトの news ページからセール情報を抽出する scraper。
 *
 * 戦略:
 *  1. /news インデックスから最近の記事 URL を取得 (最大 15 件)
 *  2. 各記事を fetch
 *  3. タイトル + 本文がセール keyword (セール / キャンペーン / 特別運賃 等)
 *     を含むものだけを通す
 *  4. 価格 (XX,XXX 円) と 路線 (「成田〜台北」「関西→香港」等) を正規表現で抽出
 *  5. AirlineSale 形式に変換
 *
 * ヒット率は記事の傾向に依存 (税改定や運航ルール改定など非セール記事も多い)。
 * 取れない時期もあるが、取れた時は公式情報なので信頼度が高い。
 */

const CITY_TO_CODE: Record<string, string> = {
  "東京": "NRT", "成田": "NRT", "羽田": "HND",
  "大阪": "KIX", "関西": "KIX", "関空": "KIX",
  "名古屋": "NGO", "中部": "NGO",
  "福岡": "FUK", "札幌": "CTS", "新千歳": "CTS",
  "仙台": "SDJ", "新潟": "KIJ", "松山": "MYJ",
  "高知": "KCZ", "長崎": "NGS", "宮崎": "KMI",
  "大分": "OIT", "鹿児島": "KOJ",
  "那覇": "OKA", "沖縄": "OKA", "石垣": "ISG", "宮古": "MMY",
  "台北": "TPE", "桃園": "TPE", "高雄": "KHH",
  "ソウル": "ICN", "仁川": "ICN", "釜山": "PUS",
  "上海": "PVG", "香港": "HKG", "バンコク": "BKK",
  "シンガポール": "SIN", "マニラ": "MNL",
};

const CITY_PATTERN = Object.keys(CITY_TO_CODE).join("|");
const ROUTE_RE = new RegExp(
  `(${CITY_PATTERN})\\s*[〜→ー―~]\\s*(${CITY_PATTERN})`,
  "g"
);

const TITLE_SALE_KW = /セール|キャンペーン|特別運賃|タイムセール|期間限定|お得|割引|スペシャル/;
const BODY_SALE_KW = /セール|キャンペーン|特別運賃|タイムセール|円〜|円から|片道|往復/;

const NEWS_INDEX_URL = "https://www.flypeach.com/news";

export class PeachOfficialScraper extends AirlineScraper {
  protected async fetchSales(): Promise<AirlineSale[]> {
    let indexHtml: string;
    try {
      indexHtml = await this.fetchHtml(NEWS_INDEX_URL);
    } catch {
      return [];
    }

    const allUrls = new Set<string>();
    for (const m of indexHtml.matchAll(
      /https:\/\/www\.flypeach\.com\/news\/(\d{6,12})/g
    )) {
      allUrls.add(m[0]);
    }
    const urls = [...allUrls].slice(0, 15);

    const sales: AirlineSale[] = [];
    for (const url of urls) {
      try {
        const html = await this.fetchHtml(url);
        const sale = this.parseSaleArticle(html, url);
        if (sale) sales.push(sale);
      } catch {
        /* 個別記事失敗は無視 */
      }
    }
    return sales;
  }

  private parseSaleArticle(html: string, url: string): AirlineSale | null {
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    if (!titleMatch) return null;
    const rawTitle = this.htmlUnescape(titleMatch[1]).trim();
    const title = rawTitle.replace(/\s*\|\s*Peach[^|]*$/, "").trim();
    if (!TITLE_SALE_KW.test(title)) return null;

    if (!BODY_SALE_KW.test(html)) return null;

    const prices = [...html.matchAll(/([1-9][0-9,]{2,6})円/g)]
      .map((m) => parseInt(m[1].replace(/,/g, ""), 10))
      .filter((p) => p >= 1000 && p <= 200000);
    if (prices.length === 0) return null;

    const minPrice = Math.min(...prices);

    const routes: SaleRoute[] = [];
    const seen = new Set<string>();
    for (const m of html.matchAll(ROUTE_RE)) {
      const oName = m[1];
      const dName = m[2];
      const oCode = CITY_TO_CODE[oName];
      const dCode = CITY_TO_CODE[dName];
      if (!oCode || !dCode || oCode === dCode) continue;
      const key = `${oCode}-${dCode}`;
      if (seen.has(key)) continue;
      seen.add(key);
      routes.push({
        origin: oName,
        originCode: oCode,
        destination: dName,
        destinationCode: dCode,
        price: minPrice,
        originalPrice: Math.round(minPrice * 1.6),
        currency: "JPY",
        cabin: "Economy",
        discount: Math.round((1 - minPrice / (minPrice * 1.6)) * 100),
      });
    }
    if (routes.length === 0) return null;

    const dateMatch = url.match(/news\/(\d{4})(\d{2})(\d{2})/);
    const baseDate = dateMatch
      ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
      : new Date().toISOString().slice(0, 10);
    const deadline = this.extractDeadline(html, baseDate);

    const idSlug = baseDate.replace(/-/g, "") + "-" + routes[0].originCode;
    return {
      id: `peach-official-${idSlug}`,
      airlineCode: this.airlineCode,
      airlineName: "Peach Aviation",
      saleName: title,
      description: title,
      startDate: baseDate,
      endDate: deadline,
      bookingDeadline: deadline,
      travelPeriodStart: baseDate,
      travelPeriodEnd: deadline,
      routes: routes.slice(0, 20),
      sourceUrl: url,
      scrapedAt: new Date().toISOString(),
      isActive: true,
    };
  }

  /** 本文から締切を抽出。なければ baseDate + 30 日。 */
  private extractDeadline(html: string, baseDate: string): string {
    const base = new Date(baseDate);
    const re = /(?:(\d{4})年)?(\d{1,2})月(\d{1,2})日[^。]{0,15}まで/g;
    let latest = 0;
    for (const m of html.matchAll(re)) {
      const year = m[1] ? parseInt(m[1], 10) : base.getFullYear();
      const month = parseInt(m[2], 10);
      const day = parseInt(m[3], 10);
      if (month < 1 || month > 12 || day < 1 || day > 31) continue;
      const t = new Date(year, month - 1, day).getTime();
      if (t > base.getTime() && t < base.getTime() + 365 * 86400000) {
        if (t > latest) latest = t;
      }
    }
    if (latest > 0) return new Date(latest).toISOString().slice(0, 10);
    return new Date(base.getTime() + 30 * 86400000).toISOString().slice(0, 10);
  }

  private htmlUnescape(s: string): string {
    return s
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, " ");
  }
}
