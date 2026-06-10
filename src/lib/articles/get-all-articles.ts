import { articles as mockArticles } from "@/data/mock-articles";
import { loadGeneratedArticles } from "./article-generator";
import { getRouteGuides } from "./route-guide-generator";
import { getCityGuideArticles } from "./city-guide-generator";
import type { Article } from "@/data/mock-articles";

export async function getAllArticles(): Promise<Article[]> {
  const generated = await loadGeneratedArticles();
  const guides = getRouteGuides();
  const cityGuides = getCityGuideArticles();
  // slug重複を排除（生成セール記事 > モック > 攻略ガイド > 都市ガイド）
  const seen = new Set<string>();
  const all: Article[] = [];
  for (const a of [...generated, ...mockArticles, ...guides, ...cityGuides]) {
    if (seen.has(a.slug)) continue;
    seen.add(a.slug);
    all.push(a);
  }
  return all.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  );
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | undefined> {
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug);
}

export async function getRelatedArticles(
  slug: string,
  limit = 4
): Promise<Article[]> {
  const all = await getAllArticles();
  const article = all.find((a) => a.slug === slug);
  if (!article) return [];

  const candidates = all.filter((a) => a.slug !== slug);

  // 関連度をスコアリング（路線一致 > 航空会社一致 > 同カテゴリ）。
  // 同点は新しい順（candidates は既に published_at 降順）。
  const scored = candidates
    .map((a) => {
      let score = 0;
      const sharedRoutes = a.route_tags.filter((t) =>
        article.route_tags.includes(t)
      ).length;
      const sharedAirlines = a.airline_tags.filter((t) =>
        article.airline_tags.includes(t)
      ).length;
      score += sharedRoutes * 3;
      score += sharedAirlines * 2;
      if (a.category === article.category) score += 1;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .map((x) => x.a);

  // 関連が limit に満たない場合は、同カテゴリ→最新記事で補完して
  // 必ず limit 件埋める（空状態を避け回遊を促す）。
  if (scored.length < limit) {
    const have = new Set(scored.map((a) => a.slug));
    const fillers = candidates
      .filter((a) => !have.has(a.slug))
      .sort((a, b) => {
        const ac = a.category === article.category ? 0 : 1;
        const bc = b.category === article.category ? 0 : 1;
        return ac - bc;
      });
    for (const f of fillers) {
      if (scored.length >= limit) break;
      scored.push(f);
    }
  }

  return scored.slice(0, limit);
}
