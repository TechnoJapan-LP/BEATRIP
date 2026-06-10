"use client";

import { useState, useMemo } from "react";
import { Search, FileSearch } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArticleCard } from "@/components/articles/article-card";
import { EmptyState } from "@/components/ui/empty-state";
import type { Article } from "@/data/mock-articles";

const categories = ["すべて", "セール速報", "攻略ガイド", "航空会社ニュース", "旅行Tips"] as const;

const categoryStyle: Record<string, string> = {
  すべて: "bg-zinc-900 text-white",
  セール速報: "bg-rose-500 text-white",
  攻略ガイド: "bg-blue-500 text-white",
  航空会社ニュース: "bg-amber-500 text-white",
  旅行Tips: "bg-emerald-500 text-white",
};

export function ArticleList({ articles }: { articles: Article[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("すべて");

  const filtered = useMemo(() => {
    let result = articles;
    if (category !== "すべて") {
      result = result.filter((a) => a.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.excerpt.toLowerCase().includes(q) ||
          a.airline_tags.some((t) => t.toLowerCase().includes(q)) ||
          a.route_tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [articles, query, category]);

  const [featured, ...rest] = filtered;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="記事を検索..."
            className="pl-9 h-10 bg-zinc-50 border-zinc-200 text-sm placeholder:text-zinc-400 focus-visible:ring-zinc-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}>
              <Badge
                className={`text-[11px] cursor-pointer transition-all ${
                  category === cat
                    ? categoryStyle[cat]
                    : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                }`}
              >
                {cat}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={FileSearch}
          title="該当する記事が見つかりませんでした"
          description="キーワードやカテゴリを変えて再検索するか、最新のセール情報をチェックしてみてください。"
          action={{ label: "最新のセールを見る", href: "/" }}
          secondaryActions={[
            { label: "攻略ガイドを読む", href: "/articles" },
            { label: "ホテルを探す", href: "/hotels" },
          ]}
          className="my-8"
        />
      ) : (
        <>
          {featured && (
            <div className="mb-8">
              <ArticleCard article={featured} featured />
            </div>
          )}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
