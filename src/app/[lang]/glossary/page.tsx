/**
 * /glossary — 旅行用語集
 *
 * 航空・ホテル・予約まわりの用語を 30 語以上、五十音 / アルファベット順に整理。
 * DefinedTermSet / DefinedTerm JSON-LD を発行し、各用語から関連ページへ内部リンク。
 *
 * 制約: 実在しない事実・数値を捏造しない。emoji 文字は使わない。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { BookA, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { localizeHref, type Locale } from "@/lib/i18n/locale";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 21600;

const BASE = "https://beatrip.jp";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const title = "旅行用語集 — 航空券・ホテル・予約の用語をやさしく解説 | BEATRIP";
  const description =
    "航空券・ホテル・予約まわりの用語を 35 語以上、五十音・アルファベット順にやさしく解説。LCC・コードシェア・オープンジョー・OTA・ノーショー・オーバーブッキングなど、旅行前に押さえたい言葉を網羅した用語集です。";
  return {
    title,
    description,
    keywords: [
      "旅行 用語",
      "航空券 用語",
      "ホテル 予約 用語",
      "LCC とは",
      "コードシェア とは",
      "オープンジョー",
      "OTA とは",
      "ノーショー",
      "オーバーブッキング",
      "旅行 用語集",
    ],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: isEn ? `${BASE}/en/glossary` : `${BASE}/glossary`,
      languages: {
        ja: `${BASE}/glossary`,
        en: `${BASE}/en/glossary`,
        "x-default": `${BASE}/glossary`,
      },
    },
  };
}

type Term = {
  /** 見出し語 */
  term: string;
  /** 読み (並び替え・補足用) */
  reading?: string;
  /** 定義 */
  def: string;
  /** 関連内部リンク */
  link?: { href: string; label: string };
};

/** 用語分類 */
type Group = { category: string; terms: Term[] };

