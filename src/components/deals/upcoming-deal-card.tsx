"use client";

import Image from "next/image";
import { TrendingDown, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getAirlineByName } from "@/data/airlines";
import { cityNameJa } from "@/lib/airport-names";
import type { SaleEvent } from "@/data/mock-deals";

const cityNames: Record<string, string> = {
  BKK: "バンコク",
  JFK: "ニューヨーク",
  CDG: "パリ",
  LHR: "ロンドン",
  LAX: "ロサンゼルス",
  TPE: "台北",
  ICN: "ソウル",
  SIN: "シンガポール",
  DXB: "ドバイ",
  HKG: "香港",
  MNL: "マニラ",
  HAN: "ハノイ",
  SGN: "ホーチミン",
  PVG: "上海",
  HRB: "ハルビン",
  WUH: "武漢",
  HNL: "ホノルル",
  HEL: "ヘルシンキ",
};

function daysUntil(dateStr: string) {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export function UpcomingDealCard({
  event,
  index,
}: {
  event: SaleEvent;
  index: number;
}) {
  const days = daysUntil(event.predictedDate);
  const airlineLogo = getAirlineByName(event.airline)?.logo;

  const origin = event.routes[0]?.split("→")[0] ?? "";
  const destination = event.routes[0]?.split("→")[1] ?? "";
  const destinationCity = cityNames[destination] ?? destination;

  // セール名から航空会社名プレフィックスを除去（"Emirates グローバルセール" → "グローバルセール"）
  const cleanSaleName = event.saleName
    .replace(new RegExp(`^${event.airline}\\s*`, "i"), "")
    .trim() || event.saleName;

  return (
    <div
      className="h-full animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.6)}s` }}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-100 dark:ring-zinc-800">
        <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.saleName}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

          <Badge className="absolute top-2 left-2 text-[8px] font-bold tracking-[0.1em] uppercase bg-violet-500 text-white hover:bg-violet-600 sm:top-3 sm:left-3 sm:text-[10px] sm:tracking-[0.15em]">
            SOON
          </Badge>

          <div className="absolute top-2 right-2 flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 backdrop-blur-sm sm:top-3 sm:right-3 sm:gap-1 sm:px-2.5 sm:py-1 sm:text-xs">
            <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            平均-{event.avgDiscount}%
          </div>

          <div className="absolute inset-x-0 top-[38%] -translate-y-1/2 px-4 text-center">
            <h3 className="font-heading text-[13px] leading-tight tracking-wide text-white/90 uppercase line-clamp-2 sm:text-[15px]">
              {cleanSaleName}
            </h3>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-white/70 text-[9px] tracking-wider mb-0.5 sm:gap-2 sm:text-[11px]">
                  <span className="font-mono">{origin}</span>
                  <Plane className="h-2.5 w-2.5 rotate-45 sm:h-3 sm:w-3" />
                  <span className="font-mono">{destination}</span>
                </div>
                <h3 className="font-heading text-[17px] leading-none tracking-wide text-white uppercase truncate sm:text-[28px]">
                  {destinationCity}
                </h3>
              </div>
              {days > 0 && (
                <div className="text-right flex-shrink-0">
                  <div className="text-[16px] font-heading leading-none text-white tracking-wide sm:text-[26px]">
                    {days}日後
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto px-2.5 py-2 flex items-center justify-between sm:px-4 sm:py-2.5">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {airlineLogo && (
              <img
                src={airlineLogo}
                alt={event.airline}
                className="h-4 w-4 flex-shrink-0 rounded-[3px] object-contain sm:h-[18px] sm:w-[18px]"
                loading="lazy"
              />
            )}
            <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-100 truncate tracking-tight sm:text-xs">
              {event.airline}
            </span>
          </div>
          {origin && (
            <span className="flex-shrink-0 text-[10px] font-medium text-zinc-400 sm:text-[11px]">
              {cityNameJa(origin)}発
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
