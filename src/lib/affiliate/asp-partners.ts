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
 *
 * 同一広告主でも、プログラム (航空券/ツアー/パッケージ等) が異なれば
 * 別 partner として登録する。a8mat はプログラム別に発行されるため、
 * カテゴリ・配置箇所・コンバージョン率が違うので独立管理する。
 */

import { buildA8Link, isValidA8Mat } from "./a8-link";

export type AspCategory =
  | "flight-domestic"     // 国内航空券
  | "flight-overseas"     // 海外航空券
  | "hotel-domestic"      // 国内ホテル
  | "hotel-overseas"      // 海外ホテル
  | "hotel-luxury"        // 高級ホテル特化
  | "hotel-glamping"      // グランピング・特殊宿泊
  | "tour-package"        // パッケージツアー
  | "tour-overseas"       // 海外ツアー専門
  | "tour-okinawa"        // 沖縄特化
  | "tour-local"          // 現地アクティビティ・ガイドツアー
  | "activity-domestic"   // 国内レジャー・アクティビティ
  | "rental-car"          // レンタカー
  | "rail-domestic"       // 国内鉄道 (新幹線・特急)
  | "bus-domestic"        // 国内バス (夜行・高速)
  | "transport-europe"    // 欧州交通 (鉄道・バス)
  | "esim-wifi"           // eSIM / Wi-Fi レンタル
  | "insurance"           // 海外旅行保険
  | "transfer"            // 空港送迎
  | "cruise"              // クルーズ旅行
  | "airline-direct"      // 海外航空会社直販
  | "tour-hawaii";        // ハワイ旅行特化

export type AspPartner = {
  id: string;
  /** 表示用日本語名 */
  label: string;
  /** ECID — A8 上の広告主識別子 (デバッグ参照用、不明なら省略) */
  ecid?: string;
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
  /** UI で優先表示すべきか (小さいほど優先) */
  priority: number;
};

