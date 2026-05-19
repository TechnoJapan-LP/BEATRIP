import { BedDouble, ArrowUpRight } from "lucide-react";
import { buildHotelLink } from "@/lib/affiliate/url-builder";
import { cityNameEn } from "@/lib/airport-names";

/**
 * 目的地ホテルへの送客ブロック（高料率アフィリエイト）。
 * フライトディール閲覧者は宿泊需要も高く、同じ訪問者の収益を底上げする。
 * URLベース（Hotellook marker）で第三者スクリプト不要・ページ軽量を維持。
 */
export function HotelCrossSell({
  destinationCode,
  destinationLabel,
  checkIn,
  checkOut,
}: {
  destinationCode: string;
  /** 表示用の都市名（日本語） */
  destinationLabel: string;
  checkIn?: string;
  checkOut?: string;
}) {
  const href = buildHotelLink(
    cityNameEn(destinationCode),
    checkIn,
    checkOut
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored noopener noreferrer"
      className="group flex items-center gap-4 rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5 transition-colors hover:border-zinc-200 dark:hover:border-zinc-700"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
        <BedDouble className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {destinationLabel}のホテルを探す
        </h3>
        <p className="text-[11px] text-zinc-400 mt-0.5">
          フライトに合わせて宿泊先も。料金を比較してまとめて準備
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}
