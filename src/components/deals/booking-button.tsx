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
  routeJa,
  departDateLabel,
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
  /** 価値表示: 割引率50%以上か (過去実績との比較ではない) */
  isLowest?: boolean;
  /** 「東京→福岡」形式の日本語路線名。CTA 下の説明に使う */
  routeJa?: string;
  /** 観測便の日付ラベル (例 "9/5発")。TP watch のみ */
  departDateLabel?: string;
}) {
  const [clicked, setClicked] = useState(false);
  const handleToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  // 計測のみ (遷移は <a rel="sponsored"> が行う)。sendBeacon でクリックを記録。
  function track(url: string, provider: string) {
    setClicked(true);

    // GA4 コンバージョンイベント (主要 CTA = ファーストビューの hero 導線)
    trackAffiliateClick({ dealId, provider, price, route, placement: "hero" });

    // sendBeacon でナビゲーション直前のトラッキングを確実に届ける。
    try {
      const payload = JSON.stringify({
        deal_id: dealId,
        affiliate_provider: provider,
        affiliate_url: url,
        placement: "hero",
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
  }

  // 自分以外の比較リンク（同一URL・同一プロバイダー名は除外）
  const otherLinks =
    compareLinks?.filter(
      (l) => l.url !== affiliateUrl && l.provider !== affiliateProvider
    ) ?? [];

  // 緊急性・ベネフィットの訴求バッジ (実データ連動)。
  //  - isLowest         → 「今が底値」(最安水準)
  //  - 高割引 (>=30%)   → 「残りわずか」(セール終了/在庫の示唆)
  const urgency = isLowest
    ? { text: "今が底値 — 最安水準のうちに", tone: "emerald" as const }
    : discountPercent !== undefined && discountPercent >= 30
      ? { text: "高割引セール — 早めの確保がおすすめ", tone: "rose" as const }
      : null;

  // 主要 CTA はベネフィットを前面に (「最安値で予約」)。
  const ctaLabel = clicked
    ? "予約サイトを開きました"
    : isLowest
      ? "最安値で予約に進む"
      : "このセールを予約する";

  return (
    <div className="space-y-3">
      {isTurnstileEnabled() && <TurnstileWidget onToken={handleToken} />}
      {urgency && (
        <div
          className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${
            urgency.tone === "emerald"
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
          }`}
        >
          <TrendingDown className="h-3.5 w-3.5 flex-shrink-0" />
          {urgency.text}
        </div>
      )}
      <a
        href={affiliateUrl}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() => track(affiliateUrl, affiliateProvider)}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-6 py-4 text-sm font-bold text-white dark:text-zinc-900 transition-all hover:bg-zinc-700 dark:hover:bg-zinc-300 active:scale-[0.98] shadow-lg hover:shadow-xl"
      >
        <Zap className="h-4 w-4" />
        {ctaLabel}
        <ExternalLink className="h-4 w-4" />
      </a>
      <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400">
        {/* セール名 (「新千歳発 最安値ウォッチ」等) では利用者にどの便を
            検索するのか伝わらない。路線 + 観測日で言い切る。 */}
        <span>
          {affiliateProvider} で {routeJa ?? saleName}
          {departDateLabel ? `（${departDateLabel}）` : ""} を検索
        </span>
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
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="sponsored noopener noreferrer"
                onClick={() => track(link.url, link.provider)}
                className="flex items-center justify-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-all hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700 active:scale-[0.98]"
              >
                {link.provider}
                <ExternalLink className="h-3 w-3 opacity-50" />
              </a>
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
            割引率50%以上の大幅セール価格です
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
            季節傾向の推計では{bestMonthName}が狙い目（年間平均比 約{avgSavingPercent}%安）
          </div>
        )}
        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-0.5">
          ※ 価格は予約サイトで最新の空席・運賃をご確認ください
        </div>
      </div>
    </div>
  );
}
