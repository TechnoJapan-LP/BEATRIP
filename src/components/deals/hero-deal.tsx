"use client";

import Link from "next/link";
import Image from "next/image";
import { BLUR_PLACEHOLDER_DARK } from "@/lib/images/blur";
import { ArrowRight, TrendingDown, Flame } from "lucide-react";
import type { DealSchema } from "@/data/deal-schema";
import { cityNameJa } from "@/lib/airport-names";
import {
  useDictionary,
  useLocalizedHref,
} from "@/components/i18n/locale-provider";

function formatPrice(p: number) {
  return new Intl.NumberFormat("ja-JP").format(p);
}

/**
 * ファーストビュー用ヒーロー枠。
 * 訪問者が開いた瞬間に「今週の最大級ディール」を見せてフックする。
 * 割引率が最大のディールを1枚だけ大きく表示。
 */
export function HeroDeal({ deals }: { deals: DealSchema[] }) {
  const t = useDictionary<Record<string, string>>("hero");
  const lh = useLocalizedHref();
  if (deals.length === 0) return null;
  const deal = [...deals].sort(
    (a, b) => b.discount_percent - a.discount_percent
  )[0];

  return (
    <Link
      href={lh(`/deals/${deal.id}`)}
      className="group relative block overflow-hidden rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm transition-all hover:shadow-xl active:scale-[0.99] active:duration-100"
    >
      <div
        className="relative w-full"
        style={{ aspectRatio: "4 / 3", maxHeight: "min(55vh, 420px)" }} data-mobile-aspect
      >
        <Image
          src={deal.image_url}
          alt={deal.destination}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER_DARK}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

        {/* 上部: 今週の最大割引バッジ */}
        <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white sm:left-6 sm:top-6 sm:text-xs">
          <Flame className="h-3.5 w-3.5" />
          {t.badge}
        </div>

        {/* 下部: 情報 */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2 font-mono text-[11px] tracking-wider text-white/70 sm:text-sm">
                <span>{deal.origin_code}</span>
                <ArrowRight className="h-3 w-3" />
                <span>{deal.destination_code}</span>
                <span className="text-white/40">·</span>
                <span className="truncate">{deal.airline_name}</span>
              </div>
              <h2 className="font-heading text-3xl leading-none tracking-wide text-white uppercase sm:text-5xl lg:text-6xl">
                {cityNameJa(deal.origin_code)}
                <span className="mx-2 font-sans text-white/50">→</span>
                {deal.destination}
              </h2>
            </div>

            <div className="flex shrink-0 items-end gap-4">
              <div className="text-right">
                <div className="font-mono text-xs text-white/50 line-through sm:text-sm">
                  ¥{formatPrice(deal.original_price)}
                </div>
                <div className="font-heading text-3xl leading-none tracking-wide text-white sm:text-5xl">
                  ¥{formatPrice(deal.sale_price)}
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-xl bg-rose-500 px-3 py-2 text-lg font-bold text-white sm:text-2xl">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                {deal.discount_percent}%
              </div>
            </div>
          </div>

          <div className="mt-4 hidden items-center gap-1.5 text-sm font-medium text-white/80 transition-colors group-hover:text-white sm:flex">
            {t.viewDeal}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
