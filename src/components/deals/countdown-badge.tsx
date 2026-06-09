"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/**
 * セール終了カウントダウンバッジ (即効性 CTR 強化用)
 *
 * 表示条件:
 *   - 残り 24h 以内 : rose-600 背景 + pulse animation
 *   - 残り 7d  以内 : amber-500 背景
 *   - それ以外     : null (非表示)
 *
 * SSR 対応:
 *   useState(() => calc()) の遅延初期化で初回 SSR と CSR で同じ値を計算。
 *   分単位で表示するため数十秒程度のズレは hydration mismatch を起こさない。
 *   念のため suppressHydrationWarning を付与。
 *
 * 依存:
 *   - lucide-react (Clock) のみ。date-fns 等の重量級依存は import しない。
 */

type Remaining = {
  days: number;
  hours: number;
  minutes: number;
} | null;

function calcRemaining(deadlineMs: number): Remaining {
  const diff = deadlineMs - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

export function CountdownBadge({ deadline }: { deadline: string }) {
  const deadlineMs = new Date(deadline).getTime();
  // Invalid date は表示しない (NaN.getTime() ガード)
  const valid = Number.isFinite(deadlineMs);

  const [remaining, setRemaining] = useState<Remaining>(() =>
    valid ? calcRemaining(deadlineMs) : null
  );

  useEffect(() => {
    if (!valid) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const tick = () => setRemaining(calcRemaining(deadlineMs));

    const start = () => {
      if (interval !== null) return;
      tick();
      interval = setInterval(tick, 60_000);
    };
    const stop = () => {
      if (interval !== null) {
        clearInterval(interval);
        interval = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [deadlineMs, valid]);

  if (!remaining) return null;

  // 7 日超は表示しない (緊急感のみが目的)
  const totalHours = remaining.days * 24 + remaining.hours;
  if (totalHours >= 24 * 7) return null;

  const within24h = totalHours < 24;

  const colorClass = within24h
    ? "bg-rose-600 text-white animate-pulse ring-1 ring-rose-300"
    : "bg-amber-500 text-white ring-1 ring-amber-300";

  // 表記: 24h 以内は「残り N 時間 M 分」、それ以外は「残り N 日 H 時間」
  const label = within24h
    ? `セール終了まで残り ${remaining.hours} 時間 ${remaining.minutes} 分`
    : `セール終了まで残り ${remaining.days} 日 ${remaining.hours} 時間`;

  return (
    <span
      suppressHydrationWarning
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold sm:text-[11px] ${colorClass}`}
    >
      <Clock className="h-3 w-3" />
      {label}
    </span>
  );
}
