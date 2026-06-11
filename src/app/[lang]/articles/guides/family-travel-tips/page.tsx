import type { Metadata } from "next";
import {
  buildGuideMetadata,
  GuidePage,
  type GuideContent,
} from "@/lib/articles/guide-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;

const CONTENT: GuideContent = {
  slug: "family-travel-tips",
  metaTitle: "子連れ旅行を快適にするコツ — 移動・宿選び・持ち物のポイント",
  metaDescription:
    "子連れ旅行を快適にするための実践的なコツを整理。フライトや移動の工夫、子連れに優しい宿の選び方、持ち物・スケジュール作り・体調管理のポイントを分かりやすく解説します。",
  keywords: [
    "子連れ 旅行 コツ",
    "子連れ 飛行機",
    "子連れ ホテル 選び方",
    "赤ちゃん 旅行 持ち物",
    "家族旅行 計画",
    "子連れ 海外旅行",
    "子連れ 旅行 準備",
  ],
  title: "子連れ旅行を快適にするコツ",
  lede:
    "子連れ旅行は、移動・宿選び・持ち物・スケジュールに大人だけの旅行とは違う配慮が必要です。子どもの負担を減らし、家族みんなが楽しめるようにするための実践的なコツを整理しました。航空会社や宿のサービスは変わるため、最新は各公式で確認してください。",
  published: "2026-06-10",
  sections: [
    {
      heading: "移動を乗り切る工夫",
      paragraphs: [
        "長時間の移動は子どもにとって負担になりがちです。機内や車内で退屈しないよう、おもちゃ・絵本・動画など気を紛らわせるものを用意し、耳抜きのために離着陸時に飲み物や軽食を準備しておくと安心です。",
      ],
      bullets: [
        { label: "座席の工夫", text: "通路側や前方席など、移動や着席のしやすい席を検討する。" },
        { label: "ベビー用品の確認", text: "ベビーカーや抱っこ紐の機内・空港での扱いを事前に確認する。" },
        { label: "余裕ある乗り継ぎ", text: "子連れは手続きに時間がかかるため、接続時間は長めに取る。" },
      ],
    },
    {
      heading: "子連れに優しい宿の選び方",
      bullets: [
        { label: "添い寝・ベッド構成", text: "添い寝可否、ベッドの広さ、ベビーベッドの貸出を確認する。" },
        { label: "設備", text: "電子レンジ・冷蔵庫・洗濯設備があると乳幼児連れに便利。" },
        { label: "立地", text: "観光地や駅・空港に近いと移動の負担が減る。" },
      ],
      note: "添い寝の年齢条件やベビーベッドの数は宿により異なります。予約前に確認するか宿へ問い合わせましょう。",
    },
    {
      heading: "持ち物のポイント",
      checklist: true,
      bullets: [
        { label: "着替え・衛生用品", text: "汚れや天候の変化に備えて多めに用意する。" },
        { label: "常備薬・体温計", text: "使い慣れた薬や体調管理グッズを持参する。" },
        { label: "食べ慣れたもの", text: "現地で口に合わない場合に備え、軽食やおやつを用意する。" },
        { label: "母子手帳・保険証", text: "急な受診に備えて必要書類を携帯する。" },
      ],
    },
    {
      heading: "スケジュールは詰め込みすぎない",
      paragraphs: [
        "大人のペースで予定を詰め込むと、子どもが疲れてぐずったり体調を崩したりしがちです。観光は欲張らず、昼寝や休憩の時間を意識的に組み込むと一日が安定します。",
        "宿に早めに戻る日を設けたり、悪天候時の屋内プランを用意しておくと、予定変更にも柔軟に対応できます。",
      ],
    },
    {
      heading: "健康と安全への備え",
      bullets: [
        { label: "体調管理", text: "睡眠・水分・食事のリズムを崩しすぎないようにする。" },
        { label: "迷子対策", text: "連絡先メモを持たせる、集合場所を決めるなど事前に取り決める。" },
        { label: "海外なら保険", text: "海外では子どもの急な受診に備えて旅行保険を検討する。" },
      ],
    },
  ],
  faqs: [
    {
      q: "子連れのフライトで気をつけることは?",
      a: "離着陸時の耳抜き用に飲み物や軽食を用意し、退屈対策におもちゃや絵本を持参すると安心です。ベビーカーや抱っこ紐の機内・空港での扱いは事前に航空会社へ確認しましょう。",
    },
    {
      q: "子連れに向いた宿はどう選べばいいですか?",
      a: "添い寝の可否やベビーベッドの貸出、電子レンジ・冷蔵庫・洗濯設備の有無、観光地や駅・空港への近さを基準にすると選びやすくなります。条件は宿により異なるため予約前に確認しましょう。",
    },
    {
      q: "子連れ旅行のスケジュールの組み方は?",
      a: "予定を詰め込みすぎず、昼寝や休憩を意識的に入れるのがコツです。宿に早めに戻る日や悪天候時の屋内プランを用意しておくと、子どもの体調や気分の変化に対応しやすくなります。",
    },
    {
      q: "海外への子連れ旅行で特に必要な準備は?",
      a: "母子手帳や保険証など必要書類の携帯、使い慣れた常備薬の持参、そして子どもの急な受診に備えた海外旅行保険の検討が挙げられます。渡航先の制度は事前に確認してください。",
    },
  ],
  aspCategories: ["tour-package", "insurance", "flight-domestic", "flight-overseas"],
  aspTitle: "家族旅行のツアー・保険を比較",
  aspSubtitle: "家族向けツアーや旅行保険を信頼できるサービスから比較",
  aspSource: "guide-family-travel-tips",
  relatedLinks: [
    { href: "/articles/rankings/family", label: "ファミリー向けホテル TOP 10", desc: "子連れに優しい設備・キッズ対応" },
    { href: "/articles/guides/first-overseas-checklist", label: "初めての海外旅行 準備チェックリスト", desc: "家族での渡航準備の全体像" },
    { href: "/articles/guides/baggage-rules", label: "機内持ち込み・預け荷物の完全ルール", desc: "ベビー用品の持ち込みにも触れる" },
    { href: "/insurance", label: "海外旅行保険を比較", desc: "子どもの急な受診に備える" },
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
