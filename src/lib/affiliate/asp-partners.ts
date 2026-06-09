/**
 * ASP 経由提携先のメタデータと BEATRIP 内での配置設計
 *
 * 各 partner は network (A8.net mat トークン / 外部 ASP の click URL / 直リンク)
 * と env を持つ。env 未設定なら disabled = true となり UI 側で出さない
 * (収益が立たないリンクは表示しない方針)。
 *
 * 各 partner にカテゴリと「適用シーン」を持たせ、コンポーネント側はこの
 * メタを引いて「自分の場所に表示すべき partner」をフィルタする。
 * これにより、新 partner 追加時は ENV と asp-partners.ts への 1 行追加で
 * 自動的に該当 UI ブロックに出る。
 *
 * 同一広告主でも、プログラム (航空券/ツアー/パッケージ等) が異なれば
 * 別 partner として登録する。コンバージョン率が違うので独立管理する。
 *
 * ─── ネットワーク別の env 設計 ───
 * - network='a8'           : matEnv に A8 a8mat (例 "4B5OO8+1NJE1M+AD2+67RK2") を入れる
 *                            buildA8Link でクリック URL を組み立てる
 * - network='external_url' : matEnv に任意 ASP のクリック URL 全文を入れる
 *                            (バリューコマース / アクセストレード / 楽天アフィリエイト /
 *                             Rakuten Advertising / TGアフィリエイト / felmat 等、ASP 中立)
 *                            ASP 側で素材ごとに URL が変わるため丸ごと保持
 *                            (例 "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=...")
 *                            (例 "https://h.accesstrade.net/sp/cc?rk=...")
 *                            (例 "https://hb.afl.rakuten.co.jp/hgc/...")
 * - network='direct'       : 直リンク (A/B テスト・自社オファー用)。directUrl を使う
 *
 * クレカ・保険系の ASP は変動が激しい (例: アメックスが バリューコマース廃止 →
 * Rakuten Advertising / TGアフィリエイト経由) ため、env 名は ASP 中立な
 * `AFFILIATE_URL_*` プレフィックスで統一する。
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
  | "credit-card"         // プレミアム / 旅行系クレジットカード
  | "transfer"            // 空港送迎
  | "cruise"              // クルーズ旅行
  | "airline-direct"      // 海外航空会社直販
  | "tour-hawaii";        // ハワイ旅行特化

/**
 * 対応 ASP ネットワーク。
 * - 'a8'           : A8.net の a8mat トークンから URL を組み立てる
 * - 'external_url' : 任意 ASP のクリック URL 全文を env にそのまま格納
 *                    (バリューコマース / アクセストレード / 楽天アフィリエイト /
 *                     Rakuten Advertising / TGアフィリエイト / felmat 等、ASP 中立)
 *                    クレカ・保険系は ASP が変動しやすいため URL を直接保持する方式に統一
 * - 'direct'       : directUrl フィールドの URL を直接使用 (自社オファー等)
 */