/** 全 partner レジストリ */
export const ASP_PARTNERS: AspPartner[] = [
  // ─── エアトリ系 ───
  {
    id: "airtrip-domestic-flight",
    label: "エアトリ（国内航空券）",
    tagline: "国内格安航空券の最安値販売",
    categories: ["flight-domestic"],
    matEnv: "A8_AIRTRIP_DOMESTIC_FLIGHT_MAT",
    accent: "rose",
    priority: 1,
  },
  {
    id: "airtrip-rental",
    label: "エアトリレンタカー",
    ecid: "s00000001343",
    tagline: "日本全国のレンタカー格安料金を比較",
    categories: ["rental-car"],
    matEnv: "A8_AIRTRIP_RENTAL_MAT",
    accent: "rose",
    priority: 5,
  },
  {
    id: "airtrip-night-bus",
    label: "エアトリ（夜行・高速バス）",
    tagline: "夜行・高速バス予約サイト",
    categories: ["bus-domestic"],
    matEnv: "A8_AIRTRIP_NIGHT_BUS_MAT",
    accent: "rose",
    priority: 6,
  },
  {
    id: "airtrip-overseas-package",
    label: "エアトリ（海外航空券＋ホテル）",
    tagline: "海外航空券＋ホテルがお得",
    categories: ["flight-overseas", "tour-overseas"],
    matEnv: "A8_AIRTRIP_OVERSEAS_PACKAGE_MAT",
    accent: "rose",
    priority: 2,
  },
  {
    id: "airtrip-plus",
    label: "エアトリプラス（国内航空券＋ホテル）",
    tagline: "国内航空券＋ホテルの予約サイト",
    categories: ["flight-domestic", "tour-package"],
    matEnv: "A8_AIRTRIP_PLUS_MAT",
    accent: "rose",
    priority: 2,
  },
  {
    id: "airtrip-domestic-tour",
    label: "エアトリ国内ツアー",
    tagline: "沖縄・北海道など格安国内ツアー",
    categories: ["tour-package", "tour-okinawa"],
    matEnv: "A8_AIRTRIP_DOMESTIC_TOUR_MAT",
    accent: "rose",
    priority: 4,
  },
  {
    id: "airtrip-hawaii",
    label: "エアトリハワイ",
    tagline: "ハワイ旅行・ハワイツアー特化",
    categories: ["tour-hawaii", "tour-overseas"],
    matEnv: "A8_AIRTRIP_HAWAII_MAT",
    accent: "rose",
    priority: 1,
  },
  {
    id: "airtrip-domestic-hotel",
    label: "エアトリ国内ホテル予約",
    tagline: "格安国内ホテル予約サイト",
    categories: ["hotel-domestic"],
    matEnv: "A8_AIRTRIP_DOMESTIC_HOTEL_MAT",
    accent: "rose",
    priority: 5,
  },

  // ─── 大手旅行代理店 ───
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
    priority: 1,
  },
  {
    id: "newt",
    label: "NEWT（令和トラベル）",
    ecid: "s00000025498",
    tagline: "アプリ完結型の海外ツアー",
    categories: ["tour-overseas", "tour-package"],
    matEnv: "A8_NEWT_MAT",
    accent: "sky",
    priority: 2,
  },

  // ─── ホテル系 ───
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
    id: "ichikyu",
    label: "一休.com",
    ecid: "s00000000218",
    tagline: "高級ホテル・旅館の予約サイト",
    categories: ["hotel-luxury", "hotel-domestic"],
    matEnv: "A8_ICHIKYU_MAT",
    accent: "amber",
    priority: 1,
  },
  {
    id: "jalan",
    label: "じゃらんnet",
    tagline: "国内25,000軒の宿をネットで予約・2%ポイント還元",
    categories: ["hotel-domestic"],
    matEnv: "A8_JALAN_MAT",
    accent: "rose",
    priority: 2,
  },
  {
    id: "travelist-hotel",
    label: "トラベリスト（国内ホテル）",
    tagline: "国内ホテル・宿泊・旅館の予約サイト",
    categories: ["hotel-domestic"],
    matEnv: "A8_TRAVELIST_HOTEL_MAT",
    accent: "sky",
    priority: 4,
  },
  {
    id: "resort-glamping",
    label: "リゾートグランピングドットコム",
    tagline: "国内最大級のグランピング予約サイト",
    categories: ["hotel-glamping"],
    matEnv: "A8_RESORT_GLAMPING_MAT",
    accent: "emerald",
    priority: 1,
  },

  // ─── 海外航空券・ツアー ───
  {
    id: "travelwest-flight",
    label: "トラベルウエスト（海外航空券）",
    tagline: "海外航空券の最安値検索・比較・予約",
    categories: ["flight-overseas"],
    matEnv: "A8_TRAVELWEST_FLIGHT_MAT",
    accent: "sky",
    priority: 2,
  },
  {
    id: "travelwest-package",
    label: "トラベルウエスト（航空券＋ホテル）",
    tagline: "海外ダイナミックパッケージ・24時間予約",
    categories: ["tour-package", "tour-overseas"],
    matEnv: "A8_TRAVELWEST_PACKAGE_MAT",
    accent: "sky",
    priority: 3,
  },
  {
    id: "travelwest-tour",
    label: "トラベルウエスト（海外ツアー）",
    tagline: "おトクに海外ツアー",
    categories: ["tour-overseas"],
    matEnv: "A8_TRAVELWEST_TOUR_MAT",
    accent: "sky",
    priority: 3,
  },
  {
    id: "travelist-overseas-flight",
    label: "Travelist（海外格安航空券）",
    tagline: "格安航空券・LCC予約",
    categories: ["flight-overseas"],
    matEnv: "A8_TRAVELIST_OVERSEAS_FLIGHT_MAT",
    accent: "sky",
    priority: 3,
  },

  // ─── 国内航空券 (エアトリ以外) ───
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
    id: "cheap-flight-mall",
    label: "格安航空券モール",
    tagline: "国内線の比較・購入サイトの決定版",
    categories: ["flight-domestic"],
    matEnv: "A8_CHEAP_FLIGHT_MALL_MAT",
    accent: "rose",
    priority: 4,
  },
  {
    id: "travelist-domestic-flight",
    label: "トラベリスト（国内航空券）",
    tagline: "国内格安航空券・LCCの比較・予約",
    categories: ["flight-domestic"],
    matEnv: "A8_TRAVELIST_DOMESTIC_FLIGHT_MAT",
    accent: "sky",
    priority: 5,
  },

  // ─── 鉄道・交通 ───
  {
    id: "navitime-rail",
    label: "NAVITIME Travel（新幹線・特急）",
    tagline: "JR新幹線・特急のチケットを自宅にお届け",
    categories: ["rail-domestic"],
    matEnv: "A8_NAVITIME_RAIL_MAT",
    accent: "emerald",
    priority: 1,
  },
  {
    id: "navitime-flight",
    label: "NAVITIME Travel（国内線）",
    tagline: "国内線14社すべての路線予約が可能・乗継便対応",
    categories: ["flight-domestic"],
    matEnv: "A8_NAVITIME_FLIGHT_MAT",
    accent: "emerald",
    priority: 5,
  },
  {
    id: "omio",
    label: "Omio",
    tagline: "ヨーロッパ格安乗車券検索・鉄道とバスの予約",
    categories: ["transport-europe"],
    matEnv: "A8_OMIO_MAT",
    accent: "sky",
    priority: 1,
  },
  {
    id: "airport-shuttle",
    label: "エアポートシャトル",
    tagline: "自宅・ホテル↔空港を定額のシェアでお得に",
    categories: ["transfer"],
    matEnv: "A8_AIRPORT_SHUTTLE_MAT",
    accent: "blue",
    priority: 1,
  },

  // ─── 現地ツアー・アクティビティ ───
  {
    id: "buyma-travel",
    label: "BUYMA TRAVEL",
    ecid: "bt",
    tagline: "現地在住ガイドが日本語で案内するプライベートツアー",
    categories: ["tour-local"],
    matEnv: "A8_BUYMA_TRAVEL_MAT",
    accent: "violet",
    priority: 1,
  },
  {
    id: "tabirai-activity",
    label: "たびらいアクティビティ",
    tagline: "沖縄・北海道の遊び・レジャーを格安で比較・予約",
    categories: ["activity-domestic", "tour-okinawa"],
    matEnv: "A8_TABIRAI_ACTIVITY_MAT",
    accent: "amber",
    priority: 2,
  },

  // ─── 通信 (eSIM / Wi-Fi) ───
  {
    id: "global-wifi",
    label: "グローバルWiFi（ビジョン）",
    ecid: "s00000011875",
    tagline: "海外Wi-Fiレンタル・最短当日受取",
    categories: ["esim-wifi"],
    matEnv: "A8_GLOBAL_WIFI_MAT",
    accent: "zinc",
    priority: 3,
  },
  {
    id: "voye-global",
    label: "ボイエグローバル（Voye Global）",
    tagline: "各国最低2回線使えるコスパ最強eSIM・通信安定",
    categories: ["esim-wifi"],
    matEnv: "A8_VOYE_GLOBAL_MAT",
    accent: "violet",
    priority: 2,
  },
  {
    id: "trifa",
    label: "トリファ（trifa）",
    tagline: "海外のネット接続がアプリだけで完結・国内利用者数No.1",
    categories: ["esim-wifi"],
    matEnv: "A8_TRIFA_MAT",
    accent: "sky",
    priority: 1,
  },
  {
    id: "tora-esim",
    label: "TORA eSIM",
    tagline: "海外向けeSIM・スマホ一つで旅行が快適",
    categories: ["esim-wifi"],
    matEnv: "A8_TORA_ESIM_MAT",
    accent: "amber",
    priority: 4,
  },
  {
    id: "japan-global-esim",
    label: "JAPAN&GLOBAL eSIM",
    tagline: "世界192地域で使える eSIM",
    categories: ["esim-wifi"],
    matEnv: "A8_JAPAN_GLOBAL_ESIM_MAT",
    accent: "blue",
    priority: 5,
  },
  {
    id: "saily",
    label: "Saily",
    tagline: "海外旅行のためのお得な eSIM",
    categories: ["esim-wifi"],
    matEnv: "A8_SAILY_MAT",
    accent: "emerald",
    priority: 6,
  },

  // ─── 航空会社直販 ───
  {
    id: "qatar-airways",
    label: "Qatar Airways",
    tagline: "世界150以上の都市へ就航・最大10%オフセール",
    categories: ["airline-direct", "flight-overseas"],
    matEnv: "A8_QATAR_AIRWAYS_MAT",
    accent: "violet",
    priority: 1,
  },

  // ─── ホテル (グローバル) ───
  {
    id: "agoda",
    label: "agoda",
    tagline: "国内・海外ホテルの格安予約",
    categories: ["hotel-domestic", "hotel-overseas"],
    matEnv: "A8_AGODA_MAT",
    accent: "rose",
    priority: 1,
  },

  // ─── 海外オプショナルツアー / 現地サービス ───
  {
    id: "kkday",
    label: "KKday",
    tagline: "海外旅行オプショナルツアーを楽々予約・簡単決済",
    categories: ["tour-local"],
    matEnv: "A8_KKDAY_MAT",
    accent: "amber",
    priority: 2,
  },
  {
    id: "oooh",
    label: "Oooh（ウー）",
    tagline: "現地旅行会社と「行きたい」を叶える海外旅行サービス",
    categories: ["tour-overseas", "tour-local"],
    matEnv: "A8_OOOH_MAT",
    accent: "violet",
    priority: 3,
  },

  // ─── 国内旅行・ツアー ───
  {
    id: "big-holiday",
    label: "ビッグホリデー",
    tagline: "国内旅行の格安予約",
    categories: ["tour-package", "hotel-domestic"],
    matEnv: "A8_BIG_HOLIDAY_MAT",
    accent: "emerald",
    priority: 4,
  },
  {
    id: "nippon-travel",
    label: "日本旅行",
    tagline: "お得な国内ツアーを多数掲載",
    categories: ["tour-package", "tour-overseas"],
    matEnv: "A8_NIPPON_TRAVEL_MAT",
    accent: "blue",
    priority: 3,
  },
  {
    id: "j-trip",
    label: "J-TRIP（ジェイトリップ）",
    tagline: "JALで行く格安国内旅行",
    categories: ["tour-package", "flight-domestic"],
    matEnv: "A8_J_TRIP_MAT",
    accent: "rose",
    priority: 4,
  },
  {
    id: "needs-tour",
    label: "ニーズツアー",
    tagline: "超お得なツアーを多数掲載・国内・沖縄",
    categories: ["tour-package", "tour-okinawa"],
    matEnv: "A8_NEEDS_TOUR_MAT",
    accent: "emerald",
    priority: 3,
  },
  {
    id: "travelwest-domestic-package",
    label: "トラベルウエスト（国内航空券＋宿泊）",
    tagline: "国内ダイナミックパッケージ・24時間予約",
    categories: ["tour-package", "flight-domestic"],
    matEnv: "A8_TRAVELWEST_DOMESTIC_PACKAGE_MAT",
    accent: "sky",
    priority: 5,
  },

  // ─── クルーズ ───
  {
    id: "best-one-cruise",
    label: "ベストワンクルーズ",
    tagline: "クルーズ旅行・船旅の専門会社・海外発着から日本発着まで",
    categories: ["cruise"],
    matEnv: "A8_BEST_ONE_CRUISE_MAT",
    accent: "blue",
    priority: 1,
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
