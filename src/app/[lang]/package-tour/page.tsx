import type { Metadata } from "next";
import Link from "next/link";
import { Package, Calendar, Wallet, Users, Sparkles, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { FAQAccordion } from "@/components/ui/faq-accordion";
import { JapanesePartnersPanel } from "@/components/affiliate/japanese-partners-panel";

// ISR: 21600秒キャッシュ (6時間)
export const revalidate = 21600;

export async function generateMetadata(): Promise<Metadata> {
  const title =
    "パッケージツアー比較・予約ガイド｜国内・海外の選び方とお得に取るコツ | BEATRIP";
  const description =
    "国内・海外パッケージツアーを比較・予約。個人手配との費用・手間・自由度の違い、出発地/予算/テーマ/期間別の選び方、早期割引・直前割引・動的パッケージ（エアトリプラス等）のお得活用術まで網羅。JTB・NEWT・日本旅行・J-TRIP などBEATRIP厳選のツアー予約サイトから検索できます。";
  return {
    title,
    description,
    keywords: [
      "パッケージツアー",
      "パッケージツアー 比較",
      "パッケージツアー 予約",
      "海外ツアー",
      "国内ツアー",
      "ダイナミックパッケージ",
      "エアトリプラス",
      "ツアー 早期割引",
      "ツアー 安い",
    ],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: "https://beatrip.jp/package-tour",
      languages: {
        ja: "https://beatrip.jp/package-tour",
        en: "https://beatrip.jp/en/package-tour",
        "x-default": "https://beatrip.jp/package-tour",
      },
    },
  };
}

const COMPARISON: {
  axis: string;
  pkg: string;
  diy: string;
  winner: "pkg" | "diy" | "tie";
}[] = [
  {
    axis: "料金",
    pkg: "航空券＋ホテルが団体仕入れでまとめ買いされるため、同条件なら個人手配より割安になることが多い",
    diy: "LCC や直前セールを使えば最安値を狙えるが、ハイシーズンや人気路線では割高になりがち",
    winner: "pkg",
  },
  {
    axis: "手間",
    pkg: "1サイトで航空券・ホテル・送迎までまとめて確定。比較検討にかかる時間が圧倒的に短い",
    diy: "航空券・ホテル・現地交通を別々に予約。比較サイトの行き来と日程整合のチェックが必要",
    winner: "pkg",
  },
  {
    axis: "自由度",
    pkg: "フライト時間・ホテルが限定的。特に格安パッケージは選択肢が固定されていることが多い",
    diy: "便もホテルも自由に組み合わせ可能。延泊・周遊・複数都市にも柔軟に対応できる",
    winner: "diy",
  },
  {
    axis: "言語サポート",
    pkg: "日本の旅行会社が窓口になるため日本語でやり取り可能。現地サポートデスクがある商品も多い",
    diy: "航空会社・現地ホテルとの直接交渉が必要。英語でのトラブル対応が発生する可能性",
    winner: "pkg",
  },
  {
    axis: "失敗リスク",
    pkg: "旅行業法に基づく標準旅行業約款で保護され、欠航・遅延時の振替対応も旅行会社が手配",
    diy: "航空券とホテルが別契約なので、片方が変更になっても自己責任で再手配が必要",
    winner: "pkg",
  },
];

const CHOICE_AXES: { icon: typeof Calendar; title: string; body: string }[] = [
  {
    icon: Calendar,
    title: "出発地で選ぶ",
    body: "羽田・成田・関空・中部・福岡・新千歳など主要空港発のツアーが豊富。地方発は便数が少ない分、設定が限定されるため早めの予約が安心です。",
  },
  {
    icon: Wallet,
    title: "予算で選ぶ",
    body: "国内3泊4日¥30,000〜、海外アジア4泊¥80,000〜、ヨーロッパ7泊¥250,000〜が目安。早期割引・直前セール・閑散期で大きく変動するため、複数サイトで比較を。",
  },
  {
    icon: Sparkles,
    title: "テーマで選ぶ",
    body: "ビーチリゾート/世界遺産/グルメ/温泉/スキーなど、テーマ特化型ツアーは添乗員同行や現地ガイドつきが多く満足度が高い。組み合わせ型より割高な代わりに失敗が少ない。",
  },
  {
    icon: Users,
    title: "期間で選ぶ",
    body: "国内1泊2日〜3泊4日、海外短期4〜5日、ヨーロッパ・南米は7〜10日以上が標準。長期になるほど1日あたりの単価が下がるので、休みが取れるなら長め推奨。",
  },
];

