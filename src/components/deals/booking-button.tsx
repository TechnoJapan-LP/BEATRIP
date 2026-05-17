"use client";

import { useState } from "react";
import { ExternalLink, Zap } from "lucide-react";

export function BookingButton({
  dealId,
  affiliateUrl,
  affiliateProvider,
  saleName,
}: {
  dealId: string;
  affiliateUrl: string;
  affiliateProvider: string;
  saleName: string;
}) {
  const [clicked, setClicked] = useState(false);

  async function handleClick() {
    setClicked(true);
    try {
      await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: dealId,
          affiliate_provider: affiliateProvider,
          affiliate_url: affiliateUrl,
        }),
      });
    } catch {
      // tracking failure should not block navigation
    }
    window.open(affiliateUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-6 py-4 text-sm font-bold text-white dark:text-zinc-900 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-300 active:scale-[0.98] shadow-lg hover:shadow-xl"
      >
        <Zap className="h-4 w-4" />
        {clicked ? "予約サイトを開きました" : "このセールを予約する"}
        <ExternalLink className="h-4 w-4" />
      </button>
      <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
        <span>{affiliateProvider} で「{saleName}」を予約</span>
      </div>
      <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2">
        <Zap className="h-3 w-3 text-emerald-500" />
        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          BEATRIPからの予約で最安値を保証
        </span>
      </div>
    </div>
  );
}
