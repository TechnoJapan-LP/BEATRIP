import type { Metadata } from "next";
import { Plane, BarChart3, Bell, Shield } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "BEATRIPについて",
  description:
    "BEATRIPは航空券セール情報を自動収集し、フラッシュディール・セール時期予測・価格推移データを提供するフライトディールポータルです。",
};

const features = [
  {
    icon: Plane,
    title: "セール情報の自動収集",
    description:
      "ANA・JAL・Peach・Jetstarなど、主要航空会社のセール情報を自動で収集。手動チェックの手間をなくします。",
  },
  {
    icon: BarChart3,
    title: "セール時期の予測",
    description:
      "過去のセール開催データをAIが分析し、次回セールの開催時期と確率を予測。最適なタイミングで予約できます。",
  },
  {
    icon: Bell,
    title: "価格アラート",
    description:
      "気になる路線の価格が設定した金額以下になったら即通知。チャンスを逃しません。",
  },
  {
    icon: Shield,
    title: "信頼性の高いデータ",
    description:
      "すべての情報は航空会社公式サイトから直接取得。正確で最新のセール情報をお届けします。",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "BEATRIPについて" },
            ]}
          />
        </div>

        <h1 className="font-heading text-3xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-4xl">
          About BEATRIP
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 max-w-2xl">
          BEATRIPは「最安値のフライトを見逃さない」をコンセプトに、航空券セール情報を自動収集・分析するフライトディールポータルです。
        </p>

        <section className="mt-12">
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl mb-6">
            Features
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 mb-4">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl mb-4">
            Mission
          </h2>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              航空券のセール情報は各航空会社のサイトやSNSに散在しており、見逃してしまうことが多くあります。BEATRIPはこれらの情報を一箇所に集約し、過去データに基づくセール予測を組み合わせることで、ユーザーが最も安いタイミングでフライトを予約できるようサポートします。
            </p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              私たちは航空券の直接販売は行っておらず、あくまで情報提供に特化したサービスです。ご予約の際は必ず各航空会社の公式サイトにてご確認ください。
            </p>
          </div>
        </section>

        <section className="mt-12 mb-8">
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-2xl mb-4">
            Data Sources
          </h2>
          <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-3">
              セール情報は以下の航空会社公式サイトから取得しています：
            </p>
            <div className="flex flex-wrap gap-2">
              {["ANA", "JAL", "Peach", "Jetstar Japan", "スクート", "エアアジア", "ZIPAIR", "Spring Japan", "Emirates", "Cathay Pacific"].map(
                (name) => (
                  <span
                    key={name}
                    className="rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
