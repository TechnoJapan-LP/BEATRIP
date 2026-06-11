/**
 * 静的記事 (= page.tsx として実装されている編集部コンテンツ) のメタデータレジストリ。
 *
 * generated 記事 (article-generator 等) は slug ベースの動的ルート
 * `/articles/[slug]` で配信されるのに対し、ここに載るのは
 * `/articles/guides/*`, `/articles/ota-compare/*` 等の「静的ルートを持つ」記事。
 *
 * 用途:
 *  - /articles ハブでのカテゴリ別一覧表示
 *  - GlobalSearch の検索インデックス
 *  - /articles/ota-compare ハブ・/seasons インデックスの一覧
 *
 * ルートを追加・削除した場合は必ずこのレジストリも更新すること。
 */

export type StaticArticleCategory =
  | "guide"
  | "ota-compare"
  | "ranking"
  | "seasonal"
  | "feature";

export type StaticArticle = {
  /** ルートの末尾セグメント (一覧 key 用) */
  slug: string;
  /** ja のパス (en は /en prefix を localizeHref で付与) */
  href: string;
  title: string;
  /** 1 行説明 (カード・検索結果のサブラベル) */
  description: string;
  category: StaticArticleCategory;
  /** 検索 haystack 補助キーワード */
  keywords?: string[];
  /** OTA 比較記事の対象都市 slug (HOTEL_DESTINATIONS と対応) */
  citySlug?: string;
};

export const STATIC_ARTICLE_CATEGORY_LABEL: Record<
  StaticArticleCategory,
  string
> = {
  guide: "旅行ガイド",
  "ota-compare": "OTA 比較",
  ranking: "ホテルランキング",
  seasonal: "シーズン特集",
  feature: "特集",
};

