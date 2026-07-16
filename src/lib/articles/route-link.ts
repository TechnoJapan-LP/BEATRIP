import { cityNameJa } from "@/lib/airport-names";

/**
 * 記事本文の「路線行」を組み立てる共通ヘルパー
 *
 * 記事に並ぶ路線名から、その路線のセールページへ直接飛べるようにする
 * (回遊率・内部リンクの強化)。generator ごとに文字列を組み立てていると
 * 表記とリンクの有無がバラつくため、ここに一本化する。
 *
 * 注: セールには締切があり記事は残り続けるため、「リンク先に必ずセールがある」
 * ことは生成時点では保証できない。そのため /routes/[route] 側の空状態を
 * 「価格推移・次回セール予測・セール中の類似路線」を出す構成にして、
 * セールが終わっていてもクリックが無駄にならないようにしている。
 */

export type RouteLineInput = {
  originCode: string;
  destinationCode: string;
  price: number;
  discount?: number;
  cabin?: string;
  /** 残席など補足があれば末尾に付ける */
  note?: string;
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP").format(price);
}

/** キャビンの日本語表記 (Economy は既定なので表示しない) */
function cabinJa(cabin?: string): string {
  if (!cabin) return "";
  if (/business/i.test(cabin)) return "・ビジネス";
  if (/first/i.test(cabin)) return "・ファースト";
  if (/premium/i.test(cabin)) return "・プレエコ";
  return "";
}

/** 路線ページへのパス */
export function routeHref(originCode: string, destinationCode: string): string {
  return `/routes/${originCode}-${destinationCode}`;
}

/** 「[沖縄→石垣](/routes/OKA-ISG)」形式のリンク付き路線名 */
export function routeLinkMd(originCode: string, destinationCode: string): string {
  return `[${cityNameJa(originCode)}→${cityNameJa(destinationCode)}](${routeHref(originCode, destinationCode)})`;
}

/**
 * 箇条書き1行を生成。
 * 例: - **[沖縄→石垣](/routes/OKA-ISG)**: ¥5,720（50%OFF）
 */
export function routeLineMd(r: RouteLineInput): string {
  const discount = r.discount ? `（${r.discount}%OFF）` : "";
  const cabin = cabinJa(r.cabin);
  const note = r.note ? ` ${r.note}` : "";
  return `- **${routeLinkMd(r.originCode, r.destinationCode)}${cabin}**: ¥${formatPrice(r.price)}${discount}${note}`;
}
