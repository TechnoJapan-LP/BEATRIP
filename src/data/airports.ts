/**
 * 日本国内空港マスタ
 *
 * 主要 (羽田/成田/関空など) から地方 (松山/旭川/石垣など) まで網羅。
 * /airports/[code] ハブページ生成・ホームの「お住まいの地域から」
 * セクション・SEO 内部リンクで利用。
 *
 * データ出典: 国土交通省 空港一覧 (2026年時点)、編集部整理。
 */

export type AirportRegion =
  | "北海道"
  | "東北"
  | "関東"
  | "中部"
  | "近畿"
  | "中国"
  | "四国"
  | "九州"
  | "沖縄";

export type AirportSize = "major" | "regional" | "minor";

export type Airport = {
  /** IATA 3-letter code */
  iata: string;
  /** 日本語名 (松山, 旭川 など) */
  nameJa: string;
  /** 英語名 */
  nameEn: string;
  /** 正式名称 (松山空港, 旭川空港 など) */
  fullNameJa: string;
  region: AirportRegion;
  /** 規模感 — UI でハイライト/絞り込みに使う */
  size: AirportSize;
  /** 所属都道府県 */
  prefecture: string;
  /** 主要な就航先空港 IATA (国内 + 国際を 3-5 個) */
  popularRoutes: string[];
  /**
   * 主に就航している航空会社コード。
   *
   * airlines.ts の `code` と文字列一致で突き合わせて /airlines/[code]/airports/[iata]
   * を生成する (sitemap.ts / airports/[iata]/page.tsx) ため、必ず airlines.ts に
   * 存在する code を使うこと。ここにしかない code (SKY/ZIP/SNA/SFJ/IBX/FDA/JAC)
   * は一致せずページが生成されない。
   */
  airlines: string[];
  /** 空港の特徴・観光誘導の 1 行紹介 */
  tagline?: string;
  /** 公式サイトドメイン (任意) */
  officialDomain?: string;
};

