import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateAction = {
  label: string;
  href: string;
};

type EmptyStateProps = {
  /** 状態を象徴するアイコン (lucide) */
  icon: LucideIcon;
  title: string;
  description?: string;
  /** 主要 CTA (おすすめ・トップへの誘導など) */
  action?: EmptyStateAction;
  /** 補助リンク (複数) */
  secondaryActions?: EmptyStateAction[];
  className?: string;
  /** 枠線付きカードで囲むか (default: true) */
  bordered?: boolean;
};

/**
 * 空状態の共通 UI。
 * 「データがありません」のぶっきらぼうな表示を、
 * アイコン + 説明 + おすすめへの誘導 CTA に統一する。
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryActions,
  className,
  bordered = true,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-12 text-center",
        bordered &&
          "rounded-xl border border-dashed border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/40",
        className
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-100 dark:bg-zinc-800 dark:ring-zinc-700">
        <Icon className="h-6 w-6 text-zinc-400 dark:text-zinc-500" aria-hidden />
      </span>
      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {action.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
      {secondaryActions && secondaryActions.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {secondaryActions.map((sa) => (
            <Link
              key={sa.href}
              href={sa.href}
              className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {sa.label}
              <ArrowRight className="h-3 w-3 text-zinc-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
