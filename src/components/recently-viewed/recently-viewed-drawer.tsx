"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { History, X, Plane, BedDouble } from "lucide-react";
import {
  clearRecentlyViewed,
  useRecentlyViewed,
} from "@/lib/recently-viewed/use-recently-viewed";
import { useLocalizedHref } from "@/components/i18n/locale-provider";

/**
 * 全ページ右下のフローティングボタン + Recently viewed ドロワー。
 *
 * - 0 件 → 何も描画しない (ボタンも非表示)
 * - mobile では bottom-nav (56px) の上に表示
 * - dialog role + Esc / 背景クリックで閉じる
 */
export function RecentlyViewedDrawer() {
  const items = useRecentlyViewed();
  const [open, setOpen] = useState(false);
  const lh = useLocalizedHref();

  // Esc で閉じる + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // 0 件 → ボタンごと非表示
  if (items.length === 0) return null;

  const count = items.length;

  return (
    <>
      {/* フローティング起動ボタン
          z-30 (drawer 内側は z-50)。
          mobile では FAB スタック 1 段目 (--fab-1, bottom-nav の上)。
          PC では右下 24px。offset は globals.css の共通トークンで一元管理。 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`最近見たアイテム ${count} 件を開く`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed right-3 sm:right-6 bottom-[var(--fab-1)] sm:bottom-6 z-30 flex min-h-[44px] items-center gap-1.5 rounded-full bg-zinc-900 px-3.5 py-2 text-white shadow-lg shadow-zinc-900/30 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-xl active:scale-95 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-zinc-100/20"
      >
        <History className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-bold">最近 {count}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="最近見たアイテム"
          className="fixed inset-0 z-50 flex"
        >
          {/* backdrop */}
          <button
            type="button"
            aria-label="閉じる"
            className="flex-1 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setOpen(false)}
          />

          {/* panel (右からスライドイン) */}
          <div className="ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-zinc-950">
            <header className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-zinc-500" aria-hidden="true" />
                <h2 className="font-heading text-base tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                  最近見た {count}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <ul className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
              {items.map((it) => {
                const Icon = it.type === "deal" ? Plane : BedDouble;
                return (
                  <li key={`${it.type}:${it.id}`}>
                    <Link
                      href={lh(it.href)}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    >
                      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                        {it.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={it.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Icon
                              className="h-5 w-5 text-zinc-400"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            {it.type === "deal" ? "Deal" : "Hotel"}
                          </span>
                        </div>
                        <div className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {it.label}
                        </div>
                        {it.sublabel && (
                          <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                            {it.sublabel}
                          </div>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <footer className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3">
              <button
                type="button"
                onClick={() => clearRecentlyViewed()}
                className="w-full rounded-lg bg-zinc-100 px-3 py-2 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                すべて削除
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