const GROUPS: Group[] = [
  {
    category: "航空・フライトの用語",
    terms: [
      {
        term: "LCC",
        reading: "エルシーシー",
        def: "Low-Cost Carrier の略で、サービスを簡素化して運賃を抑えた格安航空会社のこと。手荷物や座席指定が別料金になりやすい。",
        link: { href: "/articles/guides/lcc-tips", label: "LCC を最大活用する 10 のコツ" },
      },
      {
        term: "FSC",
        reading: "エフエスシー",
        def: "Full-Service Carrier の略で、機内サービスや受託手荷物などを運賃に含むフルサービス航空会社のこと。",
      },
      {
        term: "コードシェア",
        reading: "こーどしぇあ",
        def: "1 つの便を複数の航空会社が自社便名で共同販売する仕組み。実際の運航会社と販売会社が異なることがある。",
      },
      {
        term: "オープンジョー",
        reading: "おーぷんじょー",
        def: "往路の到着地と復路の出発地が異なる旅程のこと。例えば行きは A 都市着、帰りは B 都市発といった組み方。",
      },
      {
        term: "ストップオーバー",
        reading: "すとっぷおーばー",
        def: "乗り継ぎ地で一定時間以上 (一般に 24 時間以上) 滞在すること。短時間の乗り継ぎはトランジットと呼ばれる。",
        link: { href: "/articles/guides/transit-guide", label: "乗り継ぎ・トランジットの過ごし方" },
      },
      {
        term: "トランジット",
        reading: "とらんじっと",
        def: "目的地までの途中で航空機を乗り継ぐこと。経由地で入国せず短時間で次の便に乗り換えるケースを指すことが多い。",
        link: { href: "/articles/guides/transit-guide", label: "乗り継ぎ・トランジットの過ごし方" },
      },
      {
        term: "FIX / OPEN 航空券",
        reading: "ふぃっくす おーぷん",
        def: "FIX は復路の日付などが確定で変更に制限がある航空券、OPEN は復路の日付を後から決められる航空券のこと。FIX ほど安い傾向。",
      },
      {
        term: "マイレージ",
        reading: "まいれーじ",
        def: "搭乗や提携サービス利用で貯まるポイント (マイル) を、特典航空券などに交換できる航空会社のプログラム。",
        link: { href: "/articles/guides/miles-complete-guide", label: "マイルの貯め方・使い方 完全ガイド" },
      },
      {
        term: "特典航空券",
        reading: "とくてんこうくうけん",
        def: "貯めたマイルと交換して受け取れる航空券。必要マイル数はシーズンや空席状況で変わることがある。",
        link: { href: "/articles/miles-booking-guide", label: "マイル予約ガイド" },
      },
      {
        term: "IATA / ICAO",
        reading: "あいあた いかお",
        def: "IATA は国際航空運送協会、ICAO は国際民間航空機関。空港コードには 3 文字の IATA コードと 4 文字の ICAO コードがある。",
        link: { href: "/airports", label: "空港一覧" },
      },
      {
        term: "受託手荷物",
        reading: "じゅたくてにもつ",
        def: "カウンターやセルフ機で預ける荷物のこと。重量・個数の上限があり、超過すると追加料金がかかることが多い。",
        link: { href: "/articles/guides/baggage-rules", label: "機内持ち込み・預け荷物の完全ルール" },
      },
      {
        term: "機内持ち込み手荷物",
        reading: "きないもちこみてにもつ",
        def: "座席に持ち込む荷物のこと。サイズ・重量・個数に上限があり、特に LCC では厳格な傾向がある。",
        link: { href: "/articles/guides/baggage-rules", label: "機内持ち込み・預け荷物の完全ルール" },
      },
      {
        term: "オーバーブッキング",
        reading: "おーばーぶっきんぐ",
        def: "キャンセルを見込み座席数より多く予約を受け付けること。搭乗者が定員を超えると、別便への振替や補償が行われる場合がある。",
      },
      {
        term: "ローミング",
        reading: "ろーみんぐ",
        def: "契約中の携帯回線を海外でそのまま使うこと。料金体系の確認を怠ると高額になることがある。",
        link: { href: "/articles/guides/esim-setup-guide", label: "海外で使えるスマホ/eSIM 設定ガイド" },
      },
      {
        term: "eSIM",
        reading: "いーしむ",
        def: "物理カードを差し替えずに、端末内蔵のチップへ回線情報を書き込んで使う SIM。渡航前に設定でき、海外通信に便利。",
        link: { href: "/esim", label: "eSIM 比較" },
      },
    ],
  },
  {
    category: "ホテル・宿泊の用語",
    terms: [
      {
        term: "OTA",
        reading: "おーてぃーえー",
        def: "Online Travel Agency の略で、航空券やホテルをオンラインで予約できる旅行予約サイトの総称。Booking.com や Agoda などが代表例。",
        link: { href: "/ota-sales", label: "OTA セール比較" },
      },
      {
        term: "アメニティ",
        reading: "あめにてぃ",
        def: "宿泊施設が客室に用意する備品やサービス。歯ブラシ・シャンプー・タオルなどの消耗品を指すことが多い。",
      },
      {
        term: "チェックイン / チェックアウト",
        reading: "ちぇっくいん ちぇっくあうと",
        def: "チェックインは宿泊手続きを行い入室すること、チェックアウトは退室手続きをすること。施設ごとに開始・締切時刻が決まっている。",
      },
      {
        term: "ノーショー",
        reading: "のーしょー",
        def: "予約しながら連絡なく利用しないこと。キャンセル料が満額発生したり、以後の予約に影響する場合がある。",
      },
      {
        term: "返金不可レート",
        reading: "へんきんふかれーと",
        def: "キャンセルや変更ができない代わりに割安な宿泊料金プラン。予定変更の可能性があるなら無料キャンセル可プランが安心。",
      },
      {
        term: "無料キャンセル",
        reading: "むりょうきゃんせる",
        def: "指定された期日までなら無料で予約を取り消せるプラン。返金不可レートより割高なことが多いが柔軟性が高い。",
      },
      {
        term: "ルームチャージ / パーパーソン",
        reading: "るーむちゃーじ ぱーぱーそん",
        def: "ルームチャージは 1 室あたりの料金、パーパーソンは 1 人あたりの料金。料金表示がどちらかで総額が変わるため要確認。",
      },
      {
        term: "素泊まり",
        reading: "すどまり",
        def: "食事の付かない宿泊プラン。朝食付き・2 食付きなどと区別される。",
      },
      {
        term: "ベストレート",
        reading: "べすとれーと",
        def: "ある条件下での最安料金や、公式が最安を保証する制度を指すことがある。実際の最安は日付や経路で変わるため比較が重要。",
        link: { href: "/articles/ota-compare/tokyo", label: "OTA 比較 (東京)" },
      },
      {
        term: "リゾートフィー / 観光税",
        reading: "りぞーとふぃー かんこうぜい",
        def: "宿泊料金とは別に現地で加算される施設利用料や税金。表示価格に含まれないことがあるため総額で確認する。",
      },
      {
        term: "コネクティングルーム",
        reading: "こねくてぃんぐるーむ",
        def: "室内のドアで隣室とつながる客室。家族やグループで隣同士に泊まりたいときに便利。",
        link: { href: "/articles/guides/family-travel-tips", label: "子連れ旅行を快適にするコツ" },
      },
    ],
  },
  {
    category: "予約・手続きの用語",
    terms: [
      {
        term: "電子渡航認証 (ESTA など)",
        reading: "でんしとこうにんしょう",
        def: "ビザ免除で渡航する際に、事前のオンライン申請が必要な制度の総称。渡航先により要否や名称が異なる。",
        link: { href: "/articles/guides/first-overseas-checklist", label: "初めての海外旅行 準備チェックリスト" },
      },
      {
        term: "パスポート残存期間",
        reading: "ぱすぽーとざんぞんきかん",
        def: "入国時に必要なパスポートの有効残存期間。一定期間以上を求める国があるため、渡航前に条件を確認する。",
      },
      {
        term: "ビザ",
        reading: "びざ",
        def: "他国に入国・滞在するための査証。観光・就労など目的により種類が分かれ、不要な国 (ビザ免除) もある。",
      },
      {
        term: "早割",
        reading: "はやわり",
        def: "早期に予約することで適用される割引運賃。予定が固まっているなら有効だが、変更・払戻に制限があることが多い。",
        link: { href: "/articles/guides/best-booking-timing", label: "航空券を最安で買うベストタイミング" },
      },
      {
        term: "ダイナミックプライシング",
        reading: "だいなみっくぷらいしんぐ",
        def: "需要や空席状況に応じて価格が変動する仕組み。航空券やホテルで広く使われており、同じ商品でも時期で価格が変わる。",
      },
      {
        term: "バウチャー",
        reading: "ばうちゃー",
        def: "予約完了後に発行される利用引換証。現地のチェックインやツアー参加時に提示を求められることがある。",
      },
      {
        term: "メタサーチ",
        reading: "めたさーち",
        def: "複数の予約サイトの価格を横断的に比較できる検索サービス。最安候補を素早く見つけるのに役立つ。",
        link: { href: "/ota-sales", label: "OTA セール比較" },
      },
      {
        term: "アフィリエイト",
        reading: "あふぃりえいと",
        def: "サイトのリンク経由で予約・購入が成立すると紹介料が支払われる仕組み。当サイトも一部リンクでこの仕組みを利用している。",
        link: { href: "/disclosure", label: "広告・アフィリエイト開示" },
      },
      {
        term: "海外旅行保険",
        reading: "かいがいりょこうほけん",
        def: "渡航中の病気・けが・トラブルに備える保険。クレジットカードに付帯する場合もあり、補償内容と適用条件の確認が重要。",
        link: { href: "/insurance", label: "海外旅行保険を比較" },
      },
      {
        term: "セール予測",
        reading: "せーるよそく",
        def: "過去のセール開催履歴から次回のセール時期を推測する考え方。あくまで参考情報で、開催を保証するものではない。",
        link: { href: "/articles/sale-prediction-2027", label: "2027 セール予測" },
      },
    ],
  },
];

