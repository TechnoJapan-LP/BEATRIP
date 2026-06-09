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
  {
    slug: "kyoto", nameJa: "京都", nameEn: "Kyoto",
    iataCodes: ["KIX", "ITM"], region: "国内",
    tagline: "千年の古都・寺社仏閣と祇園情緒",
    areas: ["祇園・東山（観光中心）", "京都駅前（新幹線アクセス）", "河原町・四条（繁華街）", "嵐山（自然・嵯峨野）"],
    bestSeason: "春（桜3-4月）・秋（紅葉11月）",
    priceFromJpy: 9000,
  },
  {
    slug: "yokohama", nameJa: "横浜", nameEn: "Yokohama",
    iataCodes: ["HND", "NRT"], region: "国内",
    tagline: "みなとみらい・港町夜景・中華街",
    areas: ["みなとみらい（夜景・観光）", "横浜駅周辺", "山下公園・元町（港町散策）", "新横浜（新幹線）"],
    bestSeason: "春・秋",
    priceFromJpy: 7000,
  },
  {
    slug: "kobe", nameJa: "神戸", nameEn: "Kobe",
    iataCodes: ["UKB", "KIX", "ITM"], region: "国内",
    tagline: "1000万ドルの夜景・港町・神戸牛",
    areas: ["三宮（中心街）", "ハーバーランド・メリケンパーク（港・夜景）", "北野異人館", "六甲アイランド"],
    bestSeason: "春・秋（夜景は通年）",
    priceFromJpy: 7000,
  },
  {
    slug: "kanazawa", nameJa: "金沢", nameEn: "Kanazawa",
    iataCodes: ["KMQ"], region: "国内",
    tagline: "兼六園・茶屋街・北陸新幹線で快適",
    areas: ["金沢駅前（新幹線・ホテル集積）", "香林坊・片町（繁華街）", "ひがし茶屋街（観光）", "近江町市場"],
    bestSeason: "春・秋（冬は雪景色）",
    priceFromJpy: 7500,
  },
  {
    slug: "takamatsu", nameJa: "高松", nameEn: "Takamatsu",
    iataCodes: ["TAK"], region: "国内",
    tagline: "讃岐うどん・栗林公園・瀬戸内アート",
    areas: ["高松駅前", "丸亀町・瓦町（繁華街）", "栗林公園周辺"],
    bestSeason: "春・秋（瀬戸内国際芸術祭の年は特に）",
    priceFromJpy: 6000,
  },
  {
    slug: "hakodate", nameJa: "函館", nameEn: "Hakodate",
    iataCodes: ["HKD"], region: "国内",
    tagline: "函館山の夜景・朝市・湯の川温泉",
    areas: ["函館駅前・朝市", "ベイエリア・元町", "湯の川温泉"],
    bestSeason: "夏・秋（冬の夜景も人気）",
    priceFromJpy: 6500,
  },
  {
    slug: "kagoshima", nameJa: "鹿児島", nameEn: "Kagoshima",
    iataCodes: ["KOJ"], region: "国内",
    tagline: "桜島・指宿温泉・薩摩料理",
    areas: ["鹿児島中央駅前（新幹線）", "天文館（繁華街）", "城山周辺"],
    bestSeason: "春・秋",
    priceFromJpy: 6000,
  },
  {
    slug: "kumamoto", nameJa: "熊本", nameEn: "Kumamoto",
    iataCodes: ["KMJ"], region: "国内",
    tagline: "熊本城・阿蘇山・馬刺し",
    areas: ["熊本駅周辺", "桜町・新市街（繁華街）", "熊本城周辺"],
    bestSeason: "春・秋",
    priceFromJpy: 5500,
  },
  {
    slug: "nagasaki", nameJa: "長崎", nameEn: "Nagasaki",
    iataCodes: ["NGS"], region: "国内",
    tagline: "稲佐山の夜景・グラバー園・異国情緒",
    areas: ["長崎駅前", "思案橋・浜町（繁華街）", "グラバー園・南山手（観光）", "稲佐山周辺"],
    bestSeason: "春・秋",
    priceFromJpy: 6000,
  },
  {
    slug: "bali", nameJa: "バリ", nameEn: "Bali",
    iataCodes: ["DPS"], region: "アジア",
    tagline: "ビーチリゾート・ヴィラ・寺院めぐり",
    areas: ["ヌサドゥア（ラグジュアリーリゾート）", "スミニャック（おしゃれ・カフェ）", "ウブド（自然・ヨガ）", "クタ（ビーチ・繁華街）"],
    bestSeason: "4-10月（乾季）",
    priceFromJpy: 5500,
  },
  {
    slug: "kuala-lumpur", nameJa: "クアラルンプール", nameEn: "Kuala Lumpur",
    iataCodes: ["KUL"], region: "アジア",
    tagline: "ペトロナスツインタワー・LCC ハブ・多民族グルメ",
    areas: ["KLCC（ツインタワー・ショッピング）", "ブキッ ビンタン（繁華街・グルメ）", "チャイナタウン（ローカル）"],
    bestSeason: "5-7月、12-2月",
    priceFromJpy: 4500,
  },
  {
    slug: "busan", nameJa: "釜山", nameEn: "Busan",
    iataCodes: ["PUS"], region: "アジア",
    tagline: "海雲台ビーチ・海鮮グルメ・近場で気軽",
    areas: ["海雲台（ビーチ・リゾート）", "西面（繁華街）", "南浦洞（チャガルチ市場）"],
    bestSeason: "春・秋（夏は海水浴）",
    priceFromJpy: 6000,
  },
  {
    slug: "cebu", nameJa: "セブ", nameEn: "Cebu",
    iataCodes: ["CEB"], region: "アジア",
    tagline: "リゾート＋語学留学・ジンベエザメ・近場の南国",
    areas: ["マクタン島（リゾート・空港至近）", "セブ市内（ショッピング・ナイトライフ）"],
    bestSeason: "12-5月（乾季）",
    priceFromJpy: 5000,
  },
  {
    slug: "istanbul", nameJa: "イスタンブール", nameEn: "Istanbul",
    iataCodes: ["IST", "SAW"], region: "欧州",
    tagline: "ヨーロッパとアジアの架け橋・歴史と絶景",
    areas: ["旧市街（スルタンアフメット・歴史地区）", "ボスポラス海峡沿い", "ペラ・タクシム（モダン）"],
    bestSeason: "4-6月、9-10月",
    priceFromJpy: 8000,
  },
  {
    slug: "beijing", nameJa: "北京", nameEn: "Beijing",
    iataCodes: ["PEK", "PKX"], region: "アジア",
    tagline: "故宮・万里の長城・中国の首都",
    areas: ["王府井（観光中心）", "CBD（モダン・ホテル街）", "三里屯（夜遊び）"],
    bestSeason: "春・秋（4-5月、9-10月）",
    priceFromJpy: 7000,
  },
  {
    slug: "kaohsiung", nameJa: "高雄", nameEn: "Kaohsiung",
    iataCodes: ["KHH"], region: "アジア",
    tagline: "台湾南部・温暖・85 スカイタワー・愛河",
    areas: ["愛河沿い（夜景）", "塩埕（レトロ）", "新光三越エリア（買物）"],
    bestSeason: "10-3月",
    priceFromJpy: 5000,
  },
  {
    slug: "jeju", nameJa: "済州島", nameEn: "Jeju",
    iataCodes: ["CJU"], region: "アジア",
    tagline: "韓国のハワイ・漢拏山・中文リゾート",
    areas: ["中文観光団地（リゾートホテル集中）", "済州市（ショッピング・空港至近）", "西帰浦（南部・自然）"],
    bestSeason: "4-6月、9-10月",
    priceFromJpy: 6500,
  },
  {
    slug: "amsterdam", nameJa: "アムステルダム", nameEn: "Amsterdam",
    iataCodes: ["AMS"], region: "欧州",
    tagline: "運河の街・KLM ハブ・西欧の玄関口",
    areas: ["中央駅周辺（観光・運河）", "ヨルダン地区（カフェ・ブティック）", "美術館広場（国立美術館・ゴッホ）"],
    bestSeason: "4-6月（チューリップ）、9-10月",
    priceFromJpy: 14000,
  },
  {
    slug: "berlin", nameJa: "ベルリン", nameEn: "Berlin",
    iataCodes: ["BER"], region: "欧州",
    tagline: "ドイツの首都・歴史と現代アート",
    areas: ["ミッテ（ブランデンブルク門・観光中心）", "クロイツベルク（カフェ・夜遊び）", "ポツダム広場（モダン）"],
    bestSeason: "5-9月",
    priceFromJpy: 11000,
  },
  {
    slug: "vienna", nameJa: "ウィーン", nameEn: "Vienna",
    iataCodes: ["VIE"], region: "欧州",
    tagline: "音楽の都・宮殿とカフェ文化",
    areas: ["旧市街（シュテファン大聖堂・オペラ座）", "リンク通り（ホーフブルク・美術館）", "シェーンブルン宮殿周辺"],
    bestSeason: "4-6月、9-10月、12月（クリスマス市）",
    priceFromJpy: 12000,
  },
  {
    slug: "prague", nameJa: "プラハ", nameEn: "Prague",
    iataCodes: ["PRG"], region: "欧州",
    tagline: "百塔の街・中欧屈指の観光人気",
    areas: ["旧市街広場（天文時計・観光中心）", "マラー・ストラナ（プラハ城下）", "新市街（ヴァーツラフ広場）"],
    bestSeason: "5-6月、9-10月",
    priceFromJpy: 9000,
  },
  {
    slug: "munich", nameJa: "ミュンヘン", nameEn: "Munich",
    iataCodes: ["MUC"], region: "欧州",
    tagline: "バイエルンの首都・ビールとアルプスの玄関口",
    areas: ["マリエン広場（市庁舎・観光中心）", "中央駅周辺", "シュヴァービング（学生街）"],
    bestSeason: "5-9月、10月（オクトーバーフェスト）",
    priceFromJpy: 13000,
  },
  {
    slug: "madrid", nameJa: "マドリード", nameEn: "Madrid",
    iataCodes: ["MAD"], region: "欧州",
    tagline: "スペインの首都・美術館とタパスの街",
    areas: ["プラド美術館周辺", "グランビア（繁華街・買物）", "サラマンカ地区（高級住宅街）"],
    bestSeason: "4-6月、9-10月",
    priceFromJpy: 10000,
  },
  {
    slug: "athens", nameJa: "アテネ", nameEn: "Athens",
    iataCodes: ["ATH"], region: "欧州",
    tagline: "西洋文明発祥の地・アクロポリス",
    areas: ["シンタグマ広場（中心部）", "プラカ（旧市街・観光）", "モナスティラキ（市場・グルメ）"],
    bestSeason: "4-6月、9-10月（夏は猛暑）",
    priceFromJpy: 9000,
  },
  {
    slug: "las-vegas", nameJa: "ラスベガス", nameEn: "Las Vegas",
    iataCodes: ["LAS"], region: "米州",
    tagline: "エンタメ・カジノ・ハネムーンの聖地",
    areas: ["ストリップ中心（ベラージオ周辺）", "ストリップ北（ウィン）", "ストリップ南（マンダレイベイ）"],
    bestSeason: "3-5月、9-11月（夏は酷暑）",
    priceFromJpy: 18000,
  },
  {
    slug: "san-francisco", nameJa: "サンフランシスコ", nameEn: "San Francisco",
    iataCodes: ["SFO"], region: "米州",
    tagline: "ゴールデンゲート・ケーブルカー・西海岸の文化都市",
    areas: ["ユニオンスクエア（観光中心）", "ノブヒル（高級ホテル街）", "フィッシャーマンズワーフ"],
    bestSeason: "9-11月（霧が少なめ）",
    priceFromJpy: 22000,
  },
  {
    slug: "vancouver", nameJa: "バンクーバー", nameEn: "Vancouver",
    iataCodes: ["YVR"], region: "米州",
    tagline: "自然と都市の融合・カナダ西海岸の玄関口",
    areas: ["ダウンタウン", "コール ハーバー（ウォーターフロント）", "イェールタウン（おしゃれ）"],
    bestSeason: "6-9月",
    priceFromJpy: 18000,
  },
  {
    slug: "miami", nameJa: "マイアミ", nameEn: "Miami",
    iataCodes: ["MIA"], region: "米州",
    tagline: "アールデコ・サウスビーチ・南国リゾート",
    areas: ["サウスビーチ（観光・ナイトライフ）", "ブリッケル（金融街）", "バルハーバー（高級）"],
    bestSeason: "12-4月（乾季）",
    priceFromJpy: 20000,
  },
  {
    slug: "toronto", nameJa: "トロント", nameEn: "Toronto",
    iataCodes: ["YYZ"], region: "米州",
    tagline: "カナダ最大都市・多文化・ナイアガラ拠点",
    areas: ["ダウンタウン（ユニオン駅）", "ヨークビル（高級）", "エンターテイメント地区"],
    bestSeason: "5-10月",
    priceFromJpy: 16000,
  },
  {
    slug: "chicago", nameJa: "シカゴ", nameEn: "Chicago",
    iataCodes: ["ORD"], region: "米州",
    tagline: "建築・ブルース・ミシガン湖畔",
    areas: ["マグニフィセント・マイル（買物）", "ループ（中心街）", "ストリーターヴィル"],
    bestSeason: "5-10月（冬は厳寒）",
    priceFromJpy: 17000,
  },
  {
    slug: "melbourne", nameJa: "メルボルン", nameEn: "Melbourne",
    iataCodes: ["MEL"], region: "オセアニア・その他",
    tagline: "豪 No.2 都市・カフェ文化・芸術",
    areas: ["CBD（中心街）", "サウスバンク（カジノ・川沿い）", "フィッツロイ（おしゃれ）"],
    bestSeason: "10-4月（南半球の夏）",
    priceFromJpy: 13000,
  },
  {
    slug: "gold-coast", nameJa: "ゴールドコースト", nameEn: "Gold Coast",
    iataCodes: ["OOL"], region: "オセアニア・その他",
    tagline: "サーファーズパラダイス・ビーチリゾート",
    areas: ["サーファーズパラダイス（中心）", "ブロードビーチ", "メインビーチ"],
    bestSeason: "9-5月",
    priceFromJpy: 12000,
  },
  {
    slug: "cairns", nameJa: "ケアンズ", nameEn: "Cairns",
    iataCodes: ["CNS"], region: "オセアニア・その他",
    tagline: "グレートバリアリーフ・熱帯雨林の拠点",
    areas: ["シティ（マリーナ前）", "エスプラネード（海沿い）"],
    bestSeason: "5-10月（乾季）",
    priceFromJpy: 12000,
  },
  {
    slug: "doha", nameJa: "ドーハ", nameEn: "Doha",
    iataCodes: ["DOH"], region: "オセアニア・その他",
    tagline: "カタールのハブ・モダン建築・砂漠",
    areas: ["ウェスト・ベイ（高層・高級ホテル）", "ムシラブ（歴史地区）"],
    bestSeason: "11-3月",
    priceFromJpy: 13000,
  },
  {
    slug: "abu-dhabi", nameJa: "アブダビ", nameEn: "Abu Dhabi",
    iataCodes: ["AUH"], region: "オセアニア・その他",
    tagline: "UAE 首都・シェイク・ザイード・モスク・ヤス アイランド",
    areas: ["コーニッシュ（海沿い・高級）", "ヤス アイランド（F1・テーマパーク）"],
    bestSeason: "11-3月",
    priceFromJpy: 13000,
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
  kyoto: { en: "Japan" },
  yokohama: { en: "Japan" },
  kobe: { en: "Japan" },
  kanazawa: { en: "Japan" },
  takamatsu: { en: "Japan" },
  hakodate: { en: "Japan" },
  kagoshima: { en: "Japan" },
  kumamoto: { en: "Japan" },
  nagasaki: { en: "Japan" },
  bali: { en: "Indonesia" },
  "kuala-lumpur": { en: "Malaysia" },
  busan: { en: "South Korea", airalo: "south-korea" },
  cebu: { en: "Philippines" },
  istanbul: { en: "Turkey" },
  beijing: { en: "China" },
  kaohsiung: { en: "Taiwan" },
  jeju: { en: "South Korea", airalo: "south-korea" },
  amsterdam: { en: "Netherlands" },
  berlin: { en: "Germany" },
  vienna: { en: "Austria" },
  prague: { en: "Czech Republic", airalo: "czech-republic" },
  munich: { en: "Germany" },
  madrid: { en: "Spain" },
  athens: { en: "Greece" },
  "las-vegas": { en: "United States", airalo: "united-states" },
  "san-francisco": { en: "United States", airalo: "united-states" },
  miami: { en: "United States", airalo: "united-states" },
  chicago: { en: "United States", airalo: "united-states" },
  vancouver: { en: "Canada" },
  toronto: { en: "Canada" },
  "abu-dhabi": { en: "United Arab Emirates", airalo: "united-arab-emirates" },
  melbourne: { en: "Australia" },
  "gold-coast": { en: "Australia" },
  cairns: { en: "Australia" },
  doha: { en: "Qatar" },
};

/**
 * 同一 IATA を複数の都市で共有する場合 (例: KIX を kyoto/osaka/kobe で共有)
 * IATA ベースの自動ルックアップだと別都市の画像になる。slug 単位で明示的に
 * 都市風景画像を上書きする。Wikimedia Commons の都市代表画像 (curl 200 確認済)。
 */
const IMAGE_OVERRIDE_BY_SLUG: Record<string, string> = {
  kyoto: "https://upload.wikimedia.org/wikipedia/commons/2/22/Kyoto_montage.jpg",
  yokohama: "https://upload.wikimedia.org/wikipedia/commons/7/71/Minato_Mirai_21.jpg",
  kanazawa: "https://upload.wikimedia.org/wikipedia/commons/3/3a/Kanazawa_montage.jpg",
};

export const HOTEL_DESTINATIONS: HotelDestination[] = RAW.map((d) => {
  const country = COUNTRY_BY_SLUG[d.slug];
  return {
    ...d,
    image: IMAGE_OVERRIDE_BY_SLUG[d.slug] ?? getDestinationImage(d.iataCodes[0]),
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
