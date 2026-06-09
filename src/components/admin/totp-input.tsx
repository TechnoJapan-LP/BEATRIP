"use client";

/**
 * 2FA TOTP コード入力 UI (admin 専用)
 *
 * - 6 桁数字のみ入力
 * - /api/admin/2fa に POST → 成功時 cookie `beatrip_admin_2fa` 発行
 * - 成功後は location.reload() で admin 本体を再表示
 */
import { useState } from "react";

export function TotpInput({ token }: { token: string }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setError("6 桁の数字を入力してください");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/2fa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, code }),
      });
      const json = await res.json().catch(() => ({} as { error?: string }));
      if (!res.ok) {
        setError(json?.error ?? `エラー (${res.status})`);
        setLoading(false);
        return;
      }
      // 2FA cookie が発行された → URL から ?token を消して reload
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.location.replace(url.toString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "request failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
          認証アプリの 6 桁コード
        </span>
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          pattern="\d{6}"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          autoFocus
          className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-center font-mono text-xl tracking-[0.5em] text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-100"
        />
      </label>
      {error && (
        <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
      >
        {loading ? "検証中..." : "検証する"}
      </button>
      <p className="text-[10px] text-zinc-400">
        Google Authenticator / Authy 等の認証アプリで生成された 6 桁コードを入力してください。
        コードは 30 秒ごとに更新されます。
      </p>
    </form>
  );
}
