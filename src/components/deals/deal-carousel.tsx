"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plane, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DealSchema } from "@/data/deal-schema";

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function DealMiniCard({ deal }: { deal: DealSchema }) {
  return (
    <Link
      href={`/deals/${deal.id}`}
      className="group flex-shrink-0 w-[72vw] max-w-[256px] block rounded-xl border border-zinc-100 bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 sm:w-64 sm:max-w-none"
    >
      <div className="relative h-32 overflow-hidden sm:h-36">
        <img
          src={deal.image_url}
          alt={deal.destination}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <div className="flex items-center gap-1.5 text-white/60 text-[10px] mb-0.5">
            <span className="font-mono">{deal.origin_code}</span>
            <Plane className="h-2.5 w-2.5 rotate-45" />
            <span className="font-mono">{deal.destination_code}</span>
          </div>
          <div className="font-heading text-lg leading-tight tracking-wide text-white uppercase">
            {deal.destination}
          </div>
        </div>
        {deal.badge && (
          <Badge className={`absolute top-2 left-2 text-[9px] font-bold tracking-wider ${
            deal.badge === "NEW" ? "bg-emerald-500 text-white" :
            deal.badge === "ENDING_SOON" ? "bg-amber-500 text-white" :
            "bg-rose-500 text-white"
          }`}>
            {deal.badge === "LOWEST_IN_2_YEARS" ? "LOWEST" : deal.badge === "ENDING_SOON" ? "ENDING" : deal.badge}
          </Badge>
        )}
      </div>
      <div className="px-3 py-2.5 flex items-center justify-between">
        <div>
          <div className="text-[11px] text-zinc-400">{deal.airline_name}</div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-zinc-800">
            ¥{formatPrice(deal.sale_price)}
          </div>
          <div className="flex items-center gap-0.5 justify-end">
            <TrendingDown className="h-2.5 w-2.5 text-rose-500" />
            <span className="text-[10px] text-rose-500 font-medium">
              -{deal.discount_percent}%
            </span>
          </div>
        </div>
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
          href="/"
          className="text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          すべて見る →
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
