/**
 * 各都市の代表的なホテルのキュレート情報
 *
 * Hotellook ブランドは 2025年10月に閉鎖され API も利用不可。代わりに
 * 編集者がキュレートした有名ホテルを表示する。クリック時のリンク先は
 * Hotellook の都市検索（marker 帰属付き）に集約 — そこから絞り込み。
 *
 * 価格目安は2026年時点の3-5星帯のおおよそ。実際は変動する。
 *
 * 2026 年版で拡張: 星評価 / 客室数 / アメニティ / レビュー指標 /
 * 推奨利用シーン を編集部キュレートで付与。比較・絞り込み UI と
 * 構造化データ (Hotel schema.org) の両方で利用する想定。
 */

export type CuratedHotel = {
  name: string;
  area: string;
  tier: "ラグジュアリー" | "ハイクラス" | "ミドル" | "バジェット";
  /** 1行のセリングポイント */
  highlight: string;

  // --- 2026 年時点の編集部キュレート (以下すべて optional) ---

  /** 星評価 (3-5) — 公式 OTA で広く採用される値。2026 年時点の編集部キュレート */
  star?: 3 | 4 | 5;
  /** 客室数の概算 — ホテルの規模感を示す。2026 年時点の編集部キュレート */
  rooms?: number;
  /** 主要アメニティ識別子（最大 5 個）。2026 年時点の編集部キュレート */
  amenities?: Array<
    | "pool"          // プール
    | "spa"           // スパ
    | "gym"           // ジム
    | "restaurant"    // 館内レストラン
    | "bar"           // バー
    | "free-wifi"     // 無料 Wi-Fi
    | "parking"       // 駐車場
    | "airport-shuttle" // 空港送迎
    | "kids-friendly" // ファミリー向け設備
    | "pet-friendly"  // ペット可
    | "onsen"         // 温泉
    | "view"          // 眺望
    | "breakfast"     // 朝食付プランあり
    | "concierge"     // コンシェルジュ
    | "business"      // ビジネスセンター
  >;
  /** 典型レビュースコア (Booking/Agoda 等で見る 0.0-10.0 スコア)。2026 年時点の編集部キュレート */
  reviewScore?: number;
  /** スコアのレビュー件数オーダー (数百〜数千の感覚)。2026 年時点の編集部キュレート */
  reviewCount?: number;
  /** 推奨利用シーン (複数可)。2026 年時点の編集部キュレート */
  bestFor?: Array<"couple" | "family" | "business" | "solo" | "luxury" | "budget" | "long-stay">;

  /**
   * OTA 固有の「ホテル詳細ページ」のフル URL。設定があれば各 OTA のボタンは
   * 検索結果ページではなく直接そのホテルの詳細ページに遷移する。未設定なら
   * 従来の hotelName + cityNameEn ベース検索 URL に fallback。
   *
   * 実在しない URL は推測で書かない (404 になるため)。Booking.com の URL は
   * `https://www.booking.com/hotel/{cc}/{slug}.ja.html` パターン。
   */
  otaUrls?: {
    booking?: string;
    trip?: string;
    agoda?: string;
  };

  // 商用利用可能な画像 URL (Wikimedia Commons の建物実写を優先)。未設定時は tier グラデーション fallback。
  // 注: 都市風景や汎用ホテルストック写真は使わない (ホテル個体と無関係な
  //     画像はユーザー誤認を招くため、無いなら fallback の方が望ましい)
  imageUrl?: string;
};

