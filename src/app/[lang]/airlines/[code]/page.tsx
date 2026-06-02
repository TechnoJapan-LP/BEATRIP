import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Clock } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SaleDetailCard } from "@/components/airlines/sale-detail-card";
import { ScrapeHistory } from "@/components/airlines/scrape-history";
import { Badge } from "@/components/ui/badge";
import { ArticleCard } from "@/components/articles/article-card";
import { getAirlineByCode, airlines } from "@/data/airlines";
import { loadSales } from "@/lib/store/sale-store";
import { scrapeAirline } from "@/lib/scrapers";
import { saveSalesAndDetectChanges } from "@/lib/store/sale-store";
import { getAllArticles } from "@/lib/articles/get-all-articles";
import { mockSaleEvents } from "@/data/mock-deals";
import { UpcomingDealCard } from "@/components/deals/upcoming-deal-card";
import { SiteFooter } from "@/components/site-footer";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const airline = getAirlineByCode(code);
  if (!airline) return { title: "Not Found" };

  // 「{社名} セール」「{社名} タイムセール」需要に合わせる
  const title = `${airline.name} セール最新情報・タイムセール開催状況 | BEATRIP`;
  const description = `${airline.name}の最新フライトセール・タイムセール・キャンペーン一覧。${airline.type === "LCC" ? "格安LCC" : "フルサービスキャリア"}の現在開催中セール、過去の開催実績、次回予測まで一目で。`;

  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://beatrip.jp/airlines/${code}`,
    },
  };
}

export function generateStaticParams() {
  return airlines.map((a) => ({ code: a.code }));
}

async function getAirlineData(code: string) {
  const stored = await loadSales(code);
  if (stored.sales.length > 0) {
    return { sales: stored.sales, history: stored.history, lastScraped: stored.lastScraped };
  }
  const result = await scrapeAirline(code);
  const change = await saveSalesAndDetectChanges(result);
  const updated = await loadSales(code);
  return { sales: updated.sales, history: updated.history, lastScraped: updated.lastScraped };
}

export default async function AirlineDetailPage({ params }: Props) {
  const { code } = await params;
  const airline = getAirlineByCode(code);
  if (!airline) notFound();

  const { sales, history, lastScraped } = await getAirlineData(code);
  const activeSales = sales.filter((s) => s.isActive);
  const totalRoutes = activeSales.reduce((sum, s) => sum + s.routes.length, 0);

  const allArticles = await getAllArticles();
  const relatedArticles = allArticles
    .filter((a) =>
      a.airline_tags.some(
        (t) => t === airline.name || t.toLowerCase() === airline.nameEn.toLowerCase()
      )
    )
    .slice(0, 3);

  const upcomingEvents = mockSaleEvents.filter(
    (e) => e.airline === airline.nameEn || e.airline === airline.name
  );

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Airlines", href: "/airlines" },
              { label: airline.name },
            ]}
          />
        </div>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl overflow-hidden"
              style={{ backgroundColor: airline.color + "15" }}
            >
              <img src={airline.logo} alt={airline.nameEn} className="h-10 w-10 object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-xl font-bold tracking-tight text-zinc-900 sm:text-2xl lg:text-3xl">
                  {airline.name}
                </h1>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    airline.type === "LCC"
                      ? "bg-orange-50 text-orange-600"
                      : "bg-blue-50 text-blue-600"
                  }`}
                >
                  {airline.type}
                </Badge>
              </div>
              <p className="text-sm text-zinc-400">{airline.nameEn}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-xl font-bold text-zinc-900">
                  {activeSales.length}
                </div>
                <div className="text-[10px] text-zinc-400">開催中</div>
              </div>
              <div>
                <div className="text-xl font-bold text-zinc-900">
                  {totalRoutes}
                </div>
                <div className="text-[10px] text-zinc-400">対象路線</div>
              </div>
              <div>
                <div className="text-xl font-bold text-zinc-900">
                  {history.length}
                </div>
                <div className="text-[10px] text-zinc-400">取得履歴</div>
              </div>
            </div>
          </div>
        </div>

        {lastScraped && (
          <div className="mb-6 flex items-center gap-1.5 text-xs text-zinc-400">
            <Clock className="h-3 w-3" />
            最終取得:{" "}
            {new Date(lastScraped).toLocaleString("ja-JP", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}

        {activeSales.length > 0 ? (
          <div className="space-y-6">
            {activeSales.map((sale, i) => (
              <SaleDetailCard key={sale.id} sale={sale} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-100 bg-white py-16 text-center">
            <p className="text-zinc-400">現在開催中のセールはありません</p>
            <p className="text-xs text-zinc-300 mt-1">
              自動取得で新しいセールが見つかり次第表示されます
            </p>
          </div>
        )}

        {history.length > 0 && <ScrapeHistory history={history} />}

        {upcomingEvents.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase mb-4">
              セール予測
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              過去の開催パターンから予測された今後のセール情報
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event, i) => (
                <UpcomingDealCard key={event.id} event={event} index={i} />
              ))}
            </div>
          </div>
        )}

        {relatedArticles.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase mb-4">
              関連記事
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map((a) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8">
          <Link
            href={`/airlines/${code}/sales`}
            className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-5 transition-colors hover:bg-zinc-50"
          >
            <div>
              <div className="text-sm font-bold text-zinc-900">
                {airline.name} セール時期・実績まとめ
              </div>
              <div className="text-xs text-zinc-400 mt-0.5">
                過去のセール開催データ・傾向分析・次回予測
              </div>
            </div>
            <ArrowLeft className="h-4 w-4 text-zinc-300 rotate-180" />
          </Link>
        </div>

        <div className="mt-4 rounded-xl border border-zinc-100 bg-white p-5">
          <h2 className="font-bold text-zinc-900 mb-3 text-sm">
            データソース
          </h2>
          <div className="space-y-2">
            {airline.scrapeSources.map((source, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2"
              >
                <div>
                  <span className="text-xs font-medium text-zinc-700">
                    {source.name}
                  </span>
                  <span className="ml-2 text-[10px] text-zinc-400 uppercase">
                    {source.type}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-mono truncate max-w-[200px]">
                  {source.url}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
