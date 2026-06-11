// Server Component:
// 景表法 (ステマ規制, 2023-10 施行) 対応の PR 表記。
// アフィリエイトリンクを含むページの冒頭 (h1 直下) に明示することで
// 「広告であることの明瞭な表示」要件を満たす。

import Link from "next/link";

/**
 * PR 表記コンポーネント
 *
 * variant:
 *  - inline: h1 直下に置く 1 行表記
 *    「本ページにはプロモーション（広告）が含まれます」+ /disclosure リンク
 *  - badge: パネルヘッダ等に添える小型 [PR] チップ
 */
export function PrNotice({
  variant = "inline",
  className = "",
}: {
  variant?: "inline" | "badge";
  className?: string;
}) {
  if (variant === "badge") {
    return (
      <Link
        href="/disclosure"
        className={`inline-flex items-center rounded border border-zinc-300 dark:border-zinc-600 px-1 py-px text-[9px] font-bold leading-none tracking-wider text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors ${className}`}
        title="本ページにはプロモーション（広告）が含まれます"
      >
        PR
      </Link>
    );
  }

  return (
    <p
      className={`flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400 ${className}`}
    >
      <span className="inline-flex items-center rounded border border-zinc-300 dark:border-zinc-600 px-1 py-px text-[9px] font-bold leading-none tracking-wider">
        PR
      </span>
      <span>本ページにはプロモーション（広告）が含まれます。</span>
      <Link
        href="/disclosure"
        className="underline underline-offset-2 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        広告掲載について
      </Link>
    </p>
  );
}