export const AIRPORTS: Airport[] = [
  // ───── 関東 ─────
  {
    iata: "HND",
    nameJa: "羽田",
    nameEn: "Haneda",
    fullNameJa: "東京国際空港 (羽田)",
    region: "関東",
    size: "major",
    prefecture: "東京都",
    popularRoutes: ["CTS", "FUK", "OKA", "ITM", "HNL"],
    airlines: ["ANA", "JAL", "PCH", "SKY"],
    tagline: "都心アクセス抜群・国内線最大ハブ",
    officialDomain: "tokyo-haneda.com",
  },
  {
    iata: "NRT",
    nameJa: "成田",
    nameEn: "Narita",
    fullNameJa: "成田国際空港",
    region: "関東",
    size: "major",
    prefecture: "千葉県",
    popularRoutes: ["BKK", "TPE", "ICN", "HNL", "JFK"],
    airlines: ["ANA", "JAL", "JJP", "PCH", "ZIP", "SJO"],
    tagline: "LCC・国際線が豊富な日本の玄関口",
    officialDomain: "narita-airport.jp",
  },
  {
    iata: "IBR",
    nameJa: "茨城",
    nameEn: "Ibaraki",
    fullNameJa: "茨城空港",
    region: "関東",
    size: "minor",
    prefecture: "茨城県",
    popularRoutes: ["CTS", "FUK", "OKA", "KOJ"],
    airlines: ["SKY", "PCH"],
    tagline: "首都圏第三の空港・LCC格安便",
    officialDomain: "ibaraki-airport.net",
  },

  // ───── 北海道 ─────
  {
    iata: "CTS",
    nameJa: "新千歳",
    nameEn: "New Chitose",
    fullNameJa: "新千歳空港",
    region: "北海道",
    size: "major",
    prefecture: "北海道",
    popularRoutes: ["HND", "NRT", "KIX", "FUK", "OKA"],
    airlines: ["ANA", "JAL", "PCH", "JJP", "AIRDO"],
    tagline: "札幌・道央観光の中心ゲートウェイ",
    officialDomain: "new-chitose-airport.jp",
  },
  {
    iata: "OKD",
    nameJa: "丘珠",
    nameEn: "Okadama",
    fullNameJa: "札幌飛行場 (丘珠)",
    region: "北海道",
    size: "minor",
    prefecture: "北海道",
    popularRoutes: ["HKD", "KUH", "MSJ", "RIS"],
    airlines: ["HAC", "JAL"],
    tagline: "札幌市街地から近い道内路線拠点",
  },
  {
    iata: "HKD",
    nameJa: "函館",
    nameEn: "Hakodate",
    fullNameJa: "函館空港",
    region: "北海道",
    size: "regional",
    prefecture: "北海道",
    popularRoutes: ["HND", "ITM", "NGO", "OKD"],
    airlines: ["ANA", "JAL", "AIRDO"],
    tagline: "函館山夜景と海鮮グルメの玄関口",
    officialDomain: "airport.ne.jp",
  },
  {
    iata: "AKJ",
    nameJa: "旭川",
    nameEn: "Asahikawa",
    fullNameJa: "旭川空港",
    region: "北海道",
    size: "regional",
    prefecture: "北海道",
    popularRoutes: ["HND", "NRT", "ITM", "NGO"],
    airlines: ["ANA", "JAL", "AIRDO", "PCH"],
    tagline: "旭山動物園と道北観光の中心",
    officialDomain: "aapb.co.jp",
  },
  {
    iata: "KUH",
    nameJa: "釧路",
    nameEn: "Kushiro",
    fullNameJa: "たんちょう釧路空港",
    region: "北海道",
    size: "minor",
    prefecture: "北海道",
    popularRoutes: ["HND", "ITM", "CTS", "OKD"],
    airlines: ["ANA", "JAL", "AIRDO"],
    tagline: "釧路湿原・道東観光のベース",
  },
  {
    iata: "OBO",
    nameJa: "帯広",
    nameEn: "Obihiro",
    fullNameJa: "とかち帯広空港",
    region: "北海道",
    size: "minor",
    prefecture: "北海道",
    popularRoutes: ["HND", "AIRDO", "JAL"],
    airlines: ["ANA", "JAL", "AIRDO"],
    tagline: "十勝・帯広グルメと自然の玄関口",
  },
  {
    iata: "WKJ",
    nameJa: "稚内",
    nameEn: "Wakkanai",
    fullNameJa: "稚内空港",
    region: "北海道",
    size: "minor",
    prefecture: "北海道",
    popularRoutes: ["HND", "CTS"],
    airlines: ["ANA"],
    tagline: "日本最北端・利尻礼文へのアクセス",
  },

  // ───── 東北 ─────
  {
    iata: "SDJ",
    nameJa: "仙台",
    nameEn: "Sendai",
    fullNameJa: "仙台国際空港",
    region: "東北",
    size: "major",
    prefecture: "宮城県",
    popularRoutes: ["CTS", "ITM", "FUK", "OKA", "TPE"],
    airlines: ["ANA", "JAL", "PCH", "JJP", "IBX"],
    tagline: "東北最大の拠点空港・牛タンと松島",
    officialDomain: "sendai-airport.co.jp",
  },
  {
    iata: "AOJ",
    nameJa: "青森",
    nameEn: "Aomori",
    fullNameJa: "青森空港",
    region: "東北",
    size: "regional",
    prefecture: "青森県",
    popularRoutes: ["HND", "ITM", "CTS", "FUK"],
    airlines: ["ANA", "JAL", "FDA"],
    tagline: "ねぶた祭・奥入瀬・りんごの里",
  },
  {
    iata: "AXT",
    nameJa: "秋田",
    nameEn: "Akita",
    fullNameJa: "秋田空港",
    region: "東北",
    size: "regional",
    prefecture: "秋田県",
    popularRoutes: ["HND", "ITM", "CTS", "NGO"],
    airlines: ["ANA", "JAL", "FDA"],
    tagline: "竿燈まつり・乳頭温泉郷へ",
  },
  {
    iata: "GAJ",
    nameJa: "山形",
    nameEn: "Yamagata",
    fullNameJa: "山形空港",
    region: "東北",
    size: "minor",
    prefecture: "山形県",
    popularRoutes: ["HND", "ITM", "NGO"],
    airlines: ["JAL", "FDA"],
    tagline: "蔵王・銀山温泉・さくらんぼの郷",
  },
  {
    iata: "HNA",
    nameJa: "花巻",
    nameEn: "Hanamaki",
    fullNameJa: "いわて花巻空港",
    region: "東北",
    size: "minor",
    prefecture: "岩手県",
    popularRoutes: ["ITM", "CTS", "FUK", "NGO"],
    airlines: ["JAL", "FDA"],
    tagline: "平泉・三陸海岸への岩手玄関口",
  },
  {
    iata: "FKS",
    nameJa: "福島",
    nameEn: "Fukushima",
    fullNameJa: "福島空港",
    region: "東北",
    size: "minor",
    prefecture: "福島県",
    popularRoutes: ["ITM", "CTS"],
    airlines: ["ANA", "IBX"],
    tagline: "猪苗代湖・会津若松への入口",
  },

  // ───── 中部 ─────
  {
    iata: "NGO",
    nameJa: "中部国際",
    nameEn: "Chubu Centrair",
    fullNameJa: "中部国際空港セントレア",
    region: "中部",
    size: "major",
    prefecture: "愛知県",
    popularRoutes: ["CTS", "OKA", "FUK", "TPE", "ICN"],
    airlines: ["ANA", "JAL", "PCH", "JJP", "ZIP"],
    tagline: "中部圏最大ハブ・国際線も豊富",
    officialDomain: "centrair.jp",
  },
  {
    iata: "NKM",
    nameJa: "小牧",
    nameEn: "Komaki",
    fullNameJa: "名古屋飛行場 (小牧)",
    region: "中部",
    size: "minor",
    prefecture: "愛知県",
    popularRoutes: ["GAJ", "HNA", "KOJ", "FUK", "KMJ"],
    airlines: ["FDA"],
    tagline: "FDA 地方路線の中部拠点",
  },
  {
    iata: "KIJ",
    nameJa: "新潟",
    nameEn: "Niigata",
    fullNameJa: "新潟空港",
    region: "中部",
    size: "regional",
    prefecture: "新潟県",
    popularRoutes: ["ITM", "FUK", "CTS", "OKA", "ICN"],
    airlines: ["ANA", "JAL", "PCH", "FDA"],
    tagline: "佐渡・越後湯沢・日本酒の郷",
  },
  {
    iata: "KMQ",
    nameJa: "小松",
    nameEn: "Komatsu",
    fullNameJa: "小松空港",
    region: "中部",
    size: "regional",
    prefecture: "石川県",
    popularRoutes: ["HND", "NRT", "FUK", "CTS", "OKA"],
    airlines: ["ANA", "JAL", "IBX"],
    tagline: "金沢・能登半島観光の玄関口",
  },
  {
    iata: "TOY",
    nameJa: "富山",
    nameEn: "Toyama",
    fullNameJa: "富山空港",
    region: "中部",
    size: "minor",
    prefecture: "富山県",
    popularRoutes: ["HND", "CTS", "TPE"],
    airlines: ["ANA", "JAL"],
    tagline: "立山黒部アルペンルートへ",
  },
  {
    iata: "FSZ",
    nameJa: "静岡",
    nameEn: "Mt. Fuji Shizuoka",
    fullNameJa: "富士山静岡空港",
    region: "中部",
    size: "regional",
    prefecture: "静岡県",
    popularRoutes: ["CTS", "FUK", "OKA", "ICN", "TPE"],
    airlines: ["ANA", "FDA", "PCH"],
    tagline: "富士山・伊豆・浜名湖の玄関",
  },
  {
    iata: "HHE",
    nameJa: "庄内",
    nameEn: "Shonai",
    fullNameJa: "庄内空港",
    region: "東北",
    size: "minor",
    prefecture: "山形県",
    popularRoutes: ["HND"],
    airlines: ["ANA"],
    tagline: "出羽三山・鶴岡・酒田の玄関",
  },

  // ───── 近畿 ─────
  {
    iata: "KIX",
    nameJa: "関西",
    nameEn: "Kansai",
    fullNameJa: "関西国際空港",
    region: "近畿",
    size: "major",
    prefecture: "大阪府",
    popularRoutes: ["CTS", "OKA", "TPE", "ICN", "BKK"],
    airlines: ["ANA", "JAL", "PCH", "JJP", "ZIP"],
    tagline: "西日本最大の国際ゲートウェイ",
    officialDomain: "kansai-airport.or.jp",
  },
  {
    iata: "ITM",
    nameJa: "伊丹",
    nameEn: "Itami",
    fullNameJa: "大阪国際空港 (伊丹)",
    region: "近畿",
    size: "major",
    prefecture: "大阪府",
    popularRoutes: ["HND", "CTS", "FUK", "OKA", "NGS"],
    airlines: ["ANA", "JAL", "IBX"],
    tagline: "都心アクセス重視の国内線ハブ",
    officialDomain: "osaka-airport.co.jp",
  },
  {
    iata: "UKB",
    nameJa: "神戸",
    nameEn: "Kobe",
    fullNameJa: "神戸空港",
    region: "近畿",
    size: "regional",
    prefecture: "兵庫県",
    popularRoutes: ["HND", "CTS", "OKA", "KOJ", "ISG"],
    airlines: ["ANA", "PCH", "SKY"],
    tagline: "三宮直結・コンパクトで使いやすい",
    officialDomain: "kairport.co.jp",
  },

  // ───── 中国 ─────
  {
    iata: "HIJ",
    nameJa: "広島",
    nameEn: "Hiroshima",
    fullNameJa: "広島空港",
    region: "中国",
    size: "regional",
    prefecture: "広島県",
    popularRoutes: ["HND", "CTS", "OKA", "TPE", "ICN"],
    airlines: ["ANA", "JAL", "PCH", "IBX"],
    tagline: "原爆ドーム・宮島観光の玄関口",
    officialDomain: "hij.airport.jp",
  },
  {
    iata: "OKJ",
    nameJa: "岡山",
    nameEn: "Okayama",
    fullNameJa: "岡山桃太郎空港",
    region: "中国",
    size: "regional",
    prefecture: "岡山県",
    popularRoutes: ["HND", "CTS", "OKA", "TPE", "ICN"],
    airlines: ["ANA", "JAL", "PCH"],
    tagline: "倉敷美観地区・瀬戸内観光の玄関",
  },
  {
    iata: "YGJ",
    nameJa: "米子",
    nameEn: "Yonago",
    fullNameJa: "米子鬼太郎空港",
    region: "中国",
    size: "minor",
    prefecture: "鳥取県",
    popularRoutes: ["HND", "ICN"],
    airlines: ["ANA"],
    tagline: "大山・出雲大社・境港のゲート",
  },
  {
    iata: "TTJ",
    nameJa: "鳥取",
    nameEn: "Tottori",
    fullNameJa: "鳥取砂丘コナン空港",
    region: "中国",
    size: "minor",
    prefecture: "鳥取県",
    popularRoutes: ["HND"],
    airlines: ["ANA"],
    tagline: "鳥取砂丘・コナンの里へ",
  },
  {
    iata: "IZO",
    nameJa: "出雲",
    nameEn: "Izumo",
    fullNameJa: "出雲縁結び空港",
    region: "中国",
    size: "minor",
    prefecture: "島根県",
    popularRoutes: ["HND", "ITM", "FUK", "NGO"],
    airlines: ["JAL", "FDA"],
    tagline: "出雲大社・縁結びの聖地",
  },
  {
    iata: "UBJ",
    nameJa: "山口宇部",
    nameEn: "Yamaguchi Ube",
    fullNameJa: "山口宇部空港",
    region: "中国",
    size: "minor",
    prefecture: "山口県",
    popularRoutes: ["HND"],
    airlines: ["ANA", "JAL"],
    tagline: "萩・角島・秋吉台のアクセス",
  },
  {
    iata: "IWK",
    nameJa: "岩国",
    nameEn: "Iwakuni",
    fullNameJa: "岩国錦帯橋空港",
    region: "中国",
    size: "minor",
    prefecture: "山口県",
    popularRoutes: ["HND", "OKA"],
    airlines: ["ANA"],
    tagline: "錦帯橋・宮島対岸の便利空港",
  },

  // ───── 四国 ─────
  {
    iata: "MYJ",
    nameJa: "松山",
    nameEn: "Matsuyama",
    fullNameJa: "松山空港",
    region: "四国",
    size: "regional",
    prefecture: "愛媛県",
    popularRoutes: ["HND", "ITM", "FUK", "OKA", "ICN"],
    airlines: ["ANA", "JAL", "PCH", "JJP"],
    tagline: "道後温泉の玄関口・しまなみ海道",
    officialDomain: "matsuyama-airport.co.jp",
  },
  {
    iata: "TAK",
    nameJa: "高松",
    nameEn: "Takamatsu",
    fullNameJa: "高松空港",
    region: "四国",
    size: "regional",
    prefecture: "香川県",
    popularRoutes: ["HND", "NRT", "OKA", "ICN", "TPE"],
    airlines: ["ANA", "JAL", "JJP"],
    tagline: "讃岐うどん・小豆島・直島の入口",
  },
  {
    iata: "KCZ",
    nameJa: "高知",
    nameEn: "Kochi",
    fullNameJa: "高知龍馬空港",
    region: "四国",
    size: "minor",
    prefecture: "高知県",
    popularRoutes: ["HND", "ITM", "FUK", "NGO"],
    airlines: ["ANA", "JAL", "JJP", "FDA"],
    tagline: "桂浜・四万十川・坂本龍馬の郷",
  },
  {
    iata: "TKS",
    nameJa: "徳島",
    nameEn: "Tokushima",
    fullNameJa: "徳島阿波おどり空港",
    region: "四国",
    size: "minor",
    prefecture: "徳島県",
    popularRoutes: ["HND", "FUK"],
    airlines: ["ANA", "JAL"],
    tagline: "阿波おどり・鳴門の渦潮",
  },

  // ───── 九州 ─────
  {
    iata: "FUK",
    nameJa: "福岡",
    nameEn: "Fukuoka",
    fullNameJa: "福岡空港",
    region: "九州",
    size: "major",
    prefecture: "福岡県",
    popularRoutes: ["HND", "CTS", "OKA", "ITM", "ICN"],
    airlines: ["ANA", "JAL", "PCH", "JJP", "SFJ"],
    tagline: "市街地直結・九州最大ハブ",
    officialDomain: "fukuoka-airport.jp",
  },
  {
    iata: "KKJ",
    nameJa: "北九州",
    nameEn: "Kitakyushu",
    fullNameJa: "北九州空港",
    region: "九州",
    size: "regional",
    prefecture: "福岡県",
    popularRoutes: ["HND", "NRT", "OKA"],
    airlines: ["SFJ", "JJP"],
    tagline: "24時間運用・深夜便も使える",
  },
  {
    iata: "HSG",
    nameJa: "佐賀",
    nameEn: "Saga",
    fullNameJa: "九州佐賀国際空港",
    region: "九州",
    size: "minor",
    prefecture: "佐賀県",
    popularRoutes: ["HND", "CTS", "OKA"],
    airlines: ["ANA", "PCH"],
    tagline: "有田焼・嬉野温泉・福岡からも近い",
  },
  {
    iata: "NGS",
    nameJa: "長崎",
    nameEn: "Nagasaki",
    fullNameJa: "長崎空港",
    region: "九州",
    size: "major",
    prefecture: "長崎県",
    popularRoutes: ["HND", "ITM", "CTS", "OKA", "ICN"],
    airlines: ["ANA", "JAL", "PCH", "JJP"],
    tagline: "ハウステンボス・夜景・異国情緒",
  },
  {
    iata: "KMJ",
    nameJa: "熊本",
    nameEn: "Kumamoto",
    fullNameJa: "阿蘇くまもと空港",
    region: "九州",
    size: "regional",
    prefecture: "熊本県",
    popularRoutes: ["HND", "ITM", "CTS", "OKA", "TPE"],
    airlines: ["ANA", "JAL", "PCH", "FDA"],
    tagline: "阿蘇山・くまモン・天草の玄関",
  },
  {
    iata: "OIT",
    nameJa: "大分",
    nameEn: "Oita",
    fullNameJa: "大分空港",
    region: "九州",
    size: "regional",
    prefecture: "大分県",
    popularRoutes: ["HND", "ITM", "OKA", "ICN"],
    airlines: ["ANA", "JAL", "SNA"],
    tagline: "別府・由布院温泉の玄関口",
  },
  {
    iata: "KMI",
    nameJa: "宮崎",
    nameEn: "Miyazaki",
    fullNameJa: "宮崎ブーゲンビリア空港",
    region: "九州",
    size: "regional",
    prefecture: "宮崎県",
    popularRoutes: ["HND", "ITM", "FUK", "OKA", "ICN"],
    airlines: ["ANA", "JAL", "PCH", "SNA"],
    tagline: "高千穂・青島・南国リゾート",
  },
  {
    iata: "KOJ",
    nameJa: "鹿児島",
    nameEn: "Kagoshima",
    fullNameJa: "鹿児島空港",
    region: "九州",
    size: "regional",
    prefecture: "鹿児島県",
    popularRoutes: ["HND", "ITM", "OKA", "TPE", "ICN"],
    airlines: ["ANA", "JAL", "PCH", "JJP", "JAC"],
    tagline: "桜島・指宿温泉・離島へのハブ",
  },
  {
    iata: "TNE",
    nameJa: "種子島",
    nameEn: "Tanegashima",
    fullNameJa: "種子島空港",
    region: "九州",
    size: "minor",
    prefecture: "鹿児島県",
    popularRoutes: ["KOJ", "OKA"],
    airlines: ["JAC"],
    tagline: "宇宙センターとサーフィンの島",
  },
  {
    iata: "KUM",
    nameJa: "屋久島",
    nameEn: "Yakushima",
    fullNameJa: "屋久島空港",
    region: "九州",
    size: "minor",
    prefecture: "鹿児島県",
    popularRoutes: ["KOJ", "ITM", "FUK"],
    airlines: ["JAC"],
    tagline: "縄文杉・世界自然遺産の島",
  },
  {
    iata: "ASJ",
    nameJa: "奄美",
    nameEn: "Amami",
    fullNameJa: "奄美空港",
    region: "九州",
    size: "minor",
    prefecture: "鹿児島県",
    popularRoutes: ["HND", "ITM", "KOJ", "OKA"],
    airlines: ["JAL", "JAC", "PCH"],
    tagline: "亜熱帯の島・ダイビングと島唄",
  },

  // ───── 沖縄 ─────
  {
    iata: "OKA",
    nameJa: "那覇",
    nameEn: "Naha",
    fullNameJa: "那覇空港",
    region: "沖縄",
    size: "major",
    prefecture: "沖縄県",
    popularRoutes: ["HND", "NRT", "KIX", "FUK", "TPE"],
    airlines: ["ANA", "JAL", "PCH", "JJP", "SNA"],
    tagline: "沖縄観光・離島ホッピングの起点",
    officialDomain: "naha-airport.co.jp",
  },
  {
    iata: "ISG",
    nameJa: "石垣",
    nameEn: "Ishigaki",
    fullNameJa: "南ぬ島石垣空港",
    region: "沖縄",
    size: "regional",
    prefecture: "沖縄県",
    popularRoutes: ["HND", "NRT", "KIX", "OKA", "TPE"],
    airlines: ["ANA", "JAL", "PCH", "JJP", "SNA"],
    tagline: "八重山諸島・川平湾の青い海",
  },
  {
    iata: "MMY",
    nameJa: "宮古",
    nameEn: "Miyako",
    fullNameJa: "宮古空港",
    region: "沖縄",
    size: "regional",
    prefecture: "沖縄県",
    popularRoutes: ["HND", "KIX", "OKA", "ISG"],
    airlines: ["ANA", "JAL", "PCH", "SNA"],
    tagline: "宮古ブルーの海とビーチリゾート",
  },
  {
    iata: "RNJ",
    nameJa: "与論",
    nameEn: "Yoron",
    fullNameJa: "与論空港",
    region: "九州",
    size: "minor",
    prefecture: "鹿児島県",
    popularRoutes: ["KOJ", "OKA", "ASJ"],
    airlines: ["JAC"],
    tagline: "百合ヶ浜・透明度抜群の最南端の島",
  },
];

const AIRPORT_BY_CODE: Record<string, Airport> = Object.fromEntries(
  AIRPORTS.map((a) => [a.iata, a])
);

export function getAirportByCode(iata: string): Airport | undefined {
  return AIRPORT_BY_CODE[iata];
}

export function getAirportsByRegion(region: AirportRegion): Airport[] {
  return AIRPORTS.filter((a) => a.region === region);
}

export function getMajorAirports(): Airport[] {
  return AIRPORTS.filter((a) => a.size === "major");
}

/** regional + minor を合わせて返す (地方空港セクション用) */
export function getRegionalAirports(): Airport[] {
  return AIRPORTS.filter((a) => a.size === "regional" || a.size === "minor");
}
