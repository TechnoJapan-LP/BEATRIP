import { articles as mockArticles } from "@/data/mock-articles";
import { loadGeneratedArticles } from "./article-generator";
import { getRouteGuides } from "./route-guide-generator";
import type { Article } from "@/data/mock-articles";

export async function getAllArticles(): Promise<Article[]> {
  const generated = await loadGeneratedArticles();
  const guides = getRouteGuides();
  // slug重複を排除（生成セール記事 > モック > 攻略ガイド の優先順）
  const seen = new Set<string>();
  const all: Article[] = [];
  for (const a of [...generated, ...mockArticles, ...guides]) {
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
  limit = 3
): Promise<Article[]> {
  const all = await getAllArticles();
  const article = all.find((a) => a.slug === slug);
  if (!article) return [];
  return all
    .filter((a) => a.slug !== slug)
    .filter(
      (a) =>
        a.airline_tags.some((t) => article.airline_tags.includes(t)) ||
        a.route_tags.some((t) => article.route_tags.includes(t)) ||
        a.category === article.category
    )
    .slice(0, limit);
}
