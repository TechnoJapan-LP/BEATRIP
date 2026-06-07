import type { AirlineSale } from "@/lib/scrapers/types";
import type { Article } from "@/data/mock-articles";
import { cityNameJa } from "@/lib/airport-names";

/**
 * 「セール終了予告」記事ジェネレータ
 *
 * 販売期限が 7 日以内のセールをまとめて、緊急性の高い 1 記事として生成。
 * 「BEATRIP 来週終了 セール」のような検索 + FOMO 経由のクリック狙い。
 *
 * slug は YYYY-MM-DD ベースで日次重複排除。同じ日に複数回呼んでも OK。
 */

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("ja-JP", {
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

const URGENCY_IMAGES = [
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80",
  "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=80",
];

/**
 * 7 日以内に終了するセールから「今週終了予告」記事を 1 本生成。
 *
 * @param sales 全セール
 * @param at    現在時刻 (テスト用)
 */
export function buildEndingSoonArticle(
  sales: AirlineSale[],
  at: Date = new Date()
): Article | null {
  const SEVEN_DAYS = 7;

  const endingSoon = sales
    .map((s) => {
      if (!s.endDate) return null;
      const days = daysBetween(at, new Date(s.endDate));
      if (days < 0 || days > SEVEN_DAYS) return null;
      const routes = [...s.routes].sort((a, b) => a.price - b.price);
      if (routes.length === 0) return null;
      return { sale: s, days, routes, cheapest: routes[0] };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x))
    .sort((a, b) => a.days - b.days);

  if (endingSoon.length === 0) return null;

  // 日次 dedup の slug
  const dateStr = at.toISOString().slice(0, 10);
  const slug = `ending-soon-${dateStr}`;

  const minPrice = endingSoon[0].cheapest.price;
  const headline = `【締切間近】今週終了する航空券セール ${endingSoon.length}件 — 最安¥${formatPrice(minPrice)}〜`;
  const excerpt = `7日以内に販売期限を迎えるセールを ${endingSoon.length}件まとめてご紹介。最安は¥${formatPrice(minPrice)}〜。予約期限を逃さないようチェック必須。`;

  const sections = endingSoon
    .map(({ sale, days, cheapest, routes }) => {
      const urgency = days <= 1 ? "⏰ あと1日以内" : `あと${days}日`;
      const topRoutes = routes
        .slice(0, 3)
        .map(
          (r) =>
            `- ${cityNameJa(r.originCode)}→${cityNameJa(r.destinationCode)}: ¥${formatPrice(r.price)}`
        )
        .join("\n");
      return `### ${sale.airlineName} ${sale.saleName}

**${urgency}** (締切: ${formatDate(sale.endDate)})
最安¥${formatPrice(cheapest.price)}〜

${topRoutes}${routes.length > 3 ? `\nほか ${routes.length - 3} 路線` : ""}`;
    })
    .join("\n\n");

  const body = `${excerpt}

## 今週終了するセール一覧

${sections}

## 急ぎ予約のコツ

- **公式サイトの空席状況を直接確認** — セール終了直前は値ごろ感あるが空席薄
- **クレジットカード情報を準備** — 売り切れ前に決済まで一気に進める
- **キャンセル無料プラン** で押さえてから予約日程を最終調整するのも有効

---

価格・空席は取得時点のものです。販売期限・空席は時々刻々変動するため、最新は各航空会社の公式サイトでご確認ください。`;

  return {
    slug,
    title: headline,
    excerpt,
    body,
    image_url: URGENCY_IMAGES[at.getDate() % URGENCY_IMAGES.length],
    category: "セール速報",
    airline_tags: [...new Set(endingSoon.map((e) => e.sale.airlineName))],
    route_tags: [],
    published_at: at.toISOString(),
  };
}
