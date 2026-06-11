import type { Metadata } from "next";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import Link from "next/link";
import { Sun, Waves, Sparkles, Coffee, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";
import { getDestinationImage } from "@/lib/deals/destination-images";

// ISR: 21600秒キャッシュ (6時間)
export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = isEn
    ? "Hawaii travel guide — Oahu, Maui, Big Island deals from Japan | BEATRIP"
    : "ハワイ旅行ガイド｜オアフ・マウイ・ハワイ島の予約・比較 | BEATRIP";
  const description = isEn
    ? "Book Hawaii at the lowest fare. From Waikiki on Oahu to the outer islands of Maui, the Big Island, and Kauai — with the best time to visit, what to pack, eSIM tips, and local activities. Compare across BEATRIP's curated Hawaii booking partners."
    : "ハワイ旅行を最安値で予約。オアフ島ワイキキの王道から、マウイ・ハワイ島・カウアイの離島まで、ベストシーズン・必須持ち物・eSIM・現地アクティビティのガイドつき。BEATRIP厳選のハワイ専門予約サイトから比較できます。";
  const path = isEn ? "/en/hawaii" : "/hawaii";
  return {
    title,
    description,
    keywords: isEn
      ? ["Hawaii travel", "Hawaii from Japan", "Oahu", "Waikiki", "Maui", "Big Island", "Hawaii flights", "best time to visit Hawaii"]
      : ["ハワイ 旅行", "ハワイ ツアー", "ハワイ 格安", "オアフ島", "ワイキキ", "マウイ島", "ハワイ島", "ハワイ 航空券", "ハワイ ベストシーズン"],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/hawaii",
        en: "https://beatrip.jp/en/hawaii",
        "x-default": "https://beatrip.jp/hawaii",
      },
    },
  };
}

const ISLANDS: { name: string; tagline: string; spots: string[] }[] = [
  {
    name: "オアフ島",
    tagline: "王道・初心者向け。ワイキキ・ダイヤモンドヘッド・パールハーバー",
    spots: ["ワイキキビーチ", "ダイヤモンドヘッド", "ハナウマ湾", "パールハーバー", "ノースショア"],
  },
  {
    name: "マウイ島",
    tagline: "自然派・リゾート派に。ハレアカラ山・ハナへの道",
    spots: ["ハレアカラ国立公園", "ハナへの道", "カアナパリビーチ", "イアオ渓谷"],
  },
  {
    name: "ハワイ島（ビッグアイランド）",
    tagline: "ハワイ最大の島。活火山・スターゲイジング",
    spots: ["ハワイ火山国立公園", "マウナケア山頂", "コナコーヒー農園", "プナルウ黒砂海岸"],
  },
  {
    name: "カウアイ島",
    tagline: "ガーデンアイランド。ワイメア渓谷・ナパリコースト",
    spots: ["ワイメア渓谷", "ナパリコースト", "ハナレイ湾", "ポイプ海岸"],
  },
];

const SEASONS = [
  { label: "ベストシーズン", months: "4-5月, 9-10月", note: "雨少なめ・観光客が落ち着く・料金も比較的安め" },
  { label: "ハイシーズン", months: "6-8月, 12-1月", note: "夏休み・年末年始で料金は最高値。早期予約必須" },
  { label: "サーフィン", months: "11-3月", note: "ノースショアに大波が訪れる・観戦旅行ならこの時期" },
  { label: "ホエールウォッチング", months: "12-4月", note: "ザトウクジラが繁殖のため来訪・船ツアーが人気" },
];

const ESSENTIALS: { icon: typeof Sun; title: string; body: string }[] = [
  { icon: Sun, title: "日焼け対策", body: "SPF 50+ の日焼け止め必須。サンゴ礁に優しい reef-safe タイプを。サングラスとつば広帽子も忘れずに。" },
  { icon: Waves, title: "水着・マリンウェア", body: "ラッシュガード（長袖）あれば日焼け軽減＆サンゴ保護にも。マリンシューズで足元保護。" },
  { icon: Sparkles, title: "ESTA・パスポート", body: "ESTA (米国電子渡航認証) を出発72時間前までに取得。パスポート残存有効期間も確認。" },
  { icon: Coffee, title: "現地通信", body: "Wi-Fi は無料スポットあるが不安定。eSIM か Wi-Fi レンタルでスマホは確実に使えるように。" },
];

