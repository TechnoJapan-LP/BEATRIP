import type { Article } from "@/data/mock-articles";
import {
  ROUTE_BASELINES,
  SEASONALITY_MULTIPLIERS,
} from "@/data/route-baselines";
import { getDestinationImage } from "@/lib/deals/destination-images";

/**
 * 路線別の「格安予約攻略ガイド」を自動生成
 *
 * セール速報（ニュース型・すぐ陳腐化）と異なり、季節性モデルから
 * 「いつが最安か」「相場」「予約のコツ」を解説するエバーグリーン記事。
 * 「{出発}→{目的地} 格安 時期」等のロングテール検索を狙う。
 */

const MONTH_NAMES = [
  "1月", "2月", "3月", "4月", "5月", "6月",
  "7月", "8月", "9月", "10月", "11月", "12月",
];

// 空港コード → 日本語都市名
const CITY_NAMES: Record<string, string> = {
  NRT: "東京", HND: "東京", KIX: "大阪", ITM: "大阪", NGO: "名古屋",
  FUK: "福岡", CTS: "札幌", OKA: "沖縄", HIJ: "広島", KOJ: "鹿児島",
  SDJ: "仙台", KMJ: "熊本", KMI: "宮崎", NGS: "長崎", OKD: "札幌（丘珠）",
  AOJ: "青森", HKD: "函館", OKJ: "岡山", MYJ: "松山", ISG: "石垣",
  MMY: "宮古", KIJ: "新潟",
  BKK: "バンコク", TPE: "台北", ICN: "ソウル", SIN: "シンガポール",
  HKG: "香港", MNL: "マニラ", SGN: "ホーチミン", HAN: "ハノイ",
  PVG: "上海", PEK: "北京", DXB: "ドバイ", KUL: "クアラルンプール",
  CDG: "パリ", LHR: "ロンドン", HEL: "ヘルシンキ", FCO: "ローマ",
  FRA: "フランクフルト", IST: "イスタンブール", JFK: "ニューヨーク",
  LAX: "ロサンゼルス", SFO: "サンフランシスコ", ORD: "シカゴ",
  HNL: "ホノルル", GUM: "グアム", HRB: "ハルビン",
};

const SEASONALITY_LABEL: Record<string, string> = {
  domestic: "国内線",
  shortHaul: "アジア近距離国際線",
  mediumHaul: "東南アジア・中華圏",
  longHaul: "欧米・中東長距離",
  hawaii: "ハワイ路線",
  europe: "欧州路線",
};

function cityName(code: string): string {
  return CITY_NAMES[code] ?? code;
}

function fmt(n: number): string {
  return new Intl.NumberFormat("ja-JP").format(Math.round(n / 100) * 100);
}

