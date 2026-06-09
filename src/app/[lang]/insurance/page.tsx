import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Users,
  ArrowRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";

// ISR: 21600 秒 (6 時間)
export const revalidate = 21600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = isEn
    ? "How to choose travel insurance — credit-card cover vs. standalone plans | BEATRIP"
    : "海外旅行保険の選び方｜クレカ付帯 vs 別途加入 完全比較 | BEATRIP";
  const description = isEn
    ? "Pick the right travel insurance with BEATRIP's editorial guide. We compare credit-card travel cover (limits on payout, duration, illness) with online plans from AIG, Chubb, Sompo Japan, and Rakuten Sonpo. Plus how to choose by trip length (7/14/30/90 days) and tips for seniors, pre-existing conditions, pregnancy, and adventure sports."
    : "海外旅行保険の選び方を整理。クレジットカード付帯保険の限界（補償額・期間・疾病）、ネット保険（AIG・Chubb・損保ジャパン・楽天損保）の比較、期間別（7／14／30／90 日）の選び方、シニア・持病・妊婦・アクティビティ系の特殊ケースまで BEATRIP 編集部が解説します。";
  const path = isEn ? "/en/insurance" : "/insurance";
  return {
    title,
    description,
    keywords: isEn
      ? ["travel insurance Japan", "travel insurance comparison", "credit card travel insurance", "AIG travel insurance", "Chubb travel insurance", "Sompo travel insurance", "senior travel insurance", "pre-existing condition travel"]
      : ["海外旅行保険", "海外旅行保険 比較", "クレカ 海外旅行保険", "AIG 海外旅行保険", "Chubb 海外旅行保険", "損保ジャパン off", "楽天損保 海外旅行保険", "海外旅行保険 選び方", "シニア 海外旅行保険", "海外旅行 持病"],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/insurance",
        en: "https://beatrip.jp/en/insurance",
        "x-default": "https://beatrip.jp/insurance",
      },
    },
  };
}

const CREDIT_LIMITS: { item: string; detail: string }[] = [
  {
    item: "補償期間",
    detail: "多くのカードで「出発日から最長 90 日」までに限定。長期渡航・ワーホリ・留学では期間が不足します。",
  },
  {
    item: "疾病治療費の補償額",
    detail: "ゴールド帯で 200〜500 万円程度が一般的。米国・スイスなどは盲腸手術 1 件で 200 万円超のケースもあり不足し得ます。",
  },
  {
    item: "自動付帯 vs 利用付帯",
    detail: "近年のカードは「旅行代金をそのカードで決済しないと適用されない」利用付帯が増加。決済方法の確認が必須です。",
  },
  {
    item: "家族・同行者の補償",
    detail: "本会員のみ対象で家族カードや同行者は対象外のケース多数。家族特約付きカードか別途家族プランへの加入が必要。",
  },
  {
    item: "歯科・既往症・妊娠関連",
    detail: "クレカ付帯では原則対象外。これらに備えるならネット保険のオプションを必ず確認しましょう。",
  },
];

const NET_INSURANCE: { name: string; pitch: string; bestFor: string }[] = [
  {
    name: "AIG 損保 海外旅行保険",
    pitch: "ネット完結で出発当日まで申込可能。24 時間日本語アシスタンスサービスを完備し、キャッシュレス医療サービス提携病院が世界中に広がる。",
    bestFor: "初めての海外旅行・サポート手厚さ重視",
  },
  {
    name: "Chubb 損保 海外旅行保険",
    pitch: "オンライン申込でプランをカスタマイズ。短期から長期渡航まで柔軟、世界規模の保険グループならではのネットワーク。",
    bestFor: "プランを細かく組み立てたい人・出張多めの人",
  },
  {
    name: "損保ジャパン 新・海外旅行保険【off!】",
    pitch: "ネット専用商品で必要な補償だけ選べる組立式。同行家族のセット申込で割安。",
    bestFor: "費用を抑えたい人・家族旅行",
  },
  {
    name: "楽天損保 海外旅行保険",
    pitch: "ネット申込割引＋楽天ポイント付与。楽天会員なら年間複数回の海外旅行で総コストを抑えやすい。",
    bestFor: "楽天経済圏ユーザー・年複数回渡航する人",
  },
  {
    name: "tabiho（たびほ・ジェイアイ傷害火災）",
    pitch: "出発当日まで申込可・e チケット完結でスマホで証券受取。短期渡航の駆け込み加入に強い。",
    bestFor: "出発直前の駆け込み・スマホ完結派",
  },
];

