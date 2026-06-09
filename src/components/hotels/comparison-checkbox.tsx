"use client";

import { CheckSquare, Square } from "lucide-react";
import {
  addToComparison,
  COMPARISON_MAX,
  removeFromComparison,
  useComparison,
  type ComparisonItem,
} from "@/lib/comparison/use-comparison";

/**
 * 各 hotel card の右上に置く比較トグル。
 *
 * - 既に comparison に含まれていれば CheckSquare、いなければ Square
 * - 未追加で既に MAX 件埋まっている場合は alert で通知して no-op
 *   (FIFO で勝手に古いものを削除すると意図せぬ削除になり混乱するため、
 *    明示削除を促す UX を優先する)
 */
export function ComparisonCheckbox({ item }: { item: ComparisonItem }) {
  const items = useComparison();
  const checked = items.some((it) => it.hotelSlug === item.hotelSlug);
  const atMax = items.length >= COMPARISON_MAX;

  const toggle = () => {
    if (checked) {
      removeFromComparison(item.hotelSlug);
      return;
    }
    if (atMax) {
      // chrome alert はテストで嫌がられるが、容量限界の警告として最小実装。
      // 後で toast に置き換える余地あり。
      window.alert(`比較は最大 ${COMPARISON_MAX} 件までです。`);
      return;
    }
    addToComparison(item);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={checked}
      aria-label={
        checked
          ? `${item.name} を比較リストから外す`
          : `${item.name} を比較リストに追加`
      }
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold transition-colors ${
        checked
          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60"
          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      }`}
    >
      {checked ? (
        <CheckSquare className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Square className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span>比較</span>
    </button>
  );
}
