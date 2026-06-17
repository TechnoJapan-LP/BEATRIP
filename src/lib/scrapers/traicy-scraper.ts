import type { AirlineSale, SaleRoute } from "./types";
import { AirlineScraper } from "./scraper-base";

/**
 * Traicy.com の RSS フィードからセール情報を収集するスクレイパー
 *
 * Traicy は日本の航空ニュースサイトで、航空会社のセール情報を
 * RSS フィードで配信している。複数航空会社のセール情報を一括取得可能。
 *
 * フロー:
 * 1. RSS フィードを取得・パース
 * 2. セール関連の記事をフィルタ
 * 3. 各記事のリンク先から詳細を抽出（価格・路線）
 * 4. AirlineSale 型に変換
 */

// セール関連キーワード
const SALE_KEYWORDS = [
  "セール", "SALE", "sale", "キャンペーン", "割引",
  "特価", "値下げ", "タイムセール", "フラッシュ",
  "スーパースター", "メガセール", "0円",
];

// 航空会社名 → コードマッピング
const AIRLINE_NAME_TO_CODE: Record<string, string> = {
  "ANA": "ANA", "全日空": "ANA", "全日本空輸": "ANA",
  "JAL": "JAL", "日本航空": "JAL",
  "ピーチ": "PCH", "Peach": "PCH",
  "ジェットスター": "JJP", "Jetstar": "JJP",
  "スプリング": "APJ", "Spring": "APJ", "春秋航空": "APJ",
  "ティーウェイ": "TW", "T'way": "TW",
  "ベトジェット": "VJ", "VietJet": "VJ",
  "エミレーツ": "EK", "Emirates": "EK",
  "シンガポール航空": "SQ", "Singapore Airlines": "SQ",
  "キャセイ": "CX", "Cathay": "CX",
  "エアアジア": "D7", "AirAsia": "D7",
  "タイガーエア": "IT", "Tigerair": "IT",
  "スクート": "TR", "Scoot": "TR",
  "チェジュ航空": "7C", "Jeju Air": "7C",
  "エアソウル": "RS", "Air Seoul": "RS",
  "フィリピン航空": "PR", "Philippine Airlines": "PR",
  "セブパシフィック": "5J", "Cebu Pacific": "5J",
  "ライオンエア": "JT", "Lion Air": "JT",
  "ZIP AIR": "ZG", "ZIPAIR": "ZG",
  "タイ航空": "TG", "Thai Airways": "TG",
  "大韓航空": "KE", "Korean Air": "KE",
  "アシアナ": "OZ", "Asiana": "OZ",
  "中国東方航空": "MU", "China Eastern": "MU",
  "中国南方航空": "CZ", "China Southern": "CZ",
  "トキエア": "BV", "Toki Air": "BV",
  "アイベックス": "FW", "IBEX": "FW",
  "スカイマーク": "BC", "Skymark": "BC",
  "AIRDO": "HD", "エアドゥ": "HD",
  "ソラシドエア": "6J", "Solaseed Air": "6J",
  "スターフライヤー": "7G", "Star Flyer": "7G",
  "フジドリームエアラインズ": "JH", "FDA": "JH",
  "Air Japan": "NQ", "エアジャパン": "NQ",
};

