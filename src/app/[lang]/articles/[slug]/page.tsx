import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Tag, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { ArticleCard } from "@/components/articles/article-card";
import { ShareButtons } from "@/components/deals/share-buttons";
import {
  getAllArticles,
  getArticleBySlug,
  getRelatedArticles,
} from "@/lib/articles/get-all-articles";
import { deals } from "@/data/mock-deals-v2";
import { airlines } from "@/data/airlines";
import { SiteFooter } from "@/components/site-footer";
import { NewsletterCTA } from "@/components/newsletter/newsletter-cta";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Not Found" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.image_url],
      type: "article",
    },
    alternates: {
      canonical: `https://beatrip.jp/articles/${slug}`,
    },
  };
}


const categoryColor = {
  セール速報: "bg-rose-500 text-white",
  攻略ガイド: "bg-blue-500 text-white",
  航空会社ニュース: "bg-amber-500 text-white",
  旅行Tips: "bg-emerald-500 text-white",
} as const;

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function renderMarkdown(body: string) {
  return body.split("\n").map((line, i) => {
    if (line.startsWith("### ")) {
      return (
        <h3
          key={i}
          className="text-base font-bold text-zinc-900 mt-6 mb-2"
        >
          {line.slice(4)}
        </h3>
      );
    }
    if (line.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="font-heading text-xl tracking-wide text-zinc-900 uppercase mt-8 mb-3"
        >
          {line.slice(3)}
        </h2>
      );
    }
    if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)$/);
      if (match) {
        return (
          <li key={i} className="text-sm text-zinc-600 ml-4 mb-1">
            <span className="font-bold text-zinc-800">{match[1]}</span>
            {match[2] ? `: ${match[2]}` : ""}
          </li>
        );
      }
    }
    if (line.startsWith("- ")) {
      return (
        <li key={i} className="text-sm text-zinc-600 ml-4 mb-1">
          {line.slice(2)}
        </li>
      );
    }
    if (line.startsWith("| ") && line.includes("|")) {
      const cells = line
        .split("|")
        .filter((c) => c.trim())
        .map((c) => c.trim());
      if (cells.every((c) => c.match(/^[-:]+$/))) return null;
      return (
        <div
          key={i}
          className="grid grid-cols-3 gap-2 text-sm py-1.5 border-b border-zinc-100"
        >
          {cells.map((cell, j) => (
            <span
              key={j}
              className={j === 0 ? "text-zinc-800 font-medium" : "text-zinc-600"}
            >
              {cell}
            </span>
          ))}
        </div>
      );
    }
    if (line.trim() === "") {
      return <div key={i} className="h-2" />;
    }
    if (line.match(/^\d+\. /)) {
      return (
        <li key={i} className="text-sm text-zinc-600 ml-4 mb-1 list-decimal">
          {line.replace(/^\d+\.\s*/, "")}
        </li>
      );
    }
    const formatted = line.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="font-bold text-zinc-800">$1</strong>'
    );
    return (
      <p
        key={i}
        className="text-sm text-zinc-600 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatted }}
      />
    );
  });
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(slug);

  const linkedDeals = deals.filter(
    (d) =>
      article.airline_tags.includes(d.airline_name) ||
      article.route_tags.includes(`${d.origin_code}-${d.destination_code}`)
  );

  const linkedAirlines = airlines.filter((a) =>
    article.airline_tags.some(
      (t) => t === a.name || t.toLowerCase() === a.nameEn.toLowerCase()
    )
  );

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [article.image_url],
    datePublished: article.published_at,
    dateModified: article.published_at,
    author: {
      "@type": "Organization",
      name: "BEATRIP編集部",
      url: "https://beatrip.jp",
    },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      logo: {
        "@type": "ImageObject",
        url: "https://beatrip.jp/icon.svg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://beatrip.jp/articles/${slug}`,
    },
    articleSection: article.category,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header />

      <div className="relative h-[28vh] min-h-[220px] overflow-hidden sm:h-[35vh] sm:min-h-[280px]">
        <Image
          src={article.image_url}
          alt={article.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
            <div className="mb-4">
              <Breadcrumbs
                variant="dark"
                items={[
                  { label: "Home", href: "/" },
                  { label: "Articles", href: "/articles" },
                  { label: article.title },
                ]}
              />
            </div>
            <Badge
              className={`text-[10px] font-bold tracking-wider mb-3 ${categoryColor[article.category]}`}
            >
              {article.category}
            </Badge>
            <h1 className="text-xl font-bold text-white leading-snug sm:text-2xl lg:text-3xl">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 mt-3 text-sm text-white/50">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatDate(article.published_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <article className="lg:col-span-2">
            <div className="rounded-xl border border-zinc-100 bg-white p-4 sm:p-6 lg:p-8">
              {renderMarkdown(article.body)}
            </div>
            {/* 記事末尾CTA: 読了直後＝最もエンゲージメントが高い瞬間 */}
            <NewsletterCTA />
          </article>

          <aside className="space-y-6">
            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <ShareButtons
                url={`https://beatrip.jp/articles/${article.slug}`}
                title={article.title}
                description={`${article.excerpt} | BEATRIP`}
              />
            </div>

            {linkedDeals.length > 0 && (
              <div className="rounded-xl border border-zinc-100 bg-white p-5">
                <h3 className="font-heading text-lg tracking-wide text-zinc-900 uppercase mb-3">
                  関連ディール
                </h3>
                <div className="space-y-2">
                  {linkedDeals.slice(0, 4).map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 transition-colors hover:bg-zinc-100"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-zinc-800 truncate">
                          {deal.origin}
                          <span className="mx-1 font-normal text-zinc-400">→</span>
                          {deal.destination}
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          {deal.origin_code}→{deal.destination_code} · {deal.airline_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-zinc-800">
                          ¥{formatPrice(deal.sale_price)}
                        </div>
                        <span className="text-[10px] text-rose-500 font-medium">
                          -{deal.discount_percent}%
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {linkedAirlines.length > 0 && (
              <div className="rounded-xl border border-zinc-100 bg-white p-5">
                <h3 className="font-heading text-lg tracking-wide text-zinc-900 uppercase mb-3">
                  航空会社情報
                </h3>
                <div className="space-y-2">
                  {linkedAirlines.map((a) => (
                    <Link
                      key={a.code}
                      href={`/airlines/${a.code}`}
                      className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5 transition-colors hover:bg-zinc-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden"
                          style={{ backgroundColor: a.color + "15" }}
                        >
                          <img src={a.logo} alt={a.nameEn} className="h-5 w-5 object-contain" />
                        </span>
                        <div>
                          <div className="text-xs font-medium text-zinc-800">
                            {a.name}
                          </div>
                          <div className="text-[10px] text-zinc-400">
                            {a.nameEn} · {a.type}
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-zinc-300" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase mb-4">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
