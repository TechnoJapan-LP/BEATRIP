/**
 * FAQ アコーディオン共通コンポーネント
 *
 * /airlines/[code]/sales, /routes/[route], /hotels/[city] で個別に実装されて
 * いたものを統一。スタイル変更が一箇所で済むようにする。
 *
 * SEOの観点では、各FAQ項目に visible な <summary>/<details> を使い、
 * 同時にページ側で FAQPage JSON-LD を発行することで rich result を狙う。
 */

import type { ReactNode } from "react";

export type FAQItem = {
  q: string;
  a: ReactNode;
};

export function FAQAccordion({
  items,
  /** 最初の項目を初期展開（読みやすさ向上） */
  defaultOpenFirst = true,
}: {
  items: FAQItem[];
  defaultOpenFirst?: boolean;
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((faq, i) => (
        <details
          key={i}
          className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          open={defaultOpenFirst && i === 0}
        >
          <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <span>{faq.q}</span>
            <span className="ml-3 text-zinc-400 transition-transform group-open:rotate-180">
              ▼
            </span>
          </summary>
          <div className="px-5 pb-4 pt-1">
            <div className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              {faq.a}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}
