import type { AirlineSale } from "@/lib/scrapers/types";
import type { Article } from "@/data/mock-articles";
import { routeLineMd } from "./route-link";

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

/**
 * 週次まとめ専用の "summary" 系画像セット（個別セール記事と被らないよう
 * 空港・地図・俯瞰系を中心にキュレート）。週番号で決定論的にローテーション。
 */
const ROUNDUP_IMAGES = [
  // 空港・俯瞰
  "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=80",
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1200&q=80",
  "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=1200&q=80",
  // 機内・窓
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",
  "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=1200&q=80",
  // 地球・地図
  // 注: 旧 photo-1488646953014 は実画像がカメラと地図の静物だったため差し替え (目視済み)
  "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1200&q=80",
  // 注: 旧 photo-1502920917128 は実画像が一眼レフカメラだったため差し替え (目視済み)
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80",
  // パッキング・出発
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",
  "https://images.unsplash.com/photo-1473625247510-8ceb1760943f?w=1200&q=80",
];

function pickRoundupImage(weekSeed: number): string {
  return ROUNDUP_IMAGES[weekSeed % ROUNDUP_IMAGES.length];
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

  // セールを「最安路線の価格」で並べ、上位を本文で詳しく扱う。
  // routes が空のセールは cheapest が undefined になるため除外し、
  // 型上も cheapest を非 undefined に narrow しておく。
  type Enriched = {
    sale: AirlineSale;
    cheapest: AirlineSale["routes"][number];
    routes: AirlineSale["routes"];
  };
  const enriched: Enriched[] = sales
    .map((sale) => {
      const routes = [...sale.routes].sort((a, b) => a.price - b.price);
      const cheapest = routes[0];
      if (!cheapest) return null;
      return { sale, cheapest, routes };
    })
    .filter((e): e is Enriched => e !== null)
    .sort((a, b) => a.cheapest.price - b.cheapest.price);

  // 全 sales の routes が空だった場合は記事を作らない
  if (enriched.length === 0) return null;

  const totalRoutes = enriched.reduce((sum, e) => sum + e.routes.length, 0);
  const airlineCount = new Set(enriched.map((e) => e.sale.airlineCode)).size;
  const minPrice = enriched[0].cheapest.price;
  const headline = `${year}年第${week}週 セールまとめ — ${airlineCount}社 ${enriched.length}件、最安¥${formatPrice(minPrice)}〜`;

  const intro = `今週開催中の航空券セールを ${airlineCount}社・${enriched.length}件・${totalRoutes}路線でまとめてご紹介。最安は¥${formatPrice(minPrice)}〜。気になる目的地が見つかったら早めに比較してみてください。`;

  const sections = enriched
    .map(({ sale, cheapest, routes }) => {
      // 路線名から該当路線のセールページへ直接飛べるようにする (回遊率向上)
      const top = routes.slice(0, 3).map((r) =>
        routeLineMd({
          originCode: r.originCode,
          destinationCode: r.destinationCode,
          price: r.price,
          discount: r.discount,
          cabin: r.cabin,
        })
      );
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
    image_url: pickRoundupImage(year * 100 + week),
    category: "セール速報",
    airline_tags: airlineTags,
    route_tags: routeTags,
    published_at: at.toISOString(),
    source: "BEATRIP 自動集計",
  };
}
