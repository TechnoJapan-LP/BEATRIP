"use client";

import { useState } from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { useDictionary } from "@/components/i18n/locale-provider";
import { trackNewsletterSignup } from "@/components/analytics";

export function NewsletterCTA() {
  const t = useDictionary<Record<string, string>>("newsletter");
  const [email, setEmail] = useState("");
  // Bot対策: 人間には非表示、Botは埋めがちなハニーポット
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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
      trackNewsletterSignup({ source: "cta" });
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
            {t.successTitle}
          </h3>
          <p className="mt-2 text-sm text-zinc-400">
            {t.successBody}
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
            {t.title}
          </h3>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            {t.body}
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3"
          >
            {/* Bot対策ハニーポット: 人間に見せず、Botが埋めたら server で弾く */}
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
              placeholder={t.placeholder}
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
                t.submit
              )}
            </button>
          </form>

          {status === "error" && (
            <p className="mt-3 text-xs text-rose-400">
              {t.error}
            </p>
          )}

          <p className="mt-4 text-[11px] text-zinc-600">
            {t.note}
          </p>
        </div>
      </div>
    </section>
  );
}
