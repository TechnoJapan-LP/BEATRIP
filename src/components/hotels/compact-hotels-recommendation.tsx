import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Star } from "lucide-react";
import { CURATED_HOTELS, type CuratedHotel } from "@/data/hotel-curated";
import { getHotelDestinationBySlug } from "@/data/hotel-destinations";
import { getHotelImageUrl } from "@/lib/hotels/hotel-image-url";

type Variant = "grid" | "horizontal";

type Props = {
  /** ホテル都市スラッグの配列 (例: ["tokyo", "osaka"]) */
  citySlugs: string[];
  /** セクションタイトル (default: "おすすめホテル") */
  title?: string;
  /** タイトル下のサブテキスト */
  subtitle?: string;
  /** 最大表示ホテル数 (default: 4) */
  maxHotels?: number;
  /** レイアウト: grid (sm:2 lg:4) or horizontal (snap scroll) */
  variant?: Variant;
};

const tierBadgeClass: Record<CuratedHotel["tier"], string> = {
  ラグジュアリー:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  ハイクラス:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  ミドル:
    "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  バジェット:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
};

const tierGradient: Record<CuratedHotel["tier"], string> = {
  ラグジュアリー: "from-amber-400 via-rose-500 to-purple-600",
  ハイクラス: "from-sky-400 to-indigo-600",
  ミドル: "from-emerald-400 to-teal-600",
  バジェット: "from-zinc-400 to-zinc-600",
};

const tierPriority: Record<CuratedHotel["tier"], number> = {
  ラグジュアリー: 0,
  ハイクラス: 1,
  ミドル: 2,
  バジェット: 3,
};

type Picked = {
  hotel: CuratedHotel;
  citySlug: string;
  cityNameJa: string;
};

/**
 * 各都市から tier=ラグジュアリー優先で 1〜2 件抽出し、合計 maxHotels に絞る。
 * 都市が複数あるときは round-robin で 1 件目を集めてから 2 件目以降を追加。
 */
function pickHotels(citySlugs: string[], maxHotels: number): Picked[] {
  // 都市ごとに tier 優先 + reviewScore でソートした候補列
  const perCity = citySlugs
    .map((slug) => {
      const list = CURATED_HOTELS[slug] ?? [];
      const dest = getHotelDestinationBySlug(slug);
      if (list.length === 0 || !dest) return null;
      const sorted = [...list].sort((a, b) => {
        const tp = tierPriority[a.tier] - tierPriority[b.tier];
        if (tp !== 0) return tp;
        return (b.reviewScore ?? 0) - (a.reviewScore ?? 0);
      });
      return { slug, cityNameJa: dest.nameJa, hotels: sorted };
    })
    .filter((x): x is { slug: string; cityNameJa: string; hotels: CuratedHotel[] } => x !== null);

  if (perCity.length === 0) return [];

  const picked: Picked[] = [];
  const cursors: number[] = perCity.map(() => 0);
  // round-robin: ラウンドあたり各都市から 1 件ずつ
  while (picked.length < maxHotels) {
    let progressed = false;
    for (let i = 0; i < perCity.length; i++) {
      if (picked.length >= maxHotels) break;
      const city = perCity[i];
      const idx = cursors[i];
      if (idx >= city.hotels.length) continue;
      picked.push({ hotel: city.hotels[idx], citySlug: city.slug, cityNameJa: city.cityNameJa });
      cursors[i] = idx + 1;
      progressed = true;
    }
    if (!progressed) break;
  }
  return picked;
}

export function CompactHotelsRecommendation({
  citySlugs,
  title = "おすすめホテル",
  subtitle,
  maxHotels = 4,
  variant = "grid",
}: Props) {
  if (!citySlugs || citySlugs.length === 0) return null;
  const picks = pickHotels(citySlugs, maxHotels);
  if (picks.length === 0) return null;

  const containerCls =
    variant === "grid"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      : "flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-thin pb-2 -mx-4 px-4 sm:mx-0 sm:px-0";
  const cardCls =
    variant === "grid"
      ? ""
      : "snap-start flex-shrink-0 w-[260px] sm:w-[280px]";

  return (
    <section>
      <div className="flex items-center gap-2 mb-2">
        <BedDouble className="h-4 w-4 text-zinc-400" />
        <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-xl">
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
          {subtitle}
        </p>
      )}
      <div className={containerCls}>
        {picks.map(({ hotel: h, citySlug, cityNameJa }) => {
          const reviewScore = h.reviewScore ?? 8.5;
          const hotelImageUrl = getHotelImageUrl(citySlug, h);
          return (
            <Link
              key={`${citySlug}-${h.name}`}
              href={`/hotels/${citySlug}`}
              className={`group block overflow-hidden rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors ${cardCls}`}
            >
              <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-800">
                {hotelImageUrl ? (
                  <Image
                    src={hotelImageUrl}
                    alt={h.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    loading="lazy"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${tierGradient[h.tier]}`}
                    aria-hidden="true"
                  >
                    <span className="font-heading text-4xl font-bold text-white/90 drop-shadow">
                      {h.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span
                  className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${tierBadgeClass[h.tier]}`}
                >
                  {h.tier}
                </span>
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:underline">
                  {h.name}
                </h3>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-300">
                    <Star
                      className="h-3 w-3 fill-emerald-500 text-emerald-500"
                      aria-hidden="true"
                    />
                    <span className="font-bold">{reviewScore.toFixed(1)}</span>
                  </span>
                  <span aria-hidden="true" className="text-zinc-300">·</span>
                  <span className="truncate">{h.area}</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                  {cityNameJa}のホテル一覧
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
