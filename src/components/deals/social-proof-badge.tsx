import { Eye } from "lucide-react";
import { loadTodayClicks } from "@/lib/store/click-store";

/**
 * 「本日 N 人がチェック」社会的証明バッジ (Server Component)
 *
 * - click-store から直近 24h の click 数を取得
 * - N >= 10 のときのみ表示 (それ未満は数値が弱いので逆効果)
 * - inline badge: bg-blue-50 text-blue-700 ring-1
 *
 * Server Component なので一覧 (deal-grid) で並列 fetch されても
 * RSC streaming で個別レンダリングされ、ファーストペイントを阻害しない。
 */
export async function SocialProofBadge({
  dealId,
  className = "",
}: {
  dealId: string;
  className?: string;
}) {
  let count = 0;
  try {
    count = await loadTodayClicks(dealId);
  } catch {
    // click-store エラーは黙って非表示 (CTA を壊さない)
    return null;
  }

  if (count < 10) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800 sm:text-[11px] ${className}`}
    >
      <Eye className="h-3 w-3" />
      本日 {count} 人がチェック
    </span>
  );
}
