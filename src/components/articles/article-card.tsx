import Link from "next/link";
import Image from "next/image";
import { BLUR_PLACEHOLDER_LIGHT } from "@/lib/images/blur";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/data/mock-articles";

const categoryColor = {
  セール速報: "bg-rose-500 text-white",
  攻略ガイド: "bg-blue-500 text-white",
  航空会社ニュース: "bg-amber-500 text-white",
  旅行Tips: "bg-emerald-500 text-white",
} as const;

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "今日";
  if (days === 1) return "昨日";
  if (days < 7) return `${days}日前`;
  if (days < 30) return `${Math.floor(days / 7)}週間前`;
  return `${Math.floor(days / 30)}ヶ月前`;
}

export function ArticleCard({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  if (featured) {
    return (
      <Link
        href={`/articles/${article.slug}`}
        className="group relative block overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 transition-[box-shadow,transform] hover:shadow-lg hover:-translate-y-0.5"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2">
          <div className="relative aspect-[4/3] sm:aspect-auto overflow-hidden">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER_LIGHT}
            />
          </div>
          <div className="p-6 flex flex-col justify-center">
            <Badge
              className={`w-fit text-[10px] font-bold tracking-wider mb-3 ${categoryColor[article.category]}`}
            >
              {article.category}
            </Badge>
            <h2 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-snug mb-2 group-hover:text-zinc-600 transition-colors">
              {article.title}
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed line-clamp-2 mb-3">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(article.published_at)}
              </span>
              {article.airline_tags.length > 0 && (
                <span>{article.airline_tags.join(", ")}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="group block overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 transition-[box-shadow,transform] hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER_LIGHT}
        />
        <Badge
          className={`absolute top-3 left-3 text-[10px] font-bold tracking-wider ${categoryColor[article.category]}`}
        >
          {article.category}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 leading-snug mb-1.5 group-hover:text-zinc-600 transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-xs text-zinc-500 line-clamp-2 mb-2">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 text-[10px] text-zinc-400">
          <Clock className="h-3 w-3" />
          {timeAgo(article.published_at)}
        </div>
      </div>
    </Link>
  );
}
