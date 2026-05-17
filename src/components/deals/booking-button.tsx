"use client";

import { useState } from "react";
import { ExternalLink, Zap, Search } from "lucide-react";

type CompareLink = {
  url: string;
  provider: string;
};

export function BookingButton({
  dealId,
  affiliateUrl,
  affiliateProvider,
  saleName,
  compareLinks,
}: {
  dealId: string;
  affiliateUrl: string;
  affiliateProvider: string;
  saleName: string;
  /** 他プロバイダーでも検索できるリンク（任意） */
  compareLinks?: CompareLink[];
}) {
  const [clicked, setClicked] = useState(false);

  async function trackAndOpen(url: string, provider: string) {
    setClicked(true);
    try {
      await fetch("/api/clicks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deal_id: dealId,
          affiliate_provider: provider,
          affiliate_url: url,
        }),
      });
    } catch {
      // tracking failure should not block navigation
    }
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // 自分以外の比較リンク（同一URL・同一プロバイダー名は除外）
  const otherLinks =
    compareLinks?.filter(
      (l) => l.url !== affiliateUrl && l.provider !== affiliateProvider
    ) ?? [];

  return (
    <div className="space-y-3">
      <button
        onClick={() => trackAndOpen(affiliateUrl, affiliateProvider)}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-6 py-4 text-sm font-bold text-white dark:text-zinc-900 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-300 active:scale-[0.98] shadow-lg hover:shadow-xl"
      >
        <Zap className="h-4 w-4" />
        {clicked ? "予約サイトを開きました" : "このセールを予約する"}
        <ExternalLink className="h-4 w-4" />
      </button>
      <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
        <span>{affiliateProvider} で「{saleName}」を予約</span>
      </div>

      {/* 価格比較リンク */}
      {otherLinks.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            <Search className="h-3 w-3" />
            他サイトで価格比較
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {otherLinks.map((link) => (
              <button
                key={link.url}
                onClick={() => trackAndOpen(link.url, link.provider)}
                className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-[0.98]"
              >
                {link.provider}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2">
        <Zap className="h-3 w-3 text-emerald-500" />
        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          BEATRIPからの予約で最安値を保証
        </span>
      </div>
    </div>
  );
}
