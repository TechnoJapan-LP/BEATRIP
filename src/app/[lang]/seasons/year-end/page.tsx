import type { Metadata } from "next";
import Link from "next/link";
import { Snowflake, Calendar, Plane, Hotel, Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { CATEGORY_GRADIENTS } from "@/lib/theme/category-gradients";
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
    ? "Japan year-end & New Year travel — best booking windows for Dec–Jan | BEATRIP"
    : "年末年始の航空券・ホテル予約完全ガイド｜12月〜1月の最安タイミング | BEATRIP";
  const description = isEn
    ? "Plan your year-end and New Year trip from Japan (late December through early January). When fares peak, when they bottom out, early-bird discounts, and our picks for top domestic and overseas destinations during the holidays."
    : "年末年始 (12月後半〜1月初旬) の航空券・ホテル予約を最安で取るタイミング、人気目的地、予約のコツを完全網羅。ピークと底値時期、早期予約割引、おすすめ国内・海外目的地まで。";
  const path = isEn ? "/en/seasons/year-end" : "/seasons/year-end";
  return {
    title,
    description,
    keywords: isEn
      ? ["Japan New Year travel", "year-end Japan flights", "Oshogatsu travel", "December flights Japan", "January travel Japan", "Japan holiday peak season"]
      : ["年末年始 航空券", "年末年始 ホテル", "年末年始 旅行", "正月 旅行", "12月 航空券 安い", "1月 旅行 おすすめ", "年末年始 海外旅行", "年末年始 国内旅行", "年末年始 ピーク"],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/seasons/year-end",
        en: "https://beatrip.jp/en/seasons/year-end",
        "x-default": "https://beatrip.jp/seasons/year-end",
      },
    },
  };
}

const CALENDAR: { range: string; level: "peak" | "high" | "mid" | "low"; note: string }[] = [
  { range: "12/22 〜 12/25", level: "mid", note: "クリスマス前後は意外と落ち着く狙い目期間。" },
  { range: "12/26 〜 12/27", level: "high", note: "帰省・出発ラッシュ前夜。料金が急上昇し始める。" },
  { range: "12/28 〜 1/3", level: "peak", note: "年末年始の最ピーク。航空券・ホテルとも年間最高値クラス。" },
  { range: "1/4 〜 1/7", level: "high", note: "Uターンラッシュ。復路特に高値。" },
  { range: "1/8 以降", level: "low", note: "通常料金へ急落。1月後半は年間でも底値圏。" },
];

const TIPS: { icon: typeof Calendar; title: string; body: string }[] = [
  {
    icon: Calendar,
    title: "3ヶ月前までに予約",
    body: "年末年始は需要が読みやすいため早期予約割引の旨味が大きい。航空券は9〜10月、ホテルも同時期に押さえると最安帯を狙えます。",
  },
  {
    icon: Plane,
    title: "平日出発・平日帰着",
    body: "12/29 (火) 出発・1/4 (月) 帰着など平日を絡めるだけで往復で数万円下がるケースも。曜日カレンダーをまず確認。",
  },
  {
    icon: Clock,
    title: "帰省ピーク回避",
    body: "12/30〜1/2 を避け、12/27 出発・1/3 帰着パターンに前倒し or 後倒しすると価格と混雑の両方で得。",
  },
  {
    icon: Hotel,
    title: "キャンセル無料を活用",
    body: "ホテルは早期確保＋キャンセル無料プランで仮押さえ、直前で値下がりしたら取り直すのが鉄則。",
  },
];

const DESTINATIONS: { area: string; type: "国内" | "海外"; emoji: string; highlight: string }[] = [
  { area: "沖縄", type: "国内", emoji: "🌺", highlight: "冬でも20℃前後、リゾートホテルで初日の出。直行便多数。" },
  { area: "北海道", type: "国内", emoji: "❄️", highlight: "雪見温泉・スキー・札幌雪まつり前夜祭。ANA/JAL の年末セール対象も多い。" },
  { area: "京都", type: "国内", emoji: "⛩️", highlight: "初詣定番。新幹線+老舗旅館で正月らしい和の年越し。" },
  { area: "ハワイ", type: "海外", emoji: "🏝️", highlight: "年末年始の鉄板リゾート。ピーク料金だが早期予約で大幅差。" },
  { area: "グアム", type: "海外", emoji: "🌴", highlight: "4時間で南国。短期日程でも往復しやすく家族連れに人気。" },
  { area: "台北", type: "海外", emoji: "🇹🇼", highlight: "近距離・低予算で海外気分。年越しの台北101花火が圧巻。" },
];

