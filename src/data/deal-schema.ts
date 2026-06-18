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
  /**
   * 参考事例フラグ。実スクレイプの在庫が無いときに表示する
   * 「過去のセール傾向に基づく参考例」(mock 由来) を示す。
   * true のディールは UI で「参考事例」とラベリングし、
   * Product JSON-LD 等「現在のオファーの事実表明」は出力しない。
   */
  is_sample?: boolean;
  /**
   * TravelPayouts 等のキャッシュ価格データ由来の「最安運賃の目安」フラグ。
   * 確定価格・確定在庫ではないため:
   *   - Product/Offer JSON-LD (現在オファーの事実表明) は出力しない
   *   - 予約期限カウントダウン・出発/帰着日・支払総額など"確定情報風"の表示を抑制
   *   - 「検索時点の目安」開示を出す
   */
  is_estimate?: boolean;
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
