import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { DealGrid } from "@/components/deals/deal-grid";
import { SaleCalendar } from "@/components/calendar/sale-calendar";
import { NotificationPanel } from "@/components/notifications/notification-panel";
import { ArticleCard } from "@/components/articles/article-card";
import { mockSaleEvents } from "@/data/mock-deals";
import { getAllArticles } from "@/lib/articles/get-all-articles";
import { airlines } from "@/data/airlines";
import { AirlineCarousel } from "@/components/airlines/airline-carousel";
import { DealCarousel } from "@/components/deals/deal-carousel";
import { SiteFooter } from "@/components/site-footer";
import { CollapsibleSearch } from "@/components/search/collapsible-search";
import { HeroDeal } from "@/components/deals/hero-deal";
import { NewsletterCTA } from "@/components/newsletter/newsletter-cta";
import { getActiveDeals } from "@/lib/deals/deal-service";

export default async function Home() {
  const [deals, articles] = await Promise.all([
    getActiveDeals(),
    getAllArticles(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BEATRIP",
    url: "https://beatrip.jp",
    description: "航空券セール情報を自動収集。フライトディール、セール時期予測、価格推移を提供。",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://beatrip.jp/?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* ファーストビュー: 注目ディールで即フック */}
        <section className="mb-6">
          <HeroDeal deals={deals} />
        </section>

        {/* コンパクト検索（タップで展開） */}
        <section className="mb-10">
          <CollapsibleSearch deals={deals} />
        </section>

        <section id="deals">
          <div className="mb-8">
            <h1 className="font-heading text-3xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-4xl lg:text-5xl">
              Flash Deals
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              今すぐ予約できる限定フライトセール
            </p>
          </div>
          <DealGrid deals={deals} upcomingSales={mockSaleEvents} />
        </section>

        <NewsletterCTA />

        <section>
          <DealCarousel
            deals={[...deals].sort((a, b) => b.discount_percent - a.discount_percent).slice(0, 8)}
            title="Popular Deals"
            subtitle="割引率の高い人気ディール"
          />
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl lg:text-4xl">
                Articles
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                セール速報・攻略ガイド
              </p>
            </div>
            <Link
              href="/articles"
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              すべて見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 3).map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl lg:text-4xl">
                Airlines
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                航空会社セール情報
              </p>
            </div>
            <Link
              href="/airlines"
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              すべて見る
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <AirlineCarousel airlines={airlines} />
        </section>

        <div id="calendar">
          <SaleCalendar events={mockSaleEvents} />
        </div>
      </main>

      <SiteFooter />

      <NotificationPanel />
    </>
  );
}