export default async function GlossaryPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = lang === "en" ? "en" : "ja";
  const lh = (href: string) => localizeHref(href, locale);

  const allTerms = GROUPS.flatMap((g) => g.terms);

  // DefinedTermSet JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "BEATRIP 旅行用語集",
    description:
      "航空券・ホテル・予約まわりの用語をやさしく解説した旅行用語集。",
    url: `${BASE}/glossary`,
    hasDefinedTerm: allTerms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.def,
      inDefinedTermSet: `${BASE}/glossary`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />

      <section className="border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: lh("/") },
              { label: "用語集" },
            ]}
          />
          <h1 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl tracking-wide text-zinc-900 dark:text-zinc-100 leading-tight">
            旅行用語集
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            航空券・ホテル・予約まわりでよく使われる用語を、ジャンルごとにやさしく解説します。気になる言葉から、関連する詳しいガイドへも移動できます。
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <BookA className="h-3.5 w-3.5" aria-hidden="true" />
            全 {allTerms.length} 語
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-3xl flex-1 px-4 sm:px-6 py-8 sm:py-10 space-y-10"
      >
        {GROUPS.map((g) => (
          <section key={g.category}>
            <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
              {g.category}
            </h2>
            <dl className="space-y-3">
              {g.terms.map((t) => (
                <div
                  key={t.term}
                  className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                >
                  <dt className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {t.term}
                    {t.reading && (
                      <span className="ml-2 text-[11px] font-normal text-zinc-400">
                        {t.reading}
                      </span>
                    )}
                  </dt>
                  <dd className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {t.def}
                  </dd>
                  {t.link && (
                    <Link
                      href={lh(t.link.href)}
                      className="group mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 hover:underline"
                    >
                      {t.link.label}
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  )}
                </div>
              ))}
            </dl>
          </section>
        ))}

        <section>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            本用語集は旅行の理解を助けるための一般的な解説です。制度・料金・各社の規約は変更される場合があるため、実際の予約・手続きの際は各公式サイトで最新情報をご確認ください。
          </p>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
