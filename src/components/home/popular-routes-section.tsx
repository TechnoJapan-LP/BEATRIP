import Link from "next/link";
import { ArrowRight, Plane, TrendingDown } from "lucide-react";
import type { DealSchema } from "@/data/deal-schema";

/**
 * 「今人気の路線 TOP 10」
 *
 * 現在 active な deal の中から discount % 上位 10 件を、
 * 出発空港-到着都市の組合せ単位 (=route) で dedup して抽出する。
 * 各カードは /routes/{ORIGIN}-{DESTINATION} に直リンクし、
 * 価格 + 割引 % で「お得感」を視覚化する。
 *
 * Server Component — buildAffiliateLink 等を呼ばないため SSR で完結する。
 */
export function PopularRoutesSection({
  deals,
  lh,
}: {
  deals: DealSchema[];
  /** localizeHref 関数 (lang prefix を付ける) */
  lh: (href: string) => string;
}) {
  // route key (origin-destination) で dedup しつつ discount 上位を取得
  const seen = new Set<string>();
  const top: DealSchema[] = [];
  const sorted = [...deals].sort(
    (a, b) => b.discount_percent - a.discount_percent
  );
  for (const d of sorted) {
    const key = `${d.origin_code}-${d.destination_code}`;
    if (seen.has(key)) continue;
    seen.add(key);
    top.push(d);
    if (top.length === 10) break;
  }

  if (top.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl lg:text-4xl">
            今人気の路線 TOP 10
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            割引率の高い注目セール — 出発空港から到着都市まで直リンク
          </p>
        </div>
        <Link
          href={lh("/#deals")}
          className="hidden items-center gap-1 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-100 dark:hover:text-zinc-100 transition-colors sm:flex"
        >
          全ディール
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {top.map((d, i) => {
          const routeSlug = `${d.origin_code}-${d.destination_code}`;
          return (
            <Link
              key={d.id}
              href={lh(`/routes/${routeSlug}`)}
              className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-3 transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 sm:p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  #{i + 1}
                </span>
                <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
                  <TrendingDown className="h-2.5 w-2.5" aria-hidden />
                  {d.discount_percent}%OFF
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {d.origin_code}
                </span>
                <Plane className="h-3 w-3 rotate-90 text-zinc-400" aria-hidden />
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {d.destination_code}
                </span>
              </div>

              <div className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {d.origin}
                <span className="mx-1 text-zinc-400">→</span>
                {d.destination}
              </div>

              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-base font-bold text-rose-600 dark:text-rose-400 sm:text-lg">
                  ¥{d.sale_price.toLocaleString()}
                </span>
                {d.original_price > d.sale_price && (
                  <span className="text-[10px] text-zinc-400 line-through">
                    ¥{d.original_price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="mt-0.5 truncate text-[10px] text-zinc-500">
                {d.airline_name}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
