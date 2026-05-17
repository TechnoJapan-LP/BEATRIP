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
  code: string;
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
