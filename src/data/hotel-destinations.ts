/**
 * ホテル特集の対象目的地マスタ
 *
 * URL slug は kebab-case の英語都市名（SEO上わかりやすい）。
 * IATA コードは関連フライト検索に使う（同一都市の複数空港を束ねる）。
 * descriptions は短くてOK — 同じ都市を何度も同じ文章で出すと thin content
 * 扱いされるため、エリア解説など実コンテンツはページ側で展開する。
 */

import { getDestinationImage } from "@/lib/deals/destination-images";

export type Region = "国内" | "アジア" | "欧州" | "米州" | "オセアニア・その他";

export type HotelDestination = {
  slug: string;
  nameJa: string;
  nameEn: string;
  iataCodes: string[]; // 同一都市の複数空港（東京=NRT+HND等）
  region: Region;
  /** 検索意図に効く短い形容（タイトル/メタで使用） */
  tagline: string;
  /** 観光中心地・エリアの簡易ガイド（FAQ生成にも利用） */
  areas: string[];
  /** ベストシーズン or 旅行向きの月 */
  bestSeason: string;
  /** 1泊あたりの相場目安（円・3つ星クラス想定） */
  priceFromJpy?: number;
  /** ヒーロー画像（destination-images map から自動取得） */
  image?: string;
  /** 国名（英語）— Airalo eSIM 等の国別ページで利用 */
  countryEn?: string;
  /** Airalo の国slug（{slug}-esim）。countryEn と異なる場合のみ指定 */
  airaloSlug?: string;
};

