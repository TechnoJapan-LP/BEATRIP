import type { Metadata } from "next";
import Link from "next/link";
import { Award, ArrowRight, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { OG_IMAGES } from "@/lib/seo/og";
import { getActiveDeals } from "@/lib/deals/deal-service";
import {
  getMileCards,
  getMileDestinations,
  getMilePrograms,
  getMilesDataVerifiedAt,
} from "@/lib/miles/data";
import { awardRequirementFor } from "@/lib/miles/simulator";
import { getAspPartner, getAspPartnerUrl } from "@/lib/affiliate/asp-partners";
import {
  MileSimulator,
  type SimCard,
  type SimDestination,
} from "@/components/miles/mile-simulator";

// ISR 30分: セール最安値の鮮度と CDN キャッシュのバランス (deals 一覧と同等)
export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = isEn
    ? "Miles vs cash simulator — compare award tickets with live sale fares"
    : "マイル獲得シミュレーター｜特典航空券と現金セール最安値を比較";
  const description = isEn
    ? "Compare ANA / JAL award ticket requirements with the cheapest observed sale fares on BEATRIP, and estimate how long it takes to earn the miles with travel credit cards. All award charts and card specs are transcribed from official pages with verification dates."
    : "ANA・JALの特典航空券に必要なマイル数と、BEATRIPが観測中のセール最安値を並べて比較。月々のカード決済額からマイルが貯まるまでの期間も試算できます。必要マイル数・カード情報はすべて公式サイトの表示を確認日つきで転記しています。";
  const path = isEn ? "/en/miles" : "/miles";
  return {
    title,
    description,
    keywords: isEn
      ? ["ANA miles", "JAL miles", "award ticket", "miles simulator", "priority pass"]
      : [
          "マイル シミュレーター",
          "特典航空券 必要マイル",
          "ANA マイル 貯め方",
          "JAL マイル 貯め方",
          "マイル クレジットカード",
          "プライオリティ・パス カード",
          "マイル 現金 どっち",
        ],
    openGraph: { images: OG_IMAGES, title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/miles",
        "x-default": "https://beatrip.jp/miles",
      },
    },
  };
}

const FAQ = [
  {
    q: "必要マイル数はどこから取得したデータですか？",
    a: "ANA・JAL公式サイトの必要マイルチャートをBEATRIP編集部が確認して転記したものです。各カードの数値にも確認日と出典リンクを併記しています。改定される場合があるため、予約前に必ず公式サイトの現行チャートをご確認ください。",
  },
  {
    q: "「約◯ヶ月で貯まる」はどう計算していますか？",
    a: "入力した月間決済額をカードの公表還元率で割った推計です。ボーナスマイルや入会キャンペーン、決済先による還元率の違いは含みません。実際の獲得ペースは利用状況で変わります。",
  },
  {
    q: "マイルと現金セールはどちらが得ですか？",
    a: "一般に長距離路線・ビジネスクラスほどマイルの価値が出やすく、近距離はセール運賃が安いことが多いです。特典航空券でも燃油サーチャージ・諸税は現金で必要な点を含めて比較してください。",
  },
  {
    q: "掲載カードの選定基準は？",
    a: "マイル獲得効率・年会費・ラウンジ条件で選定・並び替えており、アフィリエイト提携の有無は順位に影響させていません。提携リンクには PR 表記を付けています。",
  },
];

export default async function MilesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const lh = (p: string) => (lang === "en" ? `/en${p}` : p);

  const programs = getMilePrograms();
  const destinations = getMileDestinations();
  const cards = getMileCards();
  const verifiedAt = getMilesDataVerifiedAt();
  const deals = await getActiveDeals();

  const items: SimDestination[] = destinations.map((destination) => {
    const codes = new Set(destination.destinationCodes);
    // 観測中ディールから当該目的地の最安 (総額) を引く。無ければ null のまま
    const candidates = deals.filter((d) => codes.has(d.destination_code));
    const cheapest = candidates.length
      ? candidates.reduce((min, d) =>
          (d.total_cost || d.sale_price) < (min.total_cost || min.sale_price) ? d : min
        )
      : null;
    return {
      destination,
      awards: programs
        .map((p) => awardRequirementFor(destination, p))
        .filter((a): a is NonNullable<typeof a> => a !== null),
      cheapestDeal: cheapest
        ? {
            id: cheapest.id,
            airlineName: cheapest.airline_name,
            totalCost: cheapest.total_cost || cheapest.sale_price,
            departureDate: cheapest.departure_date,
            returnDate: cheapest.return_date,
          }
        : null,
    };
  });

  // 提携リンクはサーバーで解決 (env 未設定 → null → 公式リンクにフォールバック)
  const simCards: SimCard[] = cards.map((card) => {
    const partner = card.affiliatePartnerId
      ? getAspPartner(card.affiliatePartnerId)
      : undefined;
    return {
      ...card,
      affiliateUrl: partner ? getAspPartnerUrl(partner) : null,
    };
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex items-center gap-2 text-xs font-medium text-white/80 mb-4">
            <Award className="h-4 w-4" />
            MILES SIMULATOR
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl">
            マイルで行く？ セールで買う？
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            ANA・JALの特典航空券に必要なマイル数と、いま観測中のセール最安値を並べて比較。
            月々のカード決済でいつ貯まるかも試算できます。必要マイル数・カード情報は
            すべて公式サイトの表示を確認して掲載しています ({verifiedAt}時点)。
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6"
      >
        <Breadcrumbs
          items={[
            { label: "ホーム", href: lh("/") },
            { label: "マイル獲得シミュレーター" },
          ]}
        />

        <div className="mt-6">
          <MileSimulator items={items} cards={simCards} verifiedAt={verifiedAt} />
        </div>

        {/* データの出所と免責 */}
        <section className="mt-12 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed space-y-2">
            <p>
              本ページの必要マイル数は ANA・JAL 公式サイトの必要マイルチャート、
              カード情報は各カード公式サイトの表示を BEATRIP 編集部が確認して転記したものです
              (最終確認日 {verifiedAt}。各数値の出典リンクを画面内に併記)。
              マイルチャート・年会費・特典は改定されることがあります。
              お申し込み・ご予約の前に必ず公式サイトの現行情報をご確認ください。
            </p>
            <p>
              「貯まるまでの期間」は入力された前提にもとづく推計であり、実際の獲得マイルを保証するものではありません。
              本ページのリンクの一部はアフィリエイト広告 (PR表記) を含みますが、
              カードの並び順・推奨は提携の有無と無関係に決めています。
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
            よくある質問
          </h2>
          <FAQAccordion items={FAQ} />
        </section>

        <section className="mt-12 flex flex-wrap gap-4">
          <Link
            href={lh("/deals")}
            className="flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            開催中のセール一覧
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={lh("/articles/guides/miles-complete-guide")}
            className="flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            マイル完全ガイドを読む
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={lh("/credit-cards")}
            className="flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            旅行クレカ比較を見る
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
