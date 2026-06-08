import type { Metadata } from "next";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import Link from "next/link";
import { ArrowRight, BedDouble } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { getHotelDestinationsByRegion } from "@/data/hotel-destinations";

// ISR: 21600秒キャッシュ (6時間)
export const revalidate = 21600;

export const metadata: Metadata = {
  title: "ホテル予約・最安値検索｜目的地別の宿泊情報 | BEATRIP",
  description: "東京・大阪・バンコク・ソウル・ホノルル等、人気目的地のホテルを最安値で検索。エリア別の特徴・相場・ベストシーズンも掲載。フライトとあわせて予約準備に。",
  alternates: {
    canonical: "https://beatrip.jp/hotels",
    languages: {
      ja: "https://beatrip.jp/hotels",
      en: "https://beatrip.jp/en/hotels",
      "x-default": "https://beatrip.jp/hotels",
    },
  },
};

export default async function HotelsIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const regions = getHotelDestinationsByRegion();
  // ItemList 化のため、地域フラット化した全目的地リストを作る
  const allDestinations = regions.flatMap((r) => r.items);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "ホテル予約・目的地別の宿泊情報",
    description: "人気目的地のホテルを最安値で検索",
    url: "https://beatrip.jp/hotels",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: allDestinations.length,
      itemListElement: allDestinations.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://beatrip.jp/hotels/${d.slug}`,
        name: d.nameJa,
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
      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "ホテル" }]}
          />
        </div>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-heading text-3xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-4xl">
                Hotels
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                目的地別にホテルを最安値で検索
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-3xl">
            人気の旅行先を地域別にまとめました。各都市のページでは、エリア別の特徴・相場目安・ベストシーズン、そしてその都市行きの最新フライトディールも合わせて確認できます。
          </p>
        </section>

        {regions.map(({ region, items }) => (
          <section key={region} className="mb-12">
            <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-2xl">
              {region}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((d) => (
                <Link
                  key={d.slug}
                  href={`/hotels/${d.slug}`}
                  className="group block overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 transition-all hover:shadow-xl hover:ring-zinc-200 dark:hover:ring-zinc-700"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    {d.image && (
                      <Image
                        src={d.image}
                        alt={d.nameJa}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER_DARK}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="font-heading text-[18px] leading-none tracking-wide text-white uppercase sm:text-[22px]">
                        {d.nameJa}
                      </h3>
                      <p className="mt-1 text-[10px] text-white/80 sm:text-xs">
                        {d.tagline}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 sm:px-4">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {d.priceFromJpy
                        ? `1泊 ¥${d.priceFromJpy.toLocaleString()}〜`
                        : "ホテルを見る"}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-300 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
