import type { Metadata } from "next";
import Link from "next/link";
import {
  CreditCard,
  Plane,
  Sparkles,
  ArrowRight,
  Wallet,
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
    ? "Travel credit cards in Japan — no-fee, lounge access, and premium | BEATRIP"
    : "旅行に強いクレジットカード比較｜年会費無料・空港ラウンジ・プレミアム | BEATRIP";
  const description = isEn
    ? "Compare travel-friendly credit cards available in Japan, sorted by use case. Best value / no annual fee (Rakuten, JCB CARD W, Recruit, Life, AEON), travel-focused with airport lounge access (d Card GOLD, SMBC NL, EPOS, Saison), and premium / status (Amex, Diners, JAL, ANA). We break down annual fees, points rates, insurance limits, and lounge eligibility."
    : "旅行用クレジットカードを目的別に比較。コスパ重視・年会費無料（楽天 / JCB CARD W / リクルート / ライフ / イオン）、旅行特化・空港ラウンジ（dカード GOLD / 三井住友 NL / エポス / セゾン）、プレミアム・ステータス（アメックス / ダイナース / JAL / ANA）の 3 セグメントで、年会費・還元率・補償額・ラウンジ条件を整理。BEATRIP 編集部が解説します。";
  const path = isEn ? "/en/credit-cards" : "/credit-cards";
  return {
    title,
    description,
    keywords: isEn
      ? ["travel credit card Japan", "no annual fee credit card", "JCB Card W", "Rakuten Card", "d Card Gold", "EPOS card travel", "credit card travel insurance", "airport lounge card", "Priority Pass"]
      : ["旅行 クレジットカード", "年会費無料 クレカ", "JCB CARD W", "楽天カード", "dカード GOLD", "リクルートカード", "三井住友カード NL", "エポスカード 海外旅行", "海外旅行保険 クレカ", "空港ラウンジ カード", "プライオリティ・パス"],
    openGraph: { title, description, type: "website" },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/credit-cards",
        en: "https://beatrip.jp/en/credit-cards",
        "x-default": "https://beatrip.jp/credit-cards",
      },
    },
  };
}

type CardEntry = {
  name: string;
  annualFee: string;
  earningRate: string;
  insurance: string;
  lounge: string;
  pitch: string;
};

// セグメント 1: コスパ重視・年会費無料
const FREE_CARDS: CardEntry[] = [
  {
    name: "楽天カード",
    annualFee: "永年無料",
    earningRate: "100 円につき 1 ポイント（楽天市場で 3 倍・楽天トラベルで 1%+）",
    insurance: "海外旅行傷害保険 最高 2,000 万円（利用付帯）",
    lounge: "なし",
    pitch: "楽天トラベルとの相性が抜群。楽天ポイントでホテル予約に直接充当できる旅行ユーザーの定番 1 枚目。",
  },
  {
    name: "JCB CARD W",
    annualFee: "永年無料（39 歳以下限定で申込）",
    earningRate: "100 円につき 2 ポイント（常時 Oki Doki ポイント 2 倍）",
    insurance: "海外旅行傷害保険 最高 2,000 万円（利用付帯）",
    lounge: "なし（JCB プラザ ラウンジは海外で利用可）",
    pitch: "若年層なら年会費無料で還元率 1%。Amazon・スタバ・セブンで還元率が跳ね上がる。",
  },
  {
    name: "リクルートカード",
    annualFee: "永年無料",
    earningRate: "100 円につき 1.2 ポイント（公共料金・税金もポイント対象）",
    insurance: "海外旅行傷害保険 最高 2,000 万円（利用付帯）",
    lounge: "なし",
    pitch: "年会費無料カードで還元率 1.2% は最高クラス。じゃらん・ホットペッパーで還元率 3〜4% に。",
  },
  {
    name: "ライフカード",
    annualFee: "永年無料",
    earningRate: "1,000 円につき 1 ポイント（誕生月は 3 倍）",
    insurance: "なし（海外旅行は別途加入を推奨）",
    lounge: "なし",
    pitch: "誕生月還元 3 倍・初年度ポイント 1.5 倍と独自施策が強い。学生向けデザインも豊富。",
  },
  {
    name: "イオンカードセレクト",
    annualFee: "永年無料",
    earningRate: "200 円につき 1 ポイント（イオン系列で常時 2 倍・5%off 日あり）",
    insurance: "なし（カードによる）",
    lounge: "なし",
    pitch: "イオン・マックスバリュ系での 5%off 日が強力。WAON 一体型でキャッシュレス完結。",
  },
];

