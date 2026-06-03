import type { Metadata } from "next";
import Link from "next/link";
import { Plane, Search, ArrowUpRight, TrendingDown } from "lucide-react";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import { getActiveDeals } from "@/lib/deals/deal-service";

// 404 はクロールから除外（フォールバック挙動の安定化）。
// 多言語サイトのため hreflang も維持しつつ、検索エンジンには noindex を渡す。
export const metadata: Metadata = {
  title: "ページが見つかりません",
  description:
    "お探しのページは見つかりませんでした。BEATRIP のトップへ戻って、最新のフライトディール・ホテル情報をご覧ください。",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "https://beatrip.jp/404",
    languages: {
      ja: "https://beatrip.jp/404",
      en: "https://beatrip.jp/en/404",
      "x-default": "https://beatrip.jp/404",
    },
  },
};

export default async function NotFound() {
  // 人気ディール 5 件（割引率の高い順）— 404 からの離脱を防ぐ救済導線
  let popularDeals: Awaited<ReturnType<typeof getActiveDeals>> = [];
  try {
    const deals = await getActiveDeals();
    popularDeals = [...deals]
      .sort((a, b) => b.discount_percent - a.discount_percent)
      .slice(0, 5);
  } catch {
    // ディール取得に失敗しても 404 ページ自体は表示する
    popularDeals = [];
  }

  // BreadcrumbList JSON-LD — クローラに 404 ページの導線を明示
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://beatrip.jp",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "404 Not Found",
        item: "https://beatrip.jp/404",
      },
    ],
  };

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Header />
      <main
        id="main-content"
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6"
      >
        {/* 404 ヒーロー */}
        <div className="flex flex-col items-center text-center">
          <Plane
            className="mb-6 h-16 w-16 text-zinc-600"
            aria-label="飛行機アイコン"
          />
          <h1 className="font-bebas text-[6rem] leading-none tracking-tight text-zinc-100 sm:text-[8rem]">
            404
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            ページが見つかりませんでした
          </p>
          <p className="mt-2 text-sm text-zinc-500 max-w-md">
            URLが変更されたか、削除された可能性があります。下記からBEATRIPの主要セクションをご覧いただけます。
          </p>

          {/* トップ導線（検索ボックス代わり） */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-100 px-5 py-3 text-sm font-bold text-zinc-900 transition-colors hover:bg-white"
            >
              <Search className="h-4 w-4" aria-hidden="true" />
              フライトディールを探す
            </Link>
            <Link
              href="/hotels"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              ホテルを探す
            </Link>
            <Link
              href="/airlines"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-5 py-3 text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-800"
            >
              航空会社セール
            </Link>
          </div>
        </div>

        {/* 人気ディール — 救済導線 */}
        {popularDeals.length > 0 && (
          <section className="mt-16">
            <h2 className="font-heading text-xl tracking-wide text-zinc-100 uppercase mb-4 text-center sm:text-2xl">
              人気のフライトディール
            </h2>
            <p className="text-center text-xs text-zinc-500 mb-6">
              割引率の高い注目セール
            </p>
            <ul className="space-y-2">
              {popularDeals.map((deal) => (
                <li key={deal.id}>
                  <Link
                    href={`/deals/${deal.id}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-colors hover:border-zinc-700 hover:bg-zinc-900"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-mono text-zinc-500">
                        {deal.origin_code} → {deal.destination_code}
                      </div>
                      <div className="mt-0.5 text-sm font-bold text-zinc-100 truncate">
                        {deal.origin} → {deal.destination}
                      </div>
                      <div className="mt-0.5 text-[11px] text-zinc-500 truncate">
                        {deal.airline_name} · {deal.sale_name}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="font-heading text-lg leading-none text-zinc-100">
                        ¥{deal.sale_price.toLocaleString()}
                      </div>
                      <div className="mt-1 flex items-center justify-end gap-0.5 text-rose-400 text-[10px]">
                        <TrendingDown
                          className="h-2.5 w-2.5"
                          aria-hidden="true"
                        />
                        -{deal.discount_percent}%
                      </div>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 flex-shrink-0 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-300"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
