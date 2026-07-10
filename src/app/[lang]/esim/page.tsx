import type { Metadata } from "next";
import Link from "next/link";
import {
  Smartphone,
  Globe2,
  Zap,
  ShieldCheck,
  Cpu,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { CATEGORY_GRADIENTS } from "@/lib/theme/category-gradients";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";
import { CompactHotelsRecommendation } from "@/components/hotels/compact-hotels-recommendation";
import { OG_IMAGES } from "@/lib/seo/og";

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
    ? "Travel eSIM comparison — pick the right plan for your trip"
    : "海外eSIM比較ガイド｜旅行用おすすめeSIMの選び方";
  const description = isEn
    ? "Compare travel eSIM providers and learn how to pick the right one. eSIM vs. pocket Wi-Fi vs. physical SIM, supported devices (iPhone XS and later, Pixel 3 and later, Galaxy S20 and later), and how to choose by data, days, and country. Compare across 5 traveler-friendly eSIM brands curated by BEATRIP."
    : "海外旅行用 eSIM を比較・選び方ガイド。Wi-Fi レンタル・物理 SIM との違い、対応端末（iPhone XS 以降 / Pixel 3 以降 / Galaxy S20 以降）、データ量・期間・国別の選び方を解説。BEATRIP厳選の日本語対応 eSIM 5 サービスから比較できます。";
  const path = isEn ? "/en/esim" : "/esim";
  return {
    title,
    description,
    keywords: isEn
      ? [
          "travel eSIM",
          "eSIM comparison",
          "best eSIM for travel",
          "eSIM vs pocket WiFi",
          "international eSIM",
          "prepaid eSIM",
          "eSIM supported devices",
        ]
      : [
          "eSIM 海外",
          "eSIM 比較",
          "海外 eSIM おすすめ",
          "eSIM 設定",
          "Wi-Fi レンタル 比較",
          "海外 通信",
          "eSIM 対応端末",
          "eSIM 旅行",
          "プリペイド eSIM",
        ],
    openGraph: {
      images: OG_IMAGES,
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/esim",
        "x-default": "https://beatrip.jp/esim",
      },
    },
  };
}

const COMPARISON: { item: string; esim: string; wifi: string; sim: string }[] =
  [
    {
      item: "受け取り・返却",
      esim: "アプリ／QR で即時開通。受取・返却ゼロ",
      wifi: "出発前に空港受取・帰国後に返却が必要",
      sim: "事前購入 or 現地空港購入・差し替え作業あり",
    },
    {
      item: "荷物・充電",
      esim: "スマホ 1 台のみ。バッテリーも本体だけ",
      wifi: "端末本体＋モバイルバッテリーが必要",
      sim: "スマホのみだが、SIM ピン・元 SIM 保管が必要",
    },
    {
      item: "通信速度・安定性",
      esim: "現地キャリア直接接続で高速・安定",
      wifi: "1 台複数人共有で速度が落ちやすい",
      sim: "現地キャリア直接接続で安定",
    },
    {
      item: "料金相場（1 週間）",
      esim: "1GB ¥500 〜 / 5GB ¥1,500 〜",
      wifi: "1 日 ¥800 〜 ¥1,500 (容量無制限プラン中心)",
      sim: "¥1,500 〜 ¥3,000 (国・容量により大きく変動)",
    },
  ];

