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
  // TravelPayouts の価格ウォッチが返す目的地の補完。
  // 未登録だと記事・SNS投稿に IATA が生で出て読者に伝わらないため随時追加する。
  ALA: "アルマトイ", LED: "サンクトペテルブルク", SVO: "モスクワ",
  NHA: "ニャチャン", CMB: "コロンボ", MFM: "マカオ", PUS: "釜山",
  CJU: "済州", KHH: "高雄", CEB: "セブ", BKI: "コタキナバル",
  DPS: "バリ", PKX: "北京", MXP: "ミラノ", MAD: "マドリード",
  VIE: "ウィーン", PRG: "プラハ", MUC: "ミュンヘン", ATH: "アテネ",
  BER: "ベルリン", LIS: "リスボン", ZRH: "チューリッヒ", CPH: "コペンハーゲン",
  ARN: "ストックホルム", OSL: "オスロ", DUB: "ダブリン", BRU: "ブリュッセル",
  WAW: "ワルシャワ", BUD: "ブダペスト", MEL: "メルボルン", BNE: "ブリスベン",
  CNS: "ケアンズ", OOL: "ゴールドコースト", CHC: "クライストチャーチ",
  ZQN: "クイーンズタウン", YYZ: "トロント", YUL: "モントリオール",
  SEA: "シアトル", LAS: "ラスベガス", MIA: "マイアミ", BOS: "ボストン",
  IAD: "ワシントン", DFW: "ダラス", ATL: "アトランタ", DEN: "デンバー",
  AUH: "アブダビ", DOH: "ドーハ", CAI: "カイロ", BOG: "ボゴタ",
  GRU: "サンパウロ", LIM: "リマ", MEX: "メキシコシティ", SPN: "サイパン",
  ROR: "パラオ", NAN: "ナンディ", VTE: "ビエンチャン", PNH: "プノンペン",
  REP: "シェムリアップ", RGN: "ヤンゴン", DAD: "ダナン", HPH: "ハイフォン",
  TAO: "青島", CAN: "広州", SZX: "深セン", XIY: "西安", CTU: "成都",
  KMG: "昆明", DLC: "大連", SHE: "瀋陽", TSN: "天津", CKG: "重慶",
  // 国内の補完
  MMB: "女満別", SHM: "南紀白浜", IWJ: "石見", TOY: "富山", KMQ: "小松",
  ASJ: "奄美", TTJ: "鳥取", IZO: "出雲", YGJ: "米子", FSZ: "静岡",
  HAC: "八丈島", UBJ: "山口宇部", MSJ: "三沢", ONJ: "大館能代",
  SHB: "中標津", RIS: "利尻", MBE: "紋別", KUM: "屋久島", TKN: "徳之島",
};

/** 空港コードを日本語都市名に。未知コードはそのまま返す */
export function cityNameJa(code: string): string {
  return CITY_NAMES_JA[code] ?? code;
}

/** "東京→鹿児島" 形式の路線文字列 */
export function routeNameJa(originCode: string, destCode: string): string {
  return `${cityNameJa(originCode)}→${cityNameJa(destCode)}`;
}

/**
 * 空港コード → 英語都市名（Hotellook等の外部アフィリエイト検索用）。
 * 英語名で渡すと検索結果が確実に解決するため別途保持する。
 */
export const CITY_NAMES_EN: Record<string, string> = {
  NRT: "Tokyo", HND: "Tokyo", KIX: "Osaka", ITM: "Osaka", NGO: "Nagoya",
  NKM: "Nagoya", FUK: "Fukuoka", CTS: "Sapporo", OKD: "Sapporo",
  OKA: "Okinawa", HIJ: "Hiroshima", KOJ: "Kagoshima", SDJ: "Sendai",
  KMJ: "Kumamoto", KMI: "Miyazaki", NGS: "Nagasaki", OIT: "Oita",
  AOJ: "Aomori", AXT: "Akita", GAJ: "Yamagata", HKD: "Hakodate",
  AKJ: "Asahikawa", KUH: "Kushiro", OBO: "Obihiro", WKJ: "Wakkanai",
  KKJ: "Kitakyushu", OKJ: "Okayama", MYJ: "Matsuyama", KCZ: "Kochi",
  TAK: "Takamatsu", TKS: "Tokushima", ISG: "Ishigaki", MMY: "Miyako",
  KIJ: "Niigata", UKB: "Kobe", HSG: "Saga",
  BKK: "Bangkok", TPE: "Taipei", ICN: "Seoul", SIN: "Singapore",
  HKG: "Hong Kong", MNL: "Manila", SGN: "Ho Chi Minh City",
  HAN: "Hanoi", PVG: "Shanghai", PEK: "Beijing", DXB: "Dubai",
  DEL: "Delhi", BOM: "Mumbai", KUL: "Kuala Lumpur", CDG: "Paris",
  LHR: "London", HEL: "Helsinki", FCO: "Rome", BCN: "Barcelona",
  FRA: "Frankfurt", AMS: "Amsterdam", IST: "Istanbul",
  JFK: "New York", LAX: "Los Angeles", SFO: "San Francisco",
  ORD: "Chicago", YVR: "Vancouver", SYD: "Sydney", AKL: "Auckland",
  HNL: "Honolulu", GUM: "Guam", HRB: "Harbin",
};

/** 空港コードを英語都市名に。未知コードはそのまま返す */
export function cityNameEn(code: string): string {
  return CITY_NAMES_EN[code] ?? code;
}
