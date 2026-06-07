import type { AirlineSale } from "@/lib/scrapers/types";
import type { Article } from "@/data/mock-articles";
import { cityNameJa } from "@/lib/airport-names";

/**
 * 月次トレンドレポート記事ジェネレータ
 *
 * 毎月1日に「先月のセール総括 + 今月のおすすめ目的地」を 1 記事として生成。
 * 週次まとめより俯瞰的・分析的で SEO 長尾キーワード ("2026年6月 航空券
 * セール" "夏休み 格安" 等) を取りにいく。slug は YYYY-MM で一意。
 */

function formatPrice(price: number): string {
  return new Intl.NumberFormat("ja-JP").format(price);
}

const MONTH_HIGHLIGHT: Record<number, string> = {
  1: "正月明け閑散期。航空券は底値が出やすい",
  2: "卒業旅行・春節避けが狙い目。3月後半より安め",
  3: "春休み・卒業旅行需要で価格上昇。早期予約推奨",
  4: "桜・GW 直前で繁忙期入り。3月までに押さえたい",
  5: "GW 真っ只中。下旬から急落する路線も",
  6: "梅雨で需要低下。海外行きは絶好の狙い目",
  7: "夏休み開始でハイシーズン突入。1ヶ月前で空席薄",
  8: "お盆ピーク。年内最高値、避けるなら下旬",
  9: "シルバーウィーク後は閑散期入り。お得な月",
  10: "秋行楽シーズン。連休を外せば安い",
  11: "閑散期。早めに年末対策を",
  12: "年末年始ピーク。11月までに買えなければ正月明けまで待つ",
};

const TREND_IMAGES = [
  "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200&q=80",
  "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&q=80",
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1200&q=80",
];

/**
 * 月次トレンドレポート記事を 1 本生成。
 * 今月のおすすめ・先月の集計を分析的にまとめる。
 *
 * @param sales 全アクティブセール (過去 60 日も含む)
 * @param at    集計時刻 (テスト用)
 */
export function buildMonthlyTrendArticle(
  sales: AirlineSale[],
  at: Date = new Date()
): Article | null {
  if (sales.length === 0) return null;

  const year = at.getFullYear();
  const month = at.getMonth() + 1;
  const slug = `monthly-trend-${year}-${String(month).padStart(2, "0")}`;

  // 路線を全部展開して価格分布を取る
  const allRoutes = sales.flatMap((s) =>
    s.routes.map((r) => ({ ...r, saleName: s.saleName, airlineName: s.airlineName }))
  );
  if (allRoutes.length === 0) return null;

  const cheapest = [...allRoutes].sort((a, b) => a.price - b.price).slice(0, 5);
  const minPrice = cheapest[0].price;
  const maxDiscount = Math.max(...allRoutes.map((r) => r.discount ?? 0));

  // destination 別の最安 (上位 6 都市)
  const byDest = new Map<string, typeof allRoutes[0]>();
  for (const r of allRoutes) {
    const cur = byDest.get(r.destinationCode);
    if (!cur || r.price < cur.price) byDest.set(r.destinationCode, r);
  }
  const topDests = [...byDest.values()].sort((a, b) => a.price - b.price).slice(0, 6);

  const monthHighlight = MONTH_HIGHLIGHT[month] ?? "";

  const headline = `${year}年${month}月の航空券セール総括｜最安¥${formatPrice(minPrice)}〜・最大${maxDiscount}%OFF`;
  const excerpt = `${year}年${month}月のセール情勢を BEATRIP 編集部が分析。${monthHighlight}最安便・お得な目的地・予約のコツを 1 記事で。`;

  const destinationSection = topDests
    .map(
      (d) =>
        `- **${cityNameJa(d.originCode)}→${cityNameJa(d.destinationCode)}**: ¥${formatPrice(d.price)}〜 (${d.airlineName})`
    )
    .join("\n");

  const body = `## ${year}年${month}月の状況

${monthHighlight}

現在 BEATRIP では **${sales.length}件のセール / ${allRoutes.length}路線** を集約しています。最安便は **¥${formatPrice(minPrice)}〜**、最大割引率は **${maxDiscount}%OFF**。

## 今月のおすすめ目的地 Top 6

最安便ベースで、今月特に値ごろ感のある目的地は以下:

${destinationSection}

## 予約のコツ

- **${month >= 5 && month <= 8 ? "夏" : month >= 11 ? "年末" : "オフシーズン"}の傾向を踏まえる** — ${monthHighlight}
- **平日出発 / 早朝深夜便** で同じセールでも 30-40% 安くなることがある
- **2-3ヶ月前予約** が基本。1ヶ月切ると LCC でも値上がりする
- **航空会社公式の "セール通知メール"** を利用して見落とし防止

## 関連リンク

- BEATRIP トップで [今すぐ予約できるセール一覧](https://beatrip.jp/) をチェック
- [航空会社別セール](https://beatrip.jp/airlines)
- [地方発の格安便](https://beatrip.jp/local-flights)

---

価格・条件は取得時点のものです。最新情報は各航空会社・予約サイトでご確認ください。`;

  return {
    slug,
    title: headline,
    excerpt,
    body,
    image_url: TREND_IMAGES[month % TREND_IMAGES.length],
    category: "攻略ガイド",
    airline_tags: [],
    route_tags: [],
    published_at: at.toISOString(),
  };
}
