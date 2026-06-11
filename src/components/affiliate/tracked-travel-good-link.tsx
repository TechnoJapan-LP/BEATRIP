"use client";

import { ArrowUpRight } from "lucide-react";
import { trackPartnerClick } from "@/components/analytics";

const ACCENT_CLASS = {
  rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200",
  sky: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-200",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  violet: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-200",
  amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  zinc: "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200",
} as const;

export type TravelGoodAccent = keyof typeof ACCENT_CLASS;

/**
 * 物販 (旅行用品) CTA クリック計測専用の最小クライアント wrapper。
 * 親 (TravelGoodsBlock) は Server Component のままにし、onClick が必要な
 * <a> のみここで囲うことでクライアント bundle を最小化する。
 *
 * travel-goods.ts (env 依存) には依存させない。必要な引数だけ受け取る。
 */
export function TrackedTravelGoodLink({
  href,
  goodId,
  category,
  source,
  accent,
  label,
}: {
  href: string;
  goodId: string;
  category: string;
  source?: string;
  accent: TravelGoodAccent;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer nofollow"
      onClick={() =>
        trackPartnerClick({
          partnerId: goodId,
          category,
          source,
          placement: "travel-goods",
        })
      }
      className={`group inline-flex w-full items-center justify-center gap-1 rounded-full border px-3 py-2 text-xs font-bold transition-colors ${ACCENT_CLASS[accent]}`}
    >
      {label}
      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}
