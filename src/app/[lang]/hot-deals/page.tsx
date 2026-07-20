import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Radar, Bell, ShieldCheck, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { HotDealsSection } from "@/components/deals/hot-deals-section";
import { HOT_DEAL_CRITERIA } from "@/lib/deals/hot-deals";
import { NewsletterCTASlim } from "@/components/newsletter/newsletter-cta-slim";
import { PrNotice } from "@/components/compliance/pr-notice";
import { OG_IMAGES } from "@/lib/seo/og";

/**
 * /hot-deals — エラーフェア/価格急落の SEO ランディング
 *
 * 狙うクエリ: 「エラーフェア」「エラー運賃」「航空券 急に安い」「航空券 掘り出し物」
 * 「ビジネスクラス 格安 なぜ」等。ライブの検出リスト + 常緑の解説 + FAQ で、
 * 検出0件のタイミングでも空ページにならない構成にする。
 */

// 超お買い得の鮮度に合わせ 1h
// 15分。「急落運賃は数時間で消える」ことを売りにするページなので、1時間
// キャッシュでは検出・売り切れ・予約リンク更新が最大1時間遅れて届き、
// ページの主張と実体が食い違う。CDN キャッシュが効いているので負荷は問題ない。
export const revalidate = 900;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = isEn
    ? "Error fares & sudden price-drop alerts from Japan"
    : "航空券のエラーフェア・価格急落を自動検出｜超お買い得速報";
  const description = isEn
    ? `BEATRIP monitors airfares from Japan every ${HOT_DEAL_CRITERIA.scanIntervalHours} hours and flags sudden price drops — error-fare-class deals on economy and business class. Sold-out fares stay visible so you know what you missed.`
    : `「航空券が急に安くなる」エラーフェア・フラッシュセール級の価格急落を${HOT_DEAL_CRITERIA.scanIntervalHours}時間ごとに自動検出。エコノミーだけでなくビジネスクラスの急落もウォッチ。消えた運賃は売り切れ表示で残るので、次を逃さない準備ができます。`;
  const path = isEn ? "/en/hot-deals" : "/hot-deals";
  return {
    title,
    description,
    keywords: isEn
      ? ["error fare", "flight price drop", "cheap business class", "flight deal alert Japan"]
      : [
          "エラーフェア",
          "エラー運賃",
          "航空券 急に安い",
          "航空券 価格 急落",
          "ビジネスクラス 格安",
          "航空券 掘り出し物",
          "フラッシュセール 航空券",
        ],
    openGraph: { images: OG_IMAGES, title, description },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/hot-deals",
        "x-default": "https://beatrip.jp/hot-deals",
      },
    },
  };
}

const FAQS = [
  {
    q: "エラーフェア（エラー運賃）とは何ですか？",
    a: "航空会社の運賃設定ミスやシステム連携の不具合、燃油・為替の反映漏れなどで、本来より大幅に安い価格が一時的に販売される運賃の通称です。数時間〜数日で修正されることが多く、見つけたら早めの判断が重要です。BEATRIPでは断定を避け、「直前の観測から急落した運賃」を機械的に検出して掲載しています。",
  },
  {
    q: "どうやって検出しているのですか？",
    a: `日本発の主要路線の最安運賃を${HOT_DEAL_CRITERIA.scanIntervalHours}時間ごとに観測し、直前の観測価格から${HOT_DEAL_CRITERIA.label}下落した運賃を「超お買い得」として自動検出しています。エコノミーに加え、羽田・成田・関西発 国際線のビジネスクラスも監視対象です。`,
  },
  {
    q: "掲載価格で必ず予約できますか？",
    a: "いいえ。掲載しているのは観測時点の最安運賃の目安で、空席状況や販売終了により予約サイトでは異なる価格になる場合があります。特に急落運賃は消えるのが速いため、リンク先の予約サイトで最新の価格・空席をご確認ください。",
  },
  {
    q: "「売り切れ」と表示されるのはなぜですか？",
    a: "検出した価格が元の水準に戻った、または観測できなくなった運賃です。急落運賃がどれほど短命かを知っていただくため、消滅後も一定期間「売り切れ」として表示しています。次の検出を逃したくない方は、Xのフォローやニュースレターの登録がおすすめです。",
  },
  {
    q: "ビジネスクラスのエラーフェアもありますか？",
    a: "あります。ビジネスクラスは元の価格が高いぶん、設定ミスや在庫調整による下落幅が大きく、過去には往復エコノミー並みの価格が出た例も知られています。BEATRIPでは羽田・成田・関西発 国際線のビジネスクラス最安値を専用にウォッチしています。",
  },
];

