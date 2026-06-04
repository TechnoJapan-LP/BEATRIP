import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { DealGrid } from "@/components/deals/deal-grid";
import { SaleCalendar } from "@/components/calendar/sale-calendar";
import { ArticleCard } from "@/components/articles/article-card";
import { mockSaleEvents } from "@/data/mock-deals";
import { getAllArticles } from "@/lib/articles/get-all-articles";
import { airlines } from "@/data/airlines";
import { AirlineCarousel } from "@/components/airlines/airline-carousel";
import { DealCarousel } from "@/components/deals/deal-carousel";
import { SiteFooter } from "@/components/site-footer";
import { CollapsibleSearch } from "@/components/search/collapsible-search";
import { HeroDeal } from "@/components/deals/hero-deal";
import { NewsletterCTASlim } from "@/components/newsletter/newsletter-cta-slim";

// Below-the-fold + heavy interactive components — code-split out of the
// initial JS chunk. Note: ssr:false is not allowed in Server Components,
// so we use dynamic() without it; the components still load lazily on the
// client and live in their own JS chunks.
const NotificationPanel = dynamic(() =>
  import("@/components/notifications/notification-panel").then((m) => ({
    default: m.NotificationPanel,
  }))
);
const NewsletterCTA = dynamic(() =>
  import("@/components/newsletter/newsletter-cta").then((m) => ({
    default: m.NewsletterCTA,
  }))
);
import { DestinationSpotlight } from "@/components/home/destination-spotlight";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { HOTEL_BY_SLUG, HOTEL_DESTINATIONS } from "@/data/hotel-destinations";
import { getDictionary, hasLocale } from "./dictionaries";
import { localizeHref } from "@/lib/i18n/locale";
import type { Metadata } from "next";

// ISR: 1800秒キャッシュ (30分: deal が頻繁に変わる top)
export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "ja";

  // 検索キーワード（「格安航空券」「航空会社セール」）需要をタイトル/説明に反映。
  // 150〜160字を目安に拡張し、CTR とキーワードカバレッジを向上。
  const description =
    locale === "ja"
      ? "「格安航空券」「航空会社セール」で検索する方へ。ANA・JAL・Peach・Jetstar など日本発着の最新セール情報を自動収集。次回セール時期の予測、価格推移、最安値ディールを毎日更新。フライトとホテルの予約準備にどうぞ。"
      : "For travelers searching cheap flights from Japan. BEATRIP auto-tracks ANA, JAL, Peach, Jetstar and more — latest sales, sale-timing forecasts, price history, and the cheapest deals, updated daily. Plan flights and hotels in one place.";

  const path = locale === "ja" ? "" : "/en";

  return {
    description,
    openGraph: {
      description,
    },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp",
        en: "https://beatrip.jp/en",
        "x-default": "https://beatrip.jp",
      },
    },
  };
}

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

  // 「今週、行きたくなる旅先」スポットライト：
  // 1) 大カード = 現在ディール最大割引の目的地（ホテルページ有のもの）
  // 2) 小カード = 同様にディスカウント率高い順から、大カードと別の都市を2つ
  const spotlightCandidates = [...deals]
    .sort((a, b) => b.discount_percent - a.discount_percent)
    .map((d) => {
      // destination_code から HotelDestination を逆引き
      const hd = HOTEL_DESTINATIONS.find((h) =>
        h.iataCodes.includes(d.destination_code)
      );
      return hd ? { slug: hd.slug, discount: d.discount_percent } : null;
    })
    .filter((x): x is { slug: string; discount: number } => Boolean(x));
  const spotlightSlugs: string[] = [];
  for (const c of spotlightCandidates) {
    if (!spotlightSlugs.includes(c.slug)) spotlightSlugs.push(c.slug);
    if (spotlightSlugs.length === 3) break;
  }
  // 万一データが薄ければ POPULAR から補完
  for (const s of ["bangkok", "honolulu", "paris"]) {
    if (spotlightSlugs.length < 3 && !spotlightSlugs.includes(s)) {
      spotlightSlugs.push(s);
    }
  }
  const spotlights = spotlightSlugs.map((slug, i) => ({
    slug,
    badge: i === 0 ? "今週のいちおし" : i === 1 ? "コスパ◎" : "憧れの旅先",
  }));

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
        {/* ファーストビュー: 注目ディール（雑誌風の一面）— 即フック */}
        <section className="mb-6 animate-fade-up">
          <HeroDeal deals={deals} />
        </section>

        {/* コンパクト検索（タップで展開） */}
        <section className="mb-4">
          <CollapsibleSearch deals={deals} />
        </section>

        {/* スリム版 ニュースレターCTA — ファーストビューでリピーター化 */}
        <section className="mb-12">
          <NewsletterCTASlim source="home_top" />
        </section>

        {/* インスピレーション: 旅先スポットライト */}
        <section
          className="mb-12 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <DestinationSpotlight
            deals={deals}
            spotlights={spotlights}
            lh={lh}
          />
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

        {/* Popular Hotels — 高料率の収益面、フライト/ホテル両軸の流量に */}
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

        {/* 割引率の高いディール カルーセル */}
        <section className="mt-12">
          <DealCarousel
            deals={[...deals].sort((a, b) => b.discount_percent - a.discount_percent).slice(0, 8)}
            title={t.popularTitle}
            subtitle={t.popularSubtitle}
          />
        </section>

        {/* リピート化のための フルCTA */}
        <NewsletterCTA />

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
