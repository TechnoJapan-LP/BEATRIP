import type { Article } from "@/data/mock-articles";
import { HOTEL_DESTINATIONS } from "@/data/hotel-destinations";
import { CITY_GUIDES } from "@/data/hotel-city-guides";

/**
 * 都市別「旅行ガイド」記事ジェネレータ
 *
 * 各ホテル目的地（29都市）に対し「{都市} 旅行ガイド｜ベストシーズン・
 * エリア・相場と航空券」記事を生成する。slug は安定なので何度呼んでも
 * 同じ内容を返す（リスト merge で dedup される）。
 *
 * getAllArticles() がこれを混ぜることで一気に30本の SEO ページを増やす。
 */

const STABLE_PUBLISHED_AT = "2026-06-01T00:00:00.000Z";

let cached: Article[] | null = null;

export function getCityGuideArticles(): Article[] {
  if (cached) return cached;

  cached = HOTEL_DESTINATIONS.map((d): Article => {
    const guide = CITY_GUIDES[d.slug];
    const price = d.priceFromJpy
      ? `1泊¥${d.priceFromJpy.toLocaleString()}〜`
      : "";

    const sections: string[] = [];

    sections.push(
      `${d.nameJa}（${d.nameEn}）の旅行ガイドです。${d.tagline}。${price ? "ホテル相場は" + price + "から。" : ""}本記事ではベストシーズン・主要エリア・おすすめの楽しみ方・航空券の取り方をまとめます。`
    );

    sections.push("## ベストシーズン\n\n" + d.bestSeason + (guide?.climate ? `\n\n気候: ${guide.climate}` : ""));

    sections.push(
      "## おすすめエリア\n\n" +
        d.areas.map((a) => `- ${a}`).join("\n")
    );

    if (guide?.attractions?.length) {
      sections.push(
        "## 人気の観光スポット\n\n" +
          guide.attractions.map((a) => `- ${a}`).join("\n")
      );
    }

    if (guide?.food?.length) {
      sections.push(
        "## ご当地グルメ\n\n" +
          guide.food.map((f) => `- ${f}`).join("\n")
      );
    }

    if (guide) {
      sections.push(
        `## 旅の基本情報\n\n- **通貨**: ${guide.currency}\n- **言語**: ${guide.language}\n- **治安**: ${guide.safety}\n- **空港アクセス**: ${guide.airportAccess}`
      );
    }

    sections.push(
      `## ${d.nameJa}行きの航空券\n\nBEATRIPでは${d.nameJa}（${d.iataCodes.join(" / ")}）行きのフライトセール情報を自動収集しています。最新の価格・次回セール予測・過去最安値はトップページからご確認ください。\n\nまた、${d.nameJa}のホテルは[こちらのページ](/hotels/${d.slug})から最安値で検索できます。`
    );

    sections.push(
      `## ${d.nameJa}を安く旅行するコツ\n\n- 出発の2〜3ヶ月前に予約\n- 平日出発・帰国で航空券＆ホテル両方を節約\n- 連休やハイシーズン（${d.bestSeason}）を外す\n- BEATRIPのニュースレターで新着セールを受け取る\n- 価格アラートで希望価格以下になったら通知を受け取る`
    );

    const body = sections.join("\n\n");

    const airlineTags: string[] = []; // 都市記事なので空
    const routeTags: string[] = d.iataCodes.map((c) => `${c}-`);

    return {
      slug: `city-guide-${d.slug}`,
      title: `${d.nameJa} 旅行ガイド｜ベストシーズン・エリア・相場と航空券`,
      excerpt: `${d.nameJa}（${d.nameEn}）旅行のベストシーズン・主要エリア・観光・グルメ・治安・空港アクセスまで網羅。${price ? "ホテル相場" + price + "、" : ""}${d.nameJa}行きフライトディールも。`,
      body,
      image_url: d.image ?? "",
      category: "攻略ガイド",
      airline_tags: airlineTags,
      route_tags: routeTags,
      published_at: STABLE_PUBLISHED_AT,
    };
  });

  return cached;
}
