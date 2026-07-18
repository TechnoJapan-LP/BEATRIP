import Link from "next/link";
import { Plane, TrendingDown } from "lucide-react";
import type { DealSchema } from "@/data/deal-schema";
import { getActiveDeals } from "@/lib/deals/deal-service";

/**
 * ディール詳細末尾の「関連ディール」レコメンド。
 *
 * 同 destination_code、または ±30% 価格帯の他ディールから最大 4 件抽出。
 * セッション深度 (次クリック) を稼ぐためのユニット。
 */
export async function RelatedDeals({
  currentDeal,
}: {
  currentDeal: DealSchema;
}) {
  const all = await getActiveDeals();

  const sameDestination: DealSchema[] = [];
  const samePriceRange: DealSchema[] = [];

  for (const d of all) {
    if (d.id === currentDeal.id) continue;
    if (d.destination_code === currentDeal.destination_code) {
      sameDestination.push(d);
      continue;
    }
    const ratio =
      Math.abs(d.sale_price - currentDeal.sale_price) /
      Math.max(currentDeal.sale_price, 1);
    if (ratio < 0.3) {
      samePriceRange.push(d);
    }
  }

  // 同 destination を優先しつつ価格帯近似で埋める。割引率降順で並べ替え。
  const seen = new Set<string>();
  const merged = [...sameDestination, ...samePriceRange]
    .filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    })
    .sort((a, b) => b.discount_percent - a.discount_percent)
    .slice(0, 4);

  if (merged.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-2xl">
            Related Deals
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            同じ目的地・近い価格帯の他のお得便
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {merged.map((d) => (
          <Link
            key={d.id}
            href={`/deals/${d.id}`}
            className="group flex flex-col rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3 transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-md"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
              <span>{d.origin_code}</span>
              <Plane className="h-2.5 w-2.5 rotate-45" aria-hidden="true" />
              <span>{d.destination_code}</span>
            </div>
            <div className="mt-1 truncate text-sm font-bold text-zinc-800 dark:text-zinc-200">
              {d.destination}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <div className="font-heading text-lg leading-none text-zinc-900 dark:text-zinc-100">
                ¥{d.sale_price.toLocaleString()}
              </div>
              <div className="flex items-center gap-0.5 text-[10px] font-bold text-rose-500">
                <TrendingDown className="h-2.5 w-2.5" aria-hidden="true" />
                -{d.discount_percent}%
              </div>
            </div>
            <div className="mt-1 truncate text-[10px] text-zinc-400">
              {d.airline_name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
