"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";

export function NewsletterCTA() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className="my-12 sm:my-16">
        <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-800 px-6 py-8 text-center sm:px-12 sm:py-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 mb-4">
            <Check className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="font-heading text-xl tracking-wide text-white uppercase sm:text-2xl">
            登録完了
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            セール情報をお届けします。お楽しみに！
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="my-12 sm:my-16">
      <div className="rounded-2xl bg-zinc-900 dark:bg-zinc-800 px-6 py-8 sm:px-12 sm:py-10">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10 mb-4 sm:h-12 sm:w-12">
            <Bell className="h-5 w-5 text-white sm:h-6 sm:w-6" />
          </div>

          <h3 className="font-heading text-xl tracking-wide text-white uppercase sm:text-2xl">
            セール情報を見逃さない
          </h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            航空会社のセール開始をメールでお知らせ。
            <br className="hidden sm:inline" />
            最安値のタイミングを逃しません。
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3"
          >
            <input
              type="email"
              required
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-zinc-900 transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap"
            >
              {status === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "無料で登録"
              )}
            </button>
          </form>

          {status === "error" && (
            <p className="mt-3 text-xs text-rose-400">
              登録に失敗しました。もう一度お試しください。
            </p>
          )}

          <p className="mt-4 text-[11px] text-zinc-600">
            いつでも配信停止できます。スパムは送りません。
          </p>
        </div>
      </div>
    </section>
  );
}