// セグメント 2: 旅行特化・空港ラウンジ
const TRAVEL_CARDS: CardEntry[] = [
  {
    name: "dカード GOLD",
    annualFee: "11,000 円（税込）",
    earningRate: "100 円につき 1 ポイント（ドコモ・ahamo 利用料金は 10% 還元）",
    insurance: "海外旅行傷害保険 最高 1 億円（利用付帯）",
    lounge: "国内主要空港ラウンジ無料",
    pitch: "ドコモ料金 10% 還元でドコモユーザーなら年会費を回収できる。空港ラウンジ＋ケータイ補償 10 万円も付帯。",
  },
  {
    name: "三井住友カード（NL）",
    annualFee: "永年無料",
    earningRate: "対象店舗で最大 7%（セブン・ローソン・マック等）",
    insurance: "海外旅行傷害保険 最高 2,000 万円（利用付帯）",
    lounge: "なし（ゴールド NL で国内主要空港ラウンジ無料）",
    pitch: "ナンバーレスでセキュリティ◎。対象コンビニ・飲食で最大 7% 還元はキャッシュレス決済で抜きん出る。",
  },
  {
    name: "エポスカード",
    annualFee: "永年無料",
    earningRate: "200 円につき 1 ポイント（マルイ・モディで 2 倍）",
    insurance: "海外旅行傷害保険 最高 3,000 万円（疾病治療 270 万円・自動付帯）",
    lounge: "ゴールド招待時に国内空港ラウンジ無料",
    pitch: "年会費無料で持っているだけで海外旅行保険が自動付帯。学生・短期出張のサブカードとして定番。",
  },
  {
    name: "セゾン・ブルー・アメックス",
    annualFee: "1,100 円（26 歳以下は無料）",
    earningRate: "1,000 円につき 1 ポイント（永久不滅）／海外利用 2 倍",
    insurance: "海外旅行傷害保険 最高 3,000 万円（自動付帯）",
    lounge: "ゴールド以上で国内ラウンジ無料",
    pitch: "若年層は年会費無料で海外旅行保険を確保。永久不滅ポイントの失効なしで貯められる。",
  },
];

// セグメント 3: プレミアム・ステータス (env 設定時のみ partner 表示)
const PREMIUM_CARDS: CardEntry[] = [
  {
    name: "アメリカン・エキスプレス・ゴールド・プリファード・カード",
    annualFee: "39,600 円（税込）",
    earningRate: "100 円につき 1 ポイント（対象加盟店で 3 倍）",
    insurance: "海外旅行傷害保険 最高 1 億円（利用付帯）／航空便遅延補償あり",
    lounge: "国内主要空港ラウンジ 同伴者 1 名まで無料",
    pitch: "ゴールド帯ながら補償額がプラチナ並み。家族特約・航空便遅延・手荷物遅延もカバー。",
  },
  {
    name: "アメリカン・エキスプレス・プラチナ・カード",
    annualFee: "165,000 円（税込）",
    earningRate: "100 円につき 1 ポイント（メンバーシップ・リワード）",
    insurance: "海外旅行傷害保険 最高 1 億円（自動付帯）",
    lounge: "プライオリティ・パス（プレステージ）無料・センチュリオン ラウンジ利用可",
    pitch: "コンシェルジュ・ホテルメンバーシップ（Marriott / Hilton 上級会員）など旅行特典が網羅的。",
  },
  {
    name: "ダイナースクラブカード",
    annualFee: "24,200 円（税込）",
    earningRate: "100 円につき 1 ポイント",
    insurance: "海外旅行傷害保険 最高 1 億円（利用付帯）",
    lounge: "国内外 1,300 ヶ所以上のラウンジ利用可・コンパニオンカード追加無料",
    pitch: "グルメ優待・空港ラウンジ網が独自に強い。プライオリティ・パスとは別系統のネットワーク。",
  },
  {
    name: "JAL カード CLUB-A ゴールド（マイル特化）",
    annualFee: "17,600 円〜",
    earningRate: "100 円につき 1 マイル（ショッピングマイル・プレミアム標準付帯）",
    insurance: "海外旅行傷害保険 最高 5,000 万円〜 1 億円（自動付帯）",
    lounge: "国内主要空港・ハワイ ホノルル ラウンジ無料",
    pitch: "JAL 利用者がマイル・保険・ラウンジを 1 枚に集約できる定番。家族特約付き。",
  },
];

