import type { Metadata } from "next";
import {
  buildGuideMetadata,
  GuidePage,
  type GuideContent,
} from "@/lib/articles/guide-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;

const CONTENT: GuideContent = {
  slug: "transit-guide",
  metaTitle: "乗り継ぎ・トランジットの過ごし方 — 接続時間と空港での過ごし方ガイド",
  metaDescription:
    "乗り継ぎ便を利用する際の基礎知識を整理。最低乗り継ぎ時間の考え方、預け荷物のスルーチェックイン、長時間トランジットの過ごし方、入国が必要なケースまで解説します。",
  keywords: [
    "乗り継ぎ 時間",
    "トランジット 過ごし方",
    "乗り継ぎ 預け荷物",
    "国際線 乗り継ぎ",
    "ストップオーバー",
    "乗り継ぎ 入国",
    "空港 乗り継ぎ",
  ],
  title: "乗り継ぎ・トランジットの過ごし方",
  lede:
    "乗り継ぎ (トランジット) は直行便より運賃が抑えられる一方、接続時間や荷物の扱いに注意が必要です。安全な乗り継ぎ時間の考え方から、長時間トランジットの過ごし方まで整理しました。手続きは空港・航空会社で異なるため、最新情報は各公式で確認してください。",
  published: "2026-06-10",
  sections: [
    {
      heading: "最低乗り継ぎ時間を確認する",
      paragraphs: [
        "空港ごとに「最低乗り継ぎ時間 (MCT)」の目安があり、これを下回る接続は予約システム上組めないか、間に合わないリスクが高くなります。同一航空会社・同一予約での乗り継ぎなら接続が保証されることが多い一方、別々に予約した便は自己責任です。",
        "国際線同士、ターミナル間移動、入国審査の有無などで必要時間は大きく変わります。初めての空港では余裕を多めに見ましょう。",
      ],
    },
    {
      heading: "預け荷物の扱い",
      bullets: [
        { label: "スルーチェックイン", text: "同一予約だと最終目的地まで荷物が運ばれることが多い (要確認)。" },
        { label: "受け取り直し", text: "別予約や入国を伴う乗り継ぎでは、一度荷物を受け取り再度預ける必要がある。" },
        { label: "時間に影響", text: "受け取り直しがある場合は乗り継ぎ時間に余裕を持たせる。" },
      ],
      note: "荷物が最終目的地までスルーで運ばれるかは、航空会社・予約形態・国の制度で異なります。チェックイン時に必ず確認してください。",
    },
    {
      heading: "入国が必要になるケース",
      paragraphs: [
        "経由地で空港の外に出る場合や、制度上いったん入国扱いになる乗り継ぎでは、その国のビザや電子渡航認証が必要になることがあります。荷物の受け取り直しや再度の保安検査が発生することもあります。",
        "国際線の乗り継ぎでは、経由国の通過に関する条件を事前に確認しておくと安心です。",
      ],
    },
    {
      heading: "長時間トランジットの過ごし方",
      bullets: [
        { label: "ラウンジ", text: "対象カードや有料利用で、休憩・シャワー・軽食が使える空港もある。" },
        { label: "仮眠・リフレッシュ", text: "仮眠スペースやシャワー施設を備えた空港もある。" },
        { label: "市内観光", text: "時間と入国条件が許せば、短時間の市内観光ができる場合もある。" },
      ],
    },
    {
      heading: "乗り継ぎを安全にするコツ",
      bullets: [
        { label: "余裕ある接続", text: "遅延の波及に備え、接続時間は長めに確保する。" },
        { label: "同一予約を優先", text: "可能なら同一予約にすると接続保証や荷物スルーで安心。" },
        { label: "ターミナルを把握", text: "到着・出発ターミナルと移動方法を事前に調べる。" },
      ],
    },
  ],
  faqs: [
    {
      q: "乗り継ぎ時間はどのくらい必要ですか?",
      a: "空港ごとに最低乗り継ぎ時間の目安があり、国際線同士やターミナル間移動、入国審査の有無で必要時間が変わります。初めての空港や別々に予約した便では余裕を多めに見るのが安全です。",
    },
    {
      q: "乗り継ぎのとき荷物は受け取り直しが必要ですか?",
      a: "同一予約なら最終目的地まで荷物が運ばれることが多い一方、別予約や入国を伴う乗り継ぎでは受け取り直しが必要になります。チェックイン時に取り扱いを必ず確認してください。",
    },
    {
      q: "乗り継ぎで経由国のビザは必要ですか?",
      a: "空港の外に出る場合や制度上入国扱いになる乗り継ぎでは、経由国のビザや電子渡航認証が必要になることがあります。経由国の通過条件を事前に確認しましょう。",
    },
    {
      q: "長時間の乗り継ぎはどう過ごせばいいですか?",
      a: "ラウンジ・仮眠スペース・シャワー施設のある空港なら休憩に活用できます。時間と入国条件が許せば短時間の市内観光ができる場合もあります。",
    },
  ],
  aspCategories: ["flight-overseas", "esim-wifi", "insurance", "credit-card"],
  aspTitle: "国際線・旅行サービスを比較",
  aspSubtitle: "航空券・通信・ラウンジ付きカードを信頼できるサービスから比較",
  aspSource: "guide-transit-guide",
  relatedLinks: [
    { href: "/articles/guides/baggage-rules", label: "機内持ち込み・預け荷物の完全ルール", desc: "乗り継ぎ時の荷物の扱いに関連" },
    { href: "/articles/guides/esim-setup-guide", label: "海外 eSIM 設定ガイド", desc: "経由地でも繋がる通信の準備" },
    { href: "/credit-cards", label: "ラウンジ付き旅行系クレカ", desc: "空港ラウンジが使えるカード比較" },
    { href: "/articles/guides/first-overseas-checklist", label: "初めての海外旅行 準備チェックリスト", desc: "渡航準備の全体像" },
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
