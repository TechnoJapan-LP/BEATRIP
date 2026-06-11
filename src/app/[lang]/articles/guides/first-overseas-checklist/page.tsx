import type { Metadata } from "next";
import {
  buildGuideMetadata,
  GuidePage,
  type GuideContent,
} from "@/lib/articles/guide-template";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 86400;

const CONTENT: GuideContent = {
  slug: "first-overseas-checklist",
  metaTitle: "初めての海外旅行 準備チェックリスト — パスポートから出発まで",
  metaDescription:
    "初めての海外旅行に必要な準備を時系列のチェックリストで整理。パスポート・ビザ・航空券・海外旅行保険・通信・お金の準備まで、抜け漏れを防ぐ完全ガイドです。",
  keywords: [
    "海外旅行 準備",
    "初めて 海外旅行",
    "海外旅行 持ち物",
    "海外旅行 チェックリスト",
    "パスポート 準備",
    "海外旅行 保険",
    "海外旅行 やること",
  ],
  title: "初めての海外旅行 準備チェックリスト",
  lede:
    "初めての海外旅行は準備項目が多く、何から手を付けるか迷いがちです。パスポートなど時間がかかるものから、出発直前に確認すべきことまで、時系列のチェックリストで整理しました。各国の制度は変わるため、最新情報は必ず公式機関で確認してください。",
  published: "2026-06-10",
  sections: [
    {
      heading: "出発の数週間〜数か月前にやること",
      checklist: true,
      bullets: [
        { label: "パスポート", text: "未取得なら早めに申請。残存有効期間の条件がある国もあるため要確認。" },
        { label: "ビザ・電子渡航認証", text: "渡航先によりビザや電子渡航認証 (ESTA など) が必要。要否と取得方法を確認。" },
        { label: "航空券・宿の予約", text: "繁忙期ほど早期確保が有利。日程を固めて押さえる。" },
        { label: "海外旅行保険", text: "万一の医療費に備えて検討。クレカ付帯の有無と補償内容も確認。" },
      ],
    },
    {
      heading: "出発の 1〜2 週間前にやること",
      checklist: true,
      bullets: [
        { label: "通信手段の手配", text: "eSIM・SIM・Wi-Fi ルーターなど現地での通信方法を決める。" },
        { label: "お金の準備", text: "現地通貨の用意、海外で使えるカードの確認、利用上限の把握。" },
        { label: "現地情報の確認", text: "気候・服装・治安・交通・チップ習慣などを下調べする。" },
        { label: "常備薬・処方薬", text: "必要な薬を用意。処方薬は持ち込み可否を確認する。" },
      ],
    },
    {
      heading: "出発の数日前にやること",
      checklist: true,
      bullets: [
        { label: "荷造り", text: "受託・機内持ち込みの規定に合わせてパッキング。液体物の制限に注意。" },
        { label: "重要書類のコピー", text: "パスポートや予約確認書の控えを紙・デジタル両方で用意。" },
        { label: "緊急連絡先", text: "大使館・保険会社・カード紛失時の連絡先を控える。" },
        { label: "オンラインチェックイン", text: "対応便なら事前チェックインで当日の手続きを短縮。" },
      ],
    },
    {
      heading: "出発当日にやること",
      checklist: true,
      bullets: [
        { label: "余裕を持った空港到着", text: "国際線は手続きに時間がかかるため早めに到着する。" },
        { label: "手荷物の最終確認", text: "液体物・モバイルバッテリーなど機内ルールを再確認。" },
        { label: "搭乗口・時刻の確認", text: "ゲート変更や遅延の有無を掲示・アプリで確認する。" },
      ],
    },
    {
      heading: "現地でのお金と通信の基本",
      paragraphs: [
        "支払いは現金とカードを併用すると安心です。カードが使えない店や交通機関に備え、少額の現地通貨を用意しておきましょう。",
        "通信は eSIM や現地 SIM、Wi-Fi ルーターなど選択肢があります。地図・翻訳・配車アプリを使うことが多いため、到着直後からネットに繋がる手段を確保しておくと移動が安心です。",
      ],
      note: "各国の入国手続き・税関・通貨・通信事情は変わります。渡航前に外務省や各国公式機関の最新情報を確認してください。",
    },
  ],
  faqs: [
    {
      q: "海外旅行で最初にやるべき準備は何ですか?",
      a: "時間がかかるパスポートの取得・更新と、ビザや電子渡航認証の要否確認です。これらは出発の数週間〜数か月前から着手するのが安心です。",
    },
    {
      q: "海外旅行保険は必要ですか?",
      a: "海外では医療費が高額になることがあり、万一に備えて検討する価値があります。クレジットカードに付帯している場合もあるため、補償内容と適用条件を確認しましょう。",
    },
    {
      q: "現地での通信はどうすればいいですか?",
      a: "eSIM・現地 SIM・Wi-Fi ルーターなどの選択肢があります。地図や翻訳、配車アプリを使う場面が多いため、到着直後から繋がる手段を出発前に手配しておくと安心です。",
    },
    {
      q: "お金は現金とカードどちらがいいですか?",
      a: "併用がおすすめです。カードが使えない店や交通機関に備えて少額の現地通貨を用意し、普段の支払いはカードを中心にすると管理しやすくなります。",
    },
  ],
  aspCategories: ["insurance", "esim-wifi", "flight-overseas", "tour-overseas"],
  aspTitle: "海外旅行の準備に役立つサービス",
  aspSubtitle: "保険・通信・航空券・ツアーを信頼できるサービスから比較",
  aspSource: "guide-first-overseas-checklist",
  relatedLinks: [
    { href: "/insurance", label: "海外旅行保険を比較", desc: "クレカ付帯 vs ネット保険" },
    { href: "/articles/guides/esim-setup-guide", label: "海外 eSIM 設定ガイド", desc: "海外で使えるスマホ通信の設定方法" },
    { href: "/articles/guides/baggage-rules", label: "機内持ち込み・預け荷物の完全ルール", desc: "荷造り前に確認したい規定" },
    { href: "/articles/guides/family-travel-tips", label: "子連れ旅行を快適にするコツ", desc: "家族での海外旅行の備え" },
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