const SEGMENTS: { id: string; title: string; subtitle: string; icon: typeof Plane; cards: CardEntry[]; partnerCategories: ("credit-card")[] }[] = [
  {
    id: "free",
    title: "コスパ重視・年会費無料",
    subtitle: "1 枚目に持つメインカード・サブカードを探している人向け",
    icon: Wallet,
    cards: FREE_CARDS,
    partnerCategories: ["credit-card"],
  },
  {
    id: "travel",
    title: "旅行特化・空港ラウンジ",
    subtitle: "ラウンジ・海外旅行保険を重視する出張・年数回の旅行向け",
    icon: Plane,
    cards: TRAVEL_CARDS,
    partnerCategories: ["credit-card"],
  },
  {
    id: "premium",
    title: "プレミアム・ステータス",
    subtitle: "年会費を払ってでも補償額・コンシェルジュ・ステータスを取りたい人向け",
    icon: Sparkles,
    cards: PREMIUM_CARDS,
    partnerCategories: ["credit-card"],
  },
];

const FAQS = [
  {
    q: "クレジットカードの海外旅行保険だけで足りますか？",
    a: "短期 (1〜2 週間) かつ持病なし・若年層であれば、ゴールド以上のクレカ付帯保険でカバーできるケースが多いです。ただし疾病治療費はクレカ付帯で 200〜500 万円程度が一般的で、米国など医療費が高い国では不足することがあります。長期渡航・シニア・持病ありの場合は別途ネット保険への加入を推奨します。詳しくは BEATRIP の保険比較ページをご参照ください。",
  },
  {
    q: "マイルを貯めるならどのカードが効率的ですか？",
    a: "頻繁に使う航空会社が決まっているなら JAL カード／ANA カードが定番です。複数社を使い分けるなら、アメックス・スカイ・トラベラー（提携 15 社）やマリオット ボンヴォイ アメックス（複数航空会社へ移行可）が柔軟です。年会費とボーナスマイル・移行手数料を踏まえて回収可能なフライト頻度を試算しましょう。",
  },
  {
    q: "プライオリティ・パスはどのカードに付帯しますか？",
    a: "アメックス・プラチナ（プレステージ会員）、楽天プレミアム、JCB プラチナ、セゾン プラチナ・ビジネス アメックス などが代表例です。プラン（スタンダード／プラス／プレステージ）によって年間利用可能回数が異なり、プレステージは回数無制限。空港ラウンジを年 10 回以上使うなら年会費の元が取れます。",
  },
  {
    q: "年会費の高いゴールド・プラチナはどう判断すれば？",
    a: "「保険補償」「ラウンジ年間利用回数」「ポイント還元」「コンシェルジュ／ホテル特典」を金額換算して比較します。例えばアメックス ゴールド（39,600 円）の場合、海外旅行保険 1 億円・空港ラウンジ・ホテル無料朝食特典など 4〜5 万円相当の利用があれば回収できる設計です。年に 1 回も海外渡航しないなら過剰スペックになります。",
  },
  {
    q: "短期渡航だけならクレカは何枚必要？",
    a: "決済用 1 枚（VISA / Mastercard 推奨）＋海外旅行保険サブ 1 枚（エポス・セゾン ブルー等の年会費無料）の 2 枚体制が無理なく始めやすいです。決済不可・盗難に備え、ブランドが異なる 2 枚を別の場所に保管するのが安全です。長期・出張が多いならゴールド・プラチナへ集約を検討してください。",
  },
];

