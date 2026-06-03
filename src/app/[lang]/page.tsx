import Link from "next/link";
import Image from "next/image";
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
import { NewsletterCTASlim } from "@/components/newsletter/newsletter-cta-slim";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { HOTEL_BY_SLUG } from "@/data/hotel-destinations";
import { getDictionary, hasLocale } from "./dictionaries";
import { localizeHref } from "@/lib/i18n/locale";

// ホームに出す代表的なホテル都市（国内→アジア→欧米まんべんなく）
const POPULAR_HOTEL_SLUGS = [
  "tokyo",
  "bangkok",
  "seoul",
  "okinawa",
  "honolulu",
  "taipei",
  "paris",
  "sapporo",
];

export default async function Home({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "ja";
  const dict = await getDictionary(locale);
  const t = dict.home;
  const lh = (href: string) => localizeHref(href, locale);

  const [deals, articles] = await Promise.all([
    getActiveDeals(),
    getAllArticles(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BEATRIP",
    url: "https://beatrip.jp",
    description:
      locale === "ja"
        ? "航空券セール情報を自動収集。フライトディール、セール時期予測、価格推移を提供。"
        : "Automatically tracking airline sales. Flight deals, sale-timing forecasts, and price history.",
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
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* ファーストビュー: 注目ディールで即フック */}
        <section className="mb-6">
          <HeroDeal deals={deals} />
        </section>

        {/* コンパクト検索（タップで展開） */}
        <section className="mb-4">
          <CollapsibleSearch deals={deals} />
        </section>

        {/* スリム版 ニュースレターCTA — ファーストビューでリピーター化 */}
        <section className="mb-10">
          <NewsletterCTASlim source="home_top" />
        </section>

        <section id="deals">
          <div className="mb-8">
            <h1 className="font-heading text-3xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-4xl lg:text-5xl">
              {t.flashDealsTitle}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {t.flashDealsSubtitle}
            </p>
          </div>
          <DealGrid deals={deals} upcomingSales={mockSaleEvents} />
        </section>

        <NewsletterCTA />

        <section>
          <DealCarousel
            deals={[...deals].sort((a, b) => b.discount_percent - a.discount_percent).slice(0, 8)}
            title={t.popularTitle}
            subtitle={t.popularSubtitle}
          />
        </section>

        {/* Popular Hotels — 高料率の収益面、新規導線 */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl lg:text-4xl">
                Popular Hotels
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                人気目的地のホテルを最安値で
              </p>
            </div>
            <Link
              href={lh("/hotels")}
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {dict.common.seeAll}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {POPULAR_HOTEL_SLUGS.map((slug) => {
              const d = HOTEL_BY_SLUG[slug];
              if (!d) return null;
              return (
                <Link
                  key={d.slug}
                  href={lh(`/hotels/${d.slug}`)}
                  className="group block overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 transition-all hover:shadow-xl hover:ring-zinc-200 dark:hover:ring-zinc-700 hover:-translate-y-1"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    {d.image && (
                      <Image
                        src={d.image}
                        alt={d.nameJa}
                        fill
                        sizes="(max-width: 640px) 50vw, 25vw"
                        loading="lazy"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="font-heading text-[18px] leading-none tracking-wide text-white uppercase sm:text-[22px]">
                        {d.nameJa}
                      </h3>
                      {d.priceFromJpy && (
                        <p className="mt-1 text-[10px] text-white/80 sm:text-xs">
                          1泊 ¥{d.priceFromJpy.toLocaleString()}〜
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl lg:text-4xl">
                {t.articlesTitle}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {t.articlesSubtitle}
              </p>
            </div>
            <Link
              href={lh("/articles")}
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {dict.common.seeAll}
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
                {t.airlinesTitle}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {t.airlinesSubtitle}
              </p>
            </div>
            <Link
              href={lh("/airlines")}
              className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              {dict.common.seeAll}
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