const DESTINATIONS: { area: string; tag: string; highlight: string; days: string }[] = [
  // 国内
  { area: "沖縄", tag: "国内", highlight: "ビーチ・離島・アクティビティ。家族・カップル定番", days: "3〜5日" },
  { area: "北海道", tag: "国内", highlight: "夏は道東周遊、冬はスキー・流氷ツアーが人気", days: "3〜6日" },
  { area: "京都", tag: "国内", highlight: "新幹線＋旅館のパッケージで底値感あり", days: "2〜3日" },
  // 海外
  { area: "ハワイ", tag: "海外", highlight: "オアフ島ワイキキ中心の定番。航空券＋ホテル＋送迎込み", days: "5〜7日" },
  { area: "グアム", tag: "海外", highlight: "直行便3.5時間・週末＋αで行ける短期向け", days: "3〜5日" },
  { area: "韓国（ソウル）", tag: "海外", highlight: "週末弾丸も可能。フリープラン型が主流", days: "2〜4日" },
  { area: "台湾", tag: "海外", highlight: "台北・台中・高雄。グルメと夜市が魅力", days: "3〜5日" },
  { area: "タイ（バンコク）", tag: "海外", highlight: "都市＋ビーチリゾート併泊が定番", days: "4〜7日" },
  { area: "ヨーロッパ", tag: "海外", highlight: "周遊型は添乗員同行ツアーが安心", days: "7〜12日" },
];

const TIPS: { icon: typeof Calendar; title: string; body: string }[] = [
  {
    icon: Calendar,
    title: "早期割引（早割）",
    body: "出発3〜6ヶ月前までの予約で¥10,000〜¥50,000の割引が一般的。海外パッケージは特に早割が大きく、人気便ほど早く埋まる。",
  },
  {
    icon: Sparkles,
    title: "直前割引（直前セール）",
    body: "出発1〜3週間前の売れ残り在庫が放出される。日程が動かせる人向け。エアトリ・トラベルウエストなどで掲示。",
  },
  {
    icon: Users,
    title: "平日出発・閑散期",
    body: "月曜・火曜発は週末発より大幅に安い。GW・お盆・年末年始を避けた1月中下旬、6月、11月は底値ゾーン。",
  },
  {
    icon: Package,
    title: "動的パッケージ（エアトリプラス等）",
    body: "航空券とホテルをユーザーが自由に組み合わせて1つの「ツアー扱い」にする商品。在庫リアルタイム・自由度高めで、固定型ツアーより安くなることも多い。",
  },
];

const FAQS = [
  {
    q: "パッケージツアーは個人手配（航空券＋ホテル別予約）と比べてどれくらい安いですか？",
    a: "同条件（同じ便・同じホテル）で比較すると、パッケージツアーは個人手配より10〜30%程度安くなることが多いです。これは旅行会社が航空会社・ホテルから団体仕入れでバルク料金を引き出しているため。ただしLCC＋格安ホテルを自力で組み合わせる場合は個人手配が勝つこともあるので、必ず両方の見積もりを比較してください。",
  },
  {
    q: "パッケージツアーのキャンセル料はいつから発生しますか？",
    a: "旅行業法の標準旅行業約款に基づき、国内ツアーは出発20日前、海外ツアーは出発40日前（一部30日前）からキャンセル料が発生するのが原則です。出発7日前で30%、前日で40%、当日で50%、出発後・無連絡不参加は100%が一般的。動的パッケージや一部商品は独自規定があるため、必ず予約時に確認を。",
  },
  {
    q: "添乗員同行ツアーと添乗員なしツアーの違いは？",
    a: "添乗員同行ツアーは旅行会社のスタッフが出発から帰国まで同行し、移動・観光・トラブル対応をすべて任せられます。ヨーロッパ周遊や南米・アフリカなど初心者向けに人気。一方フリープラン型（添乗員なし）は航空券＋ホテルだけが手配され、現地は自由行動。費用は¥50,000〜¥200,000程度の差が出ます。",
  },
  {
    q: "パッケージツアーで航空機の座席指定はできますか？",
    a: "パッケージツアーは旅行会社が航空券をバルク仕入れしているため、座席指定は出発直前（24〜72時間前）のオンラインチェックイン時にしか反映されないことが多いです。隣り合わせ希望は予約時にリクエスト可能ですが確約はされません。座席を確実に指定したい場合は、追加料金（¥1,000〜¥5,000程度）で事前指定オプションを付けられる商品もあります。",
  },
  {
    q: "航空券のみ予約とパッケージツアー、どちらを選ぶべき？",
    a: "現地ホテルにこだわりがある／長期滞在／周遊や複数都市を巡る場合は航空券のみ＋ホテル個別予約が向いています。一方、定番の観光都市・短〜中期間・初めての訪問地ではパッケージツアーが手間と価格の両面で有利です。エアトリプラスなどの動的パッケージなら両者のいいとこ取りができるので、迷ったらまずパッケージで見積もって個人手配と比較を。",
  },
];

