import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "利用規約",
  description: "BEATRIPの利用規約です。本サービスをご利用いただく前に必ずお読みください。",
};

const sections = [
  {
    title: "第1条（適用）",
    content:
      "本規約は、BEATRIP（以下「本サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意のうえ、本サービスを利用するものとします。",
  },
  {
    title: "第2条（サービス内容）",
    content:
      "本サービスは、航空券のセール情報を自動収集し、フラッシュディール・セール時期予測・価格推移データ等の情報を提供するサービスです。本サービスは航空券の販売・予約代行を行うものではなく、情報提供のみを目的としています。",
  },
  {
    title: "第3条（情報の正確性）",
    content:
      "本サービスに掲載される情報は、各航空会社の公式サイト等から取得したものですが、その正確性・完全性・最新性を保証するものではありません。航空券の価格・空席状況は常に変動するため、ご予約の際は必ず航空会社公式サイトにて最新情報をご確認ください。",
  },
  {
    title: "第4条（免責事項）",
    content:
      "本サービスの情報に基づいてユーザーが行った航空券の予約・購入等について、当方は一切の責任を負いません。また、セール予測機能による予測結果は参考情報であり、実際のセール開催を保証するものではありません。",
  },
  {
    title: "第5条（禁止事項）",
    content:
      "ユーザーは、本サービスの利用にあたり、以下の行為を行ってはなりません。\n・本サービスのコンテンツを無断で複製・転載する行為\n・本サービスに対するスクレイピング・クローリング等の自動アクセス\n・本サービスの運営を妨害する行為\n・その他、当方が不適切と判断する行為",
  },
  {
    title: "第6条（知的財産権）",
    content:
      "本サービスに関する知的財産権は当方または正当な権利者に帰属します。ユーザーは、当方の事前の書面による承諾なく、本サービスのコンテンツを複製・転載・改変等することはできません。",
  },
  {
    title: "第7条（サービスの変更・中断）",
    content:
      "当方は、ユーザーへの事前通知なく、本サービスの内容を変更、または提供を中断・終了することができるものとします。",
  },
  {
    title: "第8条（規約の変更）",
    content:
      "当方は、必要に応じて本規約を変更することができるものとします。変更後の規約は、本サービス上に掲載した時点から効力を生じるものとします。",
  },
];

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "利用規約" },
            ]}
          />
        </div>

        <h1 className="font-heading text-3xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          利用規約 — 最終更新日: 2026年5月15日
        </p>

        <div className="mt-8 space-y-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
            >
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                {section.title}
              </h2>
              <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400 whitespace-pre-line">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