export type AspNetwork = "a8" | "external_url" | "direct";

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
  /** 所属 ASP ネットワーク */
  network: AspNetwork;
  /**
   * env 名。network により入れる値のフォーマットが異なる:
   * - a8           : a8mat (例 "4B5OO8+ABCDE+AD2+12345")
   * - external_url : 任意 ASP のクリック URL 全文 (http(s):// で始まる)
   * - direct       : (任意) この場合は directUrl を直接使うので未使用でも可
   */
  matEnv: string;
  /**
   * 外部 ASP 経由 (network='external_url') の場合に、想定される ASP 候補。
   * UI/コードには影響しないドキュメント目的のフィールド。
   * クレカ・保険は ASP 変動が激しいため、特定 ASP に依存しない設計。
   */
  preferredAsp?: string;
  /**
   * network='direct' 用の直リンク URL。
   * a8 / external_url では使われない。
   */
  directUrl?: string;
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
    network: "a8",
    matEnv: "A8_AIRTRIP_DOMESTIC_FLIGHT_MAT",
    accent: "rose",
    priority: 2,
  },
  {
    id: "airtrip-rental",
    label: "エアトリレンタカー",
    ecid: "s00000001343",
    tagline: "日本全国のレンタカー格安料金を比較",
    categories: ["rental-car"],
    network: "a8",
    matEnv: "A8_AIRTRIP_RENTAL_MAT",
    accent: "rose",
    priority: 3,
  },
  {
    id: "airtrip-night-bus",
    label: "エアトリ（夜行・高速バス）",
    tagline: "夜行・高速バス予約サイト",
    categories: ["bus-domestic"],
    network: "a8",
    matEnv: "A8_AIRTRIP_NIGHT_BUS_MAT",
    accent: "rose",
    priority: 3,
  },
  {
    id: "airtrip-overseas-package",
    label: "エアトリ（海外航空券＋ホテル）",
    tagline: "海外航空券＋ホテルがお得",
    categories: ["flight-overseas", "tour-overseas"],
    network: "a8",
    matEnv: "A8_AIRTRIP_OVERSEAS_PACKAGE_MAT",
    accent: "rose",
    priority: 1,
  },
  {
    id: "airtrip-plus",
    label: "エアトリプラス（国内航空券＋ホテル）",
    tagline: "国内航空券＋ホテルの予約サイト",
    categories: ["flight-domestic", "tour-package"],
    network: "a8",
    matEnv: "A8_AIRTRIP_PLUS_MAT",
    accent: "rose",
    priority: 2,
  },
  {
    id: "airtrip-domestic-tour",
    label: "エアトリ国内ツアー",
    tagline: "沖縄・北海道など格安国内ツアー",
    categories: ["tour-package", "tour-okinawa"],
    network: "a8",
    matEnv: "A8_AIRTRIP_DOMESTIC_TOUR_MAT",
    accent: "rose",
    priority: 3,
  },
  {
    id: "airtrip-hawaii",
    label: "エアトリハワイ",
    tagline: "ハワイ旅行・ハワイツアー特化",
    categories: ["tour-hawaii", "tour-overseas"],
    network: "a8",
    matEnv: "A8_AIRTRIP_HAWAII_MAT",
    accent: "rose",
    priority: 1,
  },
  {
    id: "airtrip-domestic-hotel",
    label: "エアトリ国内ホテル予約",
    tagline: "格安国内ホテル予約サイト",
    categories: ["hotel-domestic"],
    network: "a8",
    matEnv: "A8_AIRTRIP_DOMESTIC_HOTEL_MAT",
    accent: "rose",
    priority: 2,
  },

  // ─── 大手旅行代理店 ───
  {
    id: "jtb",
    label: "JTB",
    ecid: "s00000005350",
    tagline: "国内最大手の旅行代理店・パッケージツアー",
    categories: ["tour-package", "hotel-domestic", "hotel-overseas"],
    network: "a8",
    matEnv: "A8_JTB_MAT",
    accent: "blue",
    // tour-package / hotel 系統では高 EPC のため上位扱い
    priority: 2,
  },
  {
    id: "okinawa-tourist",
    label: "沖縄ツーリスト",
    ecid: "s00000026857",
    tagline: "沖縄旅行の専門・離島ツアー・レンタカー",
    categories: ["tour-okinawa"],
    network: "a8",
    matEnv: "A8_OKINAWA_TOURIST_MAT",
    accent: "emerald",
    priority: 2,
  },
  {
    id: "newt",
    label: "NEWT（令和トラベル）",
    ecid: "s00000025498",
    tagline: "アプリ完結型の海外ツアー",
    categories: ["tour-overseas", "tour-package"],
    network: "a8",
    matEnv: "A8_NEWT_MAT",
    accent: "sky",
    // 海外ツアーは高単価のため上位
    priority: 1,
  },

  // ─── ホテル系 ───
  {
    id: "yahoo-travel",
    label: "Yahoo!トラベル",
    ecid: "s00000023244",
    tagline: "PayPayポイントが貯まる・使えるホテル予約",
    categories: ["hotel-domestic"],
    network: "a8",
    matEnv: "A8_YAHOO_TRAVEL_MAT",
    accent: "violet",
    priority: 3,
  },
  {
    id: "ichikyu",
    label: "一休.com",
    ecid: "s00000000218",
    tagline: "高級ホテル・旅館の予約サイト",
    categories: ["hotel-luxury", "hotel-domestic"],
    network: "a8",
    matEnv: "A8_ICHIKYU_MAT",
    accent: "amber",
    priority: 1,
  },
  {
    id: "jalan",
    label: "じゃらんnet",
    tagline: "国内25,000軒の宿をネットで予約・2%ポイント還元",
    categories: ["hotel-domestic"],
    network: "a8",
    matEnv: "A8_JALAN_MAT",
    accent: "rose",
    priority: 2,
  },
  // (hotel-luxury) 一休系は priority=1 維持
  {
    id: "travelist-hotel",
    label: "トラベリスト（国内ホテル）",
    tagline: "国内ホテル・宿泊・旅館の予約サイト",
    categories: ["hotel-domestic"],
    network: "a8",
    matEnv: "A8_TRAVELIST_HOTEL_MAT",
    accent: "sky",
    priority: 3,
  },
  {
    id: "resort-glamping",
    label: "リゾートグランピングドットコム",
    tagline: "国内最大級のグランピング予約サイト",
    categories: ["hotel-glamping"],
    network: "a8",
    matEnv: "A8_RESORT_GLAMPING_MAT",
    accent: "emerald",
    priority: 2,
  },

  // ─── 海外航空券・ツアー ───
  {
    id: "travelwest-flight",
    label: "トラベルウエスト（海外航空券）",
    tagline: "海外航空券の最安値検索・比較・予約",
    categories: ["flight-overseas"],
    network: "a8",
    matEnv: "A8_TRAVELWEST_FLIGHT_MAT",
    accent: "sky",
    priority: 2,
  },
  // 海外系は単価高めだが PV per click が分散するため price=2 で並列扱い
  {
    id: "travelwest-package",
    label: "トラベルウエスト（航空券＋ホテル）",
    tagline: "海外ダイナミックパッケージ・24時間予約",
    categories: ["tour-package", "tour-overseas"],
    network: "a8",
    matEnv: "A8_TRAVELWEST_PACKAGE_MAT",
    accent: "sky",
    priority: 2,
  },
  {
    id: "travelwest-tour",
    label: "トラベルウエスト（海外ツアー）",
    tagline: "おトクに海外ツアー",
    categories: ["tour-overseas"],
    network: "a8",
    matEnv: "A8_TRAVELWEST_TOUR_MAT",
    accent: "sky",
    priority: 2,
  },
  {
    id: "travelist-overseas-flight",
    label: "Travelist（海外格安航空券）",
    tagline: "格安航空券・LCC予約",
    categories: ["flight-overseas"],
    network: "a8",
    matEnv: "A8_TRAVELIST_OVERSEAS_FLIGHT_MAT",
    accent: "sky",
    priority: 2,
  },

  // ─── 国内航空券 (エアトリ以外) ───
  {
    id: "real-ticket",
    label: "リアルチケット",
    ecid: "rt",
    tagline: "24時間365日・国内航空券の最安値検索",
    categories: ["flight-domestic"],
    network: "a8",
    matEnv: "A8_REAL_TICKET_MAT",
    accent: "rose",
    priority: 3,
  },
  {
    id: "cheap-flight-mall",
    label: "格安航空券モール",
    tagline: "国内線の比較・購入サイトの決定版",
    categories: ["flight-domestic"],
    network: "a8",
    matEnv: "A8_CHEAP_FLIGHT_MALL_MAT",
    accent: "rose",
    priority: 3,
  },
  {
    id: "travelist-domestic-flight",
    label: "トラベリスト（国内航空券）",
    tagline: "国内格安航空券・LCCの比較・予約",
    categories: ["flight-domestic"],
    network: "a8",
    matEnv: "A8_TRAVELIST_DOMESTIC_FLIGHT_MAT",
    accent: "sky",
    priority: 3,
  },

  // ─── 鉄道・交通 ───
  {
    id: "navitime-rail",
    label: "NAVITIME Travel（新幹線・特急）",
    tagline: "JR新幹線・特急のチケットを自宅にお届け",
    categories: ["rail-domestic"],
    network: "a8",
    matEnv: "A8_NAVITIME_RAIL_MAT",
    accent: "emerald",
    priority: 1,
  },
  {
    id: "navitime-flight",
    label: "NAVITIME Travel（国内線）",
    tagline: "国内線14社すべての路線予約が可能・乗継便対応",
    categories: ["flight-domestic"],
    network: "a8",
    matEnv: "A8_NAVITIME_FLIGHT_MAT",
    accent: "emerald",
    priority: 3,
  },
  {
    id: "omio",
    label: "Omio",
    tagline: "ヨーロッパ格安乗車券検索・鉄道とバスの予約",
    categories: ["transport-europe"],
    network: "a8",
    matEnv: "A8_OMIO_MAT",
    accent: "sky",
    priority: 1,
  },
  {
    id: "airport-shuttle",
    label: "エアポートシャトル",
    tagline: "自宅・ホテル↔空港を定額のシェアでお得に",
    categories: ["transfer"],
    network: "a8",
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
    network: "a8",
    matEnv: "A8_BUYMA_TRAVEL_MAT",
    accent: "violet",
    priority: 1,
  },
  {
    id: "tabirai-activity",
    label: "たびらいアクティビティ",
    tagline: "沖縄・北海道の遊び・レジャーを格安で比較・予約",
    categories: ["activity-domestic", "tour-okinawa"],
    network: "a8",
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
    network: "a8",
    matEnv: "A8_GLOBAL_WIFI_MAT",
    accent: "zinc",
    // ハードウェアレンタルは EPC 高い (1 件 ¥800〜1500)
    priority: 1,
  },
  {
    id: "voye-global",
    label: "ボイエグローバル（Voye Global）",
    tagline: "各国最低2回線使えるコスパ最強eSIM・通信安定",
    categories: ["esim-wifi"],
    network: "a8",
    matEnv: "A8_VOYE_GLOBAL_MAT",
    accent: "violet",
    priority: 1,
  },
  {
    id: "trifa",
    label: "トリファ（trifa）",
    tagline: "海外のネット接続がアプリだけで完結・国内利用者数No.1",
    categories: ["esim-wifi"],
    network: "a8",
    matEnv: "A8_TRIFA_MAT",
    accent: "sky",
    priority: 1,
  },
  {
    id: "tora-esim",
    label: "TORA eSIM",
    tagline: "海外向けeSIM・スマホ一つで旅行が快適",
    categories: ["esim-wifi"],
    network: "a8",
    matEnv: "A8_TORA_ESIM_MAT",
    accent: "amber",
    priority: 3,
  },
  {
    id: "japan-global-esim",
    label: "JAPAN&GLOBAL eSIM",
    tagline: "世界192地域で使える eSIM",
    categories: ["esim-wifi"],
    network: "a8",
    matEnv: "A8_JAPAN_GLOBAL_ESIM_MAT",
    accent: "blue",
    priority: 3,
  },
  {
    id: "saily",
    label: "Saily",
    tagline: "海外旅行のためのお得な eSIM",
    categories: ["esim-wifi"],
    network: "a8",
    matEnv: "A8_SAILY_MAT",
    accent: "emerald",
    priority: 3,
  },

  // ─── 航空会社直販 ───
  {
    id: "qatar-airways",
    label: "Qatar Airways",
    tagline: "世界150以上の都市へ就航・最大10%オフセール",
    categories: ["airline-direct", "flight-overseas"],
    network: "a8",
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
    network: "a8",
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
    network: "a8",
    matEnv: "A8_KKDAY_MAT",
    accent: "amber",
    priority: 2,
  },
  {
    id: "oooh",
    label: "Oooh（ウー）",
    tagline: "現地旅行会社と「行きたい」を叶える海外旅行サービス",
    categories: ["tour-overseas", "tour-local"],
    network: "a8",
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
    network: "a8",
    matEnv: "A8_BIG_HOLIDAY_MAT",
    accent: "emerald",
    priority: 3,
  },
  {
    id: "nippon-travel",
    label: "日本旅行",
    tagline: "お得な国内ツアーを多数掲載",
    categories: ["tour-package", "tour-overseas"],
    network: "a8",
    matEnv: "A8_NIPPON_TRAVEL_MAT",
    accent: "blue",
    priority: 3,
  },
  {
    id: "j-trip",
    label: "J-TRIP（ジェイトリップ）",
    tagline: "JALで行く格安国内旅行",
    categories: ["tour-package", "flight-domestic"],
    network: "a8",
    matEnv: "A8_J_TRIP_MAT",
    accent: "rose",
    priority: 3,
  },
  {
    id: "needs-tour",
    label: "ニーズツアー",
    tagline: "超お得なツアーを多数掲載・国内・沖縄",
    categories: ["tour-package", "tour-okinawa"],
    network: "a8",
    matEnv: "A8_NEEDS_TOUR_MAT",
    accent: "emerald",
    priority: 3,
  },
  {
    id: "travelwest-domestic-package",
    label: "トラベルウエスト（国内航空券＋宿泊）",
    tagline: "国内ダイナミックパッケージ・24時間予約",
    categories: ["tour-package", "flight-domestic"],
    network: "a8",
    matEnv: "A8_TRAVELWEST_DOMESTIC_PACKAGE_MAT",
    accent: "sky",
    priority: 3,
  },

  // ─── クルーズ ───
  {
    id: "best-one-cruise",
    label: "ベストワンクルーズ",
    tagline: "クルーズ旅行・船旅の専門会社・海外発着から日本発着まで",
    categories: ["cruise"],
    network: "a8",
    matEnv: "A8_BEST_ONE_CRUISE_MAT",
    accent: "blue",
    priority: 1,
  },

  // ─── クレジットカード ───
  // 旅行系クレカは 1 件 ¥10,000〜¥25,000 と高単価。マイル・海外保険・ラウンジの
  // 3 軸で並べる。
  // クレカ・保険系の ASP は変動が激しい (例: アメックスがバリューコマース廃止 →
  // Rakuten Advertising / TGアフィリエイト経由) ため、env 名は ASP 中立な
  // `AFFILIATE_URL_*` プレフィックスで統一する。preferredAsp は推奨候補の参考値。
  //   - エポス/セゾン/MUFG → A8.net (既存・mat トークン)
  //   - その他           → external_url (任意 ASP のクリック URL)
  // ─── ニッチ・限定 ASP 系 (priority=3 で、env 設定時のみ表示) ───
  // アメックス / JAL / ANA / ダイナース 等は ASP 取扱いが限定的・審査も厳しいため
  // ラインナップとしては残すが、おすすめバッジ (priority=1) は付けない設計。
  {
    id: "amex-skytraveler",
    label: "アメックス・スカイ・トラベラー（マイル特化）",
    tagline: "マイル特化・年会費 11,000 円・3 倍ボーナスポイント",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_AMEX_SKYTRAVELER",
    preferredAsp: "Rakuten Advertising / TGアフィリエイト / felmat / 直接申込",
    accent: "amber",
    priority: 3,
  },
  {
    id: "amex-gold",
    label: "アメックス・ゴールド・プリファード（プレミアム）",
    tagline: "海外旅行保険＋空港ラウンジ＋ポイント還元のオールラウンド",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_AMEX_GOLD",
    preferredAsp: "Rakuten Advertising / TGアフィリエイト / felmat / 直接申込",
    accent: "amber",
    priority: 3,
  },
  {
    id: "amex-platinum",
    label: "アメックス・プラチナ（プレミアム）",
    tagline: "プライオリティ・パス無料・コンシェルジュ・最高 1 億円補償",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_AMEX_PLATINUM",
    preferredAsp: "Rakuten Advertising / TGアフィリエイト / felmat / 直接申込",
    accent: "amber",
    priority: 3,
  },
  {
    id: "jal-card",
    label: "JAL カード（旅行特化）",
    tagline: "搭乗ごとにマイルが貯まる・国内線特典航空券に強い",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_JAL_CARD",
    preferredAsp: "アクセストレード / felmat",
    accent: "rose",
    priority: 3,
  },
  {
    id: "ana-card",
    label: "ANA カード（マイル特化）",
    tagline: "ANA マイル・スカイコイン・継続ボーナスマイル",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_ANA_CARD",
    preferredAsp: "アクセストレード",
    accent: "sky",
    priority: 3,
  },
  {
    id: "epos-card",
    label: "エポスカード",
    tagline: "年会費無料・海外旅行傷害保険が自動付帯",
    categories: ["credit-card"],
    network: "a8",
    matEnv: "A8_EPOS_CARD_MAT",
    accent: "violet",
    priority: 1,
  },
  {
    id: "saison-blue-amex",
    label: "セゾン・ブルー・アメックス",
    tagline: "26 歳以下は年会費無料・海外旅行保険自動付帯",
    categories: ["credit-card"],
    network: "a8",
    matEnv: "A8_SAISON_BLUE_AMEX_MAT",
    accent: "blue",
    priority: 2,
  },
  {
    id: "diners-club",
    label: "ダイナースクラブカード（プレミアム）",
    tagline: "国内外ラウンジ・グルメ優待・コンパニオンカード無料",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_DINERS_CLUB",
    preferredAsp: "バリューコマース / Rakuten Advertising",
    accent: "zinc",
    priority: 3,
  },
  // 追加カード
  {
    id: "rakuten-card",
    label: "楽天カード",
    tagline: "年会費無料・楽天ポイント還元・楽天トラベルとの相性◎",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_RAKUTEN_CARD",
    preferredAsp: "楽天アフィリエイト (即時)",
    accent: "rose",
    priority: 1,
  },
  {
    id: "smbc-nl-card",
    label: "三井住友カード（NL）",
    tagline: "年会費永年無料・ナンバーレス・対象店舗で最大 7% 還元",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_SMBC_NL",
    preferredAsp: "アクセストレード / felmat",
    accent: "blue",
    priority: 1,
  },
  {
    id: "mufg-card",
    label: "三菱 UFJ カード",
    tagline: "国内大手銀行系・海外旅行傷害保険付帯",
    categories: ["credit-card"],
    network: "a8",
    matEnv: "A8_MUFG_CARD_MAT",
    accent: "emerald",
    priority: 2,
  },
  {
    id: "paypay-card",
    label: "PayPay カード",
    tagline: "PayPay 残高チャージ可・Yahoo!ショッピングでポイント還元",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_PAYPAY_CARD",
    preferredAsp: "アクセストレード",
    accent: "rose",
    priority: 2,
  },
  // ─── 主要 ASP で取扱い豊富な追加カード (現実的に提携可能) ───
  {
    id: "jcb-card-w",
    label: "JCB CARD W",
    tagline: "39 歳以下限定・年会費永年無料・Oki Doki ポイント 2 倍",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_JCB_CARD_W",
    preferredAsp: "バリューコマース",
    accent: "blue",
    priority: 1,
  },
  {
    id: "d-card-gold",
    label: "dカード GOLD",
    tagline: "ドコモ料金 10% 還元・年会費 11,000 円・空港ラウンジ",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_D_CARD_GOLD",
    preferredAsp: "A8.net / バリューコマース",
    accent: "rose",
    priority: 1,
  },
  {
    id: "recruit-card",
    label: "リクルートカード",
    tagline: "年会費永年無料・還元率 1.2%・公共料金もポイント貯まる",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_RECRUIT_CARD",
    preferredAsp: "A8.net",
    accent: "violet",
    priority: 1,
  },
  {
    id: "life-card",
    label: "ライフカード",
    tagline: "誕生月ポイント 3 倍・年会費永年無料・学生向けも充実",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_LIFE_CARD",
    preferredAsp: "A8.net",
    accent: "amber",
    priority: 2,
  },
  {
    id: "aeon-card",
    label: "イオンカードセレクト",
    tagline: "イオン系列 5%off・年会費永年無料・WAON 一体型",
    categories: ["credit-card"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_AEON_CARD",
    preferredAsp: "A8.net",
    accent: "violet",
    priority: 2,
  },

  // ─── 海外旅行保険 ───
  // 1 件 ¥1,000〜¥3,000。短期渡航向けネット保険を中心に。
  //   - 損保ジャパン off! / tabiho → A8 (既存・mat トークン)
  //   - その他 → external_url (任意 ASP のクリック URL)
  {
    id: "aig-travel-insurance",
    label: "AIG 損保 海外旅行保険",
    tagline: "ネット完結・出発当日まで申込可・24 時間日本語サポート",
    categories: ["insurance"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_AIG_INSURANCE",
    preferredAsp: "バリューコマース / Rakuten Advertising",
    accent: "blue",
    priority: 1,
  },
  {
    id: "chubb-travel-insurance",
    label: "Chubb 損保 海外旅行保険",
    tagline: "オンライン申込・短期から長期まで柔軟プラン",
    categories: ["insurance"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_CHUBB_INSURANCE",
    preferredAsp: "アクセストレード",
    accent: "violet",
    priority: 1,
  },
  {
    id: "sompo-travel-insurance",
    label: "損保ジャパン 新・海外旅行保険【off!】",
    tagline: "必要な補償だけ選べてネットで割安に",
    categories: ["insurance"],
    network: "a8",
    matEnv: "A8_SOMPO_INSURANCE_MAT",
    accent: "emerald",
    priority: 1,
  },
  {
    id: "rakuten-travel-insurance",
    label: "楽天損保 海外旅行保険",
    tagline: "楽天ポイントが貯まる・ネット申込で割引",
    categories: ["insurance"],
    network: "external_url",
    matEnv: "AFFILIATE_URL_RAKUTEN_INSURANCE",
    preferredAsp: "楽天アフィリエイト (即時)",
    accent: "rose",
    priority: 2,
  },
  {
    id: "tabiho-travel-insurance",
    label: "tabiho（たびほ）海外旅行保険",
    tagline: "ジェイアイ傷害火災・出発当日まで申込・eチケット完結",
    categories: ["insurance"],
    network: "a8",
    matEnv: "A8_TABIHO_INSURANCE_MAT",
    accent: "sky",
    priority: 2,
  },
];

/** id で 1 件取得 */
export function getAspPartner(id: string): AspPartner | undefined {
  return ASP_PARTNERS.find((p) => p.id === id);
}

/**
 * partner が「有効」(= env 設定済みでクリックリンクを発行可能) かを判定。
 * network ごとに env の形式が異なるため判定ロジックを分岐する。
 */
function isPartnerEnabled(partner: AspPartner): boolean {
  switch (partner.network) {
    case "a8":
      return isValidA8Mat(process.env[partner.matEnv]);
    case "external_url": {
      const v = process.env[partner.matEnv];
      // クリック URL 全文を入れる方式なので http(s) で始まる文字列を要求
      return typeof v === "string" && /^https?:\/\//.test(v.trim());
    }
    case "direct":
      return typeof partner.directUrl === "string" && partner.directUrl.length > 0;
  }
}

/**
 * 指定カテゴリで、ENV 設定済み (= 有効) の partner だけ返す。
 * 並び順: priority asc → label asc (priority=1 を最上位に固定露出)。
 */
export function getActiveAspPartners(category: AspCategory): AspPartner[] {
  return ASP_PARTNERS.filter(
    (p) => p.categories.includes(category) && isPartnerEnabled(p)
  ).sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.label.localeCompare(b.label, "ja");
  });
}

/**
 * partner のクリック URL を組み立て。
 * network ごとに env の解釈が異なる:
 *  - a8           : a8mat を A8 のクリック URL に組み立てる (任意で redirect 付与)
 *  - external_url : env に入っているクリック URL 全文をそのまま返す (任意 ASP 中立)
 *  - direct       : directUrl をそのまま返す
 *
 * @param destinationUrl A8 の a8ejpredirect 用。他 network では現状無視 (ASP 側の
 *                       deep link 仕様が異なるため、必要になったら個別対応)。
 */
export function getAspPartnerUrl(
  partner: AspPartner,
  destinationUrl?: string
): string | null {
  if (!isPartnerEnabled(partner)) return null;

  switch (partner.network) {
    case "a8": {
      const a8mat = process.env[partner.matEnv];
      if (!isValidA8Mat(a8mat)) return null;
      return buildA8Link(
        a8mat,
        destinationUrl ? { redirectUrl: destinationUrl } : undefined
      );
    }
    case "external_url": {
      const url = process.env[partner.matEnv];
      if (!url) return null;
      return url.trim();
    }
    case "direct":
      return partner.directUrl ?? null;
  }
}
