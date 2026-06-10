"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type TocItem = {
  /** 対応する section の id 属性 */
  id: string;
  label: string;
};

type TableOfContentsProps = {
  items: TocItem[];
  title?: string;
  className?: string;
};

/**
 * 長文ページ用の目次 (TOC)。
 * - アンカークリックで該当 section へスムーズスクロール
 * - スクロールスパイで現在位置をハイライト
 * - prefers-reduced-motion 時は instant scroll
 */
export function TableOfContents({
  items,
  title = "目次",
  className,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // 画面上部に最も近い可視 section を active にする
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        // ヘッダー分を考慮し、上部 96px をトリガーラインに
        rootMargin: "-96px 0px -60% 0px",
        threshold: 0,
      }
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [items]);

  const handleClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const top =
      el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({
      top,
      behavior: prefersReduced ? "auto" : "smooth",
    });
    setActiveId(id);
    history.replaceState(null, "", `#${id}`);
  };

  if (items.length === 0) return null;

  return (
    <nav
      aria-label={title}
      className={cn(
        "rounded-xl border border-zinc-100 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900",
        className
      )}
    >
      <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
        {title}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "block rounded-lg border-l-2 px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "border-zinc-900 bg-zinc-50 font-medium text-zinc-900 dark:border-zinc-100 dark:bg-zinc-800 dark:text-zinc-100"
                    : "border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
