"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

interface ViewCounterProps {
  dealId: string;
}

export function ViewCounter({ dealId }: ViewCounterProps) {
  const [todayViews, setTodayViews] = useState<number | null>(null);

  useEffect(() => {
    // Increment real view count in localStorage
    try {
      const stored = localStorage.getItem("beatrip-views");
      const views: Record<string, number> = stored ? JSON.parse(stored) : {};
      views[dealId] = (views[dealId] || 0) + 1;
      localStorage.setItem("beatrip-views", JSON.stringify(views));
    } catch {
      // localStorage unavailable
    }

    // Generate deterministic "today's views" based on dealId + date
    const today = new Date().toISOString().slice(0, 10);
    const seed = hashString(`${dealId}-${today}`);
    // Base range 8-45, consistent per deal per day
    const base = 8 + (seed % 38);
    setTodayViews(base);
  }, [dealId]);

  if (todayViews === null) return null;

  return (
    <div className="flex items-center gap-1 text-[11px] text-zinc-400">
      <Eye className="h-3 w-3" />
      <span>
        今日 {todayViews}人が閲覧
      </span>
    </div>
  );
}
