"use client";

import { useState, useEffect, useCallback } from "react";
import { BellRing, Check, X, Loader2 } from "lucide-react";
import { trackPriceAlertSet } from "@/components/analytics";

type StoredAlert = {
  dealId: string;
  email: string;
  threshold: number;
};

const STORAGE_KEY = "beatrip-price-alerts";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getStored(): StoredAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStored(alerts: StoredAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

type Props = {
  routeKey: string;
  currentPrice: number;
  dealId: string;
};

export function PriceAlertForm({ routeKey, currentPrice, dealId }: Props) {
  const defaultThreshold = Math.round(currentPrice * 0.8);
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [email, setEmail] = useState("");
  // Bot対策ハニーポット
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "set" | "confirm" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const existing = getStored().find((a) => a.dealId === dealId);
    if (existing) {
      setThreshold(existing.threshold);
      setEmail(existing.email);
      setStatus("set");
    }
  }, [dealId]);

  const handleEnable = useCallback(async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setErrorMsg("有効なメールアドレスを入力してください");
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, dealId, routeKey, threshold, website }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "登録に失敗しました");
      }
      const stored = getStored().filter((a) => a.dealId !== dealId);
      stored.push({ dealId, email: email.trim().toLowerCase(), threshold });
      saveStored(stored);
      trackPriceAlertSet({ routeKey, threshold });
      setStatus("confirm");
      setTimeout(() => setStatus("set"), 2500);
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "登録に失敗しました");
      setStatus("error");
    }
  }, [email, dealId, routeKey, threshold]);

  const handleRemove = useCallback(async () => {
    const stored = getStored();
    const existing = stored.find((a) => a.dealId === dealId);
    saveStored(stored.filter((a) => a.dealId !== dealId));
    setStatus("idle");
    setThreshold(defaultThreshold);
    if (existing) {
      try {
        await fetch(
          `/api/price-alerts?email=${encodeURIComponent(existing.email)}&dealId=${encodeURIComponent(dealId)}`,
          { method: "DELETE" }
        );
      } catch {
        /* ローカルは解除済み。サーバー削除失敗は次回Cronで送られ得るが致命的でない */
      }
    }
  }, [dealId, defaultThreshold]);

  return (
    <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
      <div className="flex items-center gap-2 mb-1">
        <BellRing className="h-4 w-4 text-zinc-500" />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">価格アラート</h3>
      </div>
      <p className="text-[11px] text-zinc-400 mb-4">
        この路線が指定価格以下になったらメールで通知
      </p>

      {status === "confirm" ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5">
          <Check className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">
            アラートを設定しました
          </span>
        </div>
      ) : status === "set" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5">
            <span className="text-xs text-zinc-500">通知価格</span>
            <span className="text-sm font-mono font-bold text-zinc-800">
              ¥{threshold.toLocaleString()} 以下
            </span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5">
            <span className="text-xs text-zinc-500">通知先</span>
            <span className="text-xs font-mono text-zinc-600 truncate ml-2">
              {email}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
          >
            <X className="h-3 w-3" />
            アラートを解除
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label
              htmlFor="price-threshold"
              className="text-[11px] text-zinc-400 mb-1 block"
            >
              通知価格（以下になったら通知）
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                ¥
              </span>
              <input
                id="price-threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                min={0}
                step={1000}
                // モバイル: text-base (16px) で iOS 自動ズーム回避、PC: sm:text-sm
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-7 pr-3 text-base font-mono text-zinc-800 outline-none transition-colors focus:border-zinc-400 focus:bg-white sm:py-2 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="price-alert-email"
              className="text-[11px] text-zinc-400 mb-1 block"
            >
              通知先メールアドレス
            </label>
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
              id="price-alert-email"
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              // モバイル: text-base (16px) で iOS 自動ズーム回避
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 px-3 text-base text-zinc-800 outline-none transition-colors focus:border-zinc-400 focus:bg-white placeholder:text-zinc-400 sm:py-2 sm:text-sm"
            />
          </div>
          {status === "error" && (
            <p className="text-[11px] text-rose-500">{errorMsg}</p>
          )}
          <button
            type="button"
            onClick={handleEnable}
            disabled={status === "loading"}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
          >
            {status === "loading" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <BellRing className="h-3.5 w-3.5" />
                アラートを設定
              </>
            )}
          </button>
          <p className="text-[10px] text-zinc-400 leading-relaxed">
            値下がり時に1度メールでお知らせします。解除はメール内のリンクからいつでも可能です。
          </p>
        </div>
      )}
    </div>
  );
}
