import type { Metadata } from "next";
import Link from "next/link";
import { Anchor, Calendar, Globe2, Sparkles, MapPin, ArrowRight, ArrowUpRight } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";

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
    ? "Cruise travel guide — compare cruises from Japan and worldwide | BEATRIP"
    : "クルーズ旅行・船旅の予約ガイド｜国内・海外発着の比較 | BEATRIP";
  const description = isEn
    ? "Compare and book cruises departing from Japan and around the world. Pacific cruises out of Yokohama and Kobe, plus the Mediterranean, Caribbean, Alaska and other classic routes — choose by trip length and find first-timer tips. Search through BEATRIP's curated cruise booking partners."
    : "国内・海外発着のクルーズ旅行を比較・予約。日本発着の太平洋クルーズ、地中海・カリブ海・アラスカなど世界の主要航路、所要日数別の選び方、初心者向けのポイントまで網羅。BEATRIP厳選のクルーズ予約サイトから検索できます。";
  const path = isEn ? "/en/cruise" : "/cruise";
  return {
    title,
    description,
    keywords: isEn
      ? ["cruise from Japan", "Mediterranean cruise", "Caribbean cruise", "Alaska cruise", "Pacific cruise", "cruise comparison", "cruise booking"]
      : ["クルーズ旅行", "クルーズ 比較", "船旅", "日本発着 クルーズ", "地中海クルーズ", "カリブ海クルーズ", "クルーズ 予約", "クルーズ 安い"],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/cruise",
        en: "https://beatrip.jp/en/cruise",
        "x-default": "https://beatrip.jp/cruise",
      },
    },
  };
}

const ROUTES: { area: string; emoji: string; highlight: string; duration: string }[] = [
  { area: "日本発着 太平洋", emoji: "🗾", highlight: "横浜・神戸発着で気軽に乗船、世界的客船の寄港も多数", duration: "3〜10日" },
  { area: "地中海クルーズ", emoji: "🇮🇹", highlight: "イタリア・スペイン・ギリシャの古都を巡る", duration: "7〜14日" },
  { area: "カリブ海クルーズ", emoji: "🏝️", highlight: "ビーチアイランドホッピング・年間通じて温暖", duration: "7〜10日" },
  { area: "アラスカクルーズ", emoji: "🐋", highlight: "氷河・野生動物・大自然・夏季限定の絶景航路", duration: "7〜14日" },
  { area: "北欧フィヨルド", emoji: "🇳🇴", highlight: "ノルウェーの世界遺産フィヨルド・白夜の絶景", duration: "7〜12日" },
  { area: "アジア周遊", emoji: "🌏", highlight: "シンガポール・タイ・ベトナム・短期から長期まで多彩", duration: "5〜14日" },
];

const TIPS: { icon: typeof Anchor; title: string; body: string }[] = [
  { icon: Calendar, title: "予約タイミング", body: "出発6〜12ヶ月前の早期予約割引が最もお得。出発1〜2ヶ月前の直前セールでも掘り出し物が出ます。" },
  { icon: Globe2, title: "客船と航路の選び方", body: "短期初心者向けは日本発着3〜5日、本格派は地中海・カリブ海7日以上。客船規模で雰囲気が変わるためレビュー必読。" },
  { icon: Sparkles, title: "船内料金の確認", body: "基本料金にチップ・寄港地観光・アルコールが含まれるかは要確認。全部込みの「オールインクルーシブ」プランが安心。" },
  { icon: MapPin, title: "寄港地観光", body: "船会社主催ツアー vs 個人手配で大きく差が出る。事前にKKdayやBUYMA TRAVELで現地ツアーを予約しておくとお得。" },
];

