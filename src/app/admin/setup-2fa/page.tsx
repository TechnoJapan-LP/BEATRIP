import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import { Header } from "@/components/header";
import { SiteFooter } from "@/components/site-footer";
import {
  buildOtpAuthUrl,
  generateSecret,
} from "@/lib/auth/totp";

export const metadata: Metadata = {
  title: "2FA Setup | BEATRIP Admin",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export const dynamic = "force-dynamic";

/**
 * /admin/setup-2fa — TOTP 初回セットアップ補助ページ
 *
 * - ADMIN_API_KEY 認証は admin と共通
 * - ADMIN_TOTP_SECRET が未設定なら、ランダム生成した secret を一度だけ表示
 *   (.env に貼り付けて Vercel に登録する想定)
 * - 既に設定されている場合は otpauth URL のみ表示 (再 enroll 用)
 *
 * セキュリティ:
 *   - 第三者 QR 生成サービスへ secret を渡さない (URL を text 表示するに留める)
 *   - 任意の認証アプリ (Google Authenticator / Authy / 1Password) で手動登録
 */
async function isAuthorized(token: string | undefined): Promise<boolean> {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) return false;
  if (token === expected) return true;
  const c = await cookies();
  if (c.get("beatrip_admin")?.value === expected) return true;
  const h = await headers();
  return h.get("authorization") === `Bearer ${expected}`;
}

export default async function Setup2FAPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const authed = await isAuthorized(sp.token);
  if (!authed) {
    return (
      <>
        <Header />
        <main className="mx-auto max-w-md px-4 py-20">
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
            <h1 className="font-heading text-2xl uppercase tracking-wide">
              2FA Setup
            </h1>
            <p className="mt-4 text-sm text-zinc-500">
              ADMIN_API_KEY が必要です。
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const existing = process.env.ADMIN_TOTP_SECRET ?? "";
  const isFresh = !existing;
  // 新規発行 secret (既に env にあるならそれを表示用に使う)
  const secret = existing || generateSecret();
  const otpauth = buildOtpAuthUrl({
    secretBase32: secret,
    label: "admin",
    issuer: "BEATRIP",
  });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <header className="mb-6">
          <h1 className="font-heading text-3xl uppercase tracking-wide text-zinc-900 dark:text-zinc-100">
            2FA Setup
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            管理画面の 2 要素認証 (TOTP) を有効化する手順。
          </p>
        </header>

        {isFresh ? (
          <section className="mb-8 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            <p className="font-bold">ADMIN_TOTP_SECRET は未設定です。</p>
            <p className="mt-1 text-xs">
              下の secret を <code className="rounded bg-amber-100 px-1 dark:bg-amber-900">.env</code> と Vercel 環境変数に登録し、認証アプリにも同 secret を登録してください。secret はこのページを離れると再表示できません。
            </p>
          </section>
        ) : (
          <section className="mb-8 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200">
            <p className="font-bold">ADMIN_TOTP_SECRET は設定済みです。</p>
            <p className="mt-1 text-xs">
              現在の secret に対する otpauth URL を再表示します (再 enroll 用)。
            </p>
          </section>
        )}

        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-heading text-lg uppercase tracking-wide">
            Step 1. Secret
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            認証アプリで「手動入力」を選び、以下の secret を貼り付けてください。
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-zinc-100 p-3 font-mono text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
            {secret}
          </pre>
        </section>

        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-heading text-lg uppercase tracking-wide">
            Step 2. otpauth URL
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            QR コード読み取り対応アプリ用。テキストをコピーして QR 生成ツール
            (ローカル / オフライン) で QR 化することを推奨します。
            <strong>第三者 QR サービスに貼り付けると secret が漏えいします。</strong>
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-zinc-100 p-3 font-mono text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
            {otpauth}
          </pre>
        </section>

        <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-heading text-lg uppercase tracking-wide">
            Step 3. .env に登録
          </h2>
          <pre className="mt-3 overflow-x-auto rounded bg-zinc-100 p-3 font-mono text-xs text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
            {`ADMIN_TOTP_SECRET=${secret}`}
          </pre>
          <p className="mt-2 text-xs text-zinc-500">
            Vercel の Environment Variables (Production / Preview) にも追加し、デプロイ後に
            <Link href="/admin" className="ml-1 underline">/admin</Link> へアクセスすると 6 桁コード入力画面が表示されます。
          </p>
        </section>

        <p className="text-center text-xs text-zinc-400">
          <Link href="/admin" className="underline">← /admin に戻る</Link>
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
