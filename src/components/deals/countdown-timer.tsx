"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

function calcRemaining(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
}

export function CountdownTimer({ deadline }: { deadline: string }) {
  // 初期値は遅延評価で1回だけ計算（react-hooks/purity準拠）。
  // 以降はsetIntervalだけが setRemaining を呼ぶ。
  const [remaining, setRemaining] = useState(() => calcRemaining(deadline));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const tick = () => setRemaining(calcRemaining(deadline));

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

    // タブ非表示時は止め、復帰時に追いつく (バッテリー / CPU 節約)
    const handleVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [deadline]);

  if (!remaining) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
        <Clock className="h-3 w-3" />
        終了
      </span>
    );
  }

  const urgent = remaining.days < 3;
  const warning = remaining.days < 7;

  const colorClass = urgent
    ? "bg-rose-500 text-white"
    : warning
      ? "bg-amber-500 text-white"
      : "bg-zinc-100 text-zinc-700";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${colorClass}`}
    >
      <Clock className="h-3 w-3" />
      残り {remaining.days}日 {remaining.hours}時間 {remaining.minutes}分
    </span>
  );
}
