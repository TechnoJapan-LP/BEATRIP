import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PriceTrend } from "@/lib/affiliate/hotel-price";

/**
 * 価格動向バッジ：今後 1-3 ヶ月の価格上昇/下降/横ばいを視覚化。
 * FOMO（rising: 今が安い）と信頼性（falling: 待った方が良い）の両側を演出。
 */
export function PriceTrendBadge({
  trend,
  compact = false,
}: {
  trend: PriceTrend;
  compact?: boolean;
}) {
  const styles = {
    rising: {
      Icon: TrendingUp,
      bg: "bg-rose-50 dark:bg-rose-900/30",
      ring: "ring-rose-200 dark:ring-rose-800",
      text: "text-rose-700 dark:text-rose-200",
      iconClass: "text-rose-500",
    },
    falling: {
      Icon: TrendingDown,
      bg: "bg-emerald-50 dark:bg-emerald-900/30",
      ring: "ring-emerald-200 dark:ring-emerald-800",
      text: "text-emerald-700 dark:text-emerald-200",
      iconClass: "text-emerald-500",
    },
    stable: {
      Icon: Minus,
      bg: "bg-zinc-50 dark:bg-zinc-800/50",
      ring: "ring-zinc-200 dark:ring-zinc-700",
      text: "text-zinc-700 dark:text-zinc-200",
      iconClass: "text-zinc-500",
    },
  }[trend.direction];

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ${styles.bg} ${styles.ring} ${styles.text}`}
      >
        <styles.Icon className={`h-2.5 w-2.5 ${styles.iconClass}`} />
        {trend.label}
      </span>
    );
  }

  return (
    <div
      className={`rounded-xl px-4 py-3 ring-1 ${styles.bg} ${styles.ring}`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-white/70 dark:bg-zinc-900/40 ${styles.iconClass}`}>
          <styles.Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold ${styles.text}`}>{trend.label}</p>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 mt-0.5">
            {trend.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
}
