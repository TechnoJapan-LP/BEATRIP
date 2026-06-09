"use client";

/**
 * Admin 用: 週次 digest メールのプレビュー / 送信トリガー (Wave 3-C3)
 *
 * - プレビュー: ?dryRun=1 を叩き、subject / meta / sample html を表示
 * - 送信: confirm ダイアログ後、本実行 (重複防止は API 側の sent record で担保)
 *
 * ADMIN_API_KEY は admin ページのクエリ token から取得する。
 */
import { useState } from "react";

type DryRunResponse = {
  success: boolean;
  dryRun?: boolean;
  subject?: string;
  meta?: { deals: number; articles: number; hotels: number; campaign: string };
  subscribersCount?: number;
  text?: string;
  sampleHtml?: string | null;
  error?: string;
};

type SendResponse = {
  success: boolean;
  sent?: number;
  subscribers?: number;
  skipped?: string;
  error?: string;
  date?: string;
  meta?: { deals: number; articles: number; hotels: number; campaign: string };
};

export function NewsletterDigestButton({ token }: { token: string }) {
  const [loading, setLoading] = useState<"" | "preview" | "send">("");
  const [preview, setPreview] = useState<DryRunResponse | null>(null);
  const [result, setResult] = useState<SendResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(dryRun: boolean) {
    setError(null);
    setLoading(dryRun ? "preview" : "send");
    try {
      const url = `/api/newsletter/digest${dryRun ? "?dryRun=1" : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || json.success === false) {
        setError(json.error ?? `HTTP ${res.status}`);
      } else if (dryRun) {
        setPreview(json as DryRunResponse);
        setResult(null);
      } else {
        setResult(json as SendResponse);
        setPreview(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setLoading("");
    }
  }

  function handleSend() {
    if (
      window.confirm(
        "本当に全購読者へ digest メールを送信しますか? (同日重複送信は API 側でガード)"
      )
    ) {
      void call(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void call(true)}
          disabled={loading !== ""}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          {loading === "preview" ? "生成中…" : "プレビュー (送信しない)"}
        </button>
        <button
          type="button"
          onClick={handleSend}
          disabled={loading !== ""}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading === "send" ? "送信中…" : "全購読者へ送信"}
        </button>
        <a
          href={`/api/newsletter/digest?preview=html&token=${encodeURIComponent(token)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-500 underline hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          HTML を別タブで開く
        </a>
      </div>
      {error && (
        <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
          {error}
        </p>
      )}
      {preview && (
        <div className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="購読者" value={String(preview.subscribersCount ?? 0)} />
            <Stat label="ディール" value={String(preview.meta?.deals ?? 0)} />
            <Stat label="記事" value={String(preview.meta?.articles ?? 0)} />
            <Stat label="ホテル" value={String(preview.meta?.hotels ?? 0)} />
          </div>
          <div className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Subject
            </p>
            <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-200">
              {preview.subject}
            </p>
          </div>
          {preview.sampleHtml && (
            <details className="rounded-md bg-zinc-50 p-3 dark:bg-zinc-800">
              <summary className="cursor-pointer text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                HTML プレビュー
              </summary>
              <iframe
                title="digest preview"
                srcDoc={preview.sampleHtml}
                className="mt-2 h-[420px] w-full rounded-md border border-zinc-200 bg-white dark:border-zinc-700"
              />
            </details>
          )}
        </div>
      )}
      {result && (
        <div className="mt-3 rounded-md bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          <p className="font-bold">
            {result.skipped
              ? `スキップ: ${result.skipped}`
              : `送信完了: ${result.sent ?? 0} 件 / ${result.subscribers ?? 0} 購読者`}
          </p>
          {result.meta && (
            <p className="mt-1 text-[11px] opacity-80">
              campaign: {result.meta.campaign} (deals {result.meta.deals},
              articles {result.meta.articles}, hotels {result.meta.hotels})
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-zinc-50 px-3 py-2 dark:bg-zinc-800">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
        {value}
      </p>
    </div>
  );
}
