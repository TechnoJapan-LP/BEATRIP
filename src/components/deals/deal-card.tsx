"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plane, Clock, TrendingDown, Users, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DealSchema } from "@/data/deal-schema";

const badgeConfig = {
  NEW: { label: "NEW", className: "bg-emerald-500 text-white hover:bg-emerald-600" },
  ENDING_SOON: { label: "ENDING", className: "bg-amber-500 text-white hover:bg-amber-600" },
  LOWEST_IN_2_YEARS: { label: "LOWEST", className: "bg-rose-500 text-white hover:bg-rose-600" },
} as const;

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function daysUntil(dateStr: string) {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export function DealCard({
  deal,
  showTotalCost,
  index,
  variantCount,
  variantOriginCodes,
}: {
  deal: DealSchema;
  showTotalCost: boolean;
  index: number;
  /** 同じ目的地への他の便数（自分含む。1の場合はバッジ非表示） */
  variantCount?: number;
  /** 同じ目的地の他便の出発空港コード（最大3つ） */
  variantOriginCodes?: string[];
}) {
  const displayPrice = showTotalCost ? deal.total_cost : deal.sale_price;
  const badge = deal.badge ? badgeConfig[deal.badge] : null;
  const deadlineDays = daysUntil(deal.booking_deadline);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="h-full"
    >
      <Link
        href={`/deals/${deal.id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 transition-all duration-300 hover:shadow-xl hover:ring-zinc-200 dark:hover:ring-zinc-700 hover:-translate-y-1"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={deal.image_url}
            alt={deal.destination}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {badge && (
            <Badge className={`absolute top-2 left-2 text-[8px] font-bold tracking-[0.1em] uppercase sm:top-3 sm:left-3 sm:text-[10px] sm:tracking-[0.15em] ${badge.className}`}>
              {badge.label}
            </Badge>
          )}

          <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
            <div className="flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 backdrop-blur-sm sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs">
              <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              -{deal.discount_percent}%
            </div>
          </div>

          {deal.seats_remaining !== undefined && deal.seats_remaining <= 10 && (
            <div className="absolute top-10 right-2 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] text-white backdrop-blur-sm sm:top-14 sm:right-3 sm:px-2 sm:text-[10px]">
              <Users className="h-2.5 w-2.5" />
              残{deal.seats_remaining}席
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-1 text-white/70 text-[9px] tracking-wider mb-0.5 sm:gap-2 sm:text-[11px]">
                  <span className="font-mono">{deal.origin_code}</span>
                  <Plane className="h-2.5 w-2.5 rotate-45 sm:h-3 sm:w-3" />
                  <span className="font-mono">{deal.destination_code}</span>
                </div>
                <h3 className="font-heading text-[17px] leading-none tracking-wide text-white uppercase truncate sm:text-[28px]">
                  {deal.destination}
                </h3>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-white/50 text-[9px] line-through font-mono sm:text-[11px]">
                  ¥{formatPrice(deal.original_price)}
                </div>
                <div className="text-[16px] font-heading leading-none text-white tracking-wide sm:text-[26px]">
                  ¥{formatPrice(displayPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto px-2.5 py-2 flex items-center justify-between sm:px-4 sm:py-2.5">
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <span className="text-[10px] font-medium text-zinc-500 truncate sm:text-[11px]">{deal.airline_name}</span>
            {variantCount && variantCount > 1 && (
              <>
                <span className="text-zinc-200 dark:text-zinc-700">·</span>
                <span className="flex items-center gap-0.5 text-[10px] font-medium text-sky-600 dark:text-sky-400 sm:text-[11px]">
                  <Layers className="h-2.5 w-2.5" />
                  他{variantCount - 1}便
                </span>
              </>
            )}
            {deadlineDays > 0 && deadlineDays <= 7 && (!variantCount || variantCount <= 1) && (
              <>
                <span className="text-zinc-200 dark:text-zinc-700">·</span>
                <span className="text-[10px] font-medium text-amber-500 animate-pulse">
                  残{deadlineDays}日
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {variantOriginCodes && variantOriginCodes.length > 0 ? (
              <span className="text-[9px] font-mono text-zinc-400 truncate sm:text-[10px]">
                {variantOriginCodes.slice(0, 3).join("・")}
                {variantOriginCodes.length > 3 ? "..." : ""}発
              </span>
            ) : showTotalCost ? (
              <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                <Clock className="h-3 w-3" />
                税・燃油込
              </div>
            ) : (
              <span className="text-[10px] text-zinc-400">
                総額 ¥{formatPrice(deal.total_cost)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