const RAW: Omit<HotelDestination, "image">[] = [
  // ── 国内（高需要・休日旅行需要） ──
  {
    slug: "tokyo", nameJa: "東京", nameEn: "Tokyo",
    iataCodes: ["NRT", "HND"], region: "国内",
    tagline: "ビジネスから観光まで・選択肢が豊富",
    areas: ["新宿・渋谷（夜の街・ショッピング）", "東京・銀座（観光・ビジネス）", "浅草・上野（下町・観光）"],
    bestSeason: "通年（桜は3-4月、紅葉は11月）",
    priceFromJpy: 8000,
  },
  {
    slug: "osaka", nameJa: "大阪", nameEn: "Osaka",
    iataCodes: ["KIX", "ITM", "UKB"], region: "国内",
    tagline: "グルメと観光の拠点・USJ・道頓堀",
    areas: ["難波・心斎橋（グルメ・買物）", "梅田（駅近・ビジネス）", "ベイエリア（USJ近郊）"],
    bestSeason: "春・秋",
    priceFromJpy: 6500,
  },
  {
    slug: "sapporo", nameJa: "札幌", nameEn: "Sapporo",
    iataCodes: ["CTS", "OKD"], region: "国内",
    tagline: "雪まつり・グルメ・温泉",
    areas: ["すすきの（中心街）", "札幌駅周辺（駅近・観光）"],
    bestSeason: "冬（雪まつり2月）・夏（ラベンダー）",
    priceFromJpy: 6000,
  },
  {
    slug: "fukuoka", nameJa: "福岡", nameEn: "Fukuoka",
    iataCodes: ["FUK"], region: "国内",
    tagline: "屋台・ラーメン・空港アクセス抜群",
    areas: ["博多（駅近）", "天神（繁華街）", "中洲（屋台）"],
    bestSeason: "春・秋",
    priceFromJpy: 5500,
  },
  {
    slug: "okinawa", nameJa: "沖縄", nameEn: "Okinawa",
    iataCodes: ["OKA"], region: "国内",
    tagline: "ビーチリゾート・沖縄料理",
    areas: ["那覇（街中・国際通り）", "恩納村（リゾートホテル）", "石垣島（離島ステイ）"],
    bestSeason: "4-10月（梅雨6月は注意）",
    priceFromJpy: 7000,
  },
  {
    slug: "hiroshima", nameJa: "広島", nameEn: "Hiroshima",
    iataCodes: ["HIJ"], region: "国内",
    tagline: "原爆ドーム・宮島・お好み焼き",
    areas: ["広島駅周辺", "平和記念公園エリア", "宮島（厳島）"],
    bestSeason: "春・秋",
    priceFromJpy: 5500,
  },
  {
    slug: "nagoya", nameJa: "名古屋", nameEn: "Nagoya",
    iataCodes: ["NGO", "NKM"], region: "国内",
    tagline: "中部の拠点・名古屋飯・ナガシマスパーランド",
    areas: ["名古屋駅周辺", "栄（繁華街）"],
    bestSeason: "春・秋",
    priceFromJpy: 5500,
  },
  {
    slug: "sendai", nameJa: "仙台", nameEn: "Sendai",
    iataCodes: ["SDJ"], region: "国内",
    tagline: "牛タン・松島観光・温泉アクセス",
    areas: ["仙台駅周辺", "国分町（繁華街）"],
    bestSeason: "夏（七夕）・秋",
    priceFromJpy: 5500,
  },

  // ── アジア（東南アジア・東アジア） ──
  {
    slug: "bangkok", nameJa: "バンコク", nameEn: "Bangkok",
    iataCodes: ["BKK"], region: "アジア",
    tagline: "コスパ最強・グルメ・観光・ナイトライフ",
    areas: ["スクンビット（観光・グルメ）", "サイアム（ショッピング）", "シーロム（夜遊び）"],
    bestSeason: "11-2月（乾季）",
    priceFromJpy: 4000,
  },
  {
    slug: "seoul", nameJa: "ソウル", nameEn: "Seoul",
    iataCodes: ["ICN"], region: "アジア",
    tagline: "コスメ・グルメ・近場で気軽",
    areas: ["明洞（観光・コスメ）", "弘大（若者文化）", "江南（おしゃれ）"],
    bestSeason: "春（桜4月）・秋（紅葉10-11月）",
    priceFromJpy: 6000,
  },
  {
    slug: "taipei", nameJa: "台北", nameEn: "Taipei",
    iataCodes: ["TPE"], region: "アジア",
    tagline: "夜市・小籠包・温泉",
    areas: ["西門町（観光）", "中山（ホテル街）", "信義（モダン）"],
    bestSeason: "10-4月（夏は雨）",
    priceFromJpy: 5000,
  },
  {
    slug: "singapore", nameJa: "シンガポール", nameEn: "Singapore",
    iataCodes: ["SIN"], region: "アジア",
    tagline: "マリーナベイ・グルメ・治安抜群",
    areas: ["マリーナベイ", "オーチャード（買物）", "セントーサ島"],
    bestSeason: "2-4月（雨が少なめ）",
    priceFromJpy: 12000,
  },
  {
    slug: "hong-kong", nameJa: "香港", nameEn: "Hong Kong",
    iataCodes: ["HKG"], region: "アジア",
    tagline: "夜景・点心・コンパクト観光",
    areas: ["中環（観光）", "尖沙咀（夜景）", "ディズニーランド近郊"],
    bestSeason: "10-12月",
    priceFromJpy: 9000,
  },
  {
    slug: "hanoi", nameJa: "ハノイ", nameEn: "Hanoi",
    iataCodes: ["HAN"], region: "アジア",
    tagline: "旧市街・フォー・歴史と現代",
    areas: ["旧市街", "西湖周辺"],
    bestSeason: "10-4月",
    priceFromJpy: 3500,
  },
  {
    slug: "ho-chi-minh-city", nameJa: "ホーチミン", nameEn: "Ho Chi Minh City",
    iataCodes: ["SGN"], region: "アジア",
    tagline: "ベトナム最大都市・グルメ・コスパ",
    areas: ["1区（観光中心）", "3区（ローカル）"],
    bestSeason: "12-4月（乾季）",
    priceFromJpy: 3500,
  },
  {
    slug: "shanghai", nameJa: "上海", nameEn: "Shanghai",
    iataCodes: ["PVG"], region: "アジア",
    tagline: "外灘・グルメ・近代都市",
    areas: ["外灘・南京路", "豫園周辺"],
    bestSeason: "春・秋",
    priceFromJpy: 6500,
  },
  {
    slug: "manila", nameJa: "マニラ", nameEn: "Manila",
    iataCodes: ["MNL"], region: "アジア",
    tagline: "セブ・ボラカイへの拠点",
    areas: ["マカティ（ビジネス）", "イントラムロス（観光）"],
    bestSeason: "11-4月",
    priceFromJpy: 4500,
  },

  // ── 欧州 ──
  {
    slug: "paris", nameJa: "パリ", nameEn: "Paris",
    iataCodes: ["CDG"], region: "欧州",
    tagline: "芸術・グルメ・ロマンチック",
    areas: ["1区（ルーブル近郊）", "マレ地区", "モンマルトル"],
    bestSeason: "4-6月、9-10月",
    priceFromJpy: 15000,
  },
  {
    slug: "london", nameJa: "ロンドン", nameEn: "London",
    iataCodes: ["LHR"], region: "欧州",
    tagline: "歴史・ミュージカル・ショッピング",
    areas: ["セントラル（観光）", "コヴェントガーデン", "ノッティングヒル"],
    bestSeason: "5-9月",
    priceFromJpy: 14000,
  },
  {
    slug: "helsinki", nameJa: "ヘルシンキ", nameEn: "Helsinki",
    iataCodes: ["HEL"], region: "欧州",
    tagline: "北欧デザイン・オーロラへの拠点",
    areas: ["市中心部", "デザイン地区"],
    bestSeason: "6-8月（夏）、12-3月（冬・オーロラ）",
    priceFromJpy: 11000,
  },
  {
    slug: "rome", nameJa: "ローマ", nameEn: "Rome",
    iataCodes: ["FCO"], region: "欧州",
    tagline: "歴史遺産・グルメ",
    areas: ["コロッセオ周辺", "ヴァチカン近郊"],
    bestSeason: "4-6月、9-10月",
    priceFromJpy: 11000,
  },
  {
    slug: "barcelona", nameJa: "バルセロナ", nameEn: "Barcelona",
    iataCodes: ["BCN"], region: "欧州",
    tagline: "ガウディ・ビーチ・タパス",
    areas: ["ゴシック地区", "エイシャンプラ"],
    bestSeason: "5-6月、9-10月",
    priceFromJpy: 10000,
  },

  // ── 米州 ──
  {
    slug: "new-york", nameJa: "ニューヨーク", nameEn: "New York",
    iataCodes: ["JFK"], region: "米州",
    tagline: "マンハッタン・ミュージカル・ショッピング",
    areas: ["ミッドタウン（観光中心）", "タイムズスクエア", "SoHo（おしゃれ）"],
    bestSeason: "4-6月、9-11月",
    priceFromJpy: 22000,
  },
  {
    slug: "los-angeles", nameJa: "ロサンゼルス", nameEn: "Los Angeles",
    iataCodes: ["LAX"], region: "米州",
    tagline: "ハリウッド・ビーチ・テーマパーク",
    areas: ["ハリウッド", "サンタモニカ", "ダウンタウン"],
    bestSeason: "通年（4-10月特に良い）",
    priceFromJpy: 18000,
  },
  {
    slug: "honolulu", nameJa: "ホノルル", nameEn: "Honolulu",
    iataCodes: ["HNL"], region: "米州",
    tagline: "ハワイ・ワイキキビーチ・定番リゾート",
    areas: ["ワイキキ", "アラモアナ"],
    bestSeason: "通年（4-10月乾季）",
    priceFromJpy: 16000,
  },

  // ── オセアニア・その他 ──
  {
    slug: "dubai", nameJa: "ドバイ", nameEn: "Dubai",
    iataCodes: ["DXB"], region: "オセアニア・その他",
    tagline: "高層ビル・砂漠・トランジット拠点",
    areas: ["ダウンタウン（ブルジュ・ハリファ）", "ドバイマリーナ"],
    bestSeason: "11-3月",
    priceFromJpy: 14000,
  },
  {
    slug: "sydney", nameJa: "シドニー", nameEn: "Sydney",
    iataCodes: ["SYD"], region: "オセアニア・その他",
    tagline: "オペラハウス・ビーチ・南半球",
    areas: ["CBD（中心街）", "ボンダイビーチ"],
    bestSeason: "10-4月（南半球の夏）",
    priceFromJpy: 14000,
  },
  {
    slug: "auckland", nameJa: "オークランド", nameEn: "Auckland",
    iataCodes: ["AKL"], region: "オセアニア・その他",
    tagline: "ニュージーランド最大都市・自然",
    areas: ["シティセンター", "ウォーターフロント"],
    bestSeason: "11-4月",
    priceFromJpy: 12000,
  },
  {
    slug: "guam", nameJa: "グアム", nameEn: "Guam",
    iataCodes: ["GUM"], region: "オセアニア・その他",
    tagline: "近場リゾート・タモン湾・短時間フライト",
    areas: ["タモン（中心）", "ハガニア"],
    bestSeason: "通年（12-6月乾季）",
    priceFromJpy: 11000,
  },
];

