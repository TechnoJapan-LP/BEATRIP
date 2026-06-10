"use client";

import type { ReactNode } from "react";
import { BedDouble, ArrowUpRight } from "lucide-react";
import { buildHotelLink } from "@/lib/affiliate/url-builder";
import { cityNameEn } from "@/lib/airport-names";
import { trackHotelClick } from "@/components/analytics";
import { HotelBookingButtons } from "@/components/affiliate/hotel-booking-buttons";

/**
 * 目的地ホテルへの送客ブロック（高料率アフィリエイト）。
 * フライトディール閲覧者は宿泊需要も高く、同じ訪問者の収益を底上げする。
 *
 * 構成：
 *  1) ヒーローカード — Hotellook 横断検索（チェックイン/アウト付き）
 *  2) OTAピル群     — Booking / Trip / Agoda / Hotellook へ city-level 深リンク
 *
 * 各クリックは GA4 `hotel_click` イベントとして計測（収益化の主要KPI）。
 */
export function HotelCrossSell({
  destinationCode,
  destinationLabel,
  checkIn,
  checkOut,
  dealId,
  hotelHighlights,
}: {
  destinationCode: string;
  /** 表示用の都市名（日本語） */
  destinationLabel: string;
  checkIn?: string;
  checkOut?: string;
  /** 起点となったディールID（イベント属性として送信） */
  dealId?: string;
  /**
   * 「{都市}の代表的なホテル」折りたたみ（Server Component を slot で受け取る）。
   * ヒーローと OTA ピルの間に差し込み、ホテル関連 UI を 1 枚のカードに統合する。
   */
  hotelHighlights?: ReactNode;
}) {
  const cityEn = cityNameEn(destinationCode);
  const heroHref = buildHotelLink(cityEn, checkIn, checkOut);

  return (
    <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
      {/* 1) ヒーロー: Hotellook 横断検索 */}
      <a
        href={heroHref}
        target="_blank"
        rel="sponsored noopener noreferrer"
        onClick={() =>
          trackHotelClick({
            destinationCode,
            dealId,
            provider: "hotellook_hero",
          })
        }
        className="group flex items-center gap-4 p-5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
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

      {/* 2) 代表的なホテル（折りたたみ） — 同カード内・中段 */}
      {hotelHighlights}

      {/* 3) OTA ピル: Booking / Agoda / Hotellook / Trip — 一番下 */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
          価格比較・予約サイト
        </p>
        <HotelBookingButtons
          hotelName=""
          cityNameEn={cityEn}
          checkIn={checkIn}
          checkOut={checkOut}
          destinationCode={destinationCode}
          dealId={dealId}
          size="md"
        />
      </div>
    </div>
  );
}
