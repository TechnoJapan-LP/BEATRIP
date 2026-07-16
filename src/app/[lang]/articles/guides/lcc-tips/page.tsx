import type { Metadata } from "next";
import {
  buildGuideMetadata,
  GuidePage,
  type GuideContent,
} from "@/lib/articles/guide-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;

const CONTENT: GuideContent = {
  slug: "lcc-tips",
  metaTitle: "LCC を最大活用する 10 のコツ — 格安航空券で失敗しない使い方",
  metaDescription:
    "LCC (格安航空会社) を賢く使い倒すための実践的な 10 のコツを解説。手荷物・座席・支払い手数料・遅延リスクへの備え方まで、総額で得するためのポイントを整理しました。",
  keywords: [
    "LCC コツ",
    "格安航空券 注意点",
    "LCC 手荷物",
    "LCC 座席指定",
    "LCC 預け荷物",
    "Peach 注意点",
    "Jetstar コツ",
    "LCC 安く乗る方法",
  ],
  title: "LCC を最大活用する 10 のコツ",
  lede:
    "LCC (Low-Cost Carrier / 格安航空会社) は運賃の安さが魅力ですが、手荷物や座席指定が別料金になりやすく、油断すると総額がフルサービス航空会社と変わらないこともあります。総額で得をするための実践的な 10 のポイントを整理しました。",
  published: "2026-06-10",
  sections: [
    {
      heading: "まず「総額」で比較する",
      paragraphs: [
        "LCC の表示運賃は、座席指定・受託手荷物・支払い手数料などを含まない「素の運賃」であることがほとんどです。荷物や座席を追加すると、結果的にフルサービス航空会社と総額が逆転することもあります。",
        "予約前に、自分に必要なオプションをすべて足した「総額」で各社を比較しましょう。",
      ],
      bullets: [
        { label: "受託手荷物", text: "預ける荷物がある場合は事前に重量と料金を確認する。" },
        { label: "座席指定", text: "同行者と並びたい場合は座席料金も総額に含める。" },
        { label: "支払い手数料", text: "クレジットカード手数料がかかる会社もある。" },
      ],
    },
    {
      heading: "手荷物は事前購入が基本",
      paragraphs: [
        "受託手荷物は、空港カウンターで追加すると Web 事前購入より割高になるのが一般的です。預ける可能性があるなら、予約時または出発前にオンラインで購入しておきましょう。",
        "機内持ち込みも各社でサイズ・個数・重量の上限が決まっています。超過すると追加料金が発生するため、事前に規定を確認してパッキングするのが安全です。",
      ],
      note: "手荷物規定は航空会社・運賃クラスによって異なります。予約した会社の最新規定を必ず確認してください。",
    },
    {
      heading: "セール時期を押さえる",
      paragraphs: [
        "LCC は定期的にセールを実施します。早朝・深夜の発表や、就航記念・季節のキャンペーンなどタイミングは会社ごとに傾向があります。",
        "狙っている路線があるなら、メールマガジンや公式 SNS を事前に登録しておくと、セール開始の通知を逃しにくくなります。",
      ],
    },
    {
      heading: "遅延・欠航リスクに備える",
      paragraphs: [
        "LCC は機材を効率よく回す運航のため、1 便の遅延が後続便に波及しやすい傾向があります。乗り継ぎや到着後の予定はゆとりを持って組みましょう。",
        "特に別々に予約した便を自分で乗り継ぐ場合、前の便が遅れても後の便は待ってくれません。接続時間は余裕を持たせるのが鉄則です。",
      ],
    },
    {
      heading: "支払い・予約変更のルールを確認",
      bullets: [
        { label: "変更・払い戻し", text: "最安運賃は変更不可・払い戻し不可のことが多い。" },
        { label: "オプションの追加変更", text: "予約後でも一部オプションは追加できるが割高になりがち。" },
        { label: "決済手段", text: "対応するカードブランドや手数料を事前に確認する。" },
      ],
    },
    {
      heading: "空港アクセスも込みで考える",
      paragraphs: [
        "LCC は専用ターミナルや郊外の空港を使うことがあり、アクセスに時間や交通費がかかる場合があります。深夜・早朝発着だと公共交通が動いておらず、タクシー代がかさむことも。",
        "運賃の安さだけでなく、空港までの移動時間・費用・始発終電の時刻も含めて判断しましょう。",
      ],
    },
  ],
  faqs: [
    {
      q: "LCC はフルサービス航空会社より本当に安いですか?",
      a: "素の運賃は安いことが多いですが、受託手荷物・座席指定・支払い手数料などを追加すると総額が近づくことがあります。必要なオプションを足した総額で比較するのが正確です。",
    },
    {
      q: "LCC で機内持ち込みできる荷物の上限は?",
      a: "サイズ・個数・重量の上限は航空会社と運賃クラスによって異なります。一般的に手荷物 1〜2 個で合計重量に上限がある会社が多いですが、必ず予約した会社の最新規定を確認してください。",
    },
    {
      q: "LCC のセールはいつ多いですか?",
      a: "就航記念・季節のキャンペーン・連休前後などにセールが行われる傾向がありますが、時期は会社ごとに異なります。公式メールマガジンや SNS を登録しておくと通知を逃しにくいです。",
    },
    {
      q: "LCC で乗り継ぎするときの注意点は?",
      a: "別々に予約した便を自分で乗り継ぐ場合、前の便が遅れても後の便は待ってくれません。接続時間に十分な余裕を持たせ、預け荷物の受け取り直しも考慮しましょう。",
    },
  ],
  aspCategories: ["flight-domestic", "flight-overseas", "esim-wifi", "insurance"],
  aspTitle: "格安航空券・旅行サービスを比較",
  aspSubtitle: "LCC を含む航空券や旅行の備えを信頼できるサービスから比較",
  aspSource: "guide-lcc-tips",
  // 記事を読んだ人をそのまま各社の現物セールへ送る (回遊率向上)。
  // コードは airlines マスタから導出されるためリンク切れが起きない。
  airlineLinks: {
    title: "LCC 各社のセール実績・時期",
    type: "LCC",
  },
  relatedLinks: [
    { href: "/articles/guides/baggage-rules", label: "機内持ち込み・預け荷物の完全ルール", desc: "サイズ・重量・液体物の基準を整理" },
    { href: "/articles/guides/best-booking-timing", label: "航空券を最安で買うベストタイミング", desc: "予約時期の考え方を解説" },
    { href: "/local-flights", label: "地方発の格安便特集", desc: "地方空港発の LCC・セール情報" },
    { href: "/articles/sale-prediction-2027", label: "2027 セール予測", desc: "JAL/ANA/LCC のセール時期予測" },
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
