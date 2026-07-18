// Server component: 純表示用 (useClient 不要)

import Link from "next/link";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import { Plane, TrendingDown, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAirlineByCode } from "@/data/airlines";
import { cityNameJa } from "@/lib/airport-names";
import type { DealSchema } from "@/data/deal-schema";
import { CountdownBadge } from "@/components/deals/countdown-badge";

const badgeConfig = {
  NEW: { label: "新着", className: "bg-emerald-500 text-white hover:bg-emerald-600" },
  ENDING_SOON: { label: "締切間近", className: "bg-amber-500 text-white hover:bg-amber-600" },
  BIG_DISCOUNT: { label: "50%OFF以上", className: "bg-rose-500 text-white hover:bg-rose-600" },
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
  index,
  variantOriginCodes,
}: {
  deal: DealSchema;
  index: number;
  /** 同じ目的地の他便の出発空港コード（最大3つ）。ある場合は出発地に「ほか」を付す */
  variantOriginCodes?: string[];
}) {
  const badge = deal.badge ? badgeConfig[deal.badge] : null;
  const deadlineDays = daysUntil(deal.booking_deadline);
  const airlineLogo = getAirlineByCode(deal.airline_id)?.logo;

  return (
    <div
      className="h-full animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.6)}s` }}
    >
      <Link
        href={`/deals/${deal.id}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 transition-[box-shadow,transform] duration-300 hover:shadow-xl hover:ring-zinc-200 dark:hover:ring-zinc-700 hover:-translate-y-1 active:scale-[0.98] active:transition-transform active:duration-100"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200 dark:bg-zinc-800">
          <Image
            src={deal.image_url}
            alt={deal.destination}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            // HeroDeal (priority=high) と帯域を奪い合わないため、
            // grid 内では先頭 1 枚のみ priority、最初の 2 枚のみ eager。
            loading={index < 2 ? "eager" : "lazy"}
            priority={index === 0}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER_DARK}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {deal.is_sample ? (
            <span className="absolute top-2 left-2 rounded-full bg-zinc-700/90 px-2 py-0.5 text-[9px] font-bold text-zinc-100 backdrop-blur-sm sm:top-3 sm:left-3 sm:text-[10px]">
              参考事例
            </span>
          ) : deal.is_estimate ? (
            // TravelPayouts「最安値ウォッチ」由来。確定セールではない目安であることを明示。
            <span className="absolute top-2 left-2 rounded-full bg-sky-600/90 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm sm:top-3 sm:left-3 sm:text-[10px]">
              最安目安
            </span>
          ) : (
            badge && (
              <Badge className={`absolute top-2 left-2 text-[8px] font-bold tracking-[0.1em] uppercase sm:top-3 sm:left-3 sm:text-[10px] sm:tracking-[0.15em] ${badge.className}`}>
                {badge.label}
              </Badge>
            )
          )}

          <div className="absolute top-2 right-2 flex flex-col items-end gap-1 sm:top-3 sm:right-3">
            {/* 割引率は相場比がある時だけ表示 (0%の「-0%」表示を防ぐ) */}
            {deal.discount_percent > 0 && (
              <div className="flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 backdrop-blur-sm sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs">
                <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                -{deal.discount_percent}%
              </div>
            )}
            <CountdownBadge deadline={deal.booking_deadline} />
          </div>

          {!deal.is_sample && deal.seats_remaining !== undefined && deal.seats_remaining <= 10 && (
            <div className="absolute top-10 right-2 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] text-white backdrop-blur-sm sm:top-14 sm:right-3 sm:px-2 sm:text-[10px]">
              <Users className="h-2.5 w-2.5" />
              残{deal.seats_remaining}席
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
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
                {/* 取り消し線の原価は相場比がある時だけ (同額の取り消し線を防ぐ) */}
                {deal.discount_percent > 0 && (
                  <div className="text-white/50 text-[9px] line-through font-mono sm:text-[11px]">
                    ¥{formatPrice(deal.original_price)}
                  </div>
                )}
                <div className="text-[16px] font-heading leading-none text-white tracking-wide sm:text-[26px]">
                  ¥{formatPrice(deal.sale_price)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto px-2.5 py-2 flex items-center justify-between sm:px-4 sm:py-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {airlineLogo ? (
              // 隣の span が airline 名を読み上げるため装飾扱い
              <img
                src={airlineLogo}
                alt=""
                className="h-4 w-4 flex-shrink-0 rounded-[3px] object-contain sm:h-[18px] sm:w-[18px]"
                loading="lazy"
              />
            ) : (
              // ロゴ未登録 (例: TravelPayouts "TP") はアイコンで代替し行が崩れないようにする
              <Plane
                aria-hidden
                className="h-4 w-4 flex-shrink-0 rotate-45 text-zinc-400 dark:text-zinc-500 sm:h-[18px] sm:w-[18px]"
              />
            )}
            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 truncate tracking-tight sm:text-xs">{deal.airline_name}</span>
            {deadlineDays > 0 && deadlineDays <= 7 && (
              <>
                <span className="text-zinc-200 dark:text-zinc-700">·</span>
                <span className="text-[10px] font-medium text-amber-500 animate-pulse">
                  残{deadlineDays}日
                </span>
              </>
            )}
          </div>
          <span className="flex-shrink-0 text-[10px] font-medium text-zinc-400 sm:text-[11px]">
            {cityNameJa(deal.origin_code)}発
            {variantOriginCodes && variantOriginCodes.length > 0 ? "ほか" : ""}
          </span>
        </div>
      </Link>
    </div>
  );
}
