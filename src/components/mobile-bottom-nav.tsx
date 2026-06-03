"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, BedDouble, Search, BookOpen } from "lucide-react";
import { useLocalizedHref } from "@/components/i18n/locale-provider";

/**
 * モバイル下部固定ナビ。主要4セクションへの最短遷移。
 * - PC は非表示 (sm:hidden)
 * - ディール詳細 (StickyCTA がある)・検索フォーム展開時 でも基本表示は OK だが、
 *   bottom padding が重なる場合は呼び出し側で調整
 */
const NAV = [
  { href: "/", label: "ディール", icon: Plane, match: (p: string) => p === "/" || p === "/en" },
  { href: "/hotels", label: "ホテル", icon: BedDouble, match: (p: string) => p.startsWith("/hotels") || p.startsWith("/en/hotels") },
  { href: "/articles", label: "記事", icon: BookOpen, match: (p: string) => p.startsWith("/articles") || p.startsWith("/en/articles") },
];

export function MobileBottomNav() {
  const pathname = usePathname() ?? "/";
  const lh = useLocalizedHref();

  // ディール詳細ページ (StickyCTA がある) は重複を避けるため非表示
  const onDealDetail = /^\/(?:en\/)?deals\/[^/]+$/.test(pathname);
  if (onDealDetail) return null;

  return (
    <nav
      aria-label="主要セクション"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-zinc-200/60 bg-white/90 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/85 sm:hidden"
      style={{ paddingBottom: "max(0px, env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-4">
        {NAV.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={lh(item.href)}
              className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                active
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "scale-110" : ""} transition-transform`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {/* 検索アンカー: ホーム#deals へ飛ばす（or 専用検索ページにすると将来拡張） */}
        <Link
          href={lh("/#deals")}
          className="flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
        >
          <Search className="h-5 w-5" />
          <span>検索</span>
        </Link>
      </div>
    </nav>
  );
}
