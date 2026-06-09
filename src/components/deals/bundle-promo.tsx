import Link from "next/link";
import { BedDouble, Plane, ArrowUpRight } from "lucide-react";
import type { DealSchema } from "@/data/deal-schema";
import { getHotelSlugByIata, getHotelDestinationBySlug } from "@/data/hotel-destinations";

/**
 * 航空券 + ホテル のバンドル試算カード。
 *
 * フライトディール詳細ページに掲示し、「+ N 泊で総額いくら」をその場で提示。
 * ホテル単独の興味喚起より、合算で「旅費感」を可視化したほうが
 * クロスセル CTR が高くなる（B2C 旅行サイト一般則）。
 *
 * - hotel 1 泊単価: HOTEL_DESTINATIONS.priceFromJpy（destination_code → slug 経由）
 *   未登録目的地は ¥12,000 を仮置き（中位アジア圏の汎用相場）
 * - 滞在日数: deal.departure_date / return_date から計算（同日なら 1 泊扱い）
 *   日付欠落時は 7 泊固定
 * - 行き先: HOTEL_DESTINATIONS にスラッグがあれば /hotels/{slug} へ。
 *   無い場合はカードは出さない（無効なリンクを避けるため null を返す）
 */

const DEFAULT_HOTEL_RATE_JPY = 12_000;
const FALLBACK_NIGHTS = 7;

function computeNights(departure?: string, ret?: string): number {
  if (!departure || !ret) return FALLBACK_NIGHTS;
  const d1 = new Date(departure).getTime();
  const d2 = new Date(ret).getTime();
  if (!Number.isFinite(d1) || !Number.isFinite(d2) || d2 <= d1) return FALLBACK_NIGHTS;
  const nights = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  return Math.max(1, nights);
}

function formatPrice(n: number): string {
  return new Intl.NumberFormat("ja-JP").format(n);
}

export function BundlePromo({ deal }: { deal: DealSchema }) {
  const citySlug = getHotelSlugByIata(deal.destination_code);
  const dest = citySlug ? getHotelDestinationBySlug(citySlug) : undefined;

  // 行き先がホテル登録対象外なら表示しない（リンク先が無いため）
  if (!citySlug || !dest) return null;

  const nights = computeNights(deal.departure_date, deal.return_date);
  const hotelStarting = dest.priceFromJpy ?? DEFAULT_HOTEL_RATE_JPY;
  const hotelTotal = nights * hotelStarting;
  const grandTotal = deal.sale_price + hotelTotal;

  const params = new URLSearchParams();
  if (deal.departure_date) params.set("checkIn", deal.departure_date.slice(0, 10));
  if (deal.return_date) params.set("checkOut", deal.return_date.slice(0, 10));
  const qs = params.toString();
  const hotelHref = `/hotels/${citySlug}${qs ? `?${qs}` : ""}`;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-rose-950/30 dark:via-zinc-900 dark:to-amber-950/30 ring-2 ring-rose-200 dark:ring-rose-900/50 p-5 sm:p-6">
      {/* バッジ */}
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
          Bundle &amp; Save
        </span>
        <span className="text-xs text-zinc-500 dark:text-zinc-400">
          航空券 + ホテル {nights} 泊でまとめて準備
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          {/* 内訳 */}
          <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
            <Plane className="h-3.5 w-3.5 text-rose-500" />
            <span className="font-mono">
              航空券 ¥{formatPrice(deal.sale_price)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
            <BedDouble className="h-3.5 w-3.5 text-amber-500" />
            <span className="font-mono">
              ホテル ¥{formatPrice(hotelStarting)} × {nights} 泊 = ¥
              {formatPrice(hotelTotal)}
            </span>
            <span className="text-[10px] text-zinc-400">目安</span>
          </div>

          {/* 合計 — 一番目立たせる */}
          <div className="pt-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              旅費総額の目安
            </div>
            <div className="font-heading text-3xl tracking-wide text-zinc-900 dark:text-zinc-100 sm:text-4xl">
              ¥{formatPrice(grandTotal)}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              {dest.nameJa}のホテル相場 1 泊 ¥{formatPrice(hotelStarting)} ベース。
              実際の価格はシーズン・エリアで変動します。
            </p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={hotelHref}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/10 transition-all hover:-translate-y-0.5 hover:bg-zinc-800 active:scale-[0.99] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:px-6 sm:py-3.5"
        >
          ホテルも今すぐ予約
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
}
