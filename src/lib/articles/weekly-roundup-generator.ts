import type { AirlineSale } from "@/lib/scrapers/types";
import type { Article } from "@/data/mock-articles";
import { deals } from "@/data/mock-deals-v2";
import { cityNameJa } from "@/lib/airport-names";

/**
 * 週次セールまとめ記事ジェネレータ
 *
 * 新着セールの自然増を待たずに、毎週「今あるセール」を1本の総まとめ記事として
 * 公開する。記事の slug は ISO 週番号で一意のため、同じ週に何度実行しても
 * 重複は生成側で dedupe される（slug一致 → スキップ）。週が変わると自動で
 * 新しい slug になり、サイトに新記事として並ぶ。
 */

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP").format(price);
}

/** ISO週番号 ({year, week}) を返す */
function isoWeek(date: Date): { year: number; week: number } {
  // ISO 8601: 木曜日を含む週がその年の週
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function pickRoundupImage(sales: AirlineSale[]): string {
  // 代表的なルートのモック画像を流用（destination-imagesと同基盤）
  for (const sale of sales) {
    for (const route of sale.routes) {
      const match = deals.find(
        (d) =>
          d.origin_code === route.originCode &&
          d.destination_code === route.destinationCode
      );
      if (match) return match.image_url;
    }
  }
  return "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80";
}

/**
 * 現在の全アクティブセールから「今週のセールまとめ」記事を1本生成する。
 * sales が空なら null（記事を作らない）を返す。
 *
 * @param sales 集計対象の全セール（呼び出し側でアクティブだけ渡す）
 * @param at    集計時刻（テスト用に注入可能。デフォルトは今）
 */
export function buildWeeklyRoundupArticle(
  sales: AirlineSale[],
  at: Date = new Date()
): Article | null {
  if (sales.length === 0) return null;

  const { year, week } = isoWeek(at);
  const slug = `weekly-roundup-${year}-w${String(week).padStart(2, "0")}`;

  // セールを「最安路線の価格」で並べ、上位を本文で詳しく扱う
  const enriched = sales
    .map((sale) => {
      const routes = [...sale.routes].sort((a, b) => a.price - b.price);
      return { sale, cheapest: routes[0], routes };
    })
    .filter((s) => s.cheapest)
    .sort((a, b) => a.cheapest.price - b.cheapest.price);

  const totalRoutes = enriched.reduce((sum, e) => sum + e.routes.length, 0);
  const airlineCount = new Set(enriched.map((e) => e.sale.airlineCode)).size;
  const minPrice = enriched[0].cheapest.price;
  const headline = `${year}年第${week}週 セールまとめ — ${airlineCount}社 ${enriched.length}件、最安¥${formatPrice(minPrice)}〜`;

  const intro = `今週開催中の航空券セールを ${airlineCount}社・${enriched.length}件・${totalRoutes}路線でまとめてご紹介。最安は¥${formatPrice(minPrice)}〜。気になる目的地が見つかったら早めに比較してみてください。`;

  const sections = enriched
    .map(({ sale, cheapest, routes }) => {
      const top = routes.slice(0, 3).map((r) => {
        const discount = r.discount ? `（${r.discount}%OFF）` : "";
        return `- **${cityNameJa(r.originCode)}→${cityNameJa(r.destinationCode)}**: ¥${formatPrice(r.price)}${discount}`;
      });
      const more =
        routes.length > 3
          ? `\nほか ${routes.length - 3} 路線（販売期間: ${sale.startDate}〜${sale.endDate}）`
          : `\n販売期間: ${sale.startDate}〜${sale.endDate}`;
      return `### ${sale.airlineName} — ${sale.saleName}\n\n最安¥${formatPrice(cheapest.price)}〜\n\n${top.join("\n")}${more}`;
    })
    .join("\n\n");

  const body = `${intro}\n\n## 今週のラインナップ\n\n${sections}\n\n---\n\n価格・空席は取得時点のものです。最新の価格・予約条件は各航空会社の公式サイトをご確認ください。`;

  const airlineTags = Array.from(new Set(enriched.map((e) => e.sale.airlineName)));
  const routeTags = Array.from(
    new Set(
      enriched.flatMap((e) =>
        e.routes.map((r) => `${r.originCode}-${r.destinationCode}`)
      )
    )
  ).slice(0, 20);

  return {
    slug,
    title: headline,
    excerpt: intro.slice(0, 140),
    body,
    image_url: pickRoundupImage(sales),
    category: "セール速報",
    airline_tags: airlineTags,
    route_tags: routeTags,
    published_at: at.toISOString(),
    source: "BEATRIP 自動集計",
  };
}