// 国名（英語）と Airalo の slug を slug ベースで一括補完。
const COUNTRY_BY_SLUG: Record<string, { en: string; airalo?: string }> = {
  tokyo: { en: "Japan" },
  osaka: { en: "Japan" },
  sapporo: { en: "Japan" },
  fukuoka: { en: "Japan" },
  okinawa: { en: "Japan" },
  hiroshima: { en: "Japan" },
  nagoya: { en: "Japan" },
  sendai: { en: "Japan" },
  bangkok: { en: "Thailand" },
  seoul: { en: "South Korea", airalo: "south-korea" },
  taipei: { en: "Taiwan" },
  singapore: { en: "Singapore" },
  "hong-kong": { en: "Hong Kong", airalo: "hong-kong" },
  hanoi: { en: "Vietnam" },
  "ho-chi-minh-city": { en: "Vietnam" },
  shanghai: { en: "China" },
  manila: { en: "Philippines" },
  paris: { en: "France" },
  london: { en: "United Kingdom", airalo: "united-kingdom" },
  helsinki: { en: "Finland" },
  rome: { en: "Italy" },
  barcelona: { en: "Spain" },
  "new-york": { en: "United States", airalo: "united-states" },
  "los-angeles": { en: "United States", airalo: "united-states" },
  honolulu: { en: "United States", airalo: "united-states" },
  dubai: { en: "United Arab Emirates", airalo: "united-arab-emirates" },
  sydney: { en: "Australia" },
  auckland: { en: "New Zealand", airalo: "new-zealand" },
  guam: { en: "Guam" },
};

