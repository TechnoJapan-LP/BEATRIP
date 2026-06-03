import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, ArrowUpRight, Calendar, MapPin, Plane, TrendingDown } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import {
  HOTEL_DESTINATIONS,
  getHotelDestinationBySlug,
} from "@/data/hotel-destinations";
import { buildHotelLink } from "@/lib/affiliate/url-builder";
import { getActiveDeals } from "@/lib/deals/deal-service";
import { getCityGuide } from "@/data/hotel-city-guides";
import { getCuratedHotels } from "@/data/hotel-curated";
import { TravelCompanions } from "@/components/affiliate/travel-companions";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d) return { title: "Not Found" };

  const title = `${d.nameJa}のホテル予約・最安値検索｜エリア別の特徴と相場 | BEATRIP`;
  const description = `${d.nameJa}（${d.nameEn}）のホテルを最安値で検索。${d.tagline}。${d.priceFromJpy ? `1泊¥${d.priceFromJpy.toLocaleString()}〜の目安。` : ""}主要エリアの特徴、ベストシーズン、関連フライトディールも掲載。`;

  return {
    title,
    description,
    keywords: [
      `${d.nameJa} ホテル`,
      `${d.nameJa} ホテル 格安`,
      `${d.nameJa} ホテル 予約`,
      `${d.nameJa} 宿泊`,
      `${d.nameJa} ホテル 最安値`,
      `${d.nameEn} hotel`,
    ],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp/hotels/${d.slug}`,
    },
  };
}

export function generateStaticParams() {
  return HOTEL_DESTINATIONS.map((d) => ({ city: d.slug }));
}

function priceFmt(n: number): string {
  return new Intl.NumberFormat("ja-JP").format(n);
}

export default async function HotelCityPage({ params }: Props) {
  const { city } = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d) notFound();

  const hotelUrl = buildHotelLink(d.nameEn);
  const guide = getCityGuide(d.slug);
  const curatedHotels = getCuratedHotels(d.slug);

  // 関連フライトディール（この都市行き、最大4件）
  const deals = await getActiveDeals();
  const cityDeals = deals.filter((deal) =>
    d.iataCodes.includes(deal.destination_code)
  );
  const relatedFlights = [...cityDeals]
    .sort((a, b) => a.sale_price - b.sale_price)
    .slice(0, 4);

  // この都市行きの人気路線（出発地ごとに重複排除、上位4路線）
  const popularRoutes = Array.from(
    new Set(
      cityDeals.map((dd) => `${dd.origin_code}-${dd.destination_code}`)
    )
  ).slice(0, 4);

  // FAQ — 「{都市} ホテル 安く」「{都市} ホテル どのエリア」「{都市} ホテル 相場」需要に対応
  const faqs = [
    {
      q: `${d.nameJa}のホテル相場はどのくらいですか？`,
      a: `${d.nameJa}の3つ星クラスのホテル相場は${d.priceFromJpy ? `1泊¥${priceFmt(d.priceFromJpy)}〜` : "シーズン・エリアにより変動します"}。シーズンや立地により上下するため、最新の価格は本ページの検索ボタンからHotellookで確認してください。`,
    },
    {
      q: `${d.nameJa}のホテルはどのエリアが便利ですか？`,
      a: `${d.nameJa}の代表的なエリアは ${d.areas.map((a) => `「${a}」`).join("、")} です。観光中心地と空港アクセスのバランスで選ぶのがコツです。`,
    },
    {
      q: `${d.nameJa}に行くベストシーズンはいつですか？`,
      a: `${d.nameJa}のベストシーズンは「${d.bestSeason}」です。シーズン中は航空券・ホテルとも価格が上がるため、早めの予約が安く取るコツです。`,
    },
    {
      q: `${d.nameJa}のホテルを安く取るコツは？`,
      a: `平日宿泊・出発の2〜3ヶ月前予約・キャンセル無料プランの早期確保・週末や連休を外す・複数の予約サイトで比較する、が基本です。BEATRIPでは${d.nameJa}行きフライトのセール時期予測も提供しています。`,
    },
    {
      q: `${d.nameJa}行きの航空券もチェックしたいです`,
      a: `${d.nameJa}（${d.iataCodes.join("/")}）行きのフライトディール一覧は本ページ下部の「${d.nameJa}行きフライトディール」セクションでご確認いただけます。BEATRIPは航空券セール情報を自動収集しており、過去最安や次回セール予測もご覧いただけます。`,
    },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    name: d.nameJa,
    alternateName: d.nameEn,
    description: d.tagline,
    url: `https://beatrip.jp/hotels/${d.slug}`,
    image: d.image,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      {/* Hero */}
      <section className="relative h-[280px] sm:h-[360px] overflow-hidden">
        {d.image && (
          <Image
            src={d.image}
            alt={d.nameJa}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="relative mx-auto max-w-7xl h-full flex flex-col justify-end px-4 sm:px-6 pb-6">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "ホテル", href: "/hotels" },
              { label: d.nameJa },
            ]}
          />
          <h1 className="mt-4 font-heading text-4xl tracking-wide text-white uppercase sm:text-5xl lg:text-6xl">
            {d.nameJa}
          </h1>
          <p className="mt-2 text-sm text-white/80 sm:text-base max-w-2xl">
            {d.tagline}
          </p>
        </div>
      </section>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        {/* 主要CTA */}
        <section className="mb-10">
          <a
            href={hotelUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="group flex items-center gap-4 rounded-2xl bg-zinc-900 dark:bg-zinc-100 px-6 py-5 text-white dark:text-zinc-900 transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 dark:bg-zinc-900/10">
              <BedDouble className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-heading text-xl tracking-wide uppercase sm:text-2xl">
                {d.nameJa}のホテルを検索
              </h2>
              <p className="text-xs text-white/70 dark:text-zinc-900/70 mt-0.5">
                Hotellookで複数の予約サイトを横断比較
                {d.priceFromJpy ? `（1泊¥${priceFmt(d.priceFromJpy)}〜）` : ""}
              </p>
            </div>
            <ArrowUpRight className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2 space-y-10">
            {/* エリア解説 */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  主要エリア
                </h2>
              </div>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <ul className="space-y-2">
                  {d.areas.map((a) => (
                    <li key={a} className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ベストシーズン */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  ベストシーズン
                </h2>
              </div>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {d.bestSeason}
                </p>
                {guide?.climate && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                    気候: {guide.climate}
                  </p>
                )}
                <p className="text-xs text-zinc-400 mt-2">
                  ※ ハイシーズンは航空券・ホテルとも価格上昇傾向。予約は2〜3ヶ月前が目安です。
                </p>
              </div>
            </section>

            {/* キュレートされた代表ホテル — 編集者による厳選リスト */}
            {curatedHotels.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <BedDouble className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    {d.nameJa}の代表的なホテル
                  </h2>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  編集者が選ぶ、価格帯別の代表的なホテル。クリックで{d.nameJa}のホテル一覧から最新の空室・料金をチェックできます。
                </p>
                <div className="space-y-2">
                  {curatedHotels.map((h) => (
                    <a
                      key={h.name}
                      href={hotelUrl}
                      target="_blank"
                      rel="sponsored noopener noreferrer"
                      className="group block rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-colors hover:border-zinc-200 dark:hover:border-zinc-700"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                              {h.name}
                            </h3>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                h.tier === "ラグジュアリー"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                  : h.tier === "ハイクラス"
                                    ? "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300"
                                    : h.tier === "ミドル"
                                      ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                              }`}
                            >
                              {h.tier}
                            </span>
                          </div>
                          <div className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                            エリア: {h.area}
                          </div>
                          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            {h.highlight}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* 観光名所 */}
            {guide && guide.attractions.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                  人気の観光スポット
                </h2>
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                  <ul className="space-y-2">
                    {guide.attractions.map((a) => (
                      <li
                        key={a}
                        className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* グルメ */}
            {guide && guide.food.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                  ご当地グルメ
                </h2>
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
                  <ul className="space-y-2">
                    {guide.food.map((f) => (
                      <li
                        key={f}
                        className="flex items-start gap-2 text-sm text-zinc-700 dark:text-zinc-300"
                      >
                        <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-zinc-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* 旅の準備 — 高料率アフィリエイト（env で有効なものだけ表示） */}
            <TravelCompanions
              ctx={{
                cityNameEn: d.nameEn,
                cityNameJa: d.nameJa,
                countryNameEn: d.countryEn,
                countrySlug: d.airaloSlug,
                destinationIata: d.iataCodes[0],
                originIata: relatedFlights[0]?.origin_code,
                checkIn: relatedFlights[0]?.departure_date,
                checkOut: relatedFlights[0]?.return_date,
              }}
            />

            {/* 旅の基本情報 */}
            {guide && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-3">
                  旅の基本情報
                </h2>
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-zinc-400 mb-1 font-bold uppercase tracking-wider">通貨</div>
                      <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {guide.currency}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-400 mb-1 font-bold uppercase tracking-wider">言語</div>
                      <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {guide.language}
                      </div>
                    </div>
                    <div>
                      <div className="text-zinc-400 mb-1 font-bold uppercase tracking-wider">治安</div>
                      <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        {guide.safety}
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 text-xs">
                    <div className="text-zinc-400 mb-1 font-bold uppercase tracking-wider">空港アクセス</div>
                    <div className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      {guide.airportAccess}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* FAQ */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  よくある質問
                </h2>
              </div>
              <div className="space-y-3">
                {faqs.map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
                    open={i === 0}
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                      <span>{faq.q}</span>
                      <span className="ml-3 text-zinc-400 transition-transform group-open:rotate-180">▼</span>
                    </summary>
                    <div className="px-5 pb-4 pt-1">
                      <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                        {faq.a}
                      </p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* 右サイド: 関連フライト */}
          <aside className="space-y-6">
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-4 w-4 text-zinc-400" />
                <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  {d.nameJa}行きフライトディール
                </h2>
              </div>
              {relatedFlights.length > 0 ? (
                <div className="space-y-2">
                  {relatedFlights.map((deal) => (
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.id}`}
                      className="block rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-colors hover:border-zinc-200 dark:hover:border-zinc-700"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-[11px] font-mono text-zinc-400">
                            {deal.origin_code} → {deal.destination_code}
                          </div>
                          <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {deal.airline_name}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-heading text-lg text-zinc-900 dark:text-zinc-100">
                            ¥{deal.sale_price.toLocaleString()}
                          </div>
                          <div className="flex items-center justify-end gap-0.5 text-rose-500 text-[10px]">
                            <TrendingDown className="h-2.5 w-2.5" />
                            -{deal.discount_percent}%
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    現在この目的地のセール情報はありません。BEATRIPは新セールを毎日収集しています。
                  </p>
                  <Link
                    href="/"
                    className="mt-3 inline-block text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                  >
                    すべてのディールを見る →
                  </Link>
                </div>
              )}
            </section>

            {/* 人気路線（出発地別）— 内部リンク強化 */}
            {popularRoutes.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="h-4 w-4 text-zinc-400" />
                  <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    {d.nameJa}行きの人気路線
                  </h2>
                </div>
                <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2">
                  <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {popularRoutes.map((r) => {
                      const [o, dCode] = r.split("-");
                      return (
                        <li key={r}>
                          <Link
                            href={`/routes/${r}`}
                            className="flex items-center justify-between px-3 py-2.5 text-xs hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
                          >
                            <span className="font-mono text-zinc-600 dark:text-zinc-300">
                              {o} → {dCode}
                            </span>
                            <ArrowUpRight className="h-3.5 w-3.5 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
