import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  description:
    "BEATRIPのプライバシーポリシーです。個人情報の取り扱いについて説明しています。",
};

const sections = [
  {
    title: "1. 収集する情報",
    content:
      "本サービスでは、以下の情報を収集する場合があります。\n・ブラウザの種類、OS等のアクセス環境情報\n・アクセス日時、閲覧ページ等のアクセスログ\n・価格アラート設定時にユーザーが入力した情報\n・Cookieを利用したテーマ設定・お気に入り等のユーザー設定情報",
  },
  {
    title: "2. 情報の利用目的",
    content:
      "収集した情報は、以下の目的で利用します。\n・本サービスの提供・運営・改善\n・ユーザー体験の向上（テーマ設定の保持、お気に入り機能等）\n・価格アラート機能の提供\n・アクセス解析によるサービス改善\n・不正アクセスの防止",
  },
  {
    title: "3. 情報の保存",
    content:
      "お気に入り、価格アラート、テーマ設定等のユーザー設定情報は、お使いのブラウザのローカルストレージに保存されます。これらの情報はユーザーの端末にのみ保存され、当方のサーバーには送信されません。",
  },
  {
    title: "4. 第三者への提供",
    content:
      "収集した情報は、法令に基づく場合を除き、ユーザーの同意なく第三者に提供することはありません。",
  },
  {
    title: "5. アクセス解析ツール",
    content:
      "本サービスでは、アクセス解析のためにGoogle Analytics等のサービスを利用する場合があります。これらのサービスはCookieを使用してアクセス情報を収集しますが、個人を特定する情報は含まれません。詳細は各サービスのプライバシーポリシーをご確認ください。",
  },
  {
    title: "6. アフィリエイトリンク",
    content:
      "本サービスには、航空会社公式サイトや提携予約サイトへのアフィリエイトリンクが含まれる場合があります。ユーザーがこれらのリンクを経由して予約を行った場合、当方が紹介報酬を受け取ることがあります。",
  },
  {
    title: "7. Cookieの利用",
    content:
      "本サービスでは、ユーザー体験の向上を目的としてCookieを使用しています。ブラウザの設定によりCookieの利用を制限することができますが、一部の機能が正常に動作しなくなる場合があります。",
  },
  {
    title: "8. ポリシーの変更",
    content:
      "当方は、必要に応じて本プライバシーポリシーを変更することがあります。変更後のポリシーは、本サービス上に掲載した時点から効力を生じるものとします。",
  },
  {
    title: "9. お問い合わせ",
    content:
      "本ポリシーに関するお問い合わせは、サイト内のお問い合わせフォームよりご連絡ください。",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "プライバシーポリシー" },
            ]}
          />
        </div>

        <h1 className="font-heading text-3xl tracking-wide text-zinc-900 uppercase dark:text-zinc-100 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          プライバシーポリシー — 最終更新日: 2026年5月15日
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
