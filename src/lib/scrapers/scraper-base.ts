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
      return await res.text();
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
