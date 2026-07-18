import type { Metadata } from "next";
import {
  buildGuideMetadata,
  GuidePage,
  type GuideContent,
} from "@/lib/articles/guide-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;

const CONTENT: GuideContent = {
  slug: "miles-complete-guide",
  metaTitle: "マイルの貯め方・使い方 完全ガイド — 初心者向けに基礎から解説",
  metaDescription:
    "航空会社のマイルの仕組みを基礎から解説。フライト・クレジットカード・提携サービスでの貯め方、特典航空券への使い方、有効期限の管理まで初心者向けに整理しました。",
  keywords: [
    "マイル 貯め方",
    "マイル 使い方",
    "マイル とは",
    "特典航空券",
    "ANA マイル",
    "JAL マイル",
    "マイル クレジットカード",
    "マイル 有効期限",
  ],
  title: "マイルの貯め方・使い方 完全ガイド",
  lede:
    "航空会社のマイレージ (マイル) は、フライトや日常の支払いで貯めて特典航空券などに交換できる仕組みです。基本の貯め方・使い方・有効期限の管理を初心者向けに整理しました。具体的な交換レートや特典は各社・時期で変わるため、最新は公式サイトで確認してください。",
  published: "2026-06-10",
  sections: [
    {
      heading: "マイルとは何か",
      paragraphs: [
        "マイルは航空会社のロイヤルティプログラム (マイレージ) のポイントです。搭乗や提携サービスの利用で貯まり、特典航空券・座席アップグレード・提携ポイントへの交換などに使えます。",
        "貯まる量や交換に必要なマイル数は航空会社・路線・シーズン・運賃クラスによって異なります。",
      ],
    },
    {
      heading: "マイルの貯め方",
      bullets: [
        { label: "フライトで貯める", text: "搭乗距離や運賃クラスに応じてマイルが積算される。提携航空会社の便も対象になることがある。" },
        { label: "クレジットカードで貯める", text: "マイルが貯まる提携カードを日常の支払いに使う方法。還元率や年会費を比較して選ぶ。" },
        { label: "提携サービスで貯める", text: "ショッピング・ホテル・ポイント交換など、提携先の利用でマイルを貯める。" },
      ],
      note: "カードや提携サービスの還元率・条件は変更されることがあります。申込前に最新の内容を確認してください。",
      cta: {
        href: "/credit-cards",
        label: "マイルが貯まるクレジットカードを比較",
        desc: "年会費・還元率・付帯特典を目的別に整理。手持ちのポイントをどのマイルに変えるべきかも分かります",
      },
    },
    {
      heading: "マイルの使い方",
      paragraphs: [
        "代表的な使い道は特典航空券への交換です。同じ路線でも、必要マイル数はシーズンや空席状況で変わることがあります。座席のアップグレードや提携ポイントへの交換に使える場合もあります。",
      ],
      bullets: [
        { label: "特典航空券", text: "最も価値が出やすい使い道。繁忙期は必要マイルや空席に注意。" },
        { label: "アップグレード", text: "上位クラスへの変更にマイルを充てられる場合がある。" },
        { label: "ポイント・商品交換", text: "提携ポイントや商品への交換ができることもある。" },
      ],
      cta: {
        href: "/miles",
        label: "特典航空券の必要マイルとセール最安値を比較する",
        desc: "ANA・JALの目的地別の必要マイル数と、観測中の現金セール最安値を並べて試算。シーズン別・カード別に何ヶ月で貯まるかも分かります",
      },
    },
    {
      heading: "有効期限の管理",
      paragraphs: [
        "マイルには有効期限が設定されていることが多く、期限を過ぎると失効します。せっかく貯めたマイルを無駄にしないよう、残高と期限を定期的に確認しましょう。",
        "一部のプログラムでは、利用や積算があると期限が延びる仕組みや、上級会員向けに期限が緩和される制度がある場合もあります。",
      ],
    },
    {
      heading: "初心者が押さえるべきポイント",
      bullets: [
        { label: "プログラムを絞る", text: "貯めるプログラムを分散させると貯まりにくい。よく使う航空会社に集約する。" },
        { label: "繁忙期は早めに", text: "特典航空券は人気日程ほど早く埋まる。予定が決まったら早めに探す。" },
        { label: "総額で判断する", text: "マイル交換が常に最安とは限らない。現金購入と比較して使い道を選ぶ。" },
      ],
    },
  ],
  faqs: [
    {
      q: "マイルはどうやって貯めるのが効率的ですか?",
      a: "フライトに加えて、マイルが貯まる提携クレジットカードを日常の支払いに使う方法が一般的です。貯めるプログラムをよく使う航空会社に集約すると効率が上がります。",
    },
    {
      q: "マイルの一番お得な使い道は?",
      a: "一般に特典航空券への交換が価値を出しやすい使い道とされます。ただし必要マイル数や空席はシーズンで変わるため、現金購入と比較して判断するのが確実です。",
    },
    {
      q: "マイルに有効期限はありますか?",
      a: "多くのプログラムで有効期限が設定されており、期限を過ぎると失効します。残高と期限を定期的に確認しましょう。利用で期限が延びる仕組みを持つプログラムもあります。",
    },
    {
      q: "特典航空券は繁忙期でも取れますか?",
      a: "繁忙期は特典航空券の空席が早く埋まる傾向があります。人気日程を狙う場合は、予定が決まり次第なるべく早く検索・予約するのが安全です。",
    },
  ],
  aspCategories: ["credit-card", "flight-overseas", "flight-domestic", "insurance"],
  aspTitle: "マイルが貯まるカード・航空券を比較",
  aspSubtitle: "マイル系クレジットカードや航空券を信頼できるサービスから比較",
  aspSource: "guide-miles-complete-guide",
  // 記事を読んだ人をそのまま各社の現物セールへ送る (回遊率向上)。
  // コードは airlines マスタから導出されるためリンク切れが起きない。
  airlineLinks: {
    title: "FSC 各社のセール実績・時期",
    type: "FSC",
  },
  relatedLinks: [
    { href: "/miles", label: "マイル獲得シミュレーター", desc: "特典航空券×セール最安×クレカ試算を1画面で" },
    { href: "/credit-cards", label: "旅行系クレカを比較", desc: "マイル・保険・ラウンジで選ぶ" },
    { href: "/articles/miles-booking-guide", label: "マイル予約ガイド", desc: "JAL/ANA マイルで予約 完全ガイド" },
    { href: "/articles/guides/best-booking-timing", label: "航空券を最安で買うベストタイミング", desc: "予約時期の考え方" },
    { href: "/articles/guides/lcc-tips", label: "LCC を最大活用する 10 のコツ", desc: "格安航空券で失敗しない使い方" },
  ],
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return buildGuideMetadata(CONTENT, lang);
}

export default async function Page({ params }: Props) {
  const { lang } = await params;
  return <GuidePage content={CONTENT} lang={lang} />;
}
