/**
 * /articles/miles-booking-guide
 * 「JAL/ANA マイルで予約 完全ガイド — 特典航空券の取り方・必要マイル・コツ」
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  Coins,
  Plane,
  Calendar,
  ArrowRight,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";

export const revalidate = 86400;

const PUBLISHED = "2026-06-01";

export async function generateMetadata(): Promise<Metadata> {
  const title =
    "JAL/ANA マイルで予約 完全ガイド — 特典航空券の取り方・必要マイル・コツ | BEATRIP";
  const description =
    "JAL/ANA マイルで航空券を予約する完全ガイド。必要マイル数の目安、特典航空券の取り方、希望日確保のコツ、マイル効率を最大化するクレカ選びまでを網羅した実践マニュアル。";
  return {
    title,
    description,
    keywords: [
      "JAL マイル 予約",
      "ANA マイル 予約",
      "マイル 特典航空券",
      "マイルで予約",
      "JAL マイル 必要数",
      "ANA マイル 必要数",
      "マイル 貯め方",
      "マイル クレカ",
      "特典航空券 取り方",
      "マイル 予約 コツ",
    ],
    openGraph: { title, description, type: "article" },
    alternates: {
      canonical: "https://beatrip.jp/articles/miles-booking-guide",
      languages: {
        ja: "https://beatrip.jp/articles/miles-booking-guide",
        "x-default": "https://beatrip.jp/articles/miles-booking-guide",
      },
    },
  };
}

const MILE_TABLE: { route: string; jal: string; ana: string; note: string }[] = [
  {
    route: "国内線 短距離 (羽田-大阪 等)",
    jal: "片道 6,000-7,500",
    ana: "片道 5,000-7,500",
    note: "両社とも片道 7,500 マイル前後。シーズン (LOW/REG/HIGH) で変動。",
  },
  {
    route: "国内線 中距離 (羽田-福岡 / 札幌)",
    jal: "片道 7,500-9,000",
    ana: "片道 7,500-9,000",
    note: "ハイシーズン (年末年始・GW・お盆) は LOW から 30-50% UP。",
  },
  {
    route: "国内線 沖縄路線",
    jal: "片道 7,500-10,000",
    ana: "片道 7,500-9,000",
    note: "離島路線は本島より +500-1,000 マイル必要。",
  },
  {
    route: "韓国 / 台湾 / 中国近郊",
    jal: "往復 15,000-20,000",
    ana: "往復 17,000-25,000",
    note: "近場海外は最もコスパが良い。週末日帰り旅にも使える。",
  },
  {
    route: "東南アジア (バンコク・シンガポール)",
    jal: "往復 30,000-40,000",
    ana: "往復 35,000-45,000",
    note: "ビジネスクラスなら 60,000-80,000 で大幅お得感。",
  },
  {
    route: "ハワイ",
    jal: "往復 40,000-55,000",
    ana: "往復 40,000-55,000",
    note: "ピーク期は LOW の 1.5 倍程度。早期予約で LOW シーズン枠確保が鉄則。",
  },
  {
    route: "ヨーロッパ",
    jal: "往復 55,000-75,000",
    ana: "往復 55,000-75,000",
    note: "ビジネス 110,000-150,000、ファースト 165,000-220,000 でアップグレード効果絶大。",
  },
];

const TIPS: { icon: typeof Calendar; title: string; body: string }[] = [
  {
    icon: Calendar,
    title: "予約開始日を逃さない",
    body: "JAL は搭乗日 360 日前、ANA は 355 日前から予約開始。GW・年末年始等の繁忙期は開始日 0 時ジャストの予約が必須。事前に会員ログイン状態を維持しておくのがコツ。",
  },
  {
    icon: Plane,
    title: "区間ボーナス + キャンペーン活用",
    body: "JAL/ANA とも会員ステータス (FOP/PP) で区間ボーナスマイル付与。年 2-3 回の「ボーナスマイル増量キャンペーン」期間中の搭乗で効率を 1.5-2 倍に。",
  },
  {
    icon: CreditCard,
    title: "提携クレカでマイル積上げ",
    body: "JAL/ANA カード (主に SAISON/AMEX 系) なら 100 円 = 1 マイル。年会費はかかるが日常決済を集約するだけで年 10,000-30,000 マイル貯まる。空マイラーの王道ルート。",
  },
  {
    icon: Coins,
    title: "ポイントサイト経由のマイル変換",
    body: "モッピー / ハピタス等のポイントサイトで貯めたポイントを ANA マイル / JAL マイルに交換するルートも有効。クレカ発行案件で 1 万マイル相当 (1.5 万円分) を一気に獲得することも可能。",
  },
];

const FAQS = [
  {
    q: "マイルと現金、どちらで予約すべき？",
    a: "繁忙期 (GW・お盆・年末年始) の高額路線ほどマイル予約のお得感が大きいです。ハワイ/ヨーロッパ路線のピーク期は現金で 20-30 万円のところを 50,000-75,000 マイルで予約できるため、1 マイル = 3-5 円相当の価値になります。閑散期・LCC で安く取れる時期はマイルを使わず現金で買い、マイルは温存して繁忙期に使うのが効率的。",
  },
  {
    q: "希望日の特典航空券が取れません。どうすれば？",
    a: "(1) 予約開始日 (搭乗 360/355 日前) 0 時ジャストの予約、(2) 平日・午前便・LOW シーズン優先、(3) キャンセル戻りを毎日チェック (出発 1 ヶ月前頃に開放されることが多い)、(4) JAL なら共同運航便 (アメリカン航空・カタール航空等) も視野に入れる、の 4 点が定石。",
  },
  {
    q: "マイルの有効期限はどうなっていますか？",
    a: "JAL / ANA とも一般会員は加算月から 36 ヶ月後の月末で失効。ダイヤモンド/プラチナ等の上級会員は無期限。失効間近のマイルは特典航空券に充当するか、ANA SKY コインや楽天ポイントへの交換も検討推奨。",
  },
  {
    q: "マイルを貯めるのに最適なクレカは？",
    a: "(1) ANA アメックスゴールド (毎年 2,000 マイルボーナス + 100 円 1 マイル)、(2) JAL カード CLUB-A ゴールド (区間ボーナス 25% UP)、(3) ANA VISA プラチナ プレミアム (ハイステータス向け)、が王道。年会費とマイル積上量のバランスで選定。詳細は当サイトのクレカ比較記事を参照。",
  },
  {
    q: "ANA と JAL、どちらが貯めやすい？",
    a: "ライフスタイル次第。羽田/伊丹中心なら ANA、関西/福岡中心なら JAL がフライト網的に貯めやすい傾向。ただし日常決済 + 提携クレカで貯めるなら、年会費含めた費用対効果は両社ほぼ同水準。出張で使うエアラインに合わせるのが現実的。",
  },
  {
    q: "発券手数料はかかりますか？",
    a: "JAL/ANA とも国内線特典航空券は手数料無料、国際線特典航空券は燃油サーチャージ + 諸税 (1-3 万円程度) が別途必要。完全無料ではない点に注意。日付変更・キャンセル時もマイル戻し手数料 (3,000 円 + 戻入手数料) がかかります。",
  },
];

export default async function MilesBookingGuidePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "JAL/ANA マイルで予約 完全ガイド — 特典航空券の取り方・必要マイル・コツ",
    description:
      "マイル予約の基礎から実践テクニック、必要マイル数、希望日確保のコツまでを完全網羅。",
    inLanguage: "ja-JP",
    datePublished: PUBLISHED,
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: "BEATRIP", url: "https://beatrip.jp" },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    mainEntityOfPage: "https://beatrip.jp/articles/miles-booking-guide",
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

      <section className="relative bg-gradient-to-br from-amber-600 via-yellow-600 to-rose-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            currentPath={lang === "en" ? "/en/articles/miles-booking-guide" : "/articles/miles-booking-guide"}
            items={[
              { label: "Home", href: "/" },
              { label: "Articles", href: "/articles" },
              { label: "マイル予約ガイド" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Coins className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              JAL / ANA Miles Booking Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            マイルで予約 完全ガイド
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            JAL / ANA マイルで特典航空券を予約する実践ガイド。必要マイル数の目安、
            希望日確保のコツ、マイル効率を最大化するクレカ選びまでを網羅した完全マニュアルです。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* 必要マイル表 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                路線別 必要マイル目安
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                JAL / ANA 特典航空券のレギュラーシーズン (REG) のエコノミー必要マイル目安。
                ハイ/ロー シーズンや上位クラスは別途参照。
              </p>
              <div className="overflow-x-auto rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                      <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">路線</th>
                      <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">JAL</th>
                      <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200 whitespace-nowrap">ANA</th>
                      <th className="px-3 py-3 font-bold text-zinc-700 dark:text-zinc-200">編集部メモ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {MILE_TABLE.map((r) => (
                      <tr key={r.route} className="align-top">
                        <td className="px-3 py-3 text-xs text-zinc-700 dark:text-zinc-300 font-bold whitespace-nowrap">
                          {r.route}
                        </td>
                        <td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-300 whitespace-nowrap font-mono">
                          {r.jal}
                        </td>
                        <td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-300 whitespace-nowrap font-mono">
                          {r.ana}
                        </td>
                        <td className="px-3 py-3 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed min-w-[220px]">
                          {r.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-2 text-[11px] text-zinc-400 leading-relaxed">
                上記マイル数は 2026 年 6 月時点の編集部調査による目安。改定の可能性があるため、
                予約前に各社公式の最新マイルチャートで必ずご確認ください。
              </p>
            </section>

            {/* 予約のコツ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                マイル予約の実践テクニック
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIPS.map((t) => (
                  <div
                    key={t.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <t.icon className="h-4 w-4 text-amber-500" />
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

            {/* クレカ CTA */}
            <section>
              <div className="rounded-2xl border border-amber-100 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-6 flex flex-col sm:flex-row items-start gap-4">
                <CreditCard className="h-8 w-8 text-amber-600 dark:text-amber-300 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    マイル積上げの最速ルートは「年会費有 + 入会ボーナス」
                  </h2>
                  <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    マイラー初心者なら ANA/JAL ゴールド系クレカの「入会 + 利用ボーナス」で
                    最初の 1-2 万マイルを一気に獲得するのが最速。日常決済も集約すれば
                    年間 3-5 万マイル積上は現実的。年会費 1-2 万円は実質「マイルへの投資」と考えると割安。
                  </p>
                  <Link
                    href="/credit-cards"
                    className="mt-3 inline-flex items-center gap-1 rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-bold hover:bg-amber-700 transition-colors"
                  >
                    マイル系クレカを比較する <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </section>

            {/* 信頼性パネル */}
            <section>
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-heading text-base tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                    本ガイドの位置付け
                  </h2>
                  <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    本ガイドは 2026 年 6 月時点の編集部調査に基づく一般的な目安です。
                    必要マイル数・特典航空券の運用ルール・燃油サーチャージは航空会社の判断で
                    随時改定されます。実際の予約前に必ず JAL / ANA 公式の最新ルールを
                    ご確認ください。
                  </p>
                  <p className="mt-2 text-[11px] text-zinc-400">
                    本記事のリンクの一部はアフィリエイト広告を含みます。
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-3xl">
                よくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* 関連 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/credit-cards"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    旅行系クレカ比較
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">マイル付与率・年会費・特典で選ぶ</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    クレカ比較を見る <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/articles/sale-prediction-2027"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    2027 セール予測
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">JAL/ANA/LCC 主要キャリア網羅</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    セール予測を見る <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="航空券 予約・比較"
              subtitle="マイル不足時の現金予約に"
              categories={["flight-domestic", "flight-overseas", "tour-package"]}
              source="miles-booking-guide"
            />
            <JapanesePartnersPanel
              title="マイル系クレカ"
              subtitle="ANA / JAL 提携カードの比較"
              categories={["credit-card"]}
              source="miles-booking-guide"
            />
            <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-zinc-400" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  航空会社別セール
                </h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">
                マイル予約と並行して現金セールも要チェック。年 2-3 回の大型セールを逃さない。
              </p>
              <Link
                href="/airlines"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
              >
                航空会社一覧へ <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