function generateRouteGuide(routeKey: string): Article {
  const [origin, dest] = routeKey.split("-");
  const baseline = ROUTE_BASELINES[`${origin}→${dest}`];
  const seasonality = SEASONALITY_MULTIPLIERS[baseline.seasonality];

  const oName = cityName(origin);
  const dName = cityName(dest);

  // 月別の推定価格を計算し、安い順・高い順を算出
  const monthly = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    name: MONTH_NAMES[i],
    price: baseline.avgPrice * seasonality[i + 1],
  }));
  const sorted = [...monthly].sort((a, b) => a.price - b.price);
  const cheapMonths = sorted.slice(0, 3);
  const expensiveMonths = sorted.slice(-3).reverse();

  const yearMin = sorted[0];
  const yearMax = sorted[sorted.length - 1];
  const savingPct = Math.round(
    ((yearMax.price - yearMin.price) / yearMax.price) * 100
  );

  const seasonLabel = SEASONALITY_LABEL[baseline.seasonality];

  const body = `${oName}から${dName}（${origin}→${dest}）への航空券を、できるだけ安く予約するための完全ガイドです。BEATRIPが収集した${seasonLabel}の価格データと季節性パターンをもとに、最安で予約できる時期と相場、予約のコツを解説します。

## 最も安く予約できる時期

${oName}〜${dName}線が年間で最も安くなるのは **${cheapMonths.map((m) => m.name).join("・")}** です。特に **${yearMin.name}** は年間平均より大きく下がり、推定相場は **¥${fmt(yearMin.price)}前後**。

| 月 | 推定相場 | 傾向 |
|----|---------|------|
${cheapMonths.map((m) => `| ${m.name} | ¥${fmt(m.price)}〜 | 🟢 安い |`).join("\n")}

## 避けたい高額シーズン

逆に **${expensiveMonths.map((m) => m.name).join("・")}** は需要が集中し割高になります。最も高い **${yearMax.name}** は推定 **¥${fmt(yearMax.price)}前後**で、最安月と比べて約 **${savingPct}%** の差があります。

${expensiveMonths.map((m) => `- **${m.name}**: ¥${fmt(m.price)}前後（繁忙期）`).join("\n")}

ゴールデンウィーク（4月末〜5月初）、お盆（8月中旬）、年末年始（12月末〜1月初）は特に高騰するため、可能であれば前後の週にずらすだけで数万円安くなることがあります。

## 予約のコツ

1. **${cheapMonths[0].name}の搭乗を狙う** — 同じ路線でも月をずらすだけで約${savingPct}%変わります
2. **2〜3ヶ月前に予約** — 直前は高騰、早すぎても下がりきらないことが多い
3. **セール情報をチェック** — 航空会社のセールが重なれば相場よりさらに安くなります
4. **出発地・到着地の選択肢を広げる** — ${oName}発の他空港や近隣都市も比較すると掘り出し物が見つかります

## ${dName}行きの今のセール

BEATRIPでは${oName}→${dName}線の最新セール情報をリアルタイムで収集しています。下のリンクから現在の最安値と価格推移を確認できます。

➡️ [${oName}→${dName}の格安航空券セール一覧を見る](/routes/${origin}-${dest})

※ 本記事の相場は過去の価格傾向にもとづく推定値です。実際の運賃は航空会社・予約時期・残席状況により変動します。`;

  return {
    slug: `guide-${origin}-${dest}-cheap-flights`.toLowerCase(),
    title: `${oName}→${dName}を格安で予約する方法｜最安時期・相場・コツ`,
    excerpt: `${oName}〜${dName}線の最安時期は${cheapMonths
      .slice(0, 2)
      .map((m) => m.name)
      .join("・")}。年間で約${savingPct}%の価格差があります。相場と予約のコツを解説。`,
    body,
    image_url: getDestinationImage(dest),
    category: "攻略ガイド",
    airline_tags: [],
    route_tags: [`${origin}-${dest}`],
    // 公開日は固定（エバーグリーン・更新日扱い）
    published_at: "2026-01-15T00:00:00.000Z",
    source: "BEATRIP編集部",
  };
}

/**
 * ROUTE_BASELINES の主要路線から攻略ガイドを生成
 * （全路線だと記事一覧が埋もれるため、主要路線に絞る）
 */
const GUIDE_ROUTES = [
  "NRT-BKK", "HND-HNL", "NRT-SIN", "KIX-TPE", "NRT-LHR",
  "HND-CDG", "NRT-LAX", "HND-JFK", "NRT-ICN", "KIX-HKG",
  "NRT-DXB", "FUK-ICN", "NRT-MNL", "HND-CTS", "HND-OKA",
  "HND-ITM", "NRT-FUK", "KIX-CTS", "NRT-TPE", "NRT-HEL",
];

let cached: Article[] | null = null;

export function getRouteGuides(): Article[] {
  if (cached) return cached;
  cached = GUIDE_ROUTES.filter((r) => {
    const [o, d] = r.split("-");
    return ROUTE_BASELINES[`${o}→${d}`];
  }).map(generateRouteGuide);
  return cached;
}
