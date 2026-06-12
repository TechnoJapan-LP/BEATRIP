import type { Metadata } from "next";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Smartphone, Wifi, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import {
  HOTEL_DESTINATIONS,
  getHotelDestinationBySlug,
} from "@/data/hotel-destinations";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { getCityPracticalInfo } from "@/data/city-practical-info";

type Props = { params: Promise<{ city: string; lang: string;}> };

// ISR: 21600 秒キャッシュ (6 時間)
export const revalidate = 86400;

/** 海外都市のみ生成 (国内は eSIM 不要のためスキップ) */
export function generateStaticParams() {
  return HOTEL_DESTINATIONS.filter((d) => d.region !== "国内").map((d) => ({
    city: d.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city, lang } = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d || d.region === "国内") return { title: "Not Found" };

  const isEn = lang === "en";
  const title = isEn
    ? `Best eSIM for ${d.nameEn} — stay connected on your trip | BEATRIP`
    : `${d.nameJa}の eSIM 比較・おすすめ｜現地で快適に使える通信ガイド | BEATRIP`;
  const description = isEn
    ? `Compare travel eSIMs for ${d.nameEn}. Plans, supported devices, local network quality, and setup steps — plus how an eSIM stacks up against pocket Wi-Fi.`
    : `${d.nameJa}（${d.nameEn}）旅行で使える eSIM を比較。各社の料金プラン、対応端末、現地通信品質、設定方法まで網羅。Wi-Fi レンタルとの比較も掲載。`;
  const path = isEn ? `/en/hotels/${d.slug}/esim` : `/hotels/${d.slug}/esim`;

  return {
    title,
    description,
    keywords: isEn
      ? [
          `${d.nameEn} eSIM`,
          `${d.nameEn} SIM card`,
          `${d.nameEn} mobile data`,
          `${d.nameEn} WiFi`,
          `best eSIM for ${d.nameEn}`,
        ]
      : [
          `${d.nameJa} eSIM`,
          `${d.nameJa} Wi-Fi`,
          `${d.nameJa} 通信`,
          `${d.nameJa} スマホ`,
          `${d.nameJa} SIM`,
          `${d.nameEn} eSIM`,
        ],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: `https://beatrip.jp/hotels/${d.slug}/esim`,
        en: `https://beatrip.jp/en/hotels/${d.slug}/esim`,
        "x-default": `https://beatrip.jp/hotels/${d.slug}/esim`,
      },
    },
  };
}

const WIFI_DESC: Record<string, string> = {
  excellent: "公共 Wi-Fi が充実しており、カフェやホテル・観光地で安定して使えます。",
  good: "ホテルやカフェなど主要施設で Wi-Fi は使えますが、屋外や移動中は不安定なことも。",
  spotty: "公共 Wi-Fi はまばらで、必要な時に繋がらないことが多い。",
  limited: "公共 Wi-Fi は限定的。プライベートな通信手段を別途確保するのが現実的。",
};

