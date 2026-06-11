import Image from "next/image";
import Link from "next/link";
import { BedDouble, Star, ArrowRight } from "lucide-react";
import { getHotelCitiesForAirport } from "@/lib/hotels/area-hotel-mapping";
import { getCuratedHotels, type CuratedHotel } from "@/data/hotel-curated";
import { getHotelDestinationBySlug } from "@/data/hotel-destinations";
import { getHotelImageUrlForCard, isProxyPhotoUrl } from "@/lib/hotels/hotel-image-url";

/**
 * Deal 詳細ページの HotelCrossSell 直下に置く「同エリアの代表ホテル」折りたたみ。
 *
 * 目的: フライト閲覧者に、その目的地都市の代表ホテル (CURATED_HOTELS) を
 * 写真付きで提示し、ホテルページ (/hotels/{city}) への送客を増やす。
 * 高料率ホテルアフィリエイトの導線を Deal ページ内で 1 段増やす狙い。
 *
 * <details> ネイティブ折りたたみで JS 不要・Server Component で完結。
 * 既定は閉じた状態 (ページを圧迫しない)。同エリアに curated hotel が
 * 無い destination では何も描画しない。
 *
 * HotelCrossSell の slot として、検索ヒーローと OTA ピルの間 (カード内中段) に
 * 差し込まれる前提。そのため自前の rounded/bg/border は持たず border-t 区切りのみ。
 */

const tierBadgeClass: Record<CuratedHotel["tier"], string> = {
  ラグジュアリー:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  ハイクラス:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  ミドル: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
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

export function DealHotelHighlights({
  destinationCode,
  destinationLabel,
}: {
  /** 目的地 IATA (例: HKG) */
  destinationCode: string;
  /** 表示用都市名 (日本語) */
  destinationLabel: string;
}) {
  const citySlug = getHotelCitiesForAirport(destinationCode)[0];
  if (!citySlug) return null;

  const dest = getHotelDestinationBySlug(citySlug);
  if (!dest) return null;

  const hotels = [...getCuratedHotels(citySlug)]
    .sort((a, b) => {
      const tp = tierPriority[a.tier] - tierPriority[b.tier];
      if (tp !== 0) return tp;
      return (b.reviewScore ?? 0) - (a.reviewScore ?? 0);
    })
    .slice(0, 4);

  if (hotels.length === 0) return null;

  return (
    <details className="group border-t border-zinc-100 dark:border-zinc-800">
      <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <BedDouble className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {destinationLabel}の代表的なホテルを見る
          </h3>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            編集部が選ぶ {hotels.length} 軒。タップで開く
          </p>
        </div>
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-zinc-300 transition-transform group-open:rotate-90" />
      </summary>

      <div className="border-t border-zinc-100 dark:border-zinc-800 p-4">
        <div className="grid grid-cols-2 gap-3">
          {hotels.map((h) => {
            const img = getHotelImageUrlForCard(citySlug, h);
            return (
              <Link
                key={h.name}
                href={`/hotels/${citySlug}`}
                className="group/card block overflow-hidden rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-800">
                  {img ? (
                    <Image
                      src={img}
                      alt={h.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      loading="lazy"
                      className="object-cover"
                      unoptimized={isProxyPhotoUrl(img)}
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${tierGradient[h.tier]}`}
                      aria-hidden="true"
                    >
                      <span className="font-heading text-3xl font-bold text-white/90 drop-shadow">
                        {h.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span
                    className={`absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tierBadgeClass[h.tier]}`}
                  >
                    {h.tier}
                  </span>
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover/card:underline">
                    {h.name}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                    {/* 実データのあるホテルのみスコア表示 (捏造フォールバック禁止) */}
                    {h.reviewScore !== undefined && (
                      <>
                        <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-300">
                          <Star
                            className="h-3 w-3 fill-emerald-500 text-emerald-500"
                            aria-hidden="true"
                          />
                          <span className="font-bold">
                            {h.reviewScore.toFixed(1)}
                          </span>
                        </span>
                        <span aria-hidden="true" className="text-zinc-300">
                          ·
                        </span>
                      </>
                    )}
                    <span className="truncate">{h.area}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <Link
          href={`/hotels/${citySlug}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
        >
          {destinationLabel}のホテルをすべて見る
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </details>
  );
}
