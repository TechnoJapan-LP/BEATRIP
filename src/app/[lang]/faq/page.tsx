import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "よくある質問（FAQ）",
  description:
    "BEATRIPの使い方、セール情報の見方、価格アラートの設定方法など、よくある質問にお答えします。",
};

const faqs = [
  {
    q: "BEATRIPとは何ですか？",
    a: "BEATRIPは航空券のセール情報を自動収集し、フラッシュディール・セール時期予測・価格推移データを提供するフライトディール情報サイトです。航空券の直接販売は行っておらず、情報提供のみを目的としています。",
  },
  {
    q: "セール情報はどこから取得していますか？",
    a: "ANA・JAL・Peach・Jetstar Japan・スクートなど、主要航空会社の公式サイトからセール情報を自動取得しています。情報は定期的に更新されますが、最新の価格・空席状況は航空会社公式サイトにてご確認ください。",
  },
  {
    q: "掲載されている価格は正確ですか？",
    a: "掲載価格は取得時点のものです。航空券の価格は空席状況や為替レートにより常に変動するため、実際の価格と異なる場合があります。ご予約前に必ず航空会社公式サイトで最新価格をご確認ください。",
  },
  {
    q: "「セール予測」はどのように計算されていますか？",
    a: "過去のセール開催履歴（開催日、頻度、割引率など）をAIが分析し、次回セールの開催時期と確率を予測しています。予測はあくまで参考情報であり、実際のセール開催を保証するものではありません。",
  },
  {
    q: "価格アラートの設定方法は？",
    a: "各ディールの詳細ページにある「価格アラート」セクションで、通知を受けたい価格を設定できます。設定した金額以下になった場合にお知らせします。現在はブラウザ通知のみ対応しています。",
  },
  {
    q: "お気に入り機能はどう使いますか？",
    a: "各ディールカードのハートアイコンをクリックすると、お気に入りに追加できます。お気に入り情報はブラウザのローカルストレージに保存されるため、同じブラウザでアクセスすれば次回も表示されます。",
  },
  {
    q: "航空券の予約はBEATRIPでできますか？",
    a: "BEATRIPでは航空券の直接予約はできません。「予約する」ボタンをクリックすると、航空会社公式サイトまたは提携予約サイトに遷移します。予約手続きは遷移先のサイトで行ってください。",
  },
  {
    q: "スマートフォンでも使えますか？",
    a: "はい。BEATRIPはPWA（Progressive Web App）に対応しており、スマートフォンのホーム画面に追加してアプリのように利用できます。ブラウザのメニューから「ホーム画面に追加」を選択してください。",
  },
  {
    q: "ダークモードには対応していますか？",
    a: "はい。ヘッダー右上の太陽/月アイコンをクリックすると、ライトモードとダークモードを切り替えられます。設定はブラウザに保存されます。",
  },
];

export default function FAQPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "よくある質問" },
            ]}
          />
        </div>

        <h1 className="font-heading text-3xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-4xl">
          FAQ
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          よくある質問と回答
        </p>

        <div className="mt-8 space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                {faq.q}
                <span className="ml-4 text-zinc-400 transition-transform group-open:rotate-180">
                  ▼
                </span>
              </summary>
              <div className="px-6 pb-5 pt-1">
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {faq.a}
                </p>
              </div>
            </details>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
