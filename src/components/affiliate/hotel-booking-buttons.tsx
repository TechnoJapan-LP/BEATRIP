"use client";

import { ArrowUpRight } from "lucide-react";
import {
  HOTEL_SEARCH_PROVIDERS,
  type HotelDirectUrls,
} from "@/lib/affiliate/hotel-search";
import { trackHotelClick } from "@/components/analytics";

/**
 * 1ホテル or 1都市につき複数OTAの予約ボタンを横並びで表示。
 * クリックで各サイトの「ホテル名/都市検索」結果ページへ深リンク。
 * marker帰属はOTAごとに tp.media wrap で処理（program_id 未設定なら素のリンク）。
 *
 * hotelName="" を渡すと都市検索（cross-sell 用）になる。
 */

const ACCENT_CLASS: Record<string, string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800",
  sky: "bg-sky-50 text-sky-700 ring-sky-200 hover:bg-sky-100 dark:bg-sky-900/30 dark:text-sky-200 dark:ring-sky-800",
  rose: "bg-rose-50 text-rose-700 ring-rose-200 hover:bg-rose-100 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800",
  violet: "bg-violet-50 text-violet-700 ring-violet-200 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-200 dark:ring-violet-800",
  amber: "bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800",
};

export function HotelBookingButtons({
  hotelName,
  cityNameEn,
  checkIn,
  checkOut,
  /** GA4 イベント用 — 起点ディール or 起点都市コード */
  destinationCode,
  dealId,
  /**
   * OTA 別ホテル詳細ページのフル URL。設定があれば検索 URL ではなく
   * その詳細ページへ直接遷移する。未設定の provider は従来の検索 URL fallback。
   */
  otaUrls,
  size = "sm",
  className = "",
}: {
  hotelName: string;
  cityNameEn: string;
  checkIn?: string;
  checkOut?: string;
  destinationCode?: string;
  dealId?: string;
  otaUrls?: HotelDirectUrls;
  size?: "sm" | "md";
  className?: string;
}) {
  const padding =
    size === "md"
      ? "px-3 py-2 text-sm sm:py-1.5 sm:text-xs"
      : "px-3 py-1.5 text-xs sm:px-2.5 sm:py-1 sm:text-[11px]";

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {HOTEL_SEARCH_PROVIDERS.map((p) => (
        <a
          key={p.id}
          href={p.url(hotelName, cityNameEn, { checkIn, checkOut }, otaUrls)}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={() =>
            trackHotelClick({
              destinationCode: destinationCode ?? cityNameEn,
              dealId,
              provider: p.id,
            })
          }
          className={`group inline-flex items-center gap-1 rounded-full ${padding} font-bold ring-1 transition-colors ${ACCENT_CLASS[p.accent]}`}
        >
          {p.label}
          <ArrowUpRight className="h-2.5 w-2.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      ))}
    </div>
  );
}
