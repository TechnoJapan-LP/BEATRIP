"use client";

import { useEffect, useState } from "react";

const CITIES = ["東京", "大阪", "名古屋", "福岡", "札幌", "横浜", "神戸"];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

interface RecentActivityProps {
  dealId: string;
}

export function RecentActivity({ dealId }: RecentActivityProps) {
  const [activity, setActivity] = useState<{
    city: string;
    minutes: number;
  } | null>(null);

  useEffect(() => {
    // Deterministic seed from dealId + current hour (changes hourly)
    const hourKey = new Date().toISOString().slice(0, 13);
    const seed = hashString(`${dealId}-activity-${hourKey}`);

    // 70% chance to show based on dealId hash
    const showChance = seed % 100;
    if (showChance >= 70) return;

    const cityIndex = seed % CITIES.length;
    const minutes = 1 + (seed % 30);

    setActivity({
      city: CITIES[cityIndex],
      minutes,
    });
  }, [dealId]);

  if (!activity) return null;

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
      <span>
        {activity.minutes}分前に{activity.city}
        のユーザーがこのディールを閲覧しました
      </span>
    </div>
  );
}
