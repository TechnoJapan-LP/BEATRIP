"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import { ChevronLeft, ChevronRight, Plane, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAirlineByCode } from "@/data/airlines";
import { cityNameJa } from "@/lib/airport-names";
import {
  useDictionary,
  useLocalizedHref,
} from "@/components/i18n/locale-provider";
import type { DealSchema } from "@/data/deal-schema";

const badgeConfig = {
  NEW: { label: "新着", className: "bg-emerald-500 text-white" },
  ENDING_SOON: { label: "締切間近", className: "bg-amber-500 text-white" },
  BIG_DISCOUNT: { label: "50%OFF以上", className: "bg-rose-500 text-white" },
} as const;

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

// DealCard と同一デザイン（カルーセル用にサイズのみ維持）
function DealMiniCard({ deal }: { deal: DealSchema }) {
  const badge = deal.badge ? badgeConfig[deal.badge] : null;
  const airlineLogo = getAirlineByCode(deal.airline_id)?.logo;
  const lh = useLocalizedHref();

  return (
    <Link
      href={lh(`/deals/${deal.id}`)}
      className="group flex-shrink-0 w-[72vw] max-w-[256px] flex flex-col rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800 overflow-hidden transition-all duration-300 hover:shadow-xl hover:ring-zinc-200 dark:hover:ring-zinc-700 hover:-translate-y-1 sm:w-64 sm:max-w-none"
    >
      <div className="relative h-32 overflow-hidden bg-zinc-200 dark:bg-zinc-800 sm:h-36">
        <Image
          src={deal.image_url}
          alt={deal.destination}
          fill
          sizes="256px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER_DARK}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {badge && (
          <Badge
            className={`absolute top-2 left-2 text-[8px] font-bold tracking-[0.1em] uppercase sm:text-[10px] sm:tracking-[0.15em] ${badge.className}`}
          >
            {badge.label}
          </Badge>
        )}

        <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 backdrop-blur-sm sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs">
          <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          -{deal.discount_percent}%
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-white/70 text-[9px] tracking-wider mb-0.5 sm:text-[11px]">
                <span className="font-mono">{deal.origin_code}</span>
                <Plane className="h-2.5 w-2.5 rotate-45 sm:h-3 sm:w-3" />
                <span className="font-mono">{deal.destination_code}</span>
              </div>
              <h3 className="font-heading text-[17px] leading-none tracking-wide text-white uppercase truncate sm:text-[22px]">
                {deal.destination}
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-white/50 text-[9px] line-through font-mono sm:text-[11px]">
                ¥{formatPrice(deal.original_price)}
              </div>
              <div className="text-[16px] font-heading leading-none text-white tracking-wide sm:text-[22px]">
                ¥{formatPrice(deal.sale_price)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto px-2.5 py-2 flex items-center justify-between sm:px-3 sm:py-2.5">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {airlineLogo && (
            // 隣の span が airline 名を読み上げるため装飾扱い
            <img
              src={airlineLogo}
              alt=""
              className="h-4 w-4 flex-shrink-0 rounded-[3px] object-contain sm:h-[18px] sm:w-[18px]"
              loading="lazy"
            />
          )}
          <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 truncate tracking-tight sm:text-xs">
            {deal.airline_name}
          </span>
        </div>
        <span className="flex-shrink-0 text-[10px] font-medium text-zinc-400 sm:text-[11px]">
          {cityNameJa(deal.origin_code)}発
        </span>
      </div>
    </Link>
  );
}

export function DealCarousel({
  deals,
  title,
  subtitle,
}: {
  deals: DealSchema[];
  title: string;
  subtitle?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const common = useDictionary<Record<string, string>>("common");
  const lh = useLocalizedHref();

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
  }, []);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction === "left" ? -280 : 280, behavior: "smooth" });
  }

  if (deals.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 uppercase">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-zinc-400">{subtitle}</p>
          )}
        </div>
        <Link
          href={lh("/")}
          className="text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {common.seeAll} →
        </Link>
      </div>
      <div className="relative group/carousel">
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/90 shadow-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-white transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-white/90 shadow-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-white transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {deals.map((deal) => (
            <DealMiniCard key={deal.id} deal={deal} />
          ))}
        </div>
      </div>
    </div>
  );
}
