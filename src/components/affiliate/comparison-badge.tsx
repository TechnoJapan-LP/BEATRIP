import { ShieldCheck } from "lucide-react";

/**
 * 「比較対応 OTA」バッジ — 信頼性アンカー (Pack D)
 *
 * Pack A の hotel-booking-buttons.tsx 内には既に
 * 「4 サイトで価格比較 — 最安値を比較できます」 emerald badge を実装済。
 * 重複を避けるため、本コンポーネントは **対応 OTA のブランド名を列挙**
 * する別観点 (信頼性 + 透明性) で表示する。
 *
 * 配置候補:
 *   - フライトディール詳細ページの BookingButton 近辺 (deals 文脈)
 *   - ホテル都市ページの主要 CTA カード下 (1 箇所のみ、Pack A の比較 chip と
 *     位置を変える)
 *   - aside 「価格動向」セクションの下
 *
 * Server Component (state なし)。
 */

const DEFAULT_PROVIDERS = ["Booking.com", "Agoda", "Trip.com", "Hotellook"];

export function ComparisonBadge({
  providerCount,
  providers = DEFAULT_PROVIDERS,
  variant = "inline",
  className = "",
}: {
  /** 表示する N サイト数。providers より優先 */
  providerCount?: number;
  /** OTA ブランド名のリスト。未指定なら DEFAULT_PROVIDERS */
  providers?: string[];
  /** inline: 1 行小型 / card: 角丸カード型 (CTA 下に置く想定) */
  variant?: "inline" | "card";
  className?: string;
}) {
  const count = providerCount ?? providers.length;

  if (variant === "inline") {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800 ${className}`}
        title={`比較対応 OTA: ${providers.join(", ")}`}
      >
        <ShieldCheck className="h-3 w-3" aria-hidden="true" />
        {count} サイトを一括比較
        <span className="font-medium text-emerald-600 dark:text-emerald-300">
          · 価格を見比べて選べます
        </span>
      </span>
    );
  }

  return (
    <div
      className={`rounded-xl bg-emerald-50/70 px-3 py-2.5 ring-1 ring-emerald-200 dark:bg-emerald-900/20 dark:ring-emerald-800 ${className}`}
    >
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-200">
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {count} サイトを一括比較
        <span className="font-medium text-emerald-600 dark:text-emerald-300">
          · 価格を見比べて選べます
        </span>
      </div>
      <div className="mt-1 flex flex-wrap gap-1.5 text-[10px] text-emerald-700/80 dark:text-emerald-300/80">
        <span className="font-medium uppercase tracking-wider opacity-70">
          対応 OTA
        </span>
        {providers.map((p) => (
          <span
            key={p}
            className="rounded bg-white/60 px-1.5 py-0.5 font-mono text-emerald-800 ring-1 ring-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-800/60"
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