const SELECTION: { icon: typeof Globe2; title: string; body: string }[] = [
  {
    icon: Globe2,
    title: "使う国・エリア",
    body: "単一国なら現地特化プランが最安。複数国を跨ぐならアジア周遊・ヨーロッパ周遊・グローバル対応プランを選びましょう。trifa・Saily は世界 150 以上の国・地域に対応します。",
  },
  {
    icon: Zap,
    title: "データ量",
    body: "地図・SNS・連絡中心なら 1GB／週、写真・動画アップロードや Google マップ多用なら 3〜5GB／週、テザリングや動画視聴なら 10GB 以上か無制限プランが安心です。",
  },
  {
    icon: ShieldCheck,
    title: "利用期間",
    body: "1〜3 日の短期プラン、7／14／30 日の中期、30 日以上の長期で料金単価が変わります。延長したくなった場合に追加チャージできるサービス（trifa など）が便利です。",
  },
  {
    icon: Cpu,
    title: "対応端末・SIM ロック",
    body: "eSIM 対応機種か事前確認は必須。日本キャリアで購入した端末は SIM ロック解除済みかも確認しましょう。物理 SIM スロットは触らないので、メイン回線はそのまま使えます。",
  },
];

const DEVICES: { brand: string; models: string }[] = [
  {
    brand: "iPhone",
    models:
      "iPhone XS / XR 以降のすべてのモデル（XS, XR, 11, 12, 13, 14, 15, 16, SE 第2世代以降）",
  },
  {
    brand: "Google Pixel",
    models:
      "Pixel 3 以降（一部国内版 Pixel 3／3a は非対応）。Pixel 4 以降は安定対応",
  },
  {
    brand: "Samsung Galaxy",
    models:
      "Galaxy S20 シリーズ以降、Note 20 以降、Z Fold/Flip 全モデル、A54 など対応モデルあり",
  },
  {
    brand: "iPad",
    models:
      "iPad Pro (11 インチ第1世代 / 12.9 インチ第3世代) 以降の Cellular モデル",
  },
  {
    brand: "その他",
    models:
      "Huawei P40・Sony Xperia 10 IV 以降の一部、Motorola Razr 2019 以降。詳細は購入前に各 eSIM サービスの対応端末リストで確認",
  },
];

const FAQS = [
  {
    q: "eSIM の設定はかんたんですか？",
    a: "出発前に自宅 Wi-Fi で QR コードを読み取って eSIM プロファイルをインストールしておき、現地到着後に「モバイル通信」の主回線を切り替えるだけで完了します。所要 5〜10 分。trifa など日本語対応アプリだと初心者でも迷いません。物理 SIM の差し替え作業や、空港カウンターの行列待ちは不要です。",
  },
  {
    q: "物理 SIM カードや Wi-Fi レンタルとの違いは？",
    a: "eSIM はスマホ内蔵チップに通信プランをダウンロードする方式で、物理的なカード差し替えがいりません。Wi-Fi レンタル端末と違って荷物・充電不要、グループ全員に Wi-Fi 機を持ち回す必要もありません。一方、複数人で 1 回線を共有したい・eSIM 非対応端末を使う場合は Wi-Fi レンタルが向きます。",
  },
  {
    q: "通信品質や速度は大丈夫？",
    a: "eSIM は現地キャリアの回線に直接接続するため、Wi-Fi レンタル端末の中継より速度・安定性で勝るケースが多いです。ただし接続キャリアはプロバイダによって異なるため、地方や山間部での実績はサービスごとに差があります。都市部メインなら大手 eSIM サービスならまず問題なく使えます。",
  },
  {
    q: "1 つの eSIM で複数の国を使えますか？",
    a: "「アジア周遊」「ヨーロッパ周遊」「グローバル」などの広域プランを選べば、複数国でそのまま利用できます。Voye Global は各国最低 2 回線が使えるためメイン回線の障害時にも切替可能。trifa や Saily は 150 以上の国・地域に対応するグローバルプランがあるので、複数国を跨ぐ周遊旅行に最適です。",
  },
  {
    q: "料金相場はどれくらい？",
    a: "1 週間の利用で、1GB プランが ¥500〜¥1,000、3〜5GB プランが ¥1,500〜¥2,500、10GB／無制限プランが ¥3,000〜¥5,000 が目安です。Wi-Fi レンタル（1 日 ¥800〜¥1,500）と比べると、4 日以上の旅行ならほぼ eSIM のほうが安くなる計算です。短期かつ複数人で 1 回線を共有するなら Wi-Fi レンタルも有力です。",
  },
];

