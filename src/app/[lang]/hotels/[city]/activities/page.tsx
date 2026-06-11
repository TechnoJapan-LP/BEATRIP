import type { Metadata } from "next";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Sparkles, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import {
  HOTEL_DESTINATIONS,
  getHotelDestinationBySlug,
} from "@/data/hotel-destinations";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { getCityGuide } from "@/data/hotel-city-guides";
import { getCityPracticalInfo } from "@/data/city-practical-info";
import type { AspCategory } from "@/lib/affiliate/asp-partners";

type Props = { params: Promise<{ city: string; lang: string;}> };

// ISR: 21600 秒キャッシュ (6 時間)
export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, lang } = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d) return { title: "Not Found" };

  const isEn = lang === "en";
  const title = isEn
    ? `Tours and activities in ${d.nameEn} — book the best things to do | BEATRIP`
    : `${d.nameJa}の現地ツアー・アクティビティ予約｜日本語ガイド対応 | BEATRIP`;
  const description = isEn
    ? `Compare and book tours and activities in ${d.nameEn}. Popular sightseeing tours, day trips, and experiences — plus what to do during ${d.bestSeason}.`
    : `${d.nameJa}（${d.nameEn}）の現地ツアー・観光アクティビティを比較・予約。日本語ガイド対応のツアーや、人気のオプショナルツアーが探せます。${d.bestSeason}の最新ツアー情報も掲載。`;
  const path = isEn ? `/en/hotels/${d.slug}/activities` : `/hotels/${d.slug}/activities`;

  return {
    title,
    description,
    keywords: isEn
      ? [
          `${d.nameEn} tours`,
          `things to do in ${d.nameEn}`,
          `${d.nameEn} activities`,
          `${d.nameEn} sightseeing`,
          `${d.nameEn} day tours`,
        ]
      : [
          `${d.nameJa} ツアー`,
          `${d.nameJa} オプショナルツアー`,
          `${d.nameJa} アクティビティ`,
          `${d.nameJa} 観光`,
          `${d.nameJa} 現地ツアー`,
          `${d.nameEn} tours`,
        ],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: `https://beatrip.jp/hotels/${d.slug}/activities`,
        en: `https://beatrip.jp/en/hotels/${d.slug}/activities`,
        "x-default": `https://beatrip.jp/hotels/${d.slug}/activities`,
      },
    },
  };
}

export function generateStaticParams() {
  return HOTEL_DESTINATIONS.map((d) => ({ city: d.slug }));
}