const PERIOD_GUIDE: { duration: string; recommendation: string; budgetHint: string }[] = [
  {
    duration: "1〜7 日（週末・短期出張）",
    recommendation: "クレカ付帯（ゴールド以上）＋必要に応じてネット保険ミニマム。盲腸クラスの治療費だけ追加でカバー。",
    budgetHint: "ネット保険追加目安: 700〜1,500 円／件",
  },
  {
    duration: "8〜14 日（通常の海外旅行）",
    recommendation: "ネット保険のフルプラン推奨。疾病・賠償・携行品・航空機遅延を一括カバー。",
    budgetHint: "目安: 1,500〜3,500 円／件",
  },
  {
    duration: "15〜30 日（長期休暇・周遊）",
    recommendation: "クレカ付帯が切れる目安。ネット保険の中長期プランを単独で。複数国周遊なら全期間補償を確認。",
    budgetHint: "目安: 5,000〜10,000 円／件",
  },
  {
    duration: "31〜90 日以上（ワーホリ・留学）",
    recommendation: "留学・長期滞在向けの長期プラン専用商品を選択。クレカ付帯はほぼ全社で対象外。",
    budgetHint: "目安: 30,000〜100,000 円／件（期間・国・年齢で大幅変動）",
  },
];

const SPECIAL_CASES: { icon: typeof Users; title: string; body: string }[] = [
  {
    icon: Users,
    title: "シニア（70 歳以上）",
    body: "年齢で保険料が上がり、商品によっては引受不可。AIG・Chubb 等のシニア対応プラン、または楽天損保の年齢上限がない商品から比較を。健康診断書の提出が求められる場合もあります。",
  },
  {
    icon: ShieldCheck,
    title: "持病あり（既往症対応）",
    body: "通常プランでは持病の急性増悪は対象外。tabiho『新・海外旅行保険』など既往症対応特約付きの商品を選びましょう。引受可否は病状による個別判断のため、加入前に保険会社へ問い合わせを。",
  },
  {
    icon: AlertTriangle,
    title: "妊娠中の方",
    body: "妊娠に伴う症状・分娩は原則対象外。妊娠初期の安定した時期に限り、産婦人科医の渡航許可と特定保険商品の併用が必要。航空会社の搭乗制限（妊娠 28 週以降の診断書要求等）と合わせて確認。",
  },
  {
    icon: Calendar,
    title: "アクティビティ系（スキー・ダイビング等）",
    body: "山岳登攀・スカイダイビング・スキューバ等の危険スポーツは別途特約が必要。標準プランの免責事項を必ず確認し、現地ツアー会社の保険と二重加入になっていないかチェック。",
  },
];

const FAQS = [
  {
    q: "クレジットカードの海外旅行保険だけで足りますか？",
    a: "短期 (1〜2 週間)・若年層・健常な方なら、ゴールド以上のクレカ付帯保険でカバー可能なケースが多いです。ただし米国など医療費の高い国では疾病治療費の補償額 (クレカ付帯で 200〜500 万円が一般的) が不足し得ます。また長期渡航・シニア・持病ありの場合は、ネット保険を必ず併用してください。",
  },
  {
    q: "保険はいつまでに加入すればよいですか？",
    a: "AIG・Chubb・tabiho などネット保険は出発当日まで申込可能です。ただし出国後・到着後の加入は原則できません。空港到着前の自宅 Wi-Fi 環境で申込み、メールで届く保険証券をスマホに保存しておくのが安全です。",
  },
  {
    q: "クレカ付帯保険を複数枚持っていれば合算できますか？",
    a: "疾病・傷害治療費・賠償責任など実損補填型の補償は複数カードの限度額が合算可能 (重複請求は不可)。死亡・後遺障害保険金は最も金額の大きいカードのみ適用が一般的です。同種補償の重複は無意味なため、自動付帯のサブカードで治療費を上乗せする戦略が効果的です。",
  },
  {
    q: "ネット保険で削っていい補償・削るべきでない補償は？",
    a: "必須なのは『疾病・傷害治療費』『救援者費用』『個人賠償責任』の 3 つ。逆に『携行品損害』『航空機寄託手荷物遅延』はクレカ付帯やクレカ会社の手荷物保険と重複しがちで削減候補です。死亡保険金額は家計・遺族構成によりますが、独身なら最低限で構いません。",
  },
  {
    q: "シニア・持病ありで加入できる保険はありますか？",
    a: "tabiho の既往症対応プラン、AIG の高年齢者対応プラン、ジェイアイ傷害火災の長期渡航プランなどが代表例です。年齢・病状に応じて引受可否や保険料が個別判断されるため、出発 2 週間前までに見積もりを取り、必要なら医師の診断書を準備してください。",
  },
];

