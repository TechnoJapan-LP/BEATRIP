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
  const [remaining, setRemaining] = useState(calcRemaining(deadline));

  useEffect(() => {
    setRemaining(calcRemaining(deadline));
    const interval = setInterval(() => {
      setRemaining(calcRemaining(deadline));
    }, 60_000);
    return () => clearInterval(interval);
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
