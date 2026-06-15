import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { PrNotice } from "@/components/compliance/pr-notice";
import { DealGrid } from "@/components/deals/deal-grid";
import { mockSaleEvents } from "@/data/mock-deals";
import { getActiveDeals } from "@/lib/deals/deal-service";

// ISR: 21600秒キャッシュ (6時間) — 他の deal 系ページと同じ
export const revalidate = 21600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  // layout の title template ("%s | BEATRIP") による二重付与を避けるため absolute 指定
  const title = isEn
    ? "All Flight Deals — Compare Every Sale | BEATRIP"
    : "格安航空券セール一覧｜全ディールを比較 | BEATRIP";
  const description = isEn
    ? "Browse every active flight deal from Japan in one place. Sort by price, discount or booking deadline, and filter by region, airline and cabin to find the cheapest fare."
    : "現在掲載中のフライトディールを一覧で比較。価格が安い順・割引率が高い順・締切が近い順に並び替え、エリアや航空会社で絞り込んで最安の航空券セールを探せます。";
  const path = isEn ? "/en/deals" : "/deals";
  return {
    title: { absolute: title },
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/deals",
        "x-default": "https://beatrip.jp/deals",
      },
    },
  };
}

export default async function DealsIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const isEn = lang === "en";
  const deals = await getActiveDeals();

  // CollectionPage 構造化データ (価格は deal 詳細側で管理するため URL のみ)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: isEn ? "All Flight Deals" : "フライトディール一覧",
    description: isEn
      ? "Every active flight deal from Japan, sortable by price, discount and deadline."
      : "掲載中のフライトディールを価格・割引率・締切で並び替えて比較できる一覧ページ。",
    url: `https://beatrip.jp${isEn ? "/en" : ""}/deals`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: deals.length,
      itemListElement: deals.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://beatrip.jp/deals/${d.id}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6"
      >
        <div className="mb-6">
          <Breadcrumbs
            currentPath={isEn ? "/en/deals" : "/deals"}
            items={[
              { label: "Home", href: "/" },
              { label: isEn ? "Deals" : "ディール一覧" },
            ]}
          />
        </div>

        <section className="mb-8">
          <h1 className="font-heading text-3xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-4xl lg:text-5xl">
            {isEn ? "All Flight Deals" : "フライトディール一覧"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {isEn
              ? `${deals.length} deals available now — sort by price, discount or deadline.`
              : `現在 ${deals.length} 件のディールを掲載中。価格・割引率・締切で並び替えて比較できます。`}
          </p>
          <PrNotice className="mt-3" />
        </section>

        <DealGrid
          deals={deals}
          upcomingSales={mockSaleEvents}
          showSeeAllLink={false}
        />
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
