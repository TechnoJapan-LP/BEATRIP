/**
 * 空港コード → 日本語都市名（サイト全体で共通利用）
 *
 * 出発地・行き先が IATA コードだけだと一般ユーザーには伝わらないため、
 * カード・記事・関連リスト等あらゆる箇所でこの変換を使う。
 */
export const CITY_NAMES_JA: Record<string, string> = {
  // 国内
  NRT: "東京", HND: "東京", KIX: "大阪", ITM: "大阪", NGO: "名古屋",
  NKM: "名古屋(小牧)", FUK: "福岡", CTS: "札幌", OKD: "札幌(丘珠)",
  OKA: "沖縄", HIJ: "広島", KOJ: "鹿児島", SDJ: "仙台", KMJ: "熊本",
  KMI: "宮崎", NGS: "長崎", OIT: "大分", AOJ: "青森", AXT: "秋田",
  GAJ: "山形", HKD: "函館", AKJ: "旭川", KUH: "釧路", OBO: "帯広",
  WKJ: "稚内", KKJ: "北九州", OKJ: "岡山", MYJ: "松山", KCZ: "高知",
  TAK: "高松", TKS: "徳島", ISG: "石垣", MMY: "宮古", KIJ: "新潟",
  UKB: "神戸", HSG: "佐賀",
  // 国際
  BKK: "バンコク", TPE: "台北", ICN: "ソウル", SIN: "シンガポール",
  HKG: "香港", MNL: "マニラ", SGN: "ホーチミン", HAN: "ハノイ",
  PVG: "上海", PEK: "北京", DXB: "ドバイ", DEL: "デリー",
  BOM: "ムンバイ", KUL: "クアラルンプール", CDG: "パリ", LHR: "ロンドン",
  HEL: "ヘルシンキ", FCO: "ローマ", BCN: "バルセロナ",
  FRA: "フランクフルト", AMS: "アムステルダム", IST: "イスタンブール",
  JFK: "ニューヨーク", LAX: "ロサンゼルス", SFO: "サンフランシスコ",
  ORD: "シカゴ", YVR: "バンクーバー", SYD: "シドニー", AKL: "オークランド",
  HNL: "ホノルル", GUM: "グアム", HRB: "ハルビン",
};

/** 空港コードを日本語都市名に。未知コードはそのまま返す */
export function cityNameJa(code: string): string {
  return CITY_NAMES_JA[code] ?? code;
}

/** "東京→鹿児島" 形式の路線文字列 */
export function routeNameJa(originCode: string, destCode: string): string {
  return `${cityNameJa(originCode)}→${cityNameJa(destCode)}`;
}