export const HOTEL_DESTINATIONS: HotelDestination[] = RAW.map((d) => {
  const country = COUNTRY_BY_SLUG[d.slug];
  return {
    ...d,
    image: getDestinationImage(d.iataCodes[0]),
    countryEn: country?.en,
    airaloSlug: country?.airalo,
  };
});

export const HOTEL_BY_SLUG: Record<string, HotelDestination> =
  Object.fromEntries(HOTEL_DESTINATIONS.map((d) => [d.slug, d]));

export function getHotelDestinationBySlug(slug: string): HotelDestination | undefined {
  return HOTEL_BY_SLUG[slug];
}

/**
 * IATAコード → ホテル目的地スラッグ。
 * 路線/ディール ページから "目的地の旅行ガイドを見る" 等のリンクを
 * 動的に組み立てるために使う。
 */
const HOTEL_BY_IATA: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const d of HOTEL_DESTINATIONS) {
    for (const code of d.iataCodes) {
      // 既に登録済みの code は上書きしない（最初のヒットが代表）
      if (!m[code]) m[code] = d.slug;
    }
  }
  return m;
})();

export function getHotelSlugByIata(iata: string): string | undefined {
  return HOTEL_BY_IATA[iata];
}

/** リージョン順に並べた目的地リスト（インデックスページの表示順用） */
export function getHotelDestinationsByRegion(): { region: Region; items: HotelDestination[] }[] {
  const order: Region[] = ["国内", "アジア", "欧州", "米州", "オセアニア・その他"];
  return order.map((region) => ({
    region,
    items: HOTEL_DESTINATIONS.filter((d) => d.region === region),
  }));
}

/**
 * 同一リージョン (国内は国内、アジアはアジア…) で、同じ国があれば優先的に、
 * 自分自身を除いた関連目的地を最大 `limit` 件返す。
 * PageRank を cluster 横断させるため、/hotels/[city] の末尾「関連都市」用。
 */
export function getRelatedHotelDestinations(
  slug: string,
  limit: number = 6
): HotelDestination[] {
  const self = getHotelDestinationBySlug(slug);
  if (!self) return [];

  const sameRegion = HOTEL_DESTINATIONS.filter(
    (d) => d.slug !== self.slug && d.region === self.region
  );

  // 海外は同国を優先。国内は地方区分が無いので region 全体から（slug 順を一定にするため
  // 単純なソートで安定化）。
  if (self.region !== "国内" && self.countryEn) {
    const sameCountry = sameRegion.filter((d) => d.countryEn === self.countryEn);
    const otherCountry = sameRegion.filter((d) => d.countryEn !== self.countryEn);
    return [...sameCountry, ...otherCountry].slice(0, limit);
  }

  return sameRegion.slice(0, limit);
}
