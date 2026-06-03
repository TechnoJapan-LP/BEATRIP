import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Plane, BedDouble } from "lucide-react";
import type { DealSchema } from "@/data/deal-schema";
import { HOTEL_BY_SLUG } from "@/data/hotel-destinations";

/**
 * トップページの「旅に出たくなる」ヒーローブロック。
 * 雑誌のような左1大カード + 右2小カードのレイアウトで目的地を提示し、
 * 各カードに代表航空券価格＋ホテル価格を載せて「フライト＋ホテル」両方
 * の導線を1スクリーンで提供する。
 *
 * - 大カード: 主目玉。背景フル画像＋オーバーレイ＋情報密度
 * - 小カード: サブの2目玉。同パターンでスケール感だけ違う
 * 全カードは目的地ホテルページ(/hotels/{slug})へ。
 */

type Spotlight = {
  slug: string; // HotelDestination slug
  badge?: string; // "今が買い時" 等のキャッチ
};

function findCheapestFlight(
  deals: DealSchema[],
  iataCodes: string[]
): DealSchema | null {
  const matches = deals.filter((d) =>
    iataCodes.includes(d.destination_code)
  );
  if (matches.length === 0) return null;
  return matches.reduce((min, d) =>
    d.sale_price < min.sale_price ? d : min
  );
}

export function DestinationSpotlight({
  deals,
  spotlights,
  lh,
}: {
  deals: DealSchema[];
  spotlights: Spotlight[];
  /** localizeHref */
  lh: (href: string) => string;
}) {
  const enriched = spotlights
    .map((s) => {
      const dest = HOTEL_BY_SLUG[s.slug];
      if (!dest) return null;
      const flight = findCheapestFlight(deals, dest.iataCodes);
      return { ...s, dest, flight };
    })
    .filter(Boolean) as Array<
    Spotlight & {
      dest: NonNullable<(typeof HOTEL_BY_SLUG)[string]>;
      flight: DealSchema | null;
    }
  >;

  if (enriched.length === 0) return null;
  const [hero, ...rest] = enriched;
  const sides = rest.slice(0, 2);

  return (
    <section aria-label="今週のおすすめ旅先">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-rose-500 mb-1 uppercase">
            Where to next?
          </p>
          <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase sm:text-3xl lg:text-4xl">
            今週、行きたくなる旅先
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            航空券＋ホテルがいま安い目的地をピックアップ
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 大カード（左 2/3） */}
        <SpotlightCard
          item={hero}
          tall
          lh={lh}
          className="lg:col-span-2"
        />
        {/* 小カード（右 1/3 縦積み） */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {sides.map((s) => (
            <SpotlightCard key={s.slug} item={s} lh={lh} />
          ))}
        </div>
      </div>
    </section>
  );
}

function SpotlightCard({
  item,
  tall,
  lh,
  className = "",
}: {
  item: {
    slug: string;
    badge?: string;
    dest: NonNullable<(typeof HOTEL_BY_SLUG)[string]>;
    flight: DealSchema | null;
  };
  tall?: boolean;
  lh: (href: string) => string;
  className?: string;
}) {
  const { dest, flight, badge } = item;

  return (
    <Link
      href={lh(`/hotels/${dest.slug}`)}
      className={`group relative block overflow-hidden rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 shadow-sm transition-all hover:shadow-xl active:scale-[0.99] ${className}`}
    >
      <div
        className={`relative w-full ${
          tall
            // モバイルは縦長(4/5)で画面を埋め、デスクトップは横長(16/11)に
            ? "aspect-[4/5] sm:aspect-[16/11]"
            : "aspect-[4/3]"
        }`}
        style={tall ? { maxHeight: "min(72vh, 540px)" } : undefined}
      >
        {dest.image && (
          <Image
            src={dest.image}
            alt={dest.nameJa}
            fill
            sizes={tall ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
            className={`object-cover transition-transform duration-700 group-hover:scale-110 ${tall ? "animate-ken-burns" : ""}`}
            priority={tall}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

        {badge && (
          <div className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-[11px] font-bold tracking-wider uppercase text-white shadow-lg animate-soft-pulse">
            {badge}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
          <p className="mb-1 text-[11px] font-mono tracking-widest text-white/70">
            {dest.iataCodes[0]}
          </p>
          <h3
            className={`font-heading leading-none tracking-wide text-white uppercase ${
              tall ? "text-4xl sm:text-5xl lg:text-6xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {dest.nameJa}
          </h3>
          <p className="mt-2 text-xs text-white/80 sm:text-sm">
            {dest.tagline}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {flight && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white">
                <Plane className="h-3 w-3" />
                航空券¥{flight.sale_price.toLocaleString()}〜
              </span>
            )}
            {dest.priceFromJpy && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white">
                <BedDouble className="h-3 w-3" />
                ホテル¥{dest.priceFromJpy.toLocaleString()}〜
              </span>
            )}
          </div>

          <div
            className={`mt-4 hidden items-center gap-1.5 text-sm font-medium text-white/80 transition-colors group-hover:text-white ${tall ? "sm:flex" : "sm:flex"}`}
          >
            {dest.nameJa}の旅を計画する
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