export default async function CityEsimPage({ params }: Props) {
  const { city, lang} = await params;
  const d = getHotelDestinationBySlug(city);
  if (!d || d.region === "国内") notFound();

  const practicalInfo = getCityPracticalInfo(d.slug);
  const wifiState = practicalInfo?.wifi.public ?? "good";
  const esimNeed = practicalInfo?.wifi.esimRecommended ?? true;

  const faqs = [
    {
      q: `${d.nameJa}で eSIM は必要ですか？`,
      a: practicalInfo
        ? `${d.nameJa}の Wi-Fi 事情は${WIFI_DESC[wifiState]}${
            esimNeed
              ? `そのため eSIM の導入を強くおすすめします。`
              : `Wi-Fi が比較的安定しているため必須ではありませんが、移動中や緊急時の連絡を考えると eSIM があると安心です。`
          }`
        : `海外旅行では現地で通信できる手段の確保が重要です。eSIM か Wi-Fi レンタルのどちらかを準備しておくと安心。`,
    },
    {
      q: `eSIM と Wi-Fi レンタル、どちらがいい？`,
      a: "eSIM はスマホに直接インストールでき、機器を持ち歩く必要がなく、料金もリーズナブル。Wi-Fi レンタルは複数台で共有でき、家族・グループ旅行に向いています。1 人旅・短期 = eSIM、グループ・長期 = Wi-Fi レンタル、と覚えると判断しやすいです。",
    },
    {
      q: `eSIM 対応のスマホは？`,
      a: "iPhone XS 以降、Google Pixel 3 以降、Samsung Galaxy S20 以降の最新モデルは eSIM 対応です。出発前に必ず「設定 → モバイル通信 → eSIM 追加」で対応を確認してください。古い機種なら物理 SIM か Wi-Fi レンタルを選択。",
    },
    {
      q: `データ容量はどのくらい必要？`,
      a: "観光メイン（地図 / 翻訳 / SNS）なら 1 日 1GB 程度。動画視聴・テザリングを多用するなら 1 日 2-3GB。日数分の合計データ量プランか、無制限プランから選択。",
    },
    {
      q: `eSIM の設定はかんたん？`,
      a: "購入後、QR コードをスマホでスキャン → モバイル通信プランに追加 → 出発時にプランを「主回線」に切替、で利用開始。トリファのようなアプリ完結型なら QR コード不要で更にかんたん。日本出発前に設定だけ済ませておくと安心です。",
    },
  ];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${d.nameJa}の eSIM 比較・おすすめ`,
    description: `${d.nameJa}旅行で使える eSIM の比較ガイド`,
    inLanguage: "ja-JP",
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
    },
    mainEntityOfPage: `https://beatrip.jp/hotels/${d.slug}/esim`,
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
        <div className="absolute inset-0 bg-gradient-to-t from-violet-950/90 via-violet-900/60 to-violet-700/30" />
        <div className="relative mx-auto max-w-7xl h-full flex flex-col justify-end px-4 sm:px-6 pb-6">
          <Breadcrumbs
            variant="dark"
            currentPath={lang === "en" ? `/en/hotels/${d.slug}/esim` : `/hotels/${d.slug}/esim`}
            items={[
              { label: "Home", href: "/" },
              { label: "ホテル", href: "/hotels" },
              { label: d.nameJa, href: `/hotels/${d.slug}` },
              { label: "eSIM 比較" },
            ]}
          />
          <div className="mt-3 flex items-center gap-2 mb-2">
            <Smartphone className="h-5 w-5 text-violet-200" />
            <p className="text-[11px] font-bold tracking-widest uppercase text-violet-200">
              {d.nameEn} eSIM Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide text-white uppercase sm:text-5xl">
            {d.nameJa}の eSIM 比較
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-white/80 max-w-2xl">
            現地で快適に使える通信を、出発前に確保
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-8">
            {/* 通信事情 */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-2xl">
                {d.nameJa}の通信事情
              </h2>
              <div
                className={`rounded-xl border p-5 ${
                  esimNeed
                    ? "border-rose-200 bg-rose-50/40 dark:border-rose-900 dark:bg-rose-950/30"
                    : "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/30"
                }`}
              >
                <div className="flex items-start gap-3">
                  {esimNeed ? (
                    <AlertCircle className="h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {esimNeed ? "eSIM 導入を推奨" : "Wi-Fi 環境は比較的良好"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                      {WIFI_DESC[wifiState]}
                      {practicalInfo &&
                        ` 公用語は${practicalInfo.language.primary}で、英語通用度は「${
                          practicalInfo.language.englishOk === "high"
                            ? "高"
                            : practicalInfo.language.englishOk === "medium"
                              ? "中"
                              : "低"
                        }」。`}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 選び方 */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-2xl">
                eSIM の選び方
              </h2>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  <div className="flex items-start gap-3 px-5 py-3">
                    <div className="w-28 flex-shrink-0 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      データ量
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      観光メインなら 1 日 1GB / 動画やテザリング多用なら 1 日 2-3GB / 無制限プランも選択肢
                    </p>
                  </div>
                  <div className="flex items-start gap-3 px-5 py-3">
                    <div className="w-28 flex-shrink-0 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      期間
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      短期(3-7 日) / 長期(1 ヶ月) でプラン選択。日数 + 余裕日を計算
                    </p>
                  </div>
                  <div className="flex items-start gap-3 px-5 py-3">
                    <div className="w-28 flex-shrink-0 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      対応端末
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      iPhone XS 以降 / Pixel 3 以降 / Galaxy S20 以降が eSIM 対応。事前に設定 → モバイル通信で確認
                    </p>
                  </div>
                  <div className="flex items-start gap-3 px-5 py-3">
                    <div className="w-28 flex-shrink-0 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                      アプリ完結
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300">
                      トリファのようなアプリ完結型は QR コード不要・かんたん。初心者向け
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* eSIM vs Wi-Fi */}
            <section>
              <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-2xl">
                eSIM vs Wi-Fi レンタル
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Smartphone className="h-4 w-4 text-violet-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      eSIM がおすすめ
                    </h3>
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    <li>• 1 人旅・カップル旅行</li>
                    <li>• 短期(1 週間以内)〜中期</li>
                    <li>• 機器を持ち歩きたくない</li>
                    <li>• 設定に多少慣れている</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Wifi className="h-4 w-4 text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Wi-Fi レンタルがおすすめ
                    </h3>
                  </div>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    <li>• 家族・グループ旅行(複数台共有)</li>
                    <li>• 長期(2 週間以上)</li>
                    <li>• 設定が苦手・機器のみで済ませたい</li>
                    <li>• 古い機種(eSIM 非対応)</li>
                  </ul>
                </div>
              </div>
            </section>

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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link
                  href={`/hotels/${d.slug}`}
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    {d.nameJa}のホテル
                  </h3>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    一覧へ <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href={`/hotels/${d.slug}/activities`}
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    現地ツアー
                  </h3>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    詳細へ <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href={`/hotels/${d.slug}/best-season`}
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    ベストシーズン
                  </h3>
                  <div className="mt-2 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    詳細へ <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="eSIM を比較・予約"
              subtitle="複数の eSIM サービスから選ぶ"
              categories={["esim-wifi"]}
              destinationCode={d.iataCodes[0]}
              source="city-esim"
            />

            <JapanesePartnersPanel
              title="渡航準備の他のサービス"
              subtitle="保険・送迎・現地ツアー"
              categories={["insurance", "transfer", "tour-local"]}
              destinationCode={d.iataCodes[0]}
              source="city-esim"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
