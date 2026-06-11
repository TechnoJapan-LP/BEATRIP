import type { Metadata } from "next";
import {
  buildGuideMetadata,
  GuidePage,
  type GuideContent,
} from "@/lib/articles/guide-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;

const CONTENT: GuideContent = {
  slug: "esim-setup-guide",
  metaTitle: "海外で使えるスマホ/eSIM 設定ガイド — 渡航前の準備から現地での切替まで",
  metaDescription:
    "海外でスマホを使うための通信手段を比較し、eSIM の設定手順を分かりやすく解説。eSIM・物理 SIM・Wi-Fi ルーター・ローミングの違いと、高額請求を避ける設定のコツを整理しました。",
  keywords: [
    "eSIM 設定",
    "海外 スマホ 通信",
    "eSIM 海外",
    "海外 wifi",
    "国際ローミング",
    "eSIM 使い方",
    "海外旅行 通信 おすすめ",
  ],
  title: "海外で使えるスマホ/eSIM 設定ガイド",
  lede:
    "海外でスマホを使う方法は eSIM・物理 SIM・Wi-Fi ルーター・国際ローミングなど複数あります。それぞれの違いと、eSIM を使う場合の基本的な設定の流れ、そして意図しない高額請求を避けるための設定のコツを整理しました。",
  published: "2026-06-10",
  sections: [
    {
      heading: "海外でスマホを使う 4 つの方法",
      bullets: [
        { label: "eSIM", text: "対応端末ならアプリやコードで回線を追加。物理 SIM の差し替え不要で渡航前に準備しやすい。" },
        { label: "物理 SIM", text: "現地や事前に SIM カードを入手して差し替える。eSIM 非対応端末でも使える。" },
        { label: "Wi-Fi ルーター", text: "端末をレンタルし複数機器で共有。グループ旅行で便利だが端末の充電・返却が必要。" },
        { label: "国際ローミング", text: "契約中の回線をそのまま海外で使う。手軽だが料金体系の確認が必須。" },
      ],
    },
    {
      heading: "eSIM が向いている人",
      paragraphs: [
        "eSIM は物理カードの差し替えが不要で、渡航前に自宅でセットアップを済ませられるのが利点です。eSIM 対応端末を持っていて、到着後すぐにネットを使いたい一人旅や短期滞在に向いています。",
        "一方、eSIM 非対応の端末では使えないため、まず自分の端末が対応しているかを確認する必要があります。",
      ],
    },
    {
      heading: "eSIM 設定の基本的な流れ",
      checklist: true,
      bullets: [
        { label: "端末の対応確認", text: "自分のスマホが eSIM に対応し、SIM ロックが解除されているか確認する。" },
        { label: "プランの購入", text: "渡航先・滞在日数・データ量に合うプランを渡航前に購入する。" },
        { label: "プロファイルの追加", text: "案内に従い QR コードやアプリで eSIM プロファイルを端末に追加する。" },
        { label: "回線の切替", text: "現地到着後にデータ通信の回線を eSIM 側へ切り替え、ローミング設定を案内通りにする。" },
      ],
      note: "設定手順は端末の OS・機種・eSIM 提供元で異なります。購入元の公式手順に従ってください。",
    },
    {
      heading: "高額請求を避ける設定のコツ",
      bullets: [
        { label: "メイン回線のデータローミング", text: "意図しない課金を防ぐため、普段使う回線のデータローミングはオフにしておく。" },
        { label: "通信に使う回線を指定", text: "データ通信を eSIM 側に固定し、誤って高額な回線を使わないようにする。" },
        { label: "アプリの自動更新", text: "大容量の自動更新やバックアップは Wi-Fi 接続時のみに限定する。" },
      ],
    },
    {
      heading: "渡航前に確認しておくこと",
      bullets: [
        { label: "対応エリア", text: "プランが渡航先の国・地域をカバーしているか。" },
        { label: "データ容量と期間", text: "滞在日数と使い方に合った容量・有効期間か。" },
        { label: "テザリング可否", text: "他の端末と共有したい場合はテザリング対応かを確認。" },
      ],
    },
  ],
  faqs: [
    {
      q: "eSIM と物理 SIM、Wi-Fi ルーターはどれがいいですか?",
      a: "一人旅で対応端末があるなら準備が簡単な eSIM、複数人で共有するなら Wi-Fi ルーター、eSIM 非対応端末なら物理 SIM が向いています。滞在日数や使うデータ量に合わせて選びましょう。",
    },
    {
      q: "自分のスマホが eSIM に対応しているか確認するには?",
      a: "端末の設定画面や端末メーカーの仕様で eSIM 対応を確認できます。あわせて SIM ロックが解除されているかも確認してください。非対応の場合は物理 SIM や Wi-Fi ルーターを検討します。",
    },
    {
      q: "海外で高額請求にならないようにするには?",
      a: "普段使う回線のデータローミングをオフにし、データ通信を eSIM 側に固定するのが基本です。大容量の自動更新やバックアップは Wi-Fi 接続時のみに限定しておくと安心です。",
    },
    {
      q: "eSIM はいつ設定すればいいですか?",
      a: "プロファイルの追加は渡航前に自宅で済ませておけます。回線の切替やローミング設定は現地到着後に案内通りに行うのが一般的です。手順は提供元の公式案内に従ってください。",
    },
  ],
  aspCategories: ["esim-wifi", "insurance", "flight-overseas", "tour-overseas"],
  aspTitle: "海外 eSIM・Wi-Fi を比較",
  aspSubtitle: "海外で使える通信サービスを信頼できる提供元から比較",
  aspSource: "guide-esim-setup-guide",
  relatedLinks: [
    { href: "/esim", label: "eSIM 比較", desc: "海外通信を最安にする選び方" },
    { href: "/articles/guides/first-overseas-checklist", label: "初めての海外旅行 準備チェックリスト", desc: "通信を含む渡航準備の全体像" },
    { href: "/articles/guides/transit-guide", label: "乗り継ぎ・トランジットの過ごし方", desc: "経由地でも繋がる通信の備え" },
    { href: "/insurance", label: "海外旅行保険を比較", desc: "通信と合わせて備えたい保険" },
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