export default async function CityActivitiesPage({ params }: Props) {
  const { city, lang} = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d) notFound();

  const guide = getCityGuide(d.slug);
  const practicalInfo = getCityPracticalInfo(d.slug);
  const isDomestic = d.region === "国内";

  const aspCategories: AspCategory[] = isDomestic
    ? [
        "activity-domestic",
        ...(d.slug === "okinawa" ? (["tour-okinawa"] as AspCategory[]) : []),
        "tour-package",
      ]
    : [
        "tour-local",
        "tour-overseas",
        ...(d.slug === "honolulu" ? (["tour-hawaii"] as AspCategory[]) : []),
      ];

  const faqs = [
    {
      q: `${d.nameJa}でおすすめのアクティビティは？`,
      a: guide && guide.attractions.length > 0
        ? `${d.nameJa}の代表的な観光スポットは ${guide.attractions
            .slice(0, 4)
            .map((a) => `「${a}」`)
            .join("、")} など。これらを巡る現地ツアーが多数あり、BEATRIPの提携サイトから比較・予約できます。`
        : `${d.nameJa}には観光名所が多数あり、現地ツアーで効率良く回れます。本ページのツアー予約サイトから比較してください。`,
    },
    ...(isDomestic
      ? []
      : [
          {
            q: `${d.nameJa}のツアーは日本語ガイド対応？`,
            a: `BUYMA TRAVEL では現地在住の日本語ガイドが案内するプライベートツアーを提供しています。${
              practicalInfo?.language.englishOk === "low"
                ? `${d.nameJa}は英語通用度が低めなので、日本語ガイドツアーが特に便利です。`
                : "KKday などの英語ツアーと組み合わせて使うのもおすすめです。"
            }`,
          },
        ]),
    {
      q: `${d.nameJa}のツアー予約はいつまでに？`,
      a: `人気のツアー（特に午前出発・少人数制・日本語ガイド付き）は1〜2週間前には埋まることが多いです。日本出発前に確定予約するのが安心。当日参加可能なツアーもありますが、希望の時間を選びたいなら早めの予約を。`,
    },
    {
      q: `${d.nameJa}でツアーに参加する服装は？`,
      a: practicalInfo?.packingTips.length
        ? `${practicalInfo.packingTips.slice(0, 2).join("、")} などを意識した動きやすい服装で。アウトドアアクティビティの場合は天候対策も忘れずに。`
        : "動きやすい服装と、季節に合わせた防寒・防暑対策を。雨具やサングラスもあると安心。",
    },
    {
      q: `現地での支払いはどうすれば？`,
      a: practicalInfo
        ? `${d.nameJa}の通貨は${practicalInfo.currency.code}（${practicalInfo.currency.symbol}）。${
            practicalInfo.tipping === "expected"
              ? "ツアーガイドへのチップが期待されるため、小額紙幣を用意しておくと便利です。"
              : practicalInfo.tipping === "appreciated"
                ? "チップは必須ではありませんが、サービスが良ければ感謝の気持ちとして渡すと喜ばれます。"
                : "チップ文化はないので料金通りで OK。"
          }`
        : "現地通貨またはクレジットカード。一部のツアーは事前決済が必要です。",
    },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${d.nameJa}の現地ツアー・アクティビティ予約`,
    description: `${d.nameJa}の現地ツアー・観光アクティビティを比較・予約する完全ガイド`,
    inLanguage: "ja-JP",
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
    },
    mainEntityOfPage: `https://beatrip.jp/hotels/${d.slug}/activities`,
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />

      {/* Hero */}
      <section className="relative h-[240px] sm:h-[300px] overflow-hidden">
        {d.image && (
          <Image
            src={d.image}
            alt={d.nameJa}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER_DARK}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="relative mx-auto max-w-7xl h-full flex flex-col justify-end px-4 sm:px-6 pb-6">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "ホテル", href: "/hotels" },
              { label: d.nameJa, href: `/hotels/${d.slug}` },
              { label: "現地ツアー" },
            ]}
          />
          <div className="mt-3 flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-amber-300" />
            <p className="text-[11px] font-bold tracking-widest uppercase text-amber-200">
              {d.nameEn} Activities
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide text-white uppercase sm:text-5xl">
            {d.nameJa}の現地ツアー
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-2xl">
            日本語ガイド対応から英語ツアーまで、現地で楽しむ選択肢を比較
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* 観光スポット */}
            {guide && guide.attractions.length > 0 && (
              <section>
                <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-2xl">
                  人気のツアーで巡るスポット
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {guide.attractions.map((a) => (
                    <div
                      key={a}
                      className="flex items-start gap-2 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300"
                    >
                      <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-zinc-400" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-2xl">
                よくある質問
              </h2>
              <FAQAccordion items={faqs} />
            </section>

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-2xl">
                {d.nameJa}の関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={`/hotels/${d.slug}`}
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    {d.nameJa}のホテル
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    エリア別の代表的ホテルを比較
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    一覧へ
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href={`/hotels/${d.slug}/best-season`}
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    {d.nameJa}のベストシーズン
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    月別おすすめ度カレンダー
                  </p>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    詳細へ
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                {!isDomestic && (
                  <Link
                    href={`/hotels/${d.slug}/esim`}
                    className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                  >
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                      {d.nameJa}の eSIM 比較
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      現地通信を快適に
                    </p>
                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                      おすすめ eSIM
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </Link>
                )}
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title={`${d.nameJa}のツアー予約`}
              subtitle="日本語ガイドから英語ツアーまで比較"
              categories={aspCategories}
              destinationCode={d.iataCodes[0]}
              source="city-activities"
            />

            {/* 海外なら eSIM 補助 */}
            {!isDomestic && (
              <JapanesePartnersPanel
                title="現地で必要なもの"
                subtitle="通信・移動・保険"
                categories={["esim-wifi", "transfer", "insurance"]}
                destinationCode={d.iataCodes[0]}
                source="city-activities"
              />
            )}
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
