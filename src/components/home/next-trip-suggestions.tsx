import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { HOTEL_DESTINATIONS } from "@/data/hotel-destinations";

/**
 * 詳細ページ末尾の「次の旅はどこへ？」サジェスト。
 *
 * 現在の目的地以外から3都市を決定論的に提示。slug ハッシュをseedにすることで
 * 同じページなら毎回同じ提案（人為的でない自然な構成、内部リンクgraph強化）。
 */

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function NextTripSuggestions({
  excludeSlug,
  seed,
  title = "次はどこへ？",
  subtitle = "次に行ってみたい旅先のヒント",
}: {
  /** 自分自身（slug ベース）を除外 */
  excludeSlug?: string;
  /** ハッシュseed（slug, dealId, routeKey 等）。同じseedなら同じ提案 */
  seed: string;
  title?: string;
  subtitle?: string;
}) {
  const pool = HOTEL_DESTINATIONS.filter((d) => d.slug !== excludeSlug);
  if (pool.length < 3) return null;
  const seedNum = hash(seed);
  // 決定論的な3つピック（出発オフセット + 等間隔）
  const step = Math.max(1, Math.floor(pool.length / 4));
  const picks = [0, 1, 2].map((i) => pool[(seedNum + i * step) % pool.length]);

  return (
    <section className="mt-10 mb-6">
      <div className="mb-4">
        <p className="text-[11px] font-bold tracking-widest text-rose-500 mb-1 uppercase">
          Wanderlust
        </p>
        <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-2xl">
          {title}
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
          {subtitle}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {picks.map((d) => (
          <Link
            key={d.slug}
            href={`/hotels/${d.slug}`}
            className="group relative block overflow-hidden rounded-xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="relative aspect-[5/3] bg-zinc-200 dark:bg-zinc-800">
              {d.image && (
                <Image
                  src={d.image}
                  alt={d.nameJa}
                  fill
                  sizes="(min-width: 640px) 33vw, 100vw"
                  loading="lazy"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <h3 className="font-heading text-[18px] leading-none tracking-wide text-white uppercase sm:text-[20px]">
                  {d.nameJa}
                </h3>
                <p className="mt-1 text-[10px] text-white/80">
                  {d.tagline}
                </p>
              </div>
              <ArrowUpRight className="absolute right-3 top-3 h-4 w-4 text-white/70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
