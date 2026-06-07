import type { AirlineSale, ScrapeResult, ScrapeSource } from "./types";

export abstract class AirlineScraper {
  protected airlineCode: string;
  protected sources: ScrapeSource[];

  constructor(airlineCode: string, sources: ScrapeSource[]) {
    this.airlineCode = airlineCode;
    this.sources = sources;
  }

  async scrape(): Promise<ScrapeResult> {
    const scrapedAt = new Date().toISOString();
    try {
      const sales = await this.fetchSales();
      return {
        airlineCode: this.airlineCode,
        sales,
        scrapedAt,
        success: true,
      };
    } catch (error) {
      return {
        airlineCode: this.airlineCode,
        sales: [],
        scrapedAt,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  protected abstract fetchSales(): Promise<AirlineSale[]>;

  /** スクレイパー応答 size 上限 (10 MB)。これを超えると DoS リスクのため中断 */
  protected static readonly MAX_RESPONSE_BYTES = 10 * 1024 * 1024;

  protected async fetchHtml(url: string, timeoutMs = 8000): Promise<string> {
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

      // Content-Length を事前 check (悪意あるサイトの巨大レスポンス防御)
      const declaredSize = parseInt(
        res.headers.get("content-length") ?? "0",
        10
      );
      if (declaredSize > AirlineScraper.MAX_RESPONSE_BYTES) {
        throw new Error(
          `Response too large (${declaredSize} bytes): ${url}`
        );
      }

      // ストリームで読みつつ累積サイズを check
      const reader = res.body?.getReader();
      if (!reader) return await res.text();
      const chunks: Uint8Array[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value.length;
        if (received > AirlineScraper.MAX_RESPONSE_BYTES) {
          controller.abort();
          throw new Error(`Response exceeded size limit: ${url}`);
        }
        chunks.push(value);
      }
      const merged = new Uint8Array(received);
      let off = 0;
      for (const c of chunks) {
        merged.set(c, off);
        off += c.length;
      }
      return new TextDecoder("utf-8").decode(merged);
    } catch (e) {
      if (e instanceof Error && e.name === "AbortError") {
        throw new Error(`Timeout (${timeoutMs}ms): ${url}`);
      }
      throw e;
    } finally {
      clearTimeout(timer);
    }
  }

  protected generateId(parts: string[]): string {
    return parts.join("-").toLowerCase().replace(/\s+/g, "-");
  }
}
