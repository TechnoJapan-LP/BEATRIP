"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { FlightSearchForm } from "@/components/search/flight-search-form";
import type { DealSchema } from "@/data/deal-schema";

/**
 * ファーストビュー最適化: 検索フォームを既定で折りたたみ、
 * スリムなバーだけ見せる。ディール（サイトの価値）を上部に出すため。
 * バーをタップすると本来のフルフォームが展開する。
 */
export function CollapsibleSearch({ deals }: { deals: DealSchema[] }) {
  const [open, setOpen] = useState(false);

  if (open) {
    return (
      <div>
        <FlightSearchForm deals={deals} />
        <button
          onClick={() => setOpen(false)}
          className="mt-2 mx-auto flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          検索を閉じる
          <ChevronDown className="h-3.5 w-3.5 rotate-180" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setOpen(true)}
      className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md active:scale-[0.99] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
        <Search className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">
          フライトを検索
        </span>
        <span className="block text-[11px] text-zinc-400">
          出発地・行き先・日程からセール便を探す
        </span>
      </span>
      <ChevronDown className="h-4 w-4 flex-shrink-0 text-zinc-400" />
    </button>
  );
}
