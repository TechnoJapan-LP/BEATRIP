export type DealSchema = {
  id: string;
  airline_id: string;
  airline_name: string;
  origin: string;
  origin_code: string;
  destination: string;
  destination_code: string;
  original_price: number;
  sale_price: number;
  fuel_surcharge: number;
  taxes: number;
  total_cost: number;
  is_total_cost: boolean;
  currency: string;
  discount_percent: number;
  confidence_score: number;
  cabin: "Economy" | "Premium Economy" | "Business" | "First";
  badge: "NEW" | "ENDING_SOON" | "LOWEST_IN_2_YEARS" | null;
  image_url: string;
  is_niche_lcc: boolean;
  is_hidden_gem: boolean;
  departure_date: string;
  return_date: string;
  booking_deadline: string;
  sale_id: string;
  sale_name: string;
  seats_remaining?: number;
  created_at: string;
  updated_at: string;
  affiliate_url?: string;
  affiliate_provider?: string;
};

export type ClickEvent = {
  deal_id: string;
  affiliate_provider: string;
  affiliate_url: string;
  timestamp: string;
  referrer: string;
  /**
   * 配置位置 (どの導線からのクリックか)。
   * 例: hero / pill / highlight / sticky / exit-modal / cross-sell / compare。
   * 後方互換のため任意。未送信のイベントは undefined。
   */
  placement?: string;
};

export type DealHistoricalPrice = {
  deal_id: string;
  route_key: string;
  month: number;
  year: number;
  avg_price: number;
  min_price: number;
  sample_count: number;
};

export type BestTimeToBook = {
  route_key: string;
  best_month: number;
  best_month_name: string;
  avg_saving_percent: number;
  confidence_score: number;
  historical_prices: MonthlyAverage[];
};

export type MonthlyAverage = {
  month: number;
  month_name: string;
  avg_price: number;
  min_price: number;
  is_best: boolean;
};
