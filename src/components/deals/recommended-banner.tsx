"use client";

import Link from "next/link";
import { Plane, TrendingDown, ArrowRight } from "lucide-react";
import type { DealSchema } from "@/data/deal-schema";

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

export function RecommendedBanner({ deals }: { deals: DealSchema[] }) {
  const top3 = [...deals]
    .sort((a, b) => b.discount_percent - a.discount_percent)
    .slice(0, 3);

  if (top3.length === 0) return null;

  return (
    <div className="border-t border-zinc-100 bg-zinc-50">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-heading text-sm tracking-wider text-zinc-900 uppercase">
              おすすめディール
            </span>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1 text-xs font-medium text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            すべてのディールを見る
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {top3.map((deal) => (
            <Link
              key={deal.id}
              href={`/deals/${deal.id}`}
              className="flex items-center gap-3 rounded-lg bg-white px-3 py-2.5 border border-zinc-100 transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="h-12 w-12 flex-shrink-0 rounded-lg overflow-hidden">
                <img
                  src={deal.image_url}
                  alt={deal.destination}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                  <span className="font-mono">{deal.origin_code}</span>
                  <Plane className="h-2.5 w-2.5 rotate-45" />
                  <span className="font-mono">{deal.destination_code}</span>
                  <span className="text-zinc-300">·</span>
                  <span>{deal.airline_name}</span>
                </div>
                <div className="text-sm font-bold text-zinc-800 truncate">
                  {deal.destination}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-zinc-800">
                  ¥{formatPrice(deal.sale_price)}
                </div>
                <div className="flex items-center gap-0.5 justify-end">
                  <TrendingDown className="h-2.5 w-2.5 text-rose-500" />
                  <span className="text-[10px] font-medium text-rose-500">
                    -{deal.discount_percent}%
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
