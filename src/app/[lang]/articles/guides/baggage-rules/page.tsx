import type { Metadata } from "next";
import {
  buildGuideMetadata,
  GuidePage,
  type GuideContent,
} from "@/lib/articles/guide-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 21600;

const CONTENT: GuideContent = {
  slug: "baggage-rules",
  metaTitle: "機内持ち込み・預け荷物の完全ルール — サイズ・重量・液体物の基準",
  metaDescription:
    "機内持ち込みと預け荷物の基本ルールを整理。サイズ・重量・個数の考え方、液体物の制限、モバイルバッテリーなど機内に持ち込めないもの、超過料金を避けるコツを解説します。",
  keywords: [
    "機内持ち込み サイズ",
    "預け荷物 重量",
    "液体物 持ち込み",
    "モバイルバッテリー 機内",
    "受託手荷物 ルール",
    "手荷物 超過料金",
    "飛行機 荷物 ルール",
  ],
  title: "機内持ち込み・預け荷物の完全ルール",
  lede:
    "飛行機の荷物ルールは、機内持ち込みと預け荷物で基準が異なり、航空会社や運賃クラスによっても変わります。サイズ・重量・液体物・持ち込み禁止品など、押さえておくべき基本を整理しました。実際の上限は予約した航空会社の最新規定を必ず確認してください。",
  published: "2026-06-10",
  sections: [
    {
      heading: "機内持ち込みと預け荷物の違い",
      paragraphs: [
        "機内持ち込み手荷物は座席に持ち込む荷物で、サイズ・重量・個数に上限があります。預け荷物 (受託手荷物) はカウンターやセルフ機で預ける荷物で、こちらにも重量・個数・サイズの上限があります。",
        "貴重品・壊れやすいもの・モバイルバッテリーなどは機内持ち込みにすべきものがある一方、液体物や刃物など機内に持ち込めないものは預け荷物に回す必要があります。",
      ],
    },
    {
      heading: "サイズと重量の考え方",
      bullets: [
        { label: "機内持ち込み", text: "3 辺の合計や各辺の長さ、合計重量に上限がある。LCC は特に厳格な傾向。" },
        { label: "預け荷物", text: "1 個あたりの重量上限と個数の上限がある。超過すると追加料金。" },
        { label: "運賃クラス差", text: "上位クラスや上級会員は無料許容量が多いことがある。" },
      ],
      note: "具体的なサイズ・重量の数値は航空会社・路線・運賃で異なります。予約した会社の規定を必ず確認してください。",
    },
    {
      heading: "液体物の機内持ち込み制限",
      paragraphs: [
        "国際線では、機内持ち込みの液体物に容器の容量と合計量の制限を設ける国・空港が多くあります。化粧品・飲み物・ジェル類などが対象になり、規定を超えるものは保安検査で没収されることがあります。",
        "飲み物は保安検査後に購入するか、預け荷物に入れるのが安全です。医薬品やベビー用品など例外が認められる場合もありますが、申告が必要なことがあります。",
      ],
    },
    {
      heading: "機内に持ち込めない・預けられないもの",
      bullets: [
        { label: "モバイルバッテリー・予備電池", text: "リチウム電池は預け荷物に入れられず、機内持ち込みが原則。容量制限あり。" },
        { label: "刃物・ライター類", text: "刃物は機内持ち込み不可。ライターは数量制限がある場合がある。" },
        { label: "危険物", text: "可燃物・スプレー類などは持ち込み・預け入れに制限がある。" },
      ],
      note: "リチウムバッテリーや危険物の扱いは安全規則で細かく定められています。容量や個数の制限を事前に確認してください。",
    },
    {
      heading: "超過料金を避けるコツ",
      bullets: [
        { label: "事前購入", text: "預け荷物は空港追加より Web 事前購入が割安なことが多い。" },
        { label: "重さを量る", text: "出発前に自宅で重量を量り、上限に収める。" },
        { label: "圧縮・厳選", text: "圧縮袋や厳選パッキングで容量と重量を抑える。" },
      ],
    },
  ],
  faqs: [
    {
      q: "機内持ち込みできる手荷物のサイズは?",
      a: "3 辺の合計や各辺の長さ、合計重量に上限がありますが、具体的な数値は航空会社・運賃クラスで異なります。特に LCC は厳格な傾向があるため、予約した会社の規定を確認してください。",
    },
    {
      q: "液体物はどのくらい機内に持ち込めますか?",
      a: "国際線では容器の容量と合計量に制限を設ける空港が多く、超過分は保安検査で没収されることがあります。飲み物は保安検査後の購入か預け荷物に入れるのが安全です。",
    },
    {
      q: "モバイルバッテリーは預けられますか?",
      a: "リチウム電池を含むモバイルバッテリーは預け荷物に入れられず、機内持ち込みが原則です。容量により持ち込み可否や個数の制限があるため、事前に確認してください。",
    },
    {
      q: "預け荷物の超過料金を避けるには?",
      a: "預け荷物は空港で追加するより Web で事前購入する方が割安なことが多いです。出発前に自宅で重量を量り、上限内に収めるのも効果的です。",
    },
  ],
  aspCategories: ["flight-domestic", "flight-overseas", "esim-wifi", "insurance"],
  aspTitle: "航空券・旅行サービスを比較",
  aspSubtitle: "航空券や旅行の備えを信頼できるサービスから比較",
  aspSource: "guide-baggage-rules",
  relatedLinks: [
    { href: "/articles/guides/lcc-tips", label: "LCC を最大活用する 10 のコツ", desc: "手荷物が別料金の LCC を賢く使う" },
    { href: "/articles/guides/first-overseas-checklist", label: "初めての海外旅行 準備チェックリスト", desc: "荷造り前に確認したい準備" },
    { href: "/articles/guides/transit-guide", label: "乗り継ぎ・トランジットの過ごし方", desc: "預け荷物の受け取り直しにも触れる" },
    { href: "/articles/guides/family-travel-tips", label: "子連れ旅行を快適にするコツ", desc: "ベビー用品の持ち込みなど" },
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