export default function PackageTourPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "パッケージツアー比較・予約ガイド｜国内・海外の選び方とお得に取るコツ",
    description:
      "国内・海外パッケージツアーを個人手配と比較し、選び方とお得に取るコツを解説。BEATRIP厳選のツアー予約サイトから検索できます。",
    inLanguage: "ja-JP",
    publisher: {
      "@type": "Organization",
      name: "BEATRIP",
      url: "https://beatrip.jp",
    },
    mainEntityOfPage: "https://beatrip.jp/package-tour",
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
      <section className="relative bg-gradient-to-br from-emerald-700 via-emerald-500 to-sky-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "パッケージツアー" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <Package className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Package Tour Guide
            </p>
          </div>
          <h1 className="font-heading text-4xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            パッケージツアー
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            国内・海外のパッケージツアーを比較・予約。個人手配との違い、選び方の4軸、
            早期割引・直前割引・動的パッケージのお得活用術を網羅。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-10">
            {/* パッケージツアー vs 個人手配 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                パッケージツアー vs 個人手配
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                料金・手間・自由度・サポート・リスクの5軸で比較
              </p>
              <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {COMPARISON.map((row) => (
                    <div key={row.axis} className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {row.axis}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            row.winner === "pkg"
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                              : row.winner === "diy"
                                ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                          }`}
                        >
                          {row.winner === "pkg"
                            ? "パッケージ優位"
                            : row.winner === "diy"
                              ? "個人手配優位"
                              : "互角"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-900/20 px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-1">
                            パッケージツアー
                          </p>
                          <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed">
                            {row.pkg}
                          </p>
                        </div>
                        <div className="rounded-lg bg-sky-50/60 dark:bg-sky-900/20 px-3 py-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 mb-1">
                            個人手配
                          </p>
                          <p className="text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed">
                            {row.diy}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 選び方 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                パッケージツアーの選び方
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                出発地・予算・テーマ・期間の4軸で絞り込む
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHOICE_AXES.map((c) => (
                  <div
                    key={c.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <c.icon className="h-4 w-4 text-emerald-500" />
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {c.title}
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {c.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* 人気の方面 */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-2 sm:text-3xl">
                人気の方面
              </h2>
              <p className="text-sm text-zinc-500 mb-6">
                国内3エリア・海外6エリアの定番パッケージツアー
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DESTINATIONS.map((d) => (
                  <div
                    key={d.area}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {d.area}
                          </h3>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              d.tag === "国内"
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200"
                                : "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
                            }`}
                          >
                            {d.tag}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">所要 {d.days}</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1.5 leading-relaxed">
                          {d.highlight}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* お得に取るコツ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                お得に取るコツ
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TIPS.map((t) => (
                  <div
                    key={t.title}
                    className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <t.icon className="h-4 w-4 text-emerald-500" />
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
                パッケージツアーのよくある質問
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
                  href="/cruise"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    クルーズ旅行
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    船旅・客船パッケージの予約ガイド
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    クルーズ一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/hawaii"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    ハワイ旅行
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    オアフ・マウイ・ハワイ島の予約ガイド
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ハワイ特集を見る
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/hotels"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    ホテルを個別に探す
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    都市別ホテル比較・予約
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ホテル一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/airlines"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    航空券を個別に探す
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    航空会社別の路線・直販情報
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    航空会社一覧
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー: パッケージツアー partner */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="パッケージツアーの予約・比較"
              subtitle="JTB・NEWT・日本旅行・エアトリプラスほか厳選"
              categories={["tour-package", "tour-overseas"]}
              source="package-tour-landing"
            />

            {/* 補助 panel: ホテル単独 + 航空券単独 */}
            <JapanesePartnersPanel
              title="ホテル単独 ＋ 航空券単独で組み合わせ"
              subtitle="動的パッケージ派・自由度重視の方向け"
              categories={["hotel-overseas", "flight-overseas", "flight-domestic"]}
              source="package-tour-landing"
            />
          </aside>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