export default async function CreditCardsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "旅行に強いクレジットカード比較｜年会費無料・空港ラウンジ・プレミアム",
    description:
      "旅行用クレジットカードを目的別 3 セグメント (コスパ重視・年会費無料／旅行特化・空港ラウンジ／プレミアム・ステータス) で比較。",
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
    mainEntityOfPage: "https://beatrip.jp/credit-cards",
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
      <section className="relative bg-gradient-to-br from-amber-900 via-amber-700 to-rose-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-12">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "クレジットカード比較" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-4">
            <CreditCard className="h-8 w-8" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Travel Credit Card Guide
            </p>
          </div>
          <h1 className="font-heading text-3xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            旅行に強いクレジットカード比較
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/90 max-w-2xl">
            海外旅行保険・マイル・空港ラウンジを目的別に整理。
            年会費の元が取れる使い方と、選び方の判断軸を BEATRIP 編集部が解説します。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-12">
            {/* セグメント別カード */}
            {SEGMENTS.map((seg) => (
              <section key={seg.id} id={seg.id}>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200">
                    <seg.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl">
                      {seg.title}
                    </h2>
                    <p className="text-sm text-zinc-500 mt-0.5">{seg.subtitle}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {seg.cards.map((card) => (
                    <article
                      key={card.name}
                      className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5"
                    >
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                        {card.name}
                      </h3>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-3">
                        {card.pitch}
                      </p>
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-zinc-400">
                            年会費
                          </dt>
                          <dd className="text-zinc-700 dark:text-zinc-200 mt-0.5">{card.annualFee}</dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-zinc-400">
                            還元率
                          </dt>
                          <dd className="text-zinc-700 dark:text-zinc-200 mt-0.5">{card.earningRate}</dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-zinc-400">
                            海外旅行保険
                          </dt>
                          <dd className="text-zinc-700 dark:text-zinc-200 mt-0.5">{card.insurance}</dd>
                        </div>
                        <div>
                          <dt className="font-bold uppercase tracking-wider text-zinc-400">
                            空港ラウンジ
                          </dt>
                          <dd className="text-zinc-700 dark:text-zinc-200 mt-0.5">{card.lounge}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            {/* FAQ */}
            <section>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-6 sm:text-3xl">
                クレジットカードのよくある質問
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
                  href="/insurance"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    海外旅行保険の選び方
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    クレカ付帯 vs ネット保険を完全比較
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    保険比較を見る
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
                    現地通信もアプリ完結で
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    eSIM ガイドへ
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
                <Link
                  href="/package-tour"
                  className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                    パッケージツアー比較
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    マイル積算対象のツアーも
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                    ツアー一覧へ
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* サイドバー: credit-card partner */}
          <aside className="space-y-6">
            <JapanesePartnersPanel
              title="旅行に強いクレカを比較"
              subtitle="マイル・保険・ラウンジに強い厳選カード"
              categories={["credit-card"]}
              source="credit-cards-landing"
            />
            <JapanesePartnersPanel
              title="保険もあわせて準備"
              subtitle="クレカ付帯で足りない部分はネット保険で補強"
              categories={["insurance"]}
              source="credit-cards-landing"
            />
          </aside>
        </div>
      </main>

      <SiteFooter lang={lang} />
    </>
  );
}
