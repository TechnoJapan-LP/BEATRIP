import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plane, TrendingDown, Calendar } from "lucide-react";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { PriceChart } from "@/components/deals/price-chart";
import { HotelCrossSell } from "@/components/deals/hotel-cross-sell";
import { getActiveDeals, getHistoricalPrices } from "@/lib/deals/deal-service";
import { calculateBestTimeToBook } from "@/lib/predictions/best-time-to-book";
import { Breadcrumbs } from "@/components/breadcrumbs";

type Props = { params: Promise<{ route: string }> };

function parseRoute(slug: string) {
  const decoded = decodeURIComponent(slug);
  const match = decoded.match(/^([A-Z]{3})-([A-Z]{3})$/);
  if (!match) return null;
  return { origin: match[1], destination: match[2] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { route } = await params;
  const parsed = parseRoute(route);
  if (!parsed) return { title: "Not Found" };

  const deals = await getActiveDeals();
  const routeDeals = deals.filter(
    (d) =>
      d.origin_code === parsed.origin &&
      d.destination_code === parsed.destination
  );
  const cheapest = routeDeals.length > 0
    ? Math.min(...routeDeals.map((d) => d.sale_price))
    : null;

  const origin = routeDeals[0]?.origin ?? parsed.origin;
  const dest = routeDeals[0]?.destination ?? parsed.destination;

  return {
    title: `${origin}（${parsed.origin}）→${dest}（${parsed.destination}）格安航空券セール`,
    description: `${origin}から${dest}への格安フライトセール情報。${cheapest ? `最安¥${cheapest.toLocaleString()}〜。` : ""}複数航空会社の価格を比較して最安値を見つけよう。航空券セール時期の予測も。`,
    keywords: [
      `${origin} ${dest} 格安`,
      `${origin} ${dest} 航空券`,
      `${origin} ${dest} セール`,
      `${parsed.origin} ${parsed.destination} 最安`,
      `${dest} 旅行 格安`,
      "航空券セール",
      "格安航空券",
    ],
    openGraph: {
      title: `${origin}→${dest} 格安航空券セール`,
      description: cheapest
        ? `最安¥${cheapest.toLocaleString()}〜 | 複数航空会社の価格を比較`
        : `${origin}→${dest}のセール情報`,
      type: "website",
    },
    alternates: {
      canonical: `https://beatrip.jp/routes/${route}`,
    },
  };
}

export async function generateStaticParams() {
  const deals = await getActiveDeals();
  const routes = new Set<string>();
  for (const d of deals) {
    routes.add(`${d.origin_code}-${d.destination_code}`);
  }
  return Array.from(routes).map((r) => ({ route: r }));
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

export default async function RoutePage({ params }: Props) {
  const { route } = await params;
  const parsed = parseRoute(route);
  if (!parsed) notFound();

  const deals = await getActiveDeals();
  const routeDeals = deals.filter(
    (d) =>
      d.origin_code === parsed.origin &&
      d.destination_code === parsed.destination
  );
  if (routeDeals.length === 0) notFound();

  const routeKey = `${parsed.origin}→${parsed.destination}`;
  const historicalData = await getHistoricalPrices(routeKey);
  const prediction =
    historicalData.length > 0
      ? calculateBestTimeToBook(routeKey, historicalData)
      : null;

  const origin = routeDeals[0].origin;
  const dest = routeDeals[0].destination;
  const cheapest = Math.min(...routeDeals.map((d) => d.sale_price));

  // ItemList 構造化データ（路線のセール一覧）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${origin}→${dest} 格安航空券セール一覧`,
    description: `${origin}から${dest}への航空券セール ${routeDeals.length}件。最安¥${cheapest.toLocaleString()}〜`,
    numberOfItems: routeDeals.length,
    itemListElement: routeDeals
      .sort((a, b) => a.sale_price - b.sale_price)
      .map((deal, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: `${deal.airline_name} ${origin}→${dest}`,
          url: `https://beatrip.jp/deals/${deal.id}`,
          image: deal.image_url,
          offers: {
            "@type": "Offer",
            priceCurrency: "JPY",
            price: deal.sale_price,
            availability: "https://schema.org/InStock",
          },
        },
      })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: `${origin}→${dest}` },
            ]}
          />
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          ディール一覧に戻る
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm text-zinc-500">
              {parsed.origin}
            </span>
            <Plane className="h-4 w-4 text-zinc-400 rotate-45" />
            <span className="font-mono text-sm text-zinc-500">
              {parsed.destination}
            </span>
          </div>
          <h1 className="font-heading text-4xl tracking-wide text-zinc-900 uppercase sm:text-5xl">
            {origin}→{dest}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            この路線の格安フライトセール {routeDeals.length}件
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {routeDeals
              .sort((a, b) => a.sale_price - b.sale_price)
              .map((deal) => (
                <Link
                  key={deal.id}
                  href={`/deals/${deal.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-5 transition-colors hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-4">
                    <Image
                      src={deal.image_url}
                      alt={deal.destination}
                      width={96}
                      height={64}
                      sizes="96px"
                      className="h-16 w-24 rounded-lg object-cover flex-shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-zinc-900">
                          {deal.airline_name}
                        </span>
                        {deal.badge && (
                          <Badge
                            className={`text-[9px] ${
                              deal.badge === "NEW"
                                ? "bg-emerald-500 text-white"
                                : deal.badge === "ENDING_SOON"
                                  ? "bg-amber-500 text-white"
                                  : "bg-rose-500 text-white"
                            }`}
                          >
                            {deal.badge.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500">
                        {deal.sale_name} · {deal.cabin}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400">
                        <span>
                          <Calendar className="h-3 w-3 inline mr-0.5" />
                          {formatDate(deal.departure_date)}〜
                          {formatDate(deal.return_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-400 line-through font-mono">
                      ¥{formatPrice(deal.original_price)}
                    </div>
                    <div className="font-heading text-2xl tracking-wide text-zinc-900">
                      ¥{formatPrice(deal.sale_price)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-rose-500">
                      <TrendingDown className="h-3 w-3" />
                      <span className="text-xs font-bold">
                        -{deal.discount_percent}%
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
          </div>

          <div className="space-y-6">
            <HotelCrossSell
              destinationCode={parsed.destination}
              destinationLabel={dest}
              checkIn={routeDeals[0].departure_date}
              checkOut={routeDeals[0].return_date}
            />

            {prediction && prediction.historical_prices.length > 0 && (
              <div className="rounded-xl border border-zinc-100 bg-white p-5">
                <h2 className="font-heading text-lg tracking-wide text-zinc-900 uppercase mb-3">
                  Best Time to Book
                </h2>
                <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2">
                  <span className="text-sm font-bold text-emerald-700">
                    ベスト: {prediction.best_month_name}
                  </span>
                  <p className="text-[11px] text-emerald-600">
                    平均より約{prediction.avg_saving_percent}%安い
                  </p>
                </div>
                <PriceChart prediction={prediction} />
              </div>
            )}

            <div className="rounded-xl border border-zinc-100 bg-white p-5">
              <h3 className="font-heading text-lg tracking-wide text-zinc-900 uppercase mb-3">
                他の路線
              </h3>
              <div className="space-y-2">
                {Array.from(
                  new Set(
                    deals
                      .filter(
                        (d) =>
                          !(
                            d.origin_code === parsed.origin &&
                            d.destination_code === parsed.destination
                          )
                      )
                      .map(
                        (d) => `${d.origin_code}-${d.destination_code}`
                      )
                  )
                )
                  .slice(0, 6)
                  .map((r) => {
                    const [o, d] = r.split("-");
                    const sample = deals.find(
                      (deal) =>
                        deal.origin_code === o &&
                        deal.destination_code === d
                    );
                    return (
                      <Link
                        key={r}
                        href={`/routes/${r}`}
                        className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 transition-colors hover:bg-zinc-100"
                      >
                        <span className="text-xs font-mono text-zinc-600">
                          {o}→{d}
                        </span>
                        {sample && (
                          <span className="text-xs font-bold text-zinc-800">
                            ¥{formatPrice(sample.sale_price)}〜
                          </span>
                        )}
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
