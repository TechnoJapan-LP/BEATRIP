/**
 * 旅行用品 物販アフィリエイトのレジストリ
 *
 * もしもアフィリエイト (物販特化 ASP) の「かんたんリンク」(Amazon / 楽天 / Yahoo!
 * を 1 ボタンに集約) や、Amazon / 楽天の個別商品リンクを、旅行用品として
 * ガイド記事内に設置するためのデータ定義。
 *
 * 設計方針は既存 asp-partners.ts の external_url 方式に揃える:
 *  - 各商品は env (AFFILIATE_URL_GOODS_*) に「クリック URL 全文」(http(s):// から) を持つ
 *  - env 未設定 / 無効な値の商品は UI に出さない (収益が立たないリンクは表示しない)
 *  - 実在しない商品 URL は捏造しない。env が空ならブロックごと非表示になる
 *
 * 各商品は recommendedFor に「設置すべきガイド記事の slug」を持ち、
 * コンポーネント側はこのメタを引いて「その記事に出すべき商品」をフィルタする。
 * 新商品の追加は env + この配列への 1 件追加で、該当記事に自動表示される。
 *
 * 制約:
 *  - emoji 文字は使わない。
 */

/** 旅行用品カテゴリ (UI のグルーピング・ラベル用) */
export type TravelGoodCategory =
  | "luggage" // スーツケース・バッグ類
  | "power" // 電源・充電
  | "comfort" // 機内・移動の快適グッズ
  | "packing" // パッキング・収納
  | "security" // 防犯・貴重品
  | "connectivity" // 通信機器
  | "kids"; // 子連れ便利グッズ

/** アクセントカラー (TrackedPartnerLink と同じパレット) */
export type TravelGoodAccent =
  | "rose"
  | "sky"
  | "emerald"
  | "violet"
  | "amber"
  | "blue"
  | "zinc";

export type TravelGood = {
  /** 一意な id (env キーのサフィックスと対応) */
  id: string;
  /** 表示名 (日本語) */
  label: string;
  /** 一行紹介 (カードの副題) */
  tagline: string;
  /** カテゴリ */
  category: TravelGoodCategory;
  /**
   * env 名。external_url 方式と同じく「クリック URL 全文」を入れる。
   * (もしもの「かんたんリンク」or Amazon/楽天の商品 URL)
   */
  matEnv: string;
  /** カード装飾のアクセントカラー */
  accent: TravelGoodAccent;
  /** この商品を設置すべきガイド記事の slug 一覧 */
  recommendedFor: string[];
};

/** 全 商品レジストリ */
export const TRAVEL_GOODS: TravelGood[] = [
  {
    id: "suitcase",
    label: "スーツケース・キャリーケース",
    tagline: "機内持ち込み〜大容量まで。TSA ロック付きが安心",
    category: "luggage",
    matEnv: "AFFILIATE_URL_GOODS_SUITCASE",
    accent: "sky",
    recommendedFor: ["first-overseas-checklist", "family-travel-tips"],
  },
  {
    id: "power-adapter",
    label: "変換プラグ・変圧器",
    tagline: "渡航先のコンセント形状に対応。マルチタイプが万能",
    category: "power",
    matEnv: "AFFILIATE_URL_GOODS_POWER_ADAPTER",
    accent: "amber",
    recommendedFor: ["esim-setup-guide", "first-overseas-checklist"],
  },
  {
    id: "power-bank",
    label: "モバイルバッテリー",
    tagline: "機内持ち込みルール対応の容量。eSIM・地図アプリの電池切れ対策に",
    category: "power",
    matEnv: "AFFILIATE_URL_GOODS_POWER_BANK",
    accent: "emerald",
    recommendedFor: ["baggage-rules", "transit-guide"],
  },
  {
    id: "neck-pillow",
    label: "ネックピロー",
    tagline: "長距離フライト・乗り継ぎ待ちの首をサポート",
    category: "comfort",
    matEnv: "AFFILIATE_URL_GOODS_NECK_PILLOW",
    accent: "violet",
    recommendedFor: ["transit-guide", "baggage-rules"],
  },
  {
    id: "compression-bag",
    label: "圧縮袋・パッキングキューブ",
    tagline: "荷物をコンパクトに。受託手荷物の超過対策にも",
    category: "packing",
    matEnv: "AFFILIATE_URL_GOODS_COMPRESSION_BAG",
    accent: "blue",
    recommendedFor: ["baggage-rules", "family-travel-tips"],
  },
  {
    id: "passport-case",
    label: "パスポートケース・防犯ポーチ",
    tagline: "貴重品をまとめて管理。スキミング防止素材が安心",
    category: "security",
    matEnv: "AFFILIATE_URL_GOODS_PASSPORT_CASE",
    accent: "zinc",
    recommendedFor: ["first-overseas-checklist"],
  },
  {
    id: "mobile-wifi",
    label: "海外用 WiFi ルーター・eSIM 端末",
    tagline: "現地での通信手段を確保。複数台シェアにも",
    category: "connectivity",
    matEnv: "AFFILIATE_URL_GOODS_MOBILE_WIFI",
    accent: "sky",
    recommendedFor: ["esim-setup-guide"],
  },
  {
    id: "travel-kids",
    label: "子連れ便利グッズ",
    tagline: "機内おもちゃ・携帯ベビーグッズで移動を快適に",
    category: "kids",
    matEnv: "AFFILIATE_URL_GOODS_TRAVEL_KIDS",
    accent: "rose",
    recommendedFor: ["family-travel-tips"],
  },
];

/** id で 1 件取得 */
export function getTravelGood(id: string): TravelGood | undefined {
  return TRAVEL_GOODS.find((g) => g.id === id);
}

/**
 * 商品が「有効」(= env にクリック URL が設定済み) かを判定。
 * external_url 方式 (asp-partners.ts) と同じく http(s):// で始まる文字列を要求する。
 */
function isTravelGoodEnabled(good: TravelGood): boolean {
  const v = process.env[good.matEnv];
  return typeof v === "string" && /^https?:\/\//.test(v.trim());
}

/**
 * 商品のクリック URL を取得。
 * env が未設定 or http(s):// で始まらない無効値なら null を返す。
 */
export function getTravelGoodUrl(good: TravelGood): string | null {
  const v = process.env[good.matEnv];
  if (typeof v !== "string") return null;
  const url = v.trim();
  if (!/^https?:\/\//.test(url)) return null;
  return url;
}

/**
 * 指定ガイド記事 slug に出すべき商品のうち、env 設定済み (= 有効) のものだけ返す。
 * 0 件の場合は空配列 (呼び出し側でブロックごと非表示にする)。
 */
export function getTravelGoodsForArticle(articleSlug: string): TravelGood[] {
  return TRAVEL_GOODS.filter(
    (g) => g.recommendedFor.includes(articleSlug) && isTravelGoodEnabled(g)
  );
}

/**
 * 全商品の env 設定状況 (set/unset)。値は返さない。
 * /admin の可視化用。
 */
export function getTravelGoodsEnvStatus(): Array<{
  id: string;
  label: string;
  envKey: string;
  set: boolean;
}> {
  return TRAVEL_GOODS.map((g) => ({
    id: g.id,
    label: g.label,
    envKey: g.matEnv,
    set: isTravelGoodEnabled(g),
  }));
}