export const STATIC_ARTICLES: StaticArticle[] = [
  // ---- 旅行ガイド (8) ----
  {
    slug: "lcc-tips",
    href: "/articles/guides/lcc-tips",
    title: "LCC 活用の 10 のコツ",
    description: "格安航空券で失敗しない使い方",
    category: "guide",
    keywords: ["LCC", "格安航空券", "ピーチ", "ジェットスター"],
  },
  {
    slug: "best-booking-timing",
    href: "/articles/guides/best-booking-timing",
    title: "航空券の最安タイミング",
    description: "予約時期の考え方と底値の狙い方",
    category: "guide",
    keywords: ["予約タイミング", "いつ買う", "最安値"],
  },
  {
    slug: "first-overseas-checklist",
    href: "/articles/guides/first-overseas-checklist",
    title: "初海外 準備チェックリスト",
    description: "パスポートから出発まで",
    category: "guide",
    keywords: ["初めて", "海外旅行", "持ち物", "パスポート"],
  },
  {
    slug: "miles-complete-guide",
    href: "/articles/guides/miles-complete-guide",
    title: "マイル 完全ガイド",
    description: "貯め方・使い方を基礎から",
    category: "guide",
    keywords: ["マイル", "マイレージ", "ANA", "JAL"],
  },
  {
    slug: "baggage-rules",
    href: "/articles/guides/baggage-rules",
    title: "手荷物の完全ルール",
    description: "サイズ・重量・液体物の基準",
    category: "guide",
    keywords: ["手荷物", "受託手荷物", "機内持ち込み", "液体"],
  },
  {
    slug: "transit-guide",
    href: "/articles/guides/transit-guide",
    title: "乗り継ぎ・トランジット",
    description: "接続時間と過ごし方",
    category: "guide",
    keywords: ["乗り継ぎ", "トランジット", "経由便"],
  },
  {
    slug: "esim-setup-guide",
    href: "/articles/guides/esim-setup-guide",
    title: "eSIM 設定ガイド",
    description: "海外スマホ通信の設定方法",
    category: "guide",
    keywords: ["eSIM", "海外通信", "SIM"],
  },
  {
    slug: "family-travel-tips",
    href: "/articles/guides/family-travel-tips",
    title: "子連れ旅行のコツ",
    description: "移動・宿選び・持ち物",
    category: "guide",
    keywords: ["子連れ", "家族旅行", "ファミリー"],
  },

  // ---- OTA 比較 (13 都市) ----
  {
    slug: "ota-compare-tokyo",
    href: "/articles/ota-compare/tokyo",
    title: "東京 OTA 比較",
    description: "Booking vs Agoda vs Trip.com 徹底比較",
    category: "ota-compare",
    citySlug: "tokyo",
  },
  {
    slug: "ota-compare-osaka",
    href: "/articles/ota-compare/osaka",
    title: "大阪 OTA 比較",
    description: "USJ・心斎橋エリアの最安サイト比較",
    category: "ota-compare",
    citySlug: "osaka",
  },
  {
    slug: "ota-compare-sapporo",
    href: "/articles/ota-compare/sapporo",
    title: "札幌 OTA 比較",
    description: "雪まつり期も狙う 4 大 OTA 比較",
    category: "ota-compare",
    citySlug: "sapporo",
  },
  {
    slug: "ota-compare-fukuoka",
    href: "/articles/ota-compare/fukuoka",
    title: "福岡 OTA 比較",
    description: "博多・天神の駅近ホテル比較",
    category: "ota-compare",
    citySlug: "fukuoka",
  },
  {
    slug: "ota-compare-okinawa",
    href: "/articles/ota-compare/okinawa",
    title: "沖縄 OTA 比較",
    description: "那覇・恩納村リゾートの最安サイト比較",
    category: "ota-compare",
    citySlug: "okinawa",
  },
  {
    slug: "ota-compare-honolulu",
    href: "/articles/ota-compare/honolulu",
    title: "ホノルル OTA 比較",
    description: "ワイキキの 4 大 OTA 徹底比較",
    category: "ota-compare",
    citySlug: "honolulu",
  },
  {
    slug: "ota-compare-seoul",
    href: "/articles/ota-compare/seoul",
    title: "ソウル OTA 比較",
    description: "明洞・弘大・江南の最安サイト比較",
    category: "ota-compare",
    citySlug: "seoul",
  },
  {
    slug: "ota-compare-bangkok",
    href: "/articles/ota-compare/bangkok",
    title: "バンコク OTA 比較",
    description: "コスパ最強都市の 4 大 OTA 比較",
    category: "ota-compare",
    citySlug: "bangkok",
  },
  {
    slug: "ota-compare-singapore",
    href: "/articles/ota-compare/singapore",
    title: "シンガポール OTA 比較",
    description: "マリーナベイ周辺の高単価ホテル比較",
    category: "ota-compare",
    citySlug: "singapore",
  },
  {
    slug: "ota-compare-taipei",
    href: "/articles/ota-compare/taipei",
    title: "台北 OTA 比較",
    description: "中山・西門町・信義の OTA 比較",
    category: "ota-compare",
    citySlug: "taipei",
  },
  {
    slug: "ota-compare-paris",
    href: "/articles/ota-compare/paris",
    title: "パリ OTA 比較",
    description: "欧州系ホテルに強い OTA を比較",
    category: "ota-compare",
    citySlug: "paris",
  },
  {
    slug: "ota-compare-hong-kong",
    href: "/articles/ota-compare/hong-kong",
    title: "香港 OTA 比較",
    description: "中環・尖沙咀の高層ホテル比較",
    category: "ota-compare",
    citySlug: "hong-kong",
  },
  {
    slug: "ota-compare-busan",
    href: "/articles/ota-compare/busan",
    title: "釜山 OTA 比較",
    description: "海雲台・西面の最安サイト比較",
    category: "ota-compare",
    citySlug: "busan",
  },

  // ---- ホテルランキング (3) ----
  {
    slug: "rankings-couples",
    href: "/articles/rankings/couples",
    title: "カップル向けホテル TOP 10",
    description: "二人旅・記念日に最適なホテル",
    category: "ranking",
    keywords: ["カップル", "記念日", "ランキング"],
  },
  {
    slug: "rankings-family",
    href: "/articles/rankings/family",
    title: "ファミリー向けホテル TOP 10",
    description: "子連れに優しい設備・キッズ対応",
    category: "ranking",
    keywords: ["ファミリー", "子連れ", "ランキング"],
  },
  {
    slug: "rankings-solo",
    href: "/articles/rankings/solo",
    title: "一人旅向けホテル TOP 10",
    description: "ソロ滞在で快適なホテル",
    category: "ranking",
    keywords: ["一人旅", "ソロ", "ランキング"],
  },

  // ---- シーズン特集 (年号付き) (2) ----
  {
    slug: "seasonal-autumn-2026",
    href: "/articles/seasonal/autumn-2026",
    title: "2026 秋の旅行計画",
    description: "紅葉・温泉・秋グルメ月別ガイド",
    category: "seasonal",
    keywords: ["秋", "紅葉", "温泉", "2026"],
  },
  {
    slug: "seasonal-winter-2026",
    href: "/articles/seasonal/winter-2026",
    title: "2026 冬の旅行計画",
    description: "雪国・温泉・避寒地ガイド",
    category: "seasonal",
    keywords: ["冬", "雪", "温泉", "2026"],
  },

  // ---- 特集 (2) ----
  {
    slug: "miles-booking-guide",
    href: "/articles/miles-booking-guide",
    title: "マイル予約ガイド",
    description: "JAL/ANA マイルで予約 完全ガイド",
    category: "feature",
    keywords: ["マイル", "特典航空券", "JAL", "ANA"],
  },
  {
    slug: "sale-prediction-2027",
    href: "/articles/sale-prediction-2027",
    title: "2027 セール予測",
    description: "JAL/ANA/LCC のセール時期予測",
    category: "feature",
    keywords: ["セール予測", "タイムセール", "2027"],
  },
];

/** OTA 比較記事のみ (13 都市) */
export const OTA_COMPARE_ARTICLES = STATIC_ARTICLES.filter(
  (a) => a.category === "ota-compare"
);

export function getStaticArticlesByCategory(
  category: StaticArticleCategory
): StaticArticle[] {
  return STATIC_ARTICLES.filter((a) => a.category === category);
}
