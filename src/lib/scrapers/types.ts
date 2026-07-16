export type AirlineSale = {
  id: string;
  airlineCode: string;
  airlineName: string;
  saleName: string;
  description: string;
  startDate: string;
  endDate: string;
  bookingDeadline: string;
  travelPeriodStart: string;
  travelPeriodEnd: string;
  routes: SaleRoute[];
  sourceUrl: string;
  scrapedAt: string;
  isActive: boolean;
};

export type SaleRoute = {
  origin: string;
  originCode: string;
  destination: string;
  destinationCode: string;
  price: number;
  originalPrice: number;
  currency: string;
  cabin: "Economy" | "Premium Economy" | "Business" | "First";
  discount: number;
  seatsRemaining?: number;
};

export type AirlineProfile = {
  /** 正規コード。URL (/airlines/[code]) と deal.airline_id はこれを使う */
  code: string;
  /**
   * 他データが同じ社を指すのに使う別表記 (ICAO・旧社名由来の略号など)。
   * URL には出さず、突き合わせでのみ解決する。
   * 例: airports.ts は スカイマーク を ICAO の "SKY" で持っている。
   */
  aliases?: string[];
  name: string;
  nameEn: string;
  logo: string;
  color: string;
  type: "FSC" | "LCC";
  country: string;
  scrapeSources: ScrapeSource[];
};

export type ScrapeSource = {
  name: string;
  url: string;
  type: "rss" | "html" | "api";
  selector?: string;
};

export type ScrapeResult = {
  airlineCode: string;
  sales: AirlineSale[];
  scrapedAt: string;
  success: boolean;
  error?: string;
};