export const CURATED_HOTELS: Record<string, CuratedHotel[]> = {
  tokyo: [
    { name: "Park Hyatt Tokyo", area: "新宿", tier: "ラグジュアリー", highlight: "新宿摩天楼一望・映画ロケ地で有名",
      star: 5, rooms: 177, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.2, reviewCount: 4200, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/park-hyatt-tokyo.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Shinjuku_Park_Tower_2018_from_MetGovBld.jpg" },
    { name: "Mandarin Oriental Tokyo", area: "日本橋", tier: "ラグジュアリー", highlight: "ミシュラン星付きレストランを多数擁する高層階ホテル",
      star: 5, rooms: 179, amenities: ["spa", "gym", "restaurant", "bar", "concierge"], reviewScore: 9.4, reviewCount: 3800, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/mandarin-oriental-tokyo.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d9/Mandarin_Oriental_Exterior_Tokyo.jpg" },
    { name: "Andaz Tokyo", area: "虎ノ門", tier: "ハイクラス", highlight: "虎ノ門ヒルズ最上層・モダンデザイン",
      star: 5, rooms: 164, amenities: ["spa", "gym", "restaurant", "bar", "view"], reviewScore: 9.1, reviewCount: 3500, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/andaz-tokyo-toranomon-hills.ja.html" } },
    { name: "Hotel Gracery Shinjuku", area: "新宿歌舞伎町", tier: "ミドル", highlight: "ゴジラヘッドが目印・繁華街アクセス抜群",
      star: 3, rooms: 970, amenities: ["restaurant", "free-wifi", "breakfast"], reviewScore: 8.2, reviewCount: 6500, bestFor: ["solo", "family", "budget"] },
    { name: "MIMARU TOKYO STATION EAST", area: "東京駅", tier: "ミドル", highlight: "アパートメント型・家族・長期滞在向き",
      star: 3, rooms: 138, amenities: ["kids-friendly", "free-wifi", "breakfast"], reviewScore: 8.6, reviewCount: 2400, bestFor: ["family", "long-stay"] },
  ],
  osaka: [
    { name: "Conrad Osaka", area: "中之島", tier: "ラグジュアリー", highlight: "高層40Fからの大阪パノラマ・ビジネス利用も",
      star: 5, rooms: 164, amenities: ["spa", "gym", "restaurant", "view", "concierge"], reviewScore: 9.2, reviewCount: 3600, bestFor: ["luxury", "business", "couple"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/conrad-osaka.ja.html" } },
    { name: "The Ritz-Carlton, Osaka", area: "梅田", tier: "ラグジュアリー", highlight: "梅田駅徒歩7分・ハイティーが名物",
      star: 5, rooms: 291, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.3, reviewCount: 4100, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/the-ritz-carlton-osaka.ja.html" } },
    { name: "Hotel Vischio Osaka by GRANVIA", area: "梅田", tier: "ハイクラス", highlight: "大阪駅直結・新幹線アクセスに最適",
      star: 4, rooms: 410, amenities: ["restaurant", "free-wifi", "breakfast", "business"], reviewScore: 8.7, reviewCount: 3100, bestFor: ["business", "solo"] },
    { name: "Cross Hotel Osaka", area: "心斎橋", tier: "ハイクラス", highlight: "道頓堀徒歩圏・グルメと観光のハブ",
      star: 4, rooms: 226, amenities: ["restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 8.8, reviewCount: 4800, bestFor: ["couple", "solo"] },
    { name: "Hotel Hankyu RESPIRE OSAKA", area: "梅田", tier: "ミドル", highlight: "新規開業・スタイリッシュ・コスパ良",
      star: 4, rooms: 938, amenities: ["restaurant", "free-wifi", "breakfast", "onsen"], reviewScore: 8.5, reviewCount: 2200, bestFor: ["solo", "couple", "business"] },
  ],
  sapporo: [
    { name: "JR Tower Hotel Nikko Sapporo", area: "札幌駅", tier: "ラグジュアリー", highlight: "JR札幌駅直結・最上階展望大浴場",
      star: 5, rooms: 350, amenities: ["spa", "restaurant", "onsen", "view", "concierge"], reviewScore: 8.9, reviewCount: 5200, bestFor: ["couple", "business", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/jr-tower-nikko-sapporo.ja.html" } },
    { name: "Sapporo Grand Hotel", area: "大通", tier: "ハイクラス", highlight: "1934年開業・札幌を代表する老舗",
      star: 4, rooms: 482, amenities: ["restaurant", "bar", "free-wifi", "breakfast", "concierge"], reviewScore: 8.7, reviewCount: 3600, bestFor: ["couple", "business", "family"],
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Sapporo_Grand_Hotel_exterior_01.jpg" },
    { name: "Cross Hotel Sapporo", area: "札幌駅南", tier: "ハイクラス", highlight: "デザインホテル・天然温泉",
      star: 4, rooms: 181, amenities: ["onsen", "restaurant", "bar", "free-wifi"], reviewScore: 8.8, reviewCount: 4400, bestFor: ["couple", "solo"] },
    { name: "Premier Hotel Tsubaki Sapporo", area: "中島公園", tier: "ハイクラス", highlight: "札幌ドーム・繁華街への中間立地",
      star: 4, rooms: 511, amenities: ["onsen", "restaurant", "bar", "free-wifi", "parking"], reviewScore: 8.5, reviewCount: 3200, bestFor: ["family", "couple"] },
    { name: "Jozankei Tsuruga Resort Spa Mori no Uta", area: "定山渓温泉", tier: "ハイクラス", highlight: "札幌郊外・本格温泉リゾート",
      star: 4, rooms: 80, amenities: ["onsen", "spa", "restaurant", "view", "parking"], reviewScore: 9.1, reviewCount: 1900, bestFor: ["couple", "family", "luxury"] },
    { name: "Hotel Mystays Sapporo Aspen", area: "札幌駅北", tier: "ミドル", highlight: "札幌駅徒歩2分・コスパ抜群",
      star: 3, rooms: 305, amenities: ["restaurant", "free-wifi", "breakfast"], reviewScore: 8.1, reviewCount: 3800, bestFor: ["solo", "business", "budget"] },
  ],
  fukuoka: [
    { name: "The Ritz-Carlton, Fukuoka", area: "天神", tier: "ラグジュアリー", highlight: "天神中心・福岡最高峰のサービス",
      star: 5, rooms: 167, amenities: ["spa", "gym", "restaurant", "bar", "concierge"], reviewScore: 9.3, reviewCount: 1800, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/the-ritz-carlton-fukuoka.ja.html" } },
    { name: "Grand Hyatt Fukuoka", area: "博多", tier: "ハイクラス", highlight: "博多駅・キャナルシティ徒歩圏",
      star: 5, rooms: 372, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 8.9, reviewCount: 3600, bestFor: ["couple", "business", "family"] },
    { name: "Hotel Nikko Fukuoka", area: "博多", tier: "ハイクラス", highlight: "博多駅徒歩3分・ビジネス・観光どちらも",
      star: 4, rooms: 360, amenities: ["restaurant", "bar", "free-wifi", "breakfast", "business"], reviewScore: 8.6, reviewCount: 4100, bestFor: ["business", "couple"] },
    { name: "Hotel Okura Fukuoka", area: "中洲川端", tier: "ハイクラス", highlight: "中洲・キャナルシティ徒歩・老舗の品格",
      star: 4, rooms: 263, amenities: ["pool", "restaurant", "bar", "free-wifi", "concierge"], reviewScore: 8.6, reviewCount: 2900, bestFor: ["couple", "business"] },
    { name: "Dormy Inn PREMIUM Hakata", area: "博多", tier: "ミドル", highlight: "天然温泉大浴場・夜鳴きそばが名物",
      star: 3, rooms: 254, amenities: ["onsen", "restaurant", "free-wifi", "breakfast"], reviewScore: 8.7, reviewCount: 5400, bestFor: ["solo", "business", "budget"] },
  ],
  okinawa: [
    { name: "The Busena Terrace", area: "名護", tier: "ラグジュアリー", highlight: "沖縄屈指のラグジュアリーリゾート・部瀬名岬の絶景",
      star: 5, rooms: 410, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 9.2, reviewCount: 3400, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/the-busena-terrace.ja.html" } },
    { name: "The Ritz-Carlton, Okinawa", area: "名護", tier: "ラグジュアリー", highlight: "ゴルフコース併設・名護湾の絶景",
      star: 5, rooms: 97, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.3, reviewCount: 2400, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/the-ritz-carlton-okinawa.ja.html" } },
    { name: "Halekulani Okinawa", area: "恩納村", tier: "ラグジュアリー", highlight: "ハワイ発祥ブランド・プライベートビーチ",
      star: 5, rooms: 360, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 9.4, reviewCount: 2100, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/halekulani-okinawa.ja.html" } },
    { name: "Hotel Nikko Alivila", area: "読谷", tier: "ハイクラス", highlight: "南欧風リゾート・天然ビーチ目の前",
      star: 4, rooms: 396, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 8.8, reviewCount: 3600, bestFor: ["family", "couple"] },
    { name: "Hyatt Regency Naha", area: "那覇国際通り", tier: "ハイクラス", highlight: "国際通り・観光拠点に最適",
      star: 4, rooms: 294, amenities: ["pool", "spa", "restaurant", "bar", "free-wifi"], reviewScore: 8.7, reviewCount: 3800, bestFor: ["couple", "family"] },
    { name: "Hotel Collective", area: "那覇国際通り", tier: "ハイクラス", highlight: "那覇中心・空港アクセスも良好",
      star: 4, rooms: 260, amenities: ["pool", "restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 8.8, reviewCount: 3000, bestFor: ["couple", "family"] },
    { name: "Daiwa Roynet Hotel Naha-Omoromachi", area: "那覇おもろまち", tier: "ミドル", highlight: "DFSギャラリア徒歩圏・コスパ良",
      star: 3, rooms: 248, amenities: ["restaurant", "free-wifi", "breakfast", "parking"], reviewScore: 8.3, reviewCount: 2800, bestFor: ["solo", "business", "budget"] },
  ],
  hiroshima: [
    { name: "Sheraton Grand Hiroshima Hotel", area: "広島駅", tier: "ハイクラス", highlight: "広島駅直結・最上階クラブラウンジ",
      star: 5, rooms: 238, amenities: ["spa", "gym", "restaurant", "bar", "concierge"], reviewScore: 8.9, reviewCount: 3200, bestFor: ["business", "couple"] },
    { name: "Rihga Royal Hotel Hiroshima", area: "中心部", tier: "ハイクラス", highlight: "平和記念公園徒歩圏・老舗ホテル",
      star: 4, rooms: 491, amenities: ["pool", "restaurant", "bar", "free-wifi", "view"], reviewScore: 8.6, reviewCount: 4100, bestFor: ["couple", "family", "business"] },
    { name: "Hotel Granvia Hiroshima", area: "広島駅", tier: "ハイクラス", highlight: "JR広島駅直結・新幹線アクセス完璧",
      star: 4, rooms: 404, amenities: ["restaurant", "bar", "free-wifi", "breakfast", "business"], reviewScore: 8.7, reviewCount: 3900, bestFor: ["business", "couple"] },
    { name: "Hiroshima Washington Hotel", area: "中心部", tier: "ミドル", highlight: "本通商店街徒歩・観光拠点",
      star: 3, rooms: 268, amenities: ["restaurant", "free-wifi", "breakfast"], reviewScore: 8.3, reviewCount: 2900, bestFor: ["solo", "business", "budget"] },
    { name: "Dormy Inn Hiroshima", area: "繁華街", tier: "ミドル", highlight: "天然温泉・夜鳴きそば",
      star: 3, rooms: 232, amenities: ["onsen", "restaurant", "free-wifi", "breakfast"], reviewScore: 8.6, reviewCount: 4200, bestFor: ["solo", "business", "budget"] },
  ],
  nagoya: [
    { name: "Nagoya Marriott Associa Hotel", area: "名古屋駅", tier: "ラグジュアリー", highlight: "JR名古屋駅直結・JRセントラルタワーズ最上層",
      star: 5, rooms: 774, amenities: ["spa", "gym", "restaurant", "view", "concierge"], reviewScore: 8.9, reviewCount: 5100, bestFor: ["business", "couple", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/nagoya-marriott-associa.ja.html" } },
    { name: "The Strings Hotel Nagoya", area: "名古屋駅", tier: "ハイクラス", highlight: "ささしま・ノリタケの森エリア",
      star: 4, rooms: 207, amenities: ["restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 8.7, reviewCount: 2600, bestFor: ["couple", "business"] },
    { name: "Hilton Nagoya", area: "栄", tier: "ハイクラス", highlight: "ビジネス街・栄の中心",
      star: 4, rooms: 450, amenities: ["pool", "spa", "gym", "restaurant", "business"], reviewScore: 8.5, reviewCount: 4300, bestFor: ["business", "family"] },
    { name: "Nagoya Tokyu Hotel", area: "栄", tier: "ハイクラス", highlight: "栄中心・名古屋随一のシティリゾート",
      star: 4, rooms: 503, amenities: ["pool", "restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 8.5, reviewCount: 3400, bestFor: ["couple", "family", "business"] },
    { name: "Daiwa Roynet Hotel Nagoya Eki-mae", area: "名古屋駅", tier: "ミドル", highlight: "駅前・出張に最適",
      star: 3, rooms: 240, amenities: ["restaurant", "free-wifi", "breakfast"], reviewScore: 8.2, reviewCount: 2900, bestFor: ["solo", "business", "budget"] },
  ],
  sendai: [
    { name: "The Westin Sendai", area: "仙台駅東", tier: "ラグジュアリー", highlight: "仙台最高層・パークタワー最上階に位置",
      star: 5, rooms: 292, amenities: ["spa", "gym", "restaurant", "view", "concierge"], reviewScore: 9.0, reviewCount: 3300, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/jp/the-westin-sendai.ja.html" } },
    { name: "Hotel Metropolitan Sendai", area: "仙台駅", tier: "ハイクラス", highlight: "JR仙台駅直結・新幹線アクセス完璧",
      star: 4, rooms: 300, amenities: ["restaurant", "bar", "free-wifi", "breakfast", "business"], reviewScore: 8.6, reviewCount: 3800, bestFor: ["business", "couple"] },
    { name: "Sendai Kokusai Hotel", area: "中心部", tier: "ハイクラス", highlight: "国分町徒歩圏・老舗の安心感",
      star: 4, rooms: 234, amenities: ["restaurant", "bar", "free-wifi", "breakfast", "parking"], reviewScore: 8.5, reviewCount: 2700, bestFor: ["couple", "business", "family"] },
    { name: "Dormy Inn EXPRESS Sendai Hirose-dori", area: "中心部", tier: "ミドル", highlight: "天然温泉大浴場・夜鳴きそば",
      star: 3, rooms: 196, amenities: ["onsen", "restaurant", "free-wifi", "breakfast"], reviewScore: 8.6, reviewCount: 3100, bestFor: ["solo", "business", "budget"] },
    { name: "Hotel Vista Sendai", area: "仙台駅", tier: "ミドル", highlight: "駅前・コスパ良",
      star: 3, rooms: 297, amenities: ["restaurant", "free-wifi", "breakfast"], reviewScore: 8.3, reviewCount: 2400, bestFor: ["solo", "business", "budget"] },
  ],
  bangkok: [
    { name: "Mandarin Oriental Bangkok", area: "リバーサイド", tier: "ラグジュアリー", highlight: "世界的名門・チャオプラヤー川沿いの歴史あるホテル",
      star: 5, rooms: 331, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.3, reviewCount: 4200, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/th/mandarin-oriental-bangkok.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e5/Mandarin_Oriental_Bangkok_Bang_Rak.jpg" },
    { name: "The Peninsula Bangkok", area: "リバーサイド", tier: "ラグジュアリー", highlight: "川向こうの静謐な高級ホテル・無料船で繁華街へ",
      star: 5, rooms: 370, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.4, reviewCount: 3800, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/th/the-peninsula-bangkok.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/The_Peninsula_Bangkok.JPG" },
    { name: "Banyan Tree Bangkok", area: "サトーン", tier: "ラグジュアリー", highlight: "屋上バー Vertigo・61F の絶景",
      star: 5, rooms: 327, amenities: ["pool", "spa", "restaurant", "view", "bar"], reviewScore: 9.1, reviewCount: 4400, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/th/banyan-tree-bangkok.ja.html" } },
    { name: "Shangri-La Bangkok", area: "リバーサイド", tier: "ラグジュアリー", highlight: "BTS直結・チャオプラヤー川沿い",
      star: 5, rooms: 802, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 8.9, reviewCount: 5800, bestFor: ["couple", "family", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/th/shangri-la-bangkok.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/89/Shangri-la_Hotel_Bangkok_2019.jpg" },
    { name: "Centara Grand at CentralWorld", area: "ラチャダムリ", tier: "ハイクラス", highlight: "CentralWorld直結・買物の中心",
      star: 5, rooms: 505, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 8.7, reviewCount: 6200, bestFor: ["couple", "family", "business"] },
    { name: "Aloft Bangkok Sukhumvit 11", area: "スクンビット", tier: "ミドル", highlight: "夜遊び中心地・若年層に人気",
      star: 4, rooms: 296, amenities: ["pool", "gym", "restaurant", "bar", "free-wifi"], reviewScore: 8.4, reviewCount: 5800, bestFor: ["solo", "couple", "budget"] },
    { name: "Ibis Styles Bangkok Khaosan Viengtai", area: "カオサン", tier: "バジェット", highlight: "バックパッカー街・コスパ最強",
      star: 3, rooms: 220, amenities: ["pool", "restaurant", "free-wifi", "breakfast"], reviewScore: 7.9, reviewCount: 4100, bestFor: ["solo", "budget"] },
  ],
  seoul: [
    { name: "Signiel Seoul", area: "蚕室", tier: "ラグジュアリー", highlight: "ロッテワールドタワー76-101F・韓国最高峰",
      star: 5, rooms: 235, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.3, reviewCount: 2800, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/kr/signiel-seoul.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/2/28/Lotte_World_Tower_day_view_10.jpg" },
    { name: "Lotte Hotel Seoul", area: "明洞", tier: "ラグジュアリー", highlight: "明洞徒歩圏・老舗ラグジュアリー",
      star: 5, rooms: 1015, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.0, reviewCount: 5600, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/kr/lotte-seoul.ja.html" } },
    { name: "Four Seasons Hotel Seoul", area: "光化門", tier: "ラグジュアリー", highlight: "景福宮徒歩圏・モダンラグジュアリー",
      star: 5, rooms: 317, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.4, reviewCount: 3400, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/kr/four-seasons-seoul.ja.html" } },
    { name: "Grand Hyatt Seoul", area: "梨泰院", tier: "ラグジュアリー", highlight: "南山中腹・ソウル夜景の名所",
      star: 5, rooms: 615, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 8.9, reviewCount: 4600, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/kr/grand-hyatt-seoul.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/72/Grand_Hyatt_Seoul_exterior.jpg" },
    { name: "JW Marriott Dongdaemun Square Seoul", area: "東大門", tier: "ハイクラス", highlight: "DDP徒歩・夜のファッション街",
      star: 5, rooms: 170, amenities: ["spa", "gym", "restaurant", "bar", "view"], reviewScore: 8.9, reviewCount: 3000, bestFor: ["couple", "business"] },
    { name: "L'Escape Hotel", area: "明洞", tier: "ハイクラス", highlight: "ブティック型・パリ風デザイン",
      star: 5, rooms: 204, amenities: ["restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 8.8, reviewCount: 2400, bestFor: ["couple", "solo"] },
    { name: "ENA Suite Hotel Namdaemun", area: "明洞", tier: "ミドル", highlight: "明洞徒歩・南大門市場至近",
      star: 4, rooms: 248, amenities: ["restaurant", "free-wifi", "breakfast", "business"], reviewScore: 8.4, reviewCount: 2700, bestFor: ["solo", "couple", "business"] },
  ],
  taipei: [
    { name: "Mandarin Oriental Taipei", area: "中山", tier: "ラグジュアリー", highlight: "屋外プール・ミシュラン星付きレストラン",
      star: 5, rooms: 303, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.3, reviewCount: 3300, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/tw/mandarin-oriental-taipei.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Mandarin_Oriental%2C_Taipei_2021.jpg" },
    { name: "W Taipei", area: "信義", tier: "ラグジュアリー", highlight: "台北101徒歩圏・モダン",
      star: 5, rooms: 405, amenities: ["pool", "spa", "gym", "restaurant", "bar"], reviewScore: 9.0, reviewCount: 4400, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/tw/w-taipei.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/25/W_Taipei_and_Uni-President_Hankyu_Taipei_20140826.jpg" },
    { name: "Caesar Park Hotel Taipei", area: "台北駅", tier: "ハイクラス", highlight: "MRT台北駅直結・空港リムジン乗り場前",
      star: 4, rooms: 478, amenities: ["restaurant", "bar", "free-wifi", "breakfast", "business"], reviewScore: 8.5, reviewCount: 5200, bestFor: ["business", "family"] },
    { name: "Hotel COZZI Minsheng Taipei", area: "中山", tier: "ミドル", highlight: "繁華街・コスパ良",
      star: 4, rooms: 305, amenities: ["restaurant", "free-wifi", "breakfast", "gym"], reviewScore: 8.6, reviewCount: 3100, bestFor: ["solo", "couple", "business"] },
    { name: "Cho Hotel", area: "西門", tier: "ミドル", highlight: "西門町徒歩・夜市散策に便利",
      star: 3, rooms: 156, amenities: ["restaurant", "free-wifi", "breakfast"], reviewScore: 8.2, reviewCount: 2200, bestFor: ["solo", "couple", "budget"] },
  ],
  singapore: [
    { name: "Marina Bay Sands", area: "マリーナベイ", tier: "ラグジュアリー", highlight: "屋上インフィニティプール・シンガポールの象徴",
      star: 5, rooms: 2561, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 9.0, reviewCount: 8000, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/sg/marinabaysands.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Marina_Bay_Sands_%28I%29.jpg" },
    { name: "Raffles Singapore", area: "シティホール", tier: "ラグジュアリー", highlight: "シンガポールスリングの発祥地・コロニアル建築",
      star: 5, rooms: 115, amenities: ["pool", "spa", "restaurant", "bar", "concierge"], reviewScore: 9.4, reviewCount: 2900, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/sg/raffles.ja.html" } },
    { name: "Hotel Indigo Singapore Katong", area: "カトン", tier: "ハイクラス", highlight: "プラナカン文化エリアのブティックホテル",
      star: 4, rooms: 131, amenities: ["pool", "gym", "restaurant", "bar", "free-wifi"], reviewScore: 8.7, reviewCount: 2400, bestFor: ["couple", "solo"] },
    { name: "Park Hotel Clarke Quay", area: "クラークキー", tier: "ハイクラス", highlight: "クラークキー川沿い・夜遊び拠点",
      star: 4, rooms: 336, amenities: ["pool", "gym", "restaurant", "bar", "free-wifi"], reviewScore: 8.5, reviewCount: 4100, bestFor: ["couple", "solo", "family"] },
    { name: "Hotel 81 Bencoolen", area: "ブギス", tier: "バジェット", highlight: "MRT近・コスパ重視",
      star: 3, rooms: 230, amenities: ["restaurant", "free-wifi"], reviewScore: 7.6, reviewCount: 3200, bestFor: ["solo", "budget"] },
  ],
  "hong-kong": [
    { name: "The Peninsula Hong Kong", area: "尖沙咀", tier: "ラグジュアリー", highlight: "アジアを代表する名門・ロールスロイス送迎",
      star: 5, rooms: 300, amenities: ["pool", "spa", "restaurant", "concierge", "view"], reviewScore: 9.4, reviewCount: 3400, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/hk/the-peninsula-hong-kong.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e1/The_Peninsula_Hong_Kong_%28full_view%29.jpg" },
    { name: "Mandarin Oriental Hong Kong", area: "中環", tier: "ラグジュアリー", highlight: "中環ビジネスエリア中心",
      star: 5, rooms: 502, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.3, reviewCount: 3800, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/hk/mandarinoriental.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8c/HK_Edinburgh_Place_%E6%96%87%E8%8F%AF%E6%9D%B1%E6%96%B9%E9%85%92%E5%BA%97_Mandarin_Oriental_Hotel_Connaught_Road_C.JPG" },
    { name: "The Ritz-Carlton, Hong Kong", area: "九龍", tier: "ラグジュアリー", highlight: "ICC 102-118F・世界一高層のホテル",
      star: 5, rooms: 312, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.2, reviewCount: 3200, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/hk/the-ritz-carlton-hong-kong.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d8/International_Commerce_Centre_201408.jpg" },
    { name: "Cordis, Hong Kong", area: "モンコック", tier: "ハイクラス", highlight: "MTRモンコック駅直結・夜市散策に便利",
      star: 5, rooms: 665, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 8.8, reviewCount: 5300, bestFor: ["couple", "family", "business"] },
    { name: "Hotel ICON", area: "尖沙咀", tier: "ハイクラス", highlight: "デザインホテル・ヴィクトリアハーバー眺望",
      star: 5, rooms: 262, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 8.9, reviewCount: 4100, bestFor: ["couple", "business"] },
    { name: "Mini Hotel Central", area: "中環", tier: "ミドル", highlight: "中環中心・モダンデザイン",
      star: 3, rooms: 218, amenities: ["restaurant", "free-wifi", "breakfast"], reviewScore: 8.2, reviewCount: 2800, bestFor: ["solo", "business", "budget"] },
  ],
  hanoi: [
    { name: "Sofitel Legend Metropole Hanoi", area: "旧市街", tier: "ラグジュアリー", highlight: "ハノイ最高峰の歴史的名門・1901年開業",
      star: 5, rooms: 364, amenities: ["pool", "spa", "restaurant", "bar", "concierge"], reviewScore: 9.4, reviewCount: 4100, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/vn/sofitel-legend-metropole-hanoi.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a0/Sofitel_Metropole%2C_Ng%C3%B4_Quy%E1%BB%81n_-_2022-09-02_01.jpg" },
    { name: "Hotel de l'Opera Hanoi", area: "オペラハウス周辺", tier: "ハイクラス", highlight: "オペラハウス徒歩・MGalleryブランド",
      star: 5, rooms: 107, amenities: ["spa", "gym", "restaurant", "bar", "free-wifi"], reviewScore: 9.0, reviewCount: 2900, bestFor: ["couple", "luxury"] },
    { name: "La Siesta Premium Hang Be", area: "旧市街", tier: "ハイクラス", highlight: "ブティック型・絶賛のホスピタリティ",
      star: 4, rooms: 56, amenities: ["spa", "restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 9.2, reviewCount: 2400, bestFor: ["couple", "solo"] },
    { name: "Lotte Hotel Hanoi", area: "バーディン", tier: "ラグジュアリー", highlight: "ロッテセンター高層階・市内一望",
      star: 5, rooms: 318, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 8.9, reviewCount: 3300, bestFor: ["couple", "business", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/vn/lotte-hanoi.ja.html" } },
    { name: "Hanoi Imperial Hotel", area: "旧市街", tier: "ミドル", highlight: "旧市街中心・観光徒歩圏",
      star: 4, rooms: 88, amenities: ["spa", "restaurant", "free-wifi", "breakfast"], reviewScore: 8.5, reviewCount: 1900, bestFor: ["couple", "solo", "budget"] },
  ],
  "ho-chi-minh-city": [
    { name: "The Reverie Saigon", area: "1区", tier: "ラグジュアリー", highlight: "イタリアンデザインのオペラハウス徒歩圏",
      star: 5, rooms: 286, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.2, reviewCount: 2200, bestFor: ["couple", "luxury"],
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b2/Saigon_Times_Square_april_2012.jpg" },
    { name: "Park Hyatt Saigon", area: "1区", tier: "ラグジュアリー", highlight: "オペラハウス前・コロニアル建築",
      star: 5, rooms: 245, amenities: ["pool", "spa", "restaurant", "bar", "concierge"], reviewScore: 9.4, reviewCount: 3100, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/vn/park-hyatt-saigon.ja.html" } },
    { name: "Sherwood Suites", area: "1区", tier: "ハイクラス", highlight: "アパートメント型・長期滞在に良い",
      star: 5, rooms: 228, amenities: ["pool", "gym", "restaurant", "kids-friendly", "free-wifi"], reviewScore: 8.9, reviewCount: 1700, bestFor: ["family", "long-stay", "business"] },
    { name: "Hotel Continental Saigon", area: "1区", tier: "ハイクラス", highlight: "1880年開業・サイゴン最古の名門",
      star: 4, rooms: 80, amenities: ["restaurant", "bar", "free-wifi", "breakfast", "concierge"], reviewScore: 8.5, reviewCount: 2300, bestFor: ["couple", "solo"] },
    { name: "Liberty Central Saigon Riverside Hotel", area: "1区", tier: "ミドル", highlight: "サイゴン川沿い・コスパ良",
      star: 4, rooms: 170, amenities: ["pool", "spa", "restaurant", "bar", "view"], reviewScore: 8.6, reviewCount: 4300, bestFor: ["couple", "solo", "budget"] },
  ],
  shanghai: [
    { name: "The Peninsula Shanghai", area: "外灘", tier: "ラグジュアリー", highlight: "外灘北端・浦東の夜景一望",
      star: 5, rooms: 235, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.4, reviewCount: 2800, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/cn/the-peninsula-shanghai.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/28/The_Peninsula_Shanghai.JPG" },
    { name: "Waldorf Astoria Shanghai on the Bund", area: "外灘", tier: "ラグジュアリー", highlight: "歴史建築 The Bund Club 内・象徴的なホテル",
      star: 5, rooms: 252, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.3, reviewCount: 2600, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/cn/waldorf-astoria-shanghai-on-the-bund.ja.html" } },
    { name: "Park Hyatt Shanghai", area: "陸家嘴", tier: "ラグジュアリー", highlight: "上海環球金融中心79-93F・世界最高峰のホテル",
      star: 5, rooms: 174, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.2, reviewCount: 2400, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/cn/park-hyatt-shanghai.ja.html" } },
    { name: "Jin Jiang Hotel Shanghai", area: "新天地", tier: "ハイクラス", highlight: "新天地徒歩・買物に便利",
      star: 4, rooms: 410, amenities: ["restaurant", "bar", "free-wifi", "breakfast", "business"], reviewScore: 8.4, reviewCount: 3200, bestFor: ["business", "couple"] },
    { name: "Hotel Indigo Shanghai on the Bund", area: "外灘", tier: "ハイクラス", highlight: "外灘南端・ブティック型",
      star: 5, rooms: 184, amenities: ["pool", "gym", "restaurant", "bar", "view"], reviewScore: 8.8, reviewCount: 2700, bestFor: ["couple", "solo"] },
  ],
  manila: [
    { name: "The Peninsula Manila", area: "マカティ", tier: "ラグジュアリー", highlight: "マカティ中心・ビジネス・観光どちらにも",
      star: 5, rooms: 469, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.0, reviewCount: 3400, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/ph/the-peninsula-manila.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/8/84/Ph-mm-makati-makati_cbd-ayala_ave.-makati_ave.-the_peninsula_%282015%29_01.jpg" },
    { name: "Manila Marriott Hotel", area: "パサイ", tier: "ハイクラス", highlight: "空港至近・カジノ隣接",
      star: 5, rooms: 570, amenities: ["pool", "spa", "gym", "restaurant", "airport-shuttle"], reviewScore: 8.7, reviewCount: 4800, bestFor: ["business", "family", "couple"] },
    { name: "Sofitel Philippine Plaza Manila", area: "パサイ", tier: "ハイクラス", highlight: "マニラ湾サンセット・ベイビュー",
      star: 5, rooms: 609, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 8.6, reviewCount: 5200, bestFor: ["family", "couple"] },
    { name: "Conrad Manila", area: "パサイ", tier: "ラグジュアリー", highlight: "MOAコンプレックス・マニラ湾サンセット",
      star: 5, rooms: 347, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 9.0, reviewCount: 3700, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/ph/conrad-manila.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/b/b7/Conrad_Hotel_Manila.JPG" },
    { name: "Red Planet Manila Mabini", area: "エルミタ", tier: "ミドル", highlight: "観光地至近・コスパ重視",
      star: 3, rooms: 250, amenities: ["restaurant", "free-wifi"], reviewScore: 7.8, reviewCount: 2100, bestFor: ["solo", "budget"] },
  ],
  paris: [
    { name: "The Ritz Paris", area: "ヴァンドーム広場", tier: "ラグジュアリー", highlight: "1898年開業・パリ最高峰の名門",
      star: 5, rooms: 142, amenities: ["pool", "spa", "restaurant", "bar", "concierge"], reviewScore: 9.4, reviewCount: 1900, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/fr/ritz-paris.ja.html" } },
    { name: "Hôtel Plaza Athénée", area: "シャンゼリゼ", tier: "ラグジュアリー", highlight: "ディオール本店至近・ファッショニスタ御用達",
      star: 5, rooms: 208, amenities: ["spa", "gym", "restaurant", "bar", "concierge"], reviewScore: 9.3, reviewCount: 2200, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/fr/plaza-athenee.ja.html" } },
    { name: "Pullman Paris Tour Eiffel", area: "エッフェル塔", tier: "ハイクラス", highlight: "エッフェル塔徒歩2分・絶景",
      star: 4, rooms: 430, amenities: ["spa", "gym", "restaurant", "bar", "view"], reviewScore: 8.6, reviewCount: 5400, bestFor: ["couple", "family", "business"] },
    { name: "Hotel Monge", area: "ラテン地区", tier: "ハイクラス", highlight: "ラテン地区・観光徒歩圏",
      star: 4, rooms: 36, amenities: ["spa", "free-wifi", "breakfast", "bar"], reviewScore: 8.9, reviewCount: 2100, bestFor: ["couple", "solo"] },
    { name: "Hôtel des Grands Boulevards", area: "オペラ", tier: "ミドル", highlight: "ブティック・オペラ座エリア",
      star: 4, rooms: 50, amenities: ["restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 8.5, reviewCount: 1800, bestFor: ["couple", "solo"] },
  ],
  london: [
    { name: "The Savoy", area: "コヴェントガーデン", tier: "ラグジュアリー", highlight: "テムズ川沿い・1889年開業の名門",
      star: 5, rooms: 267, amenities: ["spa", "gym", "restaurant", "bar", "concierge"], reviewScore: 9.3, reviewCount: 3400, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/gb/the-savoy.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b1/H%C3%B4tel_Savoy_The_Strand_Londres_-_edited.jpg" },
    { name: "The Langham, London", area: "リージェントストリート", tier: "ラグジュアリー", highlight: "BBC本社前・1865年開業",
      star: 5, rooms: 380, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.2, reviewCount: 3100, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/gb/the-langham-london.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/df/Langham_london.jpg" },
    { name: "ME London", area: "ストランド", tier: "ハイクラス", highlight: "シアター街徒歩圏・モダン",
      star: 5, rooms: 157, amenities: ["gym", "restaurant", "bar", "free-wifi", "view"], reviewScore: 8.7, reviewCount: 2600, bestFor: ["couple", "solo"] },
    { name: "The Ned", area: "シティ", tier: "ハイクラス", highlight: "歴史的銀行建築・9つのレストラン",
      star: 5, rooms: 250, amenities: ["pool", "spa", "gym", "restaurant", "bar"], reviewScore: 9.0, reviewCount: 2900, bestFor: ["couple", "luxury", "business"] },
    { name: "Premier Inn London City (Tower Hill)", area: "シティ", tier: "ミドル", highlight: "タワーブリッジ徒歩・コスパ最強チェーン",
      star: 3, rooms: 196, amenities: ["restaurant", "free-wifi", "breakfast"], reviewScore: 8.6, reviewCount: 6800, bestFor: ["solo", "family", "budget"] },
  ],
  helsinki: [
    { name: "Hotel Kämp", area: "中心部", tier: "ラグジュアリー", highlight: "ヘルシンキ最高峰・1887年開業",
      star: 5, rooms: 179, amenities: ["spa", "gym", "restaurant", "bar", "concierge"], reviewScore: 9.1, reviewCount: 2400, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/fi/kamp.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/14/Hotel_K%C3%A4mp_in_Helsinki.jpg" },
    { name: "Clarion Hotel Helsinki", area: "イェトカサーリ", tier: "ハイクラス", highlight: "屋上スカイバー・港湾景観",
      star: 4, rooms: 425, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 8.7, reviewCount: 4200, bestFor: ["couple", "family", "business"] },
    { name: "Scandic Park Helsinki", area: "中心部", tier: "ハイクラス", highlight: "公園隣接・中央駅徒歩圏",
      star: 4, rooms: 523, amenities: ["spa", "gym", "restaurant", "bar", "free-wifi"], reviewScore: 8.5, reviewCount: 3700, bestFor: ["business", "couple", "family"] },
    { name: "Hotel F6", area: "中心部", tier: "ミドル", highlight: "ブティック・カフェ街エリア",
      star: 4, rooms: 66, amenities: ["restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 9.0, reviewCount: 1700, bestFor: ["couple", "solo"] },
    { name: "Omena Hotel Helsinki Yrjönkatu", area: "中心部", tier: "バジェット", highlight: "セルフチェックイン・コスパ最強",
      star: 3, rooms: 152, amenities: ["free-wifi"], reviewScore: 7.9, reviewCount: 2100, bestFor: ["solo", "budget"] },
  ],
  rome: [
    { name: "Hotel de Russie", area: "スペイン階段", tier: "ラグジュアリー", highlight: "ピンチョの丘・セレブリティに愛される",
      star: 5, rooms: 120, amenities: ["spa", "gym", "restaurant", "bar", "concierge"], reviewScore: 9.3, reviewCount: 1800, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/it/de-russie.ja.html" } },
    { name: "Hotel Splendide Royal", area: "ヴェネト通り", tier: "ラグジュアリー", highlight: "ヴィッラ・ボルゲーゼ徒歩圏",
      star: 5, rooms: 69, amenities: ["restaurant", "bar", "free-wifi", "concierge", "view"], reviewScore: 9.2, reviewCount: 1500, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/it/splendide-royal.ja.html" } },
    { name: "Hotel Artemide", area: "テルミニ", tier: "ハイクラス", highlight: "テルミニ駅徒歩・観光ベース",
      star: 4, rooms: 85, amenities: ["spa", "restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 9.1, reviewCount: 5400, bestFor: ["couple", "family", "business"] },
    { name: "Hotel Indigo Rome - St. George", area: "ナヴォーナ広場", tier: "ハイクラス", highlight: "歴史地区中心",
      star: 5, rooms: 64, amenities: ["spa", "restaurant", "bar", "free-wifi", "view"], reviewScore: 8.8, reviewCount: 2100, bestFor: ["couple", "solo"] },
    { name: "The Beehive", area: "テルミニ", tier: "バジェット", highlight: "アメリカン経営・コスパとホスピタリティ",
      star: 3, rooms: 22, amenities: ["restaurant", "free-wifi", "breakfast"], reviewScore: 8.7, reviewCount: 1900, bestFor: ["solo", "budget"] },
  ],
  barcelona: [
    { name: "Hotel Arts Barcelona", area: "ベイ", tier: "ラグジュアリー", highlight: "海沿い高層・サグラダファミリア見える",
      star: 5, rooms: 483, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 9.0, reviewCount: 3600, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/es/arts.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/85/Hotel_Arts_by_night.JPG" },
    { name: "Mandarin Oriental Barcelona", area: "パセオ・デ・グラシア", tier: "ラグジュアリー", highlight: "ショッピング街中心",
      star: 5, rooms: 120, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.4, reviewCount: 2100, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/es/mandarinorientalbarcelona.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/90/Mandarin_Oriental_Barcelona.jpg" },
    { name: "Hotel Casa Camper", area: "ラバル", tier: "ハイクラス", highlight: "ブティック・カンペル創業者プロデュース",
      star: 4, rooms: 40, amenities: ["restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 8.9, reviewCount: 1600, bestFor: ["couple", "solo"] },
    { name: "H10 Casa Mimosa", area: "パセオ・デ・グラシア", tier: "ハイクラス", highlight: "ガウディ建築至近・屋上プール",
      star: 4, rooms: 79, amenities: ["pool", "spa", "restaurant", "bar", "view"], reviewScore: 8.9, reviewCount: 2400, bestFor: ["couple", "solo"] },
    { name: "Generator Barcelona", area: "グラシア", tier: "バジェット", highlight: "デザイナーズホステル・若者に人気",
      star: 3, rooms: 700, amenities: ["restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 7.8, reviewCount: 4400, bestFor: ["solo", "budget"] },
  ],
  "new-york": [
    { name: "The Plaza", area: "5番街", tier: "ラグジュアリー", highlight: "セントラルパーク前・映画の舞台",
      star: 5, rooms: 282, amenities: ["spa", "gym", "restaurant", "bar", "concierge"], reviewScore: 9.0, reviewCount: 2900, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/us/the-plaza.ja.html" } },
    { name: "The St. Regis New York", area: "ミッドタウン", tier: "ラグジュアリー", highlight: "ブラッディ・マリー発祥のホテル",
      star: 5, rooms: 238, amenities: ["spa", "gym", "restaurant", "bar", "concierge"], reviewScore: 9.2, reviewCount: 2200, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/us/the-st-regis-new-york.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/ce/5_Av_Mar_2021_43.jpg" },
    { name: "The Standard, High Line", area: "ミートパッキング", tier: "ハイクラス", highlight: "ハイラインを跨ぐデザインホテル",
      star: 4, rooms: 338, amenities: ["gym", "restaurant", "bar", "view", "free-wifi"], reviewScore: 8.6, reviewCount: 3800, bestFor: ["couple", "solo"] },
    { name: "citizenM New York Times Square", area: "タイムズスクエア", tier: "ハイクラス", highlight: "モダン・コスパ良",
      star: 4, rooms: 230, amenities: ["restaurant", "bar", "free-wifi", "gym"], reviewScore: 8.7, reviewCount: 5800, bestFor: ["solo", "couple", "business"] },
    { name: "Pod 51 Hotel", area: "ミッドタウン東", tier: "ミドル", highlight: "コンパクト客室・NY中心立地",
      star: 3, rooms: 425, amenities: ["restaurant", "free-wifi", "bar"], reviewScore: 8.0, reviewCount: 4600, bestFor: ["solo", "budget"] },
  ],
  "los-angeles": [
    { name: "The Beverly Hills Hotel", area: "ビバリーヒルズ", tier: "ラグジュアリー", highlight: "ピンクパレスの愛称・セレブリティ御用達",
      star: 5, rooms: 210, amenities: ["pool", "spa", "restaurant", "bar", "concierge"], reviewScore: 9.2, reviewCount: 2100, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/us/the-beverly-hills.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/47/The_Beverly_Hills_Hotel_%282013%29.jpg" },
    { name: "Shutters on the Beach", area: "サンタモニカ", tier: "ラグジュアリー", highlight: "ビーチフロント・西海岸の象徴",
      star: 5, rooms: 198, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.0, reviewCount: 1900, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/us/shutters-on-the-beach.ja.html" } },
    { name: "The Hollywood Roosevelt", area: "ハリウッド", tier: "ハイクラス", highlight: "第1回アカデミー賞会場・歴史",
      star: 4, rooms: 300, amenities: ["pool", "gym", "restaurant", "bar", "free-wifi"], reviewScore: 8.5, reviewCount: 4400, bestFor: ["couple", "solo"] },
    { name: "Waldorf Astoria Beverly Hills", area: "ビバリーヒルズ", tier: "ラグジュアリー", highlight: "屋上プール・ハリウッドサインの眺望",
      star: 5, rooms: 170, amenities: ["pool", "spa", "gym", "restaurant", "concierge"], reviewScore: 9.3, reviewCount: 1800, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/us/waldorf-astoria-beverly-hills.ja.html" } },
    { name: "Freehand Los Angeles", area: "ダウンタウン", tier: "ミドル", highlight: "デザイン×ホステルのハイブリッド",
      star: 3, rooms: 226, amenities: ["pool", "restaurant", "bar", "free-wifi"], reviewScore: 8.2, reviewCount: 2700, bestFor: ["solo", "budget"] },
  ],
  honolulu: [
    { name: "Halekulani", area: "ワイキキ", tier: "ラグジュアリー", highlight: "ハワイ最高峰の老舗・「天国にふさわしい館」の名",
      star: 5, rooms: 453, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.3, reviewCount: 3600, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/us/halekulani.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Halekulani_Hotel.jpg" },
    { name: "The Royal Hawaiian, a Luxury Collection Resort", area: "ワイキキ", tier: "ラグジュアリー", highlight: "ピンクパレス・1927年開業",
      star: 5, rooms: 528, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 9.0, reviewCount: 3200, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/us/the-royal-hawaiian.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/The_Royal_Hawaiian_%282024%29-L1004805.jpg" },
    { name: "Sheraton Waikiki", area: "ワイキキ", tier: "ハイクラス", highlight: "ビーチフロント・大型リゾート",
      star: 4, rooms: 1636, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 8.6, reviewCount: 6800, bestFor: ["family", "couple"],
      imageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/53/Sheraton_Waikiki_from_Waikiki_Beach.jpg" },
    { name: "Aston Waikiki Sunset", area: "ワイキキ", tier: "ハイクラス", highlight: "コンドミニアム型・家族向け",
      star: 4, rooms: 435, amenities: ["pool", "gym", "kids-friendly", "free-wifi", "view"], reviewScore: 8.5, reviewCount: 3100, bestFor: ["family", "long-stay"] },
    { name: "Ohia Waikiki Studio Suites", area: "ワイキキ", tier: "ミドル", highlight: "コスパ重視・キッチン付き",
      star: 3, rooms: 76, amenities: ["kids-friendly", "free-wifi", "parking"], reviewScore: 8.1, reviewCount: 1600, bestFor: ["family", "long-stay", "budget"] },
  ],
  dubai: [
    { name: "Burj Al Arab Jumeirah", area: "ジュメイラ", tier: "ラグジュアリー", highlight: "7つ星の称号・ドバイのシンボル",
      star: 5, rooms: 202, amenities: ["pool", "spa", "restaurant", "concierge", "view"], reviewScore: 9.3, reviewCount: 2400, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/ae/burj-al-arab.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/2/2a/Burj_Al_Arab%2C_Dubai%2C_by_Joi_Ito_Dec2007.jpg" },
    { name: "Atlantis, The Palm", area: "パーム・ジュメイラ", tier: "ラグジュアリー", highlight: "水族館・ウォーターパーク併設",
      star: 5, rooms: 1539, amenities: ["pool", "spa", "restaurant", "kids-friendly", "view"], reviewScore: 8.9, reviewCount: 7200, bestFor: ["family", "luxury", "couple"],
      otaUrls: { booking: "https://www.booking.com/hotel/ae/atlantis-the-palm.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/f/f3/Hotel_Atlantis_at_Sunset%2C_The_Palm_-_Dubai_%2849510861268%29.jpg" },
    { name: "Address Downtown", area: "ダウンタウン", tier: "ラグジュアリー", highlight: "ブルジュ・ハリファ正面",
      star: 5, rooms: 196, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 9.1, reviewCount: 3300, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/ae/address-downtown-dubai.ja.html" },
      imageUrl: "https://upload.wikimedia.org/wikipedia/en/2/2f/The_Address_Downtown_Dubai.jpg" },
    { name: "Armani Hotel Dubai", area: "ダウンタウン", tier: "ラグジュアリー", highlight: "ブルジュ・ハリファ内・ジョルジオ・アルマーニ監修",
      star: 5, rooms: 160, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.0, reviewCount: 2700, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/ae/armani-dubai.ja.html" } },
    { name: "Jumeirah Zabeel Saray", area: "パーム・ジュメイラ", tier: "ラグジュアリー", highlight: "オスマン宮殿風建築・プライベートビーチ",
      star: 5, rooms: 405, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 9.1, reviewCount: 3400, bestFor: ["couple", "luxury", "family"],
      otaUrls: { booking: "https://www.booking.com/hotel/ae/jumeirah-zabeel-saray.ja.html" } },
    { name: "Rove Downtown", area: "ダウンタウン", tier: "ミドル", highlight: "モダン・コスパ良・若年層向け",
      star: 3, rooms: 420, amenities: ["pool", "gym", "restaurant", "free-wifi", "breakfast"], reviewScore: 8.6, reviewCount: 5600, bestFor: ["solo", "couple", "budget"] },
  ],
  sydney: [
    { name: "Park Hyatt Sydney", area: "ザ・ロックス", tier: "ラグジュアリー", highlight: "オペラハウス正面の絶景",
      star: 5, rooms: 155, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.4, reviewCount: 2800, bestFor: ["couple", "luxury"],
      otaUrls: { booking: "https://www.booking.com/hotel/au/park-hyatt-sydney.ja.html" } },
    { name: "Four Seasons Hotel Sydney", area: "CBD", tier: "ラグジュアリー", highlight: "オペラハウス・ハーバーブリッジ見える",
      star: 5, rooms: 531, amenities: ["pool", "spa", "gym", "restaurant", "view"], reviewScore: 9.1, reviewCount: 4100, bestFor: ["couple", "luxury", "business"],
      otaUrls: { booking: "https://www.booking.com/hotel/au/four-seasons-sydney.ja.html" } },
    { name: "QT Sydney", area: "CBD", tier: "ハイクラス", highlight: "歴史建築×モダン・デザイナーズ",
      star: 5, rooms: 200, amenities: ["spa", "gym", "restaurant", "bar", "free-wifi"], reviewScore: 8.8, reviewCount: 3400, bestFor: ["couple", "solo"] },
    { name: "Adge Hotel", area: "サリーヒルズ", tier: "ハイクラス", highlight: "ブティック・トレンドエリア",
      star: 4, rooms: 38, amenities: ["restaurant", "bar", "free-wifi", "breakfast"], reviewScore: 8.9, reviewCount: 1500, bestFor: ["couple", "solo"] },
    { name: "ibis Sydney World Square", area: "CBD", tier: "ミドル", highlight: "CBD中心・コスパ重視",
      star: 3, rooms: 166, amenities: ["restaurant", "free-wifi", "bar"], reviewScore: 8.2, reviewCount: 3300, bestFor: ["solo", "budget", "business"] },
  ],
  auckland: [
    { name: "Hotel Britomart", area: "ブリトマート", tier: "ラグジュアリー", highlight: "5つ星エコホテル・港エリア",
      star: 5, rooms: 99, amenities: ["restaurant", "bar", "free-wifi", "breakfast", "concierge"], reviewScore: 9.3, reviewCount: 1700, bestFor: ["couple", "luxury"] },
    { name: "SO/ Auckland", area: "CBD", tier: "ラグジュアリー", highlight: "デザインホテル・港湾景観",
      star: 5, rooms: 130, amenities: ["spa", "gym", "restaurant", "bar", "view"], reviewScore: 9.0, reviewCount: 2100, bestFor: ["couple", "luxury", "business"] },
    { name: "QT Auckland", area: "プリンセス・ワーフ", tier: "ハイクラス", highlight: "ヴィアダクトハーバー・ブティック",
      star: 5, rooms: 150, amenities: ["gym", "restaurant", "bar", "view", "free-wifi"], reviewScore: 8.8, reviewCount: 1900, bestFor: ["couple", "solo"] },
    { name: "Naumi Auckland Airport", area: "空港", tier: "ハイクラス", highlight: "空港5分・トランジット最適",
      star: 4, rooms: 193, amenities: ["restaurant", "bar", "free-wifi", "airport-shuttle", "gym"], reviewScore: 8.5, reviewCount: 2600, bestFor: ["business", "solo"] },
    { name: "CityLife Auckland", area: "CBD", tier: "ミドル", highlight: "クイーンストリート・コスパ良",
      star: 4, rooms: 232, amenities: ["pool", "gym", "restaurant", "free-wifi", "breakfast"], reviewScore: 8.3, reviewCount: 2400, bestFor: ["solo", "couple", "budget"] },
  ],
  guam: [
    { name: "Hyatt Regency Guam", area: "タモン", tier: "ハイクラス", highlight: "タモン湾ビーチフロント・大型プール",
      star: 4, rooms: 437, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 8.7, reviewCount: 3800, bestFor: ["family", "couple"] },
    { name: "The Tsubaki Tower", area: "タモン", tier: "ラグジュアリー", highlight: "新規開業・タモンの最高峰",
      star: 5, rooms: 340, amenities: ["pool", "spa", "restaurant", "view", "concierge"], reviewScore: 9.2, reviewCount: 1900, bestFor: ["couple", "luxury", "family"] },
    { name: "Hilton Guam Resort & Spa", area: "タモン湾", tier: "ハイクラス", highlight: "プライベートビーチ・スパ",
      star: 4, rooms: 646, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 8.6, reviewCount: 4300, bestFor: ["family", "couple"] },
    { name: "Dusit Thani Guam Resort", area: "タモン", tier: "ハイクラス", highlight: "全室海向き・タモン湾オーシャンビュー",
      star: 4, rooms: 419, amenities: ["pool", "spa", "restaurant", "view", "kids-friendly"], reviewScore: 8.7, reviewCount: 3100, bestFor: ["couple", "family"] },
    { name: "Holiday Resort & Spa Guam", area: "タモン", tier: "ミドル", highlight: "コスパ良・ファミリー向け",
      star: 3, rooms: 264, amenities: ["pool", "restaurant", "free-wifi", "kids-friendly", "breakfast"], reviewScore: 8.0, reviewCount: 2400, bestFor: ["family", "budget"] },
  ],
};

export function getCuratedHotels(slug: string): CuratedHotel[] {
  return CURATED_HOTELS[slug] ?? [];
}
