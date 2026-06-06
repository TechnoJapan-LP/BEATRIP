// Server component: 純表示用 (useClient 不要)

import type { BestTimeToBook } from "@/data/deal-schema";

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function priceColor(ratio: number): string {
  if (ratio <= 0.2) return "bg-emerald-500";
  if (ratio <= 0.4) return "bg-emerald-300";
  if (ratio <= 0.6) return "bg-amber-300";
  if (ratio <= 0.8) return "bg-orange-400";
  return "bg-rose-500";
}

function priceLabelColor(ratio: number): string {
  if (ratio <= 0.2) return "text-emerald-600 font-bold";
  if (ratio <= 0.4) return "text-emerald-500";
  if (ratio <= 0.6) return "text-amber-500";
  if (ratio <= 0.8) return "text-orange-500";
  return "text-rose-500 font-bold";
}

export function PriceChart({ prediction }: { prediction: BestTimeToBook }) {
  const { historical_prices } = prediction;
  // 空配列で Math.max/min が ±Infinity を返し NaN 連鎖するのを防ぐ
  if (!historical_prices || historical_prices.length === 0) return null;
  const prices = historical_prices.map((p) => p.avg_price);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const range = maxPrice - minPrice || 1;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
          <span className="text-[10px] text-zinc-400">安い</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-amber-300" />
          <span className="text-[10px] text-zinc-400">普通</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
          <span className="text-[10px] text-zinc-400">高い</span>
        </div>
      </div>
      <div className="relative rounded-lg bg-zinc-50 px-3 pt-4 pb-2">
        <div className="absolute inset-x-3 top-4 bottom-8 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="border-b border-zinc-200/70" />
          ))}
        </div>
        <div className="relative flex items-end gap-1 sm:gap-2 overflow-x-auto" style={{ height: 180 }}>
          {historical_prices.map((mp, i) => {
            const ratio = (mp.avg_price - minPrice) / range;
            const height = ratio * 75 + 25;
            return (
              <div key={mp.month} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 h-full justify-end sm:gap-1.5">
                <span className={`text-[8px] font-mono leading-none hidden sm:block ${priceLabelColor(ratio)}`}>
                  ¥{formatPrice(mp.avg_price)}
                </span>
                <div
                  className={`w-full rounded-t animate-grow-h ${priceColor(ratio)}`}
                  style={{ height: `${height}%`, animationDelay: `${i * 0.05}s` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex gap-1 sm:gap-2 mt-1.5 border-t border-zinc-200 pt-1.5">
          {historical_prices.map((mp) => (
            <div key={mp.month} className="flex-1 min-w-[28px] text-center">
              <span
                className={`text-[9px] sm:text-[10px] ${
                  mp.is_best
                    ? "font-bold text-emerald-600"
                    : "text-zinc-400"
                }`}
              >
                {mp.month_name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