export default async function InsurancePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "海外旅行保険の選び方｜クレカ付帯 vs 別途加入 完全比較",
    description:
      "海外旅行保険の選び方を、クレカ付帯の限界・ネット保険比較・期間別の選び方・特殊ケースの 4 ブロックで解説。",
    inLanguage: "ja-JP",
    datePublished: "2026-06-09",
    dateModified: new Date().toISOString().split("T")[0],
    author: { "@type": "Organization", name: "BEATRIP", url: "https://beatrip.jp" },
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
      logo: { "@type": "ImageObject", url: "https://beatrip.jp/logo.png" },
    },
    image: "https://beatrip.jp/opengraph-image",
    mainEntityOfPage: "https://beatrip.jp/insurance",
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
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-700 to-emerald-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "海外旅行保険比較" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <ShieldCheck className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Travel Insurance Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            海外旅行保険の選び方
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            クレカ付帯 vs 別途加入を完全比較。期間・年齢・既往症・アクティビティの
            条件別に「どこまでカバーすればよいか」を BEATRIP 編集部が整理します。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-12">
            {/* Block 1: クレカ付帯の限界 */}
            <section id="credit-limits">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl">
                    クレカ付帯保険の限界
                  </h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    まずは「足りないところ」を把握する
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {CREDIT_LIMITS.map((row) => (
                    <div key={row.item} className="px-5 py-4">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                        {row.item}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {row.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Block 2: ネット保険比較 */}
            <section id="net-insurance">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl">
                    おすすめネット保険
                  </h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    オンライン申込・出発当日まで対応の主要 5 社
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {NET_INSURANCE.map((ins) => (
                  <article
                    key={ins.name}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                      {ins.name}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                      {ins.pitch}
                    </p>
                    <p className="text-[11px] uppercase tracking-wider text-blue-700 dark:text-blue-200 font-bold">
                      向いている人: {ins.bestFor}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            {/* Block 3: 期間別の選び方 */}
            <section id="period">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl">
                    期間別の選び方
                  </h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    旅行日数で必要な補償・費用感が変わる
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {PERIOD_GUIDE.map((row) => (
                    <div key={row.duration} className="px-5 py-4">
                      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1">
                        {row.duration}
                      </p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                        {row.recommendation}
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-200 font-bold">
                        {row.budgetHint}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Block 4: 特殊ケース */}
            <section id="special-cases">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl">
                    特殊ケースの注意点
                  </h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    シニア／持病／妊娠／アクティビティ系
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SPECIAL_CASES.map((s) => (
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

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                海外旅行保険のよくある質問
              </h2>
              <FAQAccordion items={FAQS} />
            </section>

            {/* 関連リンク */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                関連コンテンツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href="/credit-cards"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    旅行クレカ比較
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    付帯保険を含むカード一覧
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    クレカ比較へ
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/esim"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    海外 eSIM 比較
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    保険＋通信は出発前にまとめて準備
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    eSIM ガイドへ
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/hawaii"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    ハワイ旅行ガイド
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    米国は医療費高め・保険は手厚めが安心
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ハワイ特集へ
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="海外旅行保険を比較"
              subtitle="出発当日まで申込可能なネット保険"
              categories={["insurance"]}
              source="insurance-landing"
            />
            <JapanesePartnersPanel
              title="付帯保険のあるクレカも"
              subtitle="クレカ付帯 + ネット保険の併用で総コストを下げる"
              categories={["credit-card"]}
              source="insurance-landing"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