export default async function EsimPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "海外eSIM比較ガイド｜旅行用おすすめeSIMの選び方",
    description:
      "海外旅行用 eSIM の選び方・対応端末・Wi-Fi レンタルとの違いを徹底比較するガイド。",
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
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    image: "https://beatrip.jp/opengraph-image",
    mainEntityOfPage: "https://beatrip.jp/esim",
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
      <section
        className={`relative bg-gradient-to-br ${CATEGORY_GRADIENTS.telecom} text-white`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            currentPath={lang === "en" ? "/en/esim" : "/esim"}
            items={[{ label: "Home", href: "/" }, { label: "eSIM" }]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Smartphone className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              eSIM Travel Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            海外旅行 eSIM 比較
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            アプリで即時開通・荷物ゼロ・現地キャリア直結で安定通信。
            BEATRIP厳選の日本語対応 eSIM サービスから比較・購入できます。
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* なぜ eSIM？ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                なぜ eSIM？
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                Wi-Fi レンタル・物理 SIM カードとの違いを項目別に比較
              </p>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="grid grid-cols-4 border-b border-zinc-100 dark:border-zinc-800 bg-violet-50 dark:bg-violet-900/20 text-[10px] font-bold uppercase tracking-wider text-violet-700 dark:text-violet-200">
                  <div className="px-3 py-2.5">項目</div>
                  <div className="px-3 py-2.5">eSIM</div>
                  <div className="px-3 py-2.5">Wi-Fi レンタル</div>
                  <div className="px-3 py-2.5">物理 SIM</div>
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {COMPARISON.map((row) => (
                    <div key={row.item} className="grid grid-cols-4 text-xs">
                      <div className="px-3 py-3 font-bold text-zinc-900 dark:text-zinc-100">
                        {row.item}
                      </div>
                      <div className="px-3 py-3 text-violet-700 dark:text-violet-200 leading-relaxed">
                        {row.esim}
                      </div>
                      <div className="px-3 py-3 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {row.wifi}
                      </div>
                      <div className="px-3 py-3 text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {row.sim}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* eSIM の選び方 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                eSIM の選び方
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SELECTION.map((s) => (
                  <div
                    key={s.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <s.icon className="h-4 w-4 text-violet-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {s.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {s.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 対応端末 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                対応端末
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                主要メーカーの対応モデル（購入前に各サービスのリストで最終確認を）
              </p>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {DEVICES.map((d) => (
                    <div
                      key={d.brand}
                      className="flex items-start gap-4 px-5 py-3"
                    >
                      <div className="w-28 flex-shrink-0">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {d.brand}
                        </p>
                      </div>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {d.models}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                eSIM のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* 海外人気都市のおすすめホテル */}
            <CompactHotelsRecommendation
              citySlugs={["bangkok", "seoul", "taipei", "singapore"]}
              title="eSIM とあわせて予約したい海外人気ホテル"
              subtitle="アジア主要都市の代表的なホテルを比較・予約。"
              maxHotels={4}
            />

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/hawaii"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    ハワイ旅行ガイド
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    現地通信もこのページから手配
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ハワイの予約・比較
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/cruise"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    クルーズ旅行ガイド
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    寄港地での通信にも eSIM が便利
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    クルーズ航路を見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/hotels"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    都市別ホテルを探す
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    海外ホテルもまとめて予約
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ホテル一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー: eSIM partner */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="eSIM サービスを比較"
              subtitle="日本語対応の主要 eSIM から選ぶ"
              categories={["esim-wifi"]}
              source="esim-landing"
            />

            <JapanesePartnersPanel
              title="もし不安なら Wi-Fi レンタルも"
              subtitle="複数人共有や非対応端末ならこちら"
              categories={["esim-wifi", "insurance"]}
              source="esim-landing"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
