"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { trackAffiliateClick } from "@/components/analytics";

export function StickyCTA({
  dealId,
  price,
  discountPercent,
  affiliateUrl,
  affiliateProvider,
  route,
}: {
  dealId: string;
  price: number;
  discountPercent: number;
  affiliateUrl: string;
  affiliateProvider: string;
  /** GA4計測用: 路線（例 NRT→BKK） */
  route?: string;
}) {
  const [clicked, setClicked] = useState(false);

  function handleClick() {
    setClicked(true);

    // GA4 コンバージョンイベント（モバイル予約導線）
    trackAffiliateClick({ dealId, provider: affiliateProvider, price, route });

    try {
      fetch("/api/clicks", {
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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl px-4 py-3 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-lg font-heading tracking-wide text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
            ¥{new Intl.NumberFormat("ja-JP").format(price)}
          </span>
          <span className="text-xs font-bold text-rose-500 whitespace-nowrap">
            -{discountPercent}%
          </span>
        </div>
        <button
          onClick={handleClick}
          className="flex items-center gap-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-5 py-3 text-sm font-bold text-white dark:text-zinc-900 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-300 active:scale-[0.98] whitespace-nowrap flex-shrink-0"
        >
          {clicked ? "開きました" : "予約サイトへ"}
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
