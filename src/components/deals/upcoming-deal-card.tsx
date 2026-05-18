"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TrendingDown, Plane } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const probColor =
    event.probability >= 80
      ? "text-emerald-600"
      : event.probability >= 60
        ? "text-amber-600"
        : "text-zinc-500";

  const origin = event.routes[0]?.split("→")[0] ?? "";
  const destination = event.routes[0]?.split("→")[1] ?? "";
  const destinationCity = cityNames[destination] ?? destination;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="h-full"
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

          <Badge className="absolute top-3 left-3 text-[10px] font-bold tracking-[0.15em] uppercase bg-violet-500 text-white hover:bg-violet-600">
            COMING SOON
          </Badge>

          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 backdrop-blur-sm">
            <span className={`text-xs font-bold ${probColor}`}>
              {event.probability}%
            </span>
          </div>

          <div className="absolute inset-x-0 top-[42%] -translate-y-1/2 px-4 text-center">
            <span className="text-sm font-medium tracking-wider text-white/70 uppercase">
              {event.airline}
            </span>
            <h3 className="font-heading text-[17px] leading-tight tracking-wide text-white uppercase mt-0.5 sm:text-[20px]">
              {event.saleName}
            </h3>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 text-white/70 text-[11px] tracking-wider mb-0.5">
                  <span className="font-mono">{origin}</span>
                  <Plane className="h-3 w-3 rotate-45" />
                  <span className="font-mono">{destination}</span>
                </div>
                <h3 className="font-heading text-[22px] leading-none tracking-wide text-white uppercase sm:text-[28px]">
                  {destinationCity}
                </h3>
              </div>
              {days > 0 && (
                <div className="text-right">
                  <div className="text-[20px] font-heading leading-none text-white tracking-wide sm:text-[26px]">
                    {days}日後
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-zinc-500">
              {event.airline}
            </span>
            {event.routes.length > 1 && (
              <>
                <span className="text-zinc-200 dark:text-zinc-700">·</span>
                <span className="text-[11px] text-zinc-400">
                  他{event.routes.length - 1}路線
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-rose-500 font-medium">
            <TrendingDown className="h-3 w-3" />
            平均-{event.avgDiscount}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}
