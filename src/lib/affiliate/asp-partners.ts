/**
 * ASP 経由提携先のメタデータと BEATRIP 内での配置設計
 *
 * 各 partner は env で a8mat を持つ。env 未設定なら disabled = true となり
 * UI 側で出さない (収益が立たないリンクは表示しない方針)。
 *
 * 各 partner にカテゴリと「適用シーン」を持たせ、コンポーネント側はこの
 * メタを引いて「自分の場所に表示すべき partner」をフィルタする。
 * これにより、新 partner 追加時は ENV と asp-partners.ts への 1 行追加で
 * 自動的に該当 UI ブロックに出る。
 */

import { buildA8Link, isValidA8Mat } from "./a8-link";

export type AspCategory =
  | "flight-domestic"   // 国内航空券
  | "flight-overseas"   // 海外航空券
  | "hotel-domestic"    // 国内ホテル
  | "hotel-overseas"    // 海外ホテル
  | "hotel-luxury"      // 高級ホテル特化
  | "tour-package"      // パッケージツアー
  | "tour-okinawa"      // 沖縄特化
  | "tour-local"        // 現地アクティビティ・ガイドツアー
  | "rental-car"        // レンタカー
  | "rail-domestic"     // 国内鉄道 (新幹線・特急)
  | "esim-wifi"         // eSIM / Wi-Fi レンタル
  | "insurance"         // 海外旅行保険
  | "transfer";         // 空港送迎

export type AspPartner = {
  id: string;
  /** 表示用日本語名 */
  label: string;
  /** ECID — A8 上の広告主識別子 (デバッグ・参照用) */
  ecid: string;
  /** 一行紹介 (UI で副題として使う) */
  tagline: string;
  /** 該当カテゴリ (複数可) */
  categories: AspCategory[];
  /** 環境変数名 (a8mat を入れる) */
  matEnv: string;
  /** デフォルトの遷移先 (a8ejpredirect なしの場合に広告主LP に飛ぶ) */
  defaultDestination?: string;
  /** カテゴリ別アクセントカラー (Tailwind) */
  accent: "rose" | "sky" | "emerald" | "violet" | "amber" | "blue" | "zinc";
  /** UI で優先表示すべきか */
  priority: number;
};

/** 全 partner レジストリ */
export const ASP_PARTNERS: AspPartner[] = [
  {
    id: "airtrip-rental",
    label: "エアトリレンタカー",
    ecid: "s00000001343",
    tagline: "日本全国のレンタカー格安料金を比較",
    categories: ["rental-car"],
    matEnv: "A8_AIRTRIP_RENTAL_MAT",
    accent: "rose",
    priority: 6,
  },
  {
    id: "jtb",
    label: "JTB",
    ecid: "s00000005350",
    tagline: "国内最大手の旅行代理店・パッケージツアー",
    categories: ["tour-package", "hotel-domestic", "hotel-overseas"],
    matEnv: "A8_JTB_MAT",
    accent: "blue",
    priority: 1,
  },
  {
    id: "okinawa-tourist",
    label: "沖縄ツーリスト",
    ecid: "s00000026857",
    tagline: "沖縄旅行の専門・離島ツアー・レンタカー",
    categories: ["tour-okinawa"],
    matEnv: "A8_OKINAWA_TOURIST_MAT",
    accent: "emerald",
    priority: 5,
  },
  {
    id: "yahoo-travel",
    label: "Yahoo!トラベル",
    ecid: "s00000023244",
    tagline: "PayPayポイントが貯まる・使えるホテル予約",
    categories: ["hotel-domestic"],
    matEnv: "A8_YAHOO_TRAVEL_MAT",
    accent: "violet",
    priority: 2,
  },
  {
    id: "newt",
    label: "NEWT（令和トラベル）",
    ecid: "s00000025498",
    tagline: "アプリ完結型の海外ツアー",
    categories: ["tour-package", "flight-overseas"],
    matEnv: "A8_NEWT_MAT",
    accent: "sky",
    priority: 3,
  },
  {
    id: "ichikyu",
    label: "一休.com",
    ecid: "s00000000218",
    tagline: "高級ホテル・旅館の予約サイト",
    categories: ["hotel-luxury", "hotel-domestic"],
    matEnv: "A8_ICHIKYU_MAT",
    accent: "amber",
    priority: 2,
  },
  {
    id: "global-wifi",
    label: "グローバルWiFi（ビジョン）",
    ecid: "s00000011875",
    tagline: "海外Wi-Fiレンタル・最短当日受取",
    categories: ["esim-wifi"],
    matEnv: "A8_GLOBAL_WIFI_MAT",
    accent: "zinc",
    priority: 4,
  },
  {
    id: "travel-west",
    label: "トラベルウエスト",
    ecid: "tw",
    tagline: "海外航空券の最安値検索・比較・予約",
    categories: ["flight-overseas"],
    matEnv: "A8_TRAVEL_WEST_MAT",
    accent: "sky",
    priority: 3,
  },
  {
    id: "real-ticket",
    label: "リアルチケット",
    ecid: "rt",
    tagline: "24時間365日・国内航空券の最安値検索",
    categories: ["flight-domestic"],
    matEnv: "A8_REAL_TICKET_MAT",
    accent: "rose",
    priority: 3,
  },
  {
    id: "navitime-travel",
    label: "NAVITIME Travel",
    ecid: "nt",
    tagline: "JR新幹線・特急チケットを自宅にお届け",
    categories: ["rail-domestic"],
    matEnv: "A8_NAVITIME_MAT",
    accent: "emerald",
    priority: 4,
  },
  {
    id: "buyma-travel",
    label: "BUYMA TRAVEL",
    ecid: "bt",
    tagline: "現地在住ガイドが日本語で案内するプライベートツアー",
    categories: ["tour-local"],
    matEnv: "A8_BUYMA_TRAVEL_MAT",
    accent: "violet",
    priority: 2,
  },
];

/** id で 1 件取得 */
export function getAspPartner(id: string): AspPartner | undefined {
  return ASP_PARTNERS.find((p) => p.id === id);
}

/** 指定カテゴリで、ENV 設定済み (= 有効) の partner だけ返す */
export function getActiveAspPartners(category: AspCategory): AspPartner[] {
  return ASP_PARTNERS.filter(
    (p) =>
      p.categories.includes(category) && isValidA8Mat(process.env[p.matEnv])
  ).sort((a, b) => a.priority - b.priority);
}

/** partner の クリック URL を組み立て */
export function getAspPartnerUrl(
  partner: AspPartner,
  destinationUrl?: string
): string | null {
  const a8mat = process.env[partner.matEnv];
  if (!isValidA8Mat(a8mat)) return null;
  return buildA8Link(a8mat, destinationUrl ? { redirectUrl: destinationUrl } : undefined);
}
