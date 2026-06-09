"use client";

import { useCallback, useState } from "react";
import { ExternalLink, Zap, Search, TrendingDown, CalendarCheck, BarChart3 } from "lucide-react";
import { trackAffiliateClick } from "@/components/analytics";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import {
  consumeTurnstileToken,
  isTurnstileEnabled,
  setTurnstileToken,
} from "@/lib/security/click-token";

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
  price,
  route,
  discountPercent,
  bestMonthName,
  avgSavingPercent,
  isLowest,
}: {
  dealId: string;
  affiliateUrl: string;
  affiliateProvider: string;
  saleName: string;
  /** 他プロバイダーでも検索できるリンク（任意） */
  compareLinks?: CompareLink[];
  /** GA4 計測用: セール価格 */
  price?: number;
  /** GA4 計測用: 路線（例 NRT→BKK） */
  route?: string;
  /** 価値表示: 割引率 */
  discountPercent?: number;
  /** 価値表示: ベスト予約月（例 "2月"） */
  bestMonthName?: string;
  /** 価値表示: 年間平均比の節約率 */
  avgSavingPercent?: number;
  /** 価値表示: 過去2年で最安水準か */
  isLowest?: boolean;
}) {
  const [clicked, setClicked] = useState(false);
  const handleToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  function trackAndOpen(url: string, provider: string) {
    setClicked(true);

    // GA4 コンバージョンイベント
    trackAffiliateClick({ dealId, provider, price, route });

    // sticky-cta と同型: sendBeacon でナビゲーション直前のトラッキングを
    // 確実に届けつつ、window.open を await でブロックしない (INP 改善 +
    // ポップアップブロック回避)。
    try {
      const payload = JSON.stringify({
        deal_id: dealId,
        affiliate_provider: provider,
        affiliate_url: url,
        // Turnstile 未設定 (env なし) のとき "" が入るが server 側 skip 扱い
        turnstile_token: consumeTurnstileToken(),
      });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/clicks",
          new Blob([payload], { type: "application/json" })
        );
      } else {
        // フォールバック (古いブラウザ): keepalive で navigation 後も配信
        fetch("/api/clicks", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: payload,
        }).catch(() => undefined);
      }
    } catch {
      /* tracking 失敗は navigation を妨げない */
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
      {isTurnstileEnabled() && <TurnstileWidget onToken={handleToken} />}
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

      {/* BEATRIPだから分かる判断材料（実データ） */}
      <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2.5 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          BEATRIPの価格分析
        </div>
        {isLowest && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            <BarChart3 className="h-3 w-3 flex-shrink-0" />
            過去2年でも最安水準の価格です
          </div>
        )}
        {discountPercent !== undefined && discountPercent > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
            <TrendingDown className="h-3 w-3 flex-shrink-0 text-rose-500" />
            通常価格より{discountPercent}%安いセール価格
          </div>
        )}
        {bestMonthName && avgSavingPercent !== undefined && avgSavingPercent > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300">
            <CalendarCheck className="h-3 w-3 flex-shrink-0 text-sky-500" />
            この路線の底値は{bestMonthName}（年間平均比 約{avgSavingPercent}%安）
          </div>
        )}
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-0.5">
          ※ 価格は予約サイトで最新の空席・運賃をご確認ください
        </div>
      </div>
    </div>
  );
}