const FAQS = [
  {
    q: "年末年始の航空券はいつから安くなりますか？",
    a: "復路は1月8日以降、往路は1月4日以降から通常料金に戻ります。12月28日〜1月3日のピーク期は3ヶ月以上前の早期予約割引が最も有効。直前 (出発2週間以内) はピーク日除けば LCC で空席が出ることもあります。",
  },
  {
    q: "年末年始は国内と海外どちらがコスパ良いですか？",
    a: "総額重視なら国内 (沖縄・北海道) が安定。早期予約済みなら海外 (ハワイ・台北・グアム) も競争力があります。海外は燃油サーチャージとパスポート期限の確認も忘れずに。3泊以下の短期ならアジア近郊、5泊以上ならハワイなどの中距離がおすすめ。",
  },
  {
    q: "年末年始の直前予約でも間に合いますか？",
    a: "ピーク日 (12/29〜1/2) は直前ほぼ満席・残席は最高値。一方、12/27 出発や1/4 帰着など前後にずらせば直前でも見つかる場合があります。LCC やキャンセル無料プランの再販在庫を毎日チェックするのが現実的な対策です。",
  },
  {
    q: "予約後にキャンセル料はいつから発生しますか？",
    a: "航空券は航空会社・運賃種別で異なり、LCC は予約直後から不可、フラッグキャリアは出発21日前まで無料の運賃もあります。ホテルはキャンセル無料プランなら多くが出発3〜7日前まで無料。年末年始は規定が厳しめなので必ず予約時に確認してください。",
  },
  {
    q: "子連れの年末年始旅行におすすめの目的地は？",
    a: "短時間フライト・時差なしのグアム (3.5時間)、直行便多数の沖縄、雪体験できる北海道が定番。子連れは「乗り継ぎなし」「全食事込みリゾート」「キッズプログラム」の3条件で絞ると失敗しにくいです。",
  },
];

export default async function YearEndSeasonPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "年末年始の航空券・ホテル予約完全ガイド｜12月〜1月の最安タイミング",
    description:
      "年末年始のピーク・底値カレンダー、予約のコツ、人気目的地、FAQ までを完全網羅した予約ガイド。",
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
    mainEntityOfPage: "https://beatrip.jp/seasons/year-end",
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

  const levelStyle: Record<string, string> = {
    peak: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
    high: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    mid: "bg-sky-500/15 text-sky-600 dark:text-sky-300 border-sky-500/30",
    low: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  };
  const levelLabel: Record<string, string> = {
    peak: "ピーク",
    high: "高値",
    mid: "やや高",
    low: "底値",
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
      <section className={`relative bg-gradient-to-br ${CATEGORY_GRADIENTS.season} text-white`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            currentPath={lang === "en" ? "/en/seasons/year-end" : "/seasons/year-end"}
            items={[
              { label: "Home", href: "/" },
              { label: "季節特集", href: "/seasons/year-end" },
              { label: "年末年始" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Snowflake className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Year-End & New Year Travel
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            年末年始の旅行予約
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            12月〜1月初旬のピーク・底値カレンダー、最安タイミング、人気目的地まで完全網羅。
            早期予約と平日活用で年末年始の旅費を賢く抑えるためのガイドです。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* ピーク時期カレンダー */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                ピーク時期カレンダー
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                12/28〜1/3 が最高値。12/22〜25 と 1/8 以降は大きく下落します。
              </p>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {CALENDAR.map((c) => (
                    <div
                      key={c.range}
                      className="flex items-start gap-4 px-5 py-3"
                    >
                      <div className="w-36 flex-shrink-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                          {c.range}
                        </p>
                        <span
                          className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${levelStyle[c.level]}`}
                        >
                          {levelLabel[c.level]}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pt-1">
                        {c.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 予約のコツ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                年末年始 予約のコツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIPS.map((t) => (
                  <div
                    key={t.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <t.icon className="h-4 w-4 text-rose-500" />
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

            {/* 人気目的地 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                年末年始 人気目的地
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                国内3つ・海外3つの定番。早期予約で大きく差がつくエリアです。
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DESTINATIONS.map((d) => (
                  <div
                    key={d.area}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl flex-shrink-0">{d.emoji}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {d.area}
                          </h3>
                          <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-300">
                            {d.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                          {d.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                年末年始旅行のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* 年末年始人気のおすすめホテル */}
            <CompactHotelsRecommendation
              citySlugs={["tokyo", "osaka", "sapporo", "honolulu"]}
              title="年末年始に人気のホテル"
              subtitle="国内・海外の人気目的地から、編集者が選ぶ代表的なホテル。"
              maxHotels={4}
            />

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/okinawa"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    冬の沖縄ガイド
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    年末年始の沖縄リゾート特集
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    沖縄ガイドを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/hawaii"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    年末年始ハワイ
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    早期予約で差がつくハワイの取り方
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ハワイガイドを見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="年末年始の予約・比較"
              subtitle="航空券・ホテル・ツアーをまとめて比較"
              categories={["flight-domestic", "flight-overseas", "hotel-domestic", "tour-package"]}
              source="seasons-year-end"
            />

            <JapanesePartnersPanel
              title="海外・現地手配"
              subtitle="海外ホテル・ツアー・レンタカー"
              categories={["hotel-overseas", "tour-overseas", "rental-car"]}
              source="seasons-year-end"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
