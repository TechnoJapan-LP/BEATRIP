"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { trackNewsletterSignup } from "@/components/analytics";

/**
 * スリム版ニュースレターCTA — ファーストビュー直下に置く用途。
 * 縦に場所を取らず、メアドだけ求めて即サブミット。本体の NewsletterCTA と
 * 同じ API（/api/newsletter）を叩く。
 */
export function NewsletterCTASlim({ source = "slim" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website }),
      });
      if (!res.ok) throw new Error("request failed");
      trackNewsletterSignup({ source });
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 px-4 py-3 text-emerald-700 dark:text-emerald-400">
        <Check className="h-4 w-4 flex-shrink-0" />
        <span className="text-xs font-medium">
          登録完了。新着セールをメールでお届けします
        </span>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-stretch gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 px-4 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-5 sm:py-3"
    >
      <div className="flex items-center gap-2 sm:flex-shrink-0">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/10 sm:h-8 sm:w-8">
          <Bell className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" />
        </div>
        <div className="text-white">
          <div className="text-xs font-bold sm:text-sm">新着セールをメールで</div>
          <div className="text-[10px] text-zinc-400 hidden sm:block">
            週次でまとめてお届け・配信停止いつでも可
          </div>
        </div>
      </div>
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
      />
      <input
        type="email"
        required
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        inputMode="email"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        // モバイルは text-base (16px) で iOS 自動ズーム回避、PC は sm:text-sm
        className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-base text-white placeholder:text-zinc-500 outline-none focus:border-zinc-500 sm:py-2 sm:text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center justify-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-zinc-900 transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-60 whitespace-nowrap sm:text-sm"
      >
        {status === "loading" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          "無料登録"
        )}
      </button>
      {status === "error" && (
        <span className="text-[10px] text-rose-400 sm:text-xs">
          失敗。再試行を。
        </span>
      )}
    </form>
  );
}