// 空港名→コード（テキストから路線抽出用）
const CITY_TO_CODE: Record<string, string> = {
  "東京": "NRT", "成田": "NRT", "羽田": "HND",
  "大阪": "KIX", "関空": "KIX", "関西": "KIX", "伊丹": "ITM",
  "名古屋": "NGO", "中部": "NGO", "セントレア": "NGO", "小牧": "NKM",
  "福岡": "FUK", "札幌": "CTS", "新千歳": "CTS", "丘珠": "OKD",
  "沖縄": "OKA", "那覇": "OKA", "広島": "HIJ", "石垣": "ISG",
  "仙台": "SDJ", "鹿児島": "KOJ", "熊本": "KMJ", "宮古": "MMY",
  "新潟": "KIJ", "神戸": "UKB", "松山": "MYJ", "高知": "KCZ",
  "高松": "TAK", "徳島": "TKS", "青森": "AOJ", "秋田": "AXT",
  "山形": "GAJ", "函館": "HKD", "旭川": "AKJ", "釧路": "KUH",
  "帯広": "OBO", "稚内": "WKJ", "北九州": "KKJ", "宮崎": "KMI",
  "長崎": "NGS", "大分": "OIT", "佐賀": "HSG",
  "バンコク": "BKK", "台北": "TPE", "ソウル": "ICN", "仁川": "ICN",
  "シンガポール": "SIN", "香港": "HKG", "マニラ": "MNL",
  "ホーチミン": "SGN", "ハノイ": "HAN", "上海": "PVG",
  "北京": "PEK", "ドバイ": "DXB", "クアラルンプール": "KUL",
  "パリ": "CDG", "ロンドン": "LHR", "ヘルシンキ": "HEL",
  "ローマ": "FCO", "バルセロナ": "BCN", "フランクフルト": "FRA",
  "ニューヨーク": "JFK", "ロサンゼルス": "LAX", "LA": "LAX",
  "サンフランシスコ": "SFO", "ホノルル": "HNL", "ハワイ": "HNL",
  "シドニー": "SYD", "グアム": "GUM",
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RssFeedConfig = {
  /** フィードURL */
  url: string;
  /** スクレイプソース名（ログ・モニタ用） */
  sourceName: string;
  /** ID生成用プレフィクス（フィード間でのID衝突を避ける） */
  idPrefix: string;
};

const DEFAULT_FEED: RssFeedConfig = {
  url: "https://www.traicy.com/category/sale/feed/",
  sourceName: "Traicy セール情報RSS",
  idPrefix: "traicy",
};

export class TraicyScraper extends AirlineScraper {
  private targetAirlineCode: string;
  protected feedConfig: RssFeedConfig;

  constructor(airlineCode: string, feedConfig: RssFeedConfig = DEFAULT_FEED) {
    super(airlineCode, [
      {
        name: feedConfig.sourceName,
        url: feedConfig.url,
        type: "rss",
      },
    ]);
    this.targetAirlineCode = airlineCode;
    this.feedConfig = feedConfig;
  }

  protected async fetchSales(): Promise<AirlineSale[]> {
    const rssFeed = await this.fetchRSS();
    const saleItems = rssFeed.filter((item) => this.isSaleArticle(item));

    const sales: AirlineSale[] = [];

    for (const item of saleItems) {
      const airlineCode = this.detectAirlineCode(item.title + " " + item.description);
      if (!airlineCode) continue;
      if (this.targetAirlineCode !== "ALL" && airlineCode !== this.targetAirlineCode) continue;

      try {
        const sale = await this.parseArticleToSale(item, airlineCode);
        if (sale) sales.push(sale);
      } catch (e) {
        console.warn(`[TraicyScraper] Failed to parse article: ${item.title}`, e);
      }
    }

    return sales;
  }

  /**
   * RSS フィードを取得してパース
   */
  private async fetchRSS(): Promise<RSSItem[]> {
    const source = this.sources[0];
    const text = await this.fetchHtml(source.url);
    return this.parseRSSXml(text);
  }

  /**
   * シンプルなXMLパーサー（外部ライブラリ不要）
   */
  private parseRSSXml(xml: string): RSSItem[] {
    const items: RSSItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;

    let match;
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      const title = this.extractTag(itemXml, "title");
      const link = this.extractTag(itemXml, "link");
      const description = this.extractTag(itemXml, "description");
      const pubDate = this.extractTag(itemXml, "pubDate");

      if (title && link) {
        items.push({
          title: this.decodeHtmlEntities(title),
          link,
          description: this.decodeHtmlEntities(description ?? ""),
          pubDate: pubDate ?? new Date().toISOString(),
        });
      }
    }

    return items;
  }

  private extractTag(xml: string, tag: string): string | null {
    // CDATA対応
    const cdataRegex = new RegExp(`<${tag}>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`);
    const cdataMatch = cdataRegex.exec(xml);
    if (cdataMatch) return cdataMatch[1].trim();

    const simpleRegex = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);
    const simpleMatch = simpleRegex.exec(xml);
    return simpleMatch ? simpleMatch[1].trim() : null;
  }

  private decodeHtmlEntities(str: string): string {
    return str
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/<[^>]+>/g, ""); // strip HTML tags
  }

  /**
   * セール関連の記事かどうか判定
   */
  private isSaleArticle(item: RSSItem): boolean {
    const text = item.title + " " + item.description;
    return SALE_KEYWORDS.some((kw) => text.includes(kw));
  }

  /**
   * テキストから航空会社コードを検出
   */
  private detectAirlineCode(text: string): string | null {
    for (const [name, code] of Object.entries(AIRLINE_NAME_TO_CODE)) {
      if (text.includes(name)) return code;
    }
    return null;
  }

  /**
   * 記事の本文を取得し、セール情報を抽出
   */
  private async parseArticleToSale(
    item: RSSItem,
    airlineCode: string
  ): Promise<AirlineSale | null> {
    // 記事本文を取得
    let articleText = item.description;
    try {
      const html = await this.fetchHtml(item.link);
      articleText = this.extractArticleBody(html);
    } catch {
      // 記事取得失敗時はdescriptionで続行
    }

    const fullText = item.title + " " + articleText;

    // ルート抽出:
    // 1. タイトルから抽出（最も信頼度が高い見出し路線）
    // 2. 本文からも抽出（"東京/羽田〜大阪/伊丹線が9,130円" 等の運賃表）
    // 3. マージ（同一路線は重複排除、タイトルの価格を優先）
    const titleRoutes = this.extractRoutes(item.title, item.title);
    const bodyRoutes = this.extractRoutes(articleText);
    const routes = this.mergeRoutes(titleRoutes, bodyRoutes);
    if (routes.length === 0) return null;

    // 日付抽出
    const dates = this.extractDates(fullText, item.pubDate);

    const airlineName = Object.entries(AIRLINE_NAME_TO_CODE)
      .find(([, code]) => code === airlineCode)?.[0] ?? airlineCode;

    const saleName = this.extractSaleName(item.title, airlineName);

    return {
      id: this.generateId([this.feedConfig.idPrefix, airlineCode, dates.startDate]),
      airlineCode,
      airlineName,
      saleName,
      description: item.description.slice(0, 200),
      startDate: dates.startDate,
      endDate: dates.endDate,
      bookingDeadline: dates.bookingDeadline,
      travelPeriodStart: dates.travelStart,
      travelPeriodEnd: dates.travelEnd,
      routes,
      sourceUrl: item.link,
      scrapedAt: new Date().toISOString(),
      isActive: true,
    };
  }

  /**
   * HTMLから記事本文を抽出
   *
   * Traicy (WordPress) の本文は `single-content` コンテナ内。
   * 関連記事・広告・SNSシェア等のノイズを除外して本文だけを返す。
   */
  private extractArticleBody(html: string): string {
    // 本文コンテナ候補（優先順）
    const containerPatterns = [
      /<div[^>]*class="[^"]*single-content[^"]*"[^>]*>([\s\S]*?)<(?:footer|aside|div[^>]*class="[^"]*(?:related|sns|share|footer|sidebar))/i,
      /<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>([\s\S]*?)<(?:footer|aside)/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
    ];

    let body = html;
    for (const pattern of containerPatterns) {
      const match = pattern.exec(html);
      if (match?.[1] && match[1].includes("円")) {
        body = match[1];
        break;
      }
    }

    // ノイズ要素を除去（スクリプト・スタイル・関連記事ブロック）
    body = body
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<(?:aside|nav|footer)[\s\S]*?<\/(?:aside|nav|footer)>/gi, " ");

    // HTMLタグを除去してテキスト抽出
    let text = body
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&yen;/g, "¥")
      .replace(/&#[0-9]+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // 関連記事・他セールのティーザーを切り捨て（ノイズ路線の最大要因）
    // Traicyは本文の後に「関連記事」「あわせて読みたい」「投稿 ○○ は」等が続く
    const cutMarkers = [
      "関連記事",
      "あわせて読みたい",
      "こちらの記事も",
      "おすすめ記事",
      "人気記事",
      "投稿 ",
      "の記事をもっと見る",
      "ピックアップ",
      "TRAICY（トライシー）に最初に表示されました",
    ];
    for (const marker of cutMarkers) {
      const idx = text.indexOf(marker);
      if (idx > 100) {
        text = text.slice(0, idx);
        break;
      }
    }

    return text;
  }

  /**
   * タイトル路線と本文路線をマージ
   * - 同一路線（origin-dest）はタイトル側の価格を優先
   * - 本文路線は最大20件まで（運賃表が長大な記事のノイズ抑制）
   */
  private mergeRoutes(
    titleRoutes: SaleRoute[],
    bodyRoutes: SaleRoute[]
  ): SaleRoute[] {
    const merged = new Map<string, SaleRoute>();
    const valid = (r: SaleRoute) =>
      r.originCode !== r.destinationCode &&
      r.price >= 1000 &&
      r.price <= 500000;

    // タイトル優先
    for (const r of titleRoutes) {
      if (!valid(r)) continue;
      merged.set(`${r.originCode}-${r.destinationCode}`, r);
    }
    // 本文で補完（既存路線は上書きしない、最大12件でノイズ抑制）
    for (const r of bodyRoutes.slice(0, 12)) {
      if (!valid(r)) continue;
      const key = `${r.originCode}-${r.destinationCode}`;
      if (!merged.has(key)) merged.set(key, r);
    }

    return Array.from(merged.values());
  }

  /**
   * テキストからルート情報（路線・価格）を抽出
   * タイトルを優先し、信頼度の低いものはフィルター
   */
  private extractRoutes(text: string, titleOnly?: string): SaleRoute[] {
    const routes: SaleRoute[] = [];
    const seen = new Set<string>();

    // タイトルから抽出を優先（タイトルが提供されている場合）
    const sources = titleOnly ? [titleOnly] : [text];

    // パターン1: "東京→バンコク 38,000円" / "成田-台北 9,800円" / "関空〜ソウルが片道5,980円から"
    // - 区切り文字: →, 〜, ～, ＝, ー
    // - "名古屋/中部" 形式は最後の単語を採用
    // - 都市名はカタカナ・漢字両対応 [一-鿿ァ-ヴー]
    // - "丘珠線が" → "丘珠" + "線が" に分解するため非貪欲マッチ + 後置トークン除外
    const cityChar = "[一-鿿ァ-ヴーｱ-ﾝ]";
    const cityGroup = `(?:${cityChar}+\\/)?(${cityChar}+?)`;
    // 区切り: →, 〜, ～, ＝, -（半角ハイフン）, ー（長音記号は除外、都市名内で使われるため）
    const separator = "[→〜～＝\\-]+";
    const suffixTokens = "(?:線|便|路線|空港|国際線|国内線|発)?";
    // 接続: 空白・「が」「は」「を」「、」「：」など。任意（"ホノルル往復総額"のようにすぐ価格修飾子が来る場合に対応）
    const connector = "(?:[\\s\\u3000がはを：:、]|片道|往復|総額|約|など)*";
    // 価格は「38,000円」だけでなく「16.2万円」「16万円」も拾う (FSC は万円表記が多い)。
    // group1=数値, group2=「万」有無。万があれば ×10000 で換算。
    const priceCapture = "[\\s¥￥]?([0-9,]+(?:\\.[0-9]+)?)\\s*(万)?\\s*円";
    const routePriceRegex = new RegExp(
      `${cityGroup}${separator}${cityGroup}${suffixTokens}${connector}${priceCapture}`,
      "g"
    );

    for (const source of sources) {
      let m;
      while ((m = routePriceRegex.exec(source)) !== null) {
        const originCode = CITY_TO_CODE[m[1]];
        const destCode = CITY_TO_CODE[m[2]];
        if (!originCode || !destCode) continue;

        // 同じ空港コード（NGO→NGOなど）は除外
        if (originCode === destCode) continue;

        const key = `${originCode}-${destCode}`;
        if (seen.has(key)) continue;
        seen.add(key);

        // m[3]=数値, m[4]="万" 有無。万表記は ×10000 で円に換算。
        const rawNum = m[3].replace(/,/g, "");
        const price =
          m[4] === "万"
            ? Math.round(parseFloat(rawNum) * 10000)
            : parseInt(rawNum, 10);
        // 航空券として現実的な範囲のみ（1,000円未満は誤検出、50万円超は外れ値）
        if (isNaN(price) || price < 1000 || price > 500000) continue;

        routes.push({
          origin: m[1],
          originCode,
          destination: m[2],
          destinationCode: destCode,
          price,
          originalPrice: Math.round(price * 2),
          currency: "JPY",
          cabin: "Economy",
          discount: 50,
        });

        // タイトルからの抽出は通常1路線なので、まずタイトルを優先
        if (titleOnly && routes.length >= 3) break;
      }
    }

    // 注: かつて「価格1つ + 都市名列挙」のパターン2フォールバックがあったが、
    // 1つの価格を無関係な複数都市にばらまき大量の誤路線を生成していた
    // （例: 韓国LCCに国内線NRT→CTSが付与される）ため廃止。
    // 明示的な "A〜B X円" 形式（パターン1）のみを信頼する。

    return routes;
  }

  /**
   * テキストから日付情報を抽出
   */
  private extractDates(text: string, pubDate: string) {
    const now = new Date();
    const pub = new Date(pubDate);
    const pubStr = pub.toISOString().split("T")[0];

    // YYYY年MM月DD日 or YYYY/MM/DD パターン
    const dateRegex =
      /(\d{4})[年\/\-](\d{1,2})[月\/\-](\d{1,2})[日]?/g;
    const dates: string[] = [];
    let dm;
    while ((dm = dateRegex.exec(text)) !== null) {
      const y = dm[1];
      const m = dm[2].padStart(2, "0");
      const d = dm[3].padStart(2, "0");
      dates.push(`${y}-${m}-${d}`);
    }

    // MM月DD日 パターン（年なし → 今年と推定）
    const shortDateRegex = /(\d{1,2})月(\d{1,2})日/g;
    while ((dm = shortDateRegex.exec(text)) !== null) {
      const m = dm[1].padStart(2, "0");
      const d = dm[2].padStart(2, "0");
      dates.push(`${now.getFullYear()}-${m}-${d}`);
    }

    dates.sort();

    return {
      startDate: dates[0] ?? pubStr,
      endDate: dates[1] ?? addDays(pubStr, 14),
      bookingDeadline: dates[1] ?? addDays(pubStr, 14),
      travelStart: dates[2] ?? addDays(pubStr, 30),
      travelEnd: dates[3] ?? addDays(pubStr, 180),
    };
  }

  /**
   * タイトルからセール名を抽出
   */
  private extractSaleName(title: string, airlineName: string): string {
    // 「」で囲まれたセール名があればそれを使用
    const quoted = /「([^」]+)」/.exec(title);
    if (quoted) return quoted[1];

    // 航空会社名 + "セール"系キーワードを抽出
    for (const kw of SALE_KEYWORDS) {
      if (title.includes(kw)) {
        return title.replace(/【[^】]+】/g, "").trim();
      }
    }

    return `${airlineName} セール`;
  }
}

// ── ヘルパー ──

const DESTINATION_NAMES_REV: Record<string, string> = {
  NRT: "東京", HND: "羽田", KIX: "大阪", NGO: "名古屋", FUK: "福岡",
};

const CITY_TO_CODE_REV: Record<string, string> = Object.fromEntries(
  Object.entries(CITY_TO_CODE).map(([k, v]) => [v, k])
);

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/**
 * 全航空会社のセール情報をTraicyから一括取得する専用スクレイパー
 */
export class TraicyAllScraper extends TraicyScraper {
  constructor() {
    super("ALL");
  }
}

/**
 * Aviation Wire RSS（航空業界ニュース）。Traicy より幅広く航空関連ニュースを
 * 配信しており、セールキーワードでフィルタした上で同じパーサで処理する。
 * 完全な路線/価格抽出に失敗した記事は静かにスキップされる（routes=0で null）。
 */
export class AviationWireAllScraper extends TraicyScraper {
  constructor() {
    super("ALL", {
      url: "https://www.aviationwire.jp/feed",
      sourceName: "Aviation Wire RSS",
      idPrefix: "aviationwire",
    });
  }
}