const FAQS = [
  {
    q: "クルーズ旅行は初心者でも大丈夫ですか？",
    a: "日本発着の3〜5日の短期クルーズが初心者には最適です。横浜・神戸発着で寄港地が日本国内中心なら言葉の心配もなく、客船内の生活に慣れることができます。船酔いが心配な方は大型客船を選ぶと揺れが少なくおすすめです。",
  },
  {
    q: "クルーズ旅行の費用相場はどのくらいですか？",
    a: "日本発着3〜5日で1人¥80,000〜¥250,000、地中海7日で¥250,000〜¥500,000、世界一周クルーズになると¥3,000,000〜が目安です。早期予約割引や直前割引で大幅に下がることもあります。BEATRIP厳選のクルーズ予約サイトで最新料金をご確認ください。",
  },
  {
    q: "クルーズの予約に最適な時期は？",
    a: "出発の6〜12ヶ月前の早期予約割引が最もお得です。逆に出発1〜2ヶ月前の「直前セール」でも安く取れる場合があります。地中海・アラスカは夏季が人気でハイシーズン料金になるため、価格重視ならオフシーズン（春秋）も検討余地ありです。",
  },
  {
    q: "クルーズ料金にはどこまで含まれていますか？",
    a: "一般的に船室・3食・船内エンタメ・港湾税は含まれます。チップ・寄港地観光・アルコール・スパ・有料レストランは別料金のことが多いです。「オールインクルーシブ」プランなら大半が込みで安心。予約時に必ず内訳を確認しましょう。",
  },
  {
    q: "船酔いが心配です。対策は？",
    a: "大型客船（10万トン超）は安定性が高く揺れが少ないです。船室は船の中央・低層階を選ぶと揺れを感じにくくなります。事前に酔い止め薬を準備し、初日は無理せず横になるのも有効。最新の大型客船は揺れ対策の装備も充実しています。",
  },
];

export default async function CruisePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "クルーズ旅行・船旅の予約ガイド｜国内・海外発着の比較",
    description:
      "日本発着から世界一周まで、クルーズ旅行の予約サイト比較・選び方・費用相場のガイド。",
    inLanguage: "ja-JP",
    datePublished: "2026-06-01",
    dateModified: new Date().toISOString().split("T")[0],
    author: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
    },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: {
        "@type": "ImageObject",
        url: "https://beatrip.jp/logo.png",
      },
    },
    image: "https://beatrip.jp/opengraph-image",
    mainEntityOfPage: "https://beatrip.jp/cruise",
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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "クルーズ" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Anchor className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Cruise Travel
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            クルーズ旅行・船旅
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            日本発着の太平洋から地中海・カリブ海・アラスカまで、世界の主要航路を網羅。
            BEATRIP厳選のクルーズ予約サイトから比較・予約できます。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* 主要航路 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                主要なクルーズ航路
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                初心者向けの日本発着から、世界の人気航路まで
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ROUTES.map((r) => (
                  <div
                    key={r.area}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">{r.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {r.area}
                        </h3>
                        <p className="text-xs text-zinc-500 mt-0.5">所要 {r.duration}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                          {r.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 選び方のコツ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                クルーズ予約のコツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIPS.map((t) => (
                  <div
                    key={t.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <t.icon className="h-4 w-4 text-blue-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {t.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {t.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                クルーズ旅行のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* 主要寄港地のおすすめホテル */}
            <CompactHotelsRecommendation
              citySlugs={["singapore", "hong-kong", "sydney", "honolulu"]}
              title="主要寄港地のおすすめホテル"
              subtitle="クルーズ前後の延泊にぴったり。寄港地の代表的なホテルを比較。"
              maxHotels={4}
            />

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/hotels"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    寄港地のホテルを探す
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    クルーズ前後の連泊にも便利
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    都市別ホテル一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    出発地への航空券セール
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    乗船港までの航空券もBEATRIPで
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    セール一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー: クルーズ partner */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="クルーズの予約・比較"
              subtitle="厳選のクルーズ予約サイトから検索"
              categories={["cruise", "tour-overseas", "tour-package"]}
              source="cruise-landing"
            />

            {/* 関連サービス */}
            <JapanesePartnersPanel
              title="クルーズの周辺サービス"
              subtitle="乗船前後に役立つ予約"
              categories={["hotel-overseas", "esim-wifi", "transfer"]}
              source="cruise-landing"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
