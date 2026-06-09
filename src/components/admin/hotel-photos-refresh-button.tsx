"use client";

/**
 * Admin 用: Google Places API でホテル実物写真をリフレッシュするバッチ起動 UI
 *
 * - 「リフレッシュ実行」ボタン → /api/admin/hotels/refresh-photos?all=1 POST
 * - 「キャッシュ確認」ボタン → ?dump=1 GET 相当 (POST で同 endpoint)
 * - 結果サマリ (api_calls / succeeded / failed / remaining) を表示
 *
 * 注: 1 リクエスト 50 件上限。残件がある場合は再度ボタンを押す。
 */

import { useState } from "react";

type RefreshResponse = {
  success: boolean;
  error?: string;
  summary?: {
    total_curated_hotels: number;
    already_have_imageUrl: number;
    candidates_without_image: number;
    processed_in_this_run: number;
    cached_skipped: number;
    newly_succeeded: number;
    lookup_failed: number;
    api_calls: number;
    remaining: number;
  };
  failures?: Array<{ citySlug: string; hotelName: string; reason: string }>;
  note?: string;
};

type DumpResponse = {
  success: boolean;
  error?: string;
  count?: number;
  items?: Array<{
    citySlug: string;
    hotelName: string;
    entry: {
      placeId: string | null;
      photoName: string | null;
      fetchedAt: string;
    };
  }>;
};

export function HotelPhotosRefreshButton({ token }: { token: string }) {
  const [loading, setLoading] = useState<"" | "refresh" | "dump">("");
  const [result, setResult] = useState<RefreshResponse | null>(null);
  const [dump, setDump] = useState<DumpResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    setLoading("refresh");
    try {
      const res = await fetch(
        "/api/admin/hotels/refresh-photos?all=1",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json: RefreshResponse = await res.json();
      if (!res.ok || json.success === false) {
        setError(json.error ?? `HTTP ${res.status}`);
      } else {
        setResult(json);
        setDump(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setLoading("");
    }
  }

  async function loadDump() {
    setError(null);
    setLoading("dump");
    try {
      const res = await fetch(
        "/api/admin/hotels/refresh-photos?dump=1",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json: DumpResponse = await res.json();
      if (!res.ok || json.success === false) {
        setError(json.error ?? `HTTP ${res.status}`);
      } else {
        setDump(json);
        setResult(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "unknown error");
    } finally {
      setLoading("");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading !== ""}
          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {loading === "refresh" ? "実行中..." : "ホテル写真リフレッシュ (Google Places)"}
        </button>
        <button
          type="button"
          onClick={() => void loadDump()}
          disabled={loading !== ""}
          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading === "dump" ? "読み込み中..." : "KV キャッシュ確認"}
        </button>
      </div>

      <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
        1 リクエスト最大 50 件。残件がある場合は再実行してください。取得結果は
        Upstash KV に 30 日 TTL で保存され、ビルド時に
        <code className="mx-1 rounded bg-zinc-100 px-1 py-0.5 text-[10px] dark:bg-zinc-800">
          src/data/hotel-photos.ts
        </code>
        にマージして本番に反映します。
      </p>

      {error && (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </div>
      )}

      {result?.summary && (
        <div className="mt-3 space-y-1 text-xs text-zinc-700 dark:text-zinc-200">
          <div className="font-bold">実行結果</div>
          <ul className="ml-4 list-disc">
            <li>キュレートホテル総数: {result.summary.total_curated_hotels}</li>
            <li>Wikimedia 等で imageUrl 済: {result.summary.already_have_imageUrl}</li>
            <li>Google Places 対象 (未取得): {result.summary.candidates_without_image}</li>
            <li>今回処理: {result.summary.processed_in_this_run}</li>
            <li>キャッシュ済みスキップ: {result.summary.cached_skipped}</li>
            <li className="text-emerald-700 dark:text-emerald-400">
              新規取得成功: {result.summary.newly_succeeded}
            </li>
            <li className="text-rose-700 dark:text-rose-400">
              失敗: {result.summary.lookup_failed}
            </li>
            <li>API 呼び出し回数: {result.summary.api_calls}</li>
            <li>残: {result.summary.remaining}</li>
          </ul>
          {result.note && (
            <p className="mt-2 text-amber-700 dark:text-amber-400">{result.note}</p>
          )}
          {result.failures && result.failures.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-zinc-500">失敗詳細 ({result.failures.length})</summary>
              <ul className="ml-4 mt-1 list-disc text-[11px]">
                {result.failures.map((f, i) => (
                  <li key={i}>
                    [{f.citySlug}] {f.hotelName} — {f.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      {dump && (
        <div className="mt-3 text-xs text-zinc-700 dark:text-zinc-200">
          <div className="font-bold">KV キャッシュ: {dump.count ?? 0} エントリ</div>
          <p className="mt-1 text-[11px] text-zinc-500">
            下記 JSON を <code>src/data/hotel-photos.ts</code> にマージしてください。
          </p>
          <textarea
            readOnly
            value={JSON.stringify(
              Object.fromEntries(
                (dump.items ?? [])
                  .filter((x) => x.entry.photoName)
                  .map((x) => [
                    `${x.citySlug}:${x.hotelName}`,
                    // 注: 実 URL は build 時に GOOGLE_PLACES_API_KEY を埋めて生成する。
                    // ここでは photoName のみを出力する (key 漏えい防止)。
                    x.entry.photoName,
                  ])
              ),
              null,
              2
            )}
            className="mt-2 h-48 w-full rounded-md border border-zinc-200 bg-zinc-50 p-2 font-mono text-[10px] dark:border-zinc-700 dark:bg-zinc-950"
          />
        </div>
      )}
    </div>
  );
}