const FAQS = [
  {
    q: "ハワイ旅行のベストシーズンはいつですか？",
    a: "観光に最適なのは4-5月、9-10月の乾季。雨が少なく、観光客が比較的落ち着いていて料金も抑えめです。ハイシーズン（夏休み・年末年始）は料金が大幅に上がるため、早期予約が必須です。ホエールウォッチング目的なら12-4月、サーフィン観戦は11-3月のノースショアがおすすめです。",
  },
  {
    q: "ハワイ旅行の費用相場はどれくらい？",
    a: "東京発5日間で航空券＋ホテルのパッケージツアーで1人¥120,000〜¥250,000が目安です。ハイシーズン（夏・年末年始）は¥300,000を超えることも。航空券単体なら往復¥60,000〜¥150,000、現地ホテルは1泊¥15,000〜¥50,000程度。BEATRIPで最新セール価格を確認できます。",
  },
  {
    q: "オアフ島とマウイ島、初めてならどちら？",
    a: "初めてのハワイならオアフ島（ホノルル）が圧倒的におすすめ。ワイキキビーチ、買い物、レストランの選択肢が豊富で、日本語対応の店も多く、空港から市街までも近いです。マウイ島は自然派・リゾート派向けで、複数島周遊なら2島目として組み合わせるのが定番です。",
  },
  {
    q: "ハワイで日本語は通じますか？",
    a: "ワイキキ周辺の主要レストラン・ショップ・ホテルでは日本語スタッフが常駐していることが多く、観光に必要なやり取りは日本語でほぼ問題ありません。ただしツアー時の細かい案内や緊急時の医療などでは英語ができると安心。BUYMA TRAVELなど現地日本語ガイドツアーの活用も便利です。",
  },
  {
    q: "ESTA は何日前までに取得すべき？",
    a: "ESTA（米国電子渡航認証）は出発72時間前までの取得が推奨されています。申請後は通常数分〜数時間で承認されますが、稀に追加審査で時間がかかる場合があるため、余裕をもって出発1週間前までには取得してください。有効期限は2年または記載のパスポート期限まで。",
  },
];

export default async function HawaiiPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "ハワイ旅行ガイド｜オアフ・マウイ・ハワイ島の予約・比較",
    description:
      "オアフ島ワイキキの王道から離島まで、ハワイ旅行のベストシーズン・必須持ち物・予約サイト比較のガイド。",
    inLanguage: "ja-JP",
    datePublished: "2026-06-01",
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: "BEATRIP", url: "https://beatrip.jp" },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    image: "https://beatrip.jp/opengraph-image",
    mainEntityOfPage: "https://beatrip.jp/hawaii",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const heroImage = getDestinationImage("honolulu");

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
      <section className="relative h-[320px] sm:h-[400px] overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage}
            alt="ハワイ"
            fill
            priority
            sizes="100vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER_DARK}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="relative mx-auto max-w-7xl h-full flex flex-col justify-end px-4 sm:px-6 pb-8">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "ハワイ" },
            ]}
          />
          <div className="mt-4 flex items-center gap-3 mb-2">
            <Sun className="h-7 w-7 text-amber-300" />
            <p className="text-[11px] font-bold tracking-widest uppercase text-amber-200">
              Hawaii Travel Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide text-white uppercase sm:text-5xl lg:text-6xl">
            ハワイ旅行
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/90 max-w-2xl">
            オアフ・マウイ・ハワイ島・カウアイ。航空券・ホテル・現地ツアーまで一括で比較・予約。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* 4島の特徴 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                ハワイ4島の選び方
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                初めてならオアフ、2回目以降は他の島も検討を
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ISLANDS.map((island) => (
                  <div
                    key={island.name}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                      {island.name}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                      {island.tagline}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {island.spots.map((s) => (
                        <span
                          key={s}
                          className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* シーズン情報 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                ハワイのシーズン
              </h2>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {SEASONS.map((s) => (
                    <div key={s.label} className="flex items-start gap-4 px-5 py-3">
                      <div className="w-32 flex-shrink-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {s.label}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-300 font-mono mt-0.5">
                          {s.months}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {s.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 必須持ち物 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                出発前に準備するもの
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ESSENTIALS.map((e) => (
                  <div
                    key={e.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <e.icon className="h-4 w-4 text-amber-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {e.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {e.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                ハワイ旅行のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* おすすめホテル */}
            <CompactHotelsRecommendation
              citySlugs={["honolulu"]}
              title="ハワイのおすすめホテル"
              subtitle="ワイキキの王道リゾートから、家族向けコンドミニアムまで。"
              maxHotels={4}
            />

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/hotels/honolulu"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    ホノルル（ワイキキ）のホテル
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    エリア別の代表的ホテルを比較
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ホノルルのホテル一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/hotels/honolulu/best-season"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    ハワイのベストシーズン詳細
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    月別のおすすめ度と気候
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    月別カレンダーを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー: ハワイ partner */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="ハワイ旅行の予約・比較"
              subtitle="ハワイ特化サイトから航空券・ホテルまで"
              categories={["tour-hawaii", "tour-overseas", "flight-overseas", "hotel-overseas"]}
              destinationCode="HNL"
              source="hawaii-landing"
            />

            <JapanesePartnersPanel
              title="現地で楽しむ"
              subtitle="eSIM・現地ツアー・空港送迎"
              categories={["esim-wifi", "tour-local", "transfer"]}
              destinationCode="HNL"
              source="hawaii-landing"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
