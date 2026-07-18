import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  HOTEL_DESTINATIONS,
  getHotelDestinationBySlug,
  type HotelDestination,
} from "@/data/hotel-destinations";

/**
 * Wave 2-B3: 前/次の都市ナビゲーション
 *
 * 同 region (国内 / アジア / 欧州 / 米州 / オセアニア・その他) の都市配列で
 * 現在の都市の前後にあたる都市へ内部リンク。回遊性向上 → セッション深度↑
 * → アフィリエイトクリック総数↑ を狙う。
 *
 * - 配列の端は wrap-around (先頭の prev は末尾 / 末尾の next は先頭)
 * - region 内が 1 都市以下なら null を返してレンダリングしない
 */
type Props = {
  currentSlug: string;
};

function gradientForRegion(region: HotelDestination["region"]): string {
  switch (region) {
    case "国内":
      return "from-rose-400 via-rose-500 to-orange-500";
    case "アジア":
      return "from-amber-400 via-orange-500 to-rose-500";
    case "欧州":
      return "from-sky-400 via-indigo-500 to-violet-600";
    case "米州":
      return "from-emerald-400 via-teal-500 to-sky-600";
    case "オセアニア・その他":
      return "from-fuchsia-400 via-purple-500 to-indigo-600";
  }
}

export function CityPrevNextNav({ currentSlug }: Props) {
  const current = getHotelDestinationBySlug(currentSlug);
  if (!current) return null;

  const sameRegion = HOTEL_DESTINATIONS.filter(
    (d) => d.region === current.region,
  );
  if (sameRegion.length < 2) return null;

  const idx = sameRegion.findIndex((d) => d.slug === currentSlug);
  if (idx === -1) return null;

  // wrap-around: 配列の先頭/末尾でループ
  const prev = sameRegion[(idx - 1 + sameRegion.length) % sameRegion.length];
  const next = sameRegion[(idx + 1) % sameRegion.length];

  const gradient = gradientForRegion(current.region);

  return (
    <section className="mt-12">
      <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4">
        他の{current.region === "国内" ? "国内都市" : `${current.region}都市`}も見る
      </h2>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
        同じリージョンの他の宿泊先を順番にチェック。比較検討の参考にどうぞ。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* 前の都市 */}
        <Link
          href={`/hotels/${prev.slug}`}
          className="group relative overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-lg"
        >
          <div className="relative aspect-[16/9] bg-zinc-100 dark:bg-zinc-800">
            {prev.image ? (
              <Image
                src={prev.image}
                alt={prev.nameJa}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                loading="lazy"
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient}`}
                aria-hidden="true"
              >
                <span className="font-heading text-6xl font-bold text-white/90 drop-shadow">
                  {prev.nameJa.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
            <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase opacity-90">
              <ArrowLeft className="h-3 w-3" />
              前の都市
            </div>
            <h3 className="mt-1 font-heading text-2xl tracking-wide uppercase">
              {prev.nameJa}
            </h3>
            <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
              {prev.tagline}
            </p>
          </div>
        </Link>

        {/* 次の都市 */}
        <Link
          href={`/hotels/${next.slug}`}
          className="group relative overflow-hidden rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-[box-shadow,border-color,transform] hover:-translate-y-0.5 hover:border-zinc-200 dark:hover:border-zinc-700 hover:shadow-lg"
        >
          <div className="relative aspect-[16/9] bg-zinc-100 dark:bg-zinc-800">
            {next.image ? (
              <Image
                src={next.image}
                alt={next.nameJa}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                loading="lazy"
                className="object-cover transition-transform group-hover:scale-105"
              />
            ) : (
              <div
                className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${gradient}`}
                aria-hidden="true"
              >
                <span className="font-heading text-6xl font-bold text-white/90 drop-shadow">
                  {next.nameJa.charAt(0)}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white text-right">
            <div className="flex items-center justify-end gap-1.5 text-[10px] font-bold tracking-widest uppercase opacity-90">
              次の都市
              <ArrowRight className="h-3 w-3" />
            </div>
            <h3 className="mt-1 font-heading text-2xl tracking-wide uppercase">
              {next.nameJa}
            </h3>
            <p className="text-xs text-white/80 mt-0.5 line-clamp-1">
              {next.tagline}
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
