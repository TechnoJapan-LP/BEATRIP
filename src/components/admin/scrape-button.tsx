"use client";

/**
 * Admin 用: セールスクレイプを手動実行する UI
 *
 * - 「今すぐスクレイプ実行」→ /api/admin/scrape POST
 * - 航空会社別の取得件数 / 新着件数 / モードを表示
 * - 実行後は本番の KV も更新されるため、サイトのセール一覧に即反映される
 */

import { useState } from "react";

type ScrapeResponse = {
  success: boolean;
  error?: string;
  scraperMode?: string;
  elapsedMs?: number;
  airlines?: number;
  totalSales?: number;
  newSales?: number;
  details?: Array<{
    airline: string;
    scraped: number;
    success: boolean;
    error?: string;
  }>;
};

export function ScrapeButton({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json: ScrapeResponse = await res.json();
      if (!res.ok || json.success === false) {
        setError(json.error ?? `HTTP ${res.status}`);
      } else {
        setResult(json);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void run()}
          disabled={loading}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "スクレイプ実行中..." : "今すぐスクレイプ実行"}
        </button>
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
          全航空会社を再取得して KV を更新します（サイトに即反映）。
        </span>
      </div>

      {error && (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </div>
      )}

      {result?.success && (
        <div className="mt-3 space-y-1 text-xs text-zinc-700 dark:text-zinc-200">
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span>
              モード:{" "}
              <span className="font-mono font-bold">{result.scraperMode}</span>
            </span>
            <span>
              取得セール総数:{" "}
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                {result.totalSales}
              </span>
            </span>
            <span>
              新着: <span className="font-bold">{result.newSales}</span>
            </span>
            <span className="text-zinc-400">
              {result.elapsedMs}ms / {result.airlines}社
            </span>
          </div>
          {result.details && result.details.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-zinc-500">
                航空会社別の取得件数
              </summary>
              <ul className="ml-4 mt-1 list-disc">
                {result.details.map((d) => (
                  <li
                    key={d.airline}
                    className={
                      d.error ? "text-rose-600 dark:text-rose-400" : ""
                    }
                  >
                    {d.airline}: {d.scraped}件
                    {d.error ? ` — ${d.error.slice(0, 60)}` : ""}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {result.scraperMode === "mock" && (
            <p className="mt-2 text-amber-700 dark:text-amber-400">
              注: SCRAPER_MODE が mock です。実データ取得には hybrid が必要。
            </p>
          )}
        </div>
      )}
    </div>
  );
}