export default async function HotDealsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
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
      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6"
      >
        <div className="mb-6">
          <Breadcrumbs
            currentPath="/hot-deals"
            items={[
              { label: "Home", href: "/" },
              { label: "超お買い得速報" },
            ]}
          />
        </div>

        <section className="mb-8">
          <div className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-rose-500" />
            <h1 className="font-heading text-3xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-4xl">
              超お買い得速報
            </h1>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            「航空券が急に安くなっている」——エラーフェアやフラッシュセール級の
            <strong className="text-zinc-700 dark:text-zinc-200">価格急落を{HOT_DEAL_CRITERIA.scanIntervalHours}時間ごとに自動検出</strong>
            して掲載します。エコノミーに加え、羽田・成田・関西発のビジネスクラスも監視対象。
            急落運賃は数時間で消えることもあるため、見つけたら早めのチェックがおすすめです。
          </p>
          <PrNotice className="mt-3" />
        </section>

        {/* ライブの検出リスト (0件でも空状態を表示) */}
        <section aria-label="検出中の超お買い得" className="mb-12">
          <HotDealsSection variant="page" />
        </section>

        {/* 速報登録 — 急落は消えるのが速いのでプッシュ型が本命 */}
        <div className="mb-12">
          <NewsletterCTASlim source="hot_deals" />
        </div>

        {/* 仕組み (常緑コンテンツ — 検出0件でもページが薄くならない) */}
        <section className="mb-12">
          <h2 className="mb-4 font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl">
            検出の仕組み
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <Radar className="mb-2 h-5 w-5 text-rose-500" />
              <h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                1. {HOT_DEAL_CRITERIA.scanIntervalHours}時間ごとに価格を観測
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                日本の主要7空港発の最安運賃と、羽田・成田・関西発 国際線ビジネスクラスの最安値を継続的に記録します。
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <Zap className="mb-2 h-5 w-5 text-rose-500" />
              <h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                2. 急落だけを抽出
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                直前の観測から{HOT_DEAL_CRITERIA.label}下がった運賃だけを「超お買い得」として検出。通常のセール情報とは別軸の掘り出し物です。
              </p>
            </div>
            <div className="rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
              <Bell className="mb-2 h-5 w-5 text-rose-500" />
              <h3 className="mb-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                3. 即速報・消えたら売り切れ表示
              </h3>
              <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                検出と同時に X・Bluesky へ自動速報。価格が戻った運賃は「売り切れ」として残すので、急落の短命さと相場感がつかめます。
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-zinc-50 p-3 text-[11px] leading-relaxed text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
            <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-zinc-400" />
            <p>
              掲載価格は観測時点の最安運賃の目安であり、予約可能性を保証するものではありません。
              「エラーフェア」であるかの断定は行わず、価格変動の事実のみを掲載しています。
              実際の価格・空席は各予約サイトでご確認ください。
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl">
            よくある質問
          </h2>
          <FAQAccordion items={FAQS} />
        </section>

        {/* 回遊: セール情報本体へ */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/deals"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            開催中のセール・ディール一覧
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sale-calendar"
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white px-5 py-2.5 text-sm font-bold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            各社の次回セール予測を見る
          </Link>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
