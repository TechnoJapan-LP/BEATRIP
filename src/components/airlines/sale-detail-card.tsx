"use client";

import Link from "next/link";
import {
  Calendar,
  Clock,
  Plane,
  Users,
  TrendingDown,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AirlineSale } from "@/lib/scrapers/types";
import { cityNameJa } from "@/lib/airport-names";
import { cleanScrapedDescription } from "@/lib/scrapers/clean-description";
import { formatPrice } from "@/lib/format";


function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  });
}

function daysLeft(endDate: string) {
  return Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export function SaleDetailCard({
  sale,
  index,
}: {
  sale: AirlineSale;
  index: number;
}) {
  const days = daysLeft(sale.endDate);
  const isUrgent = days <= 3 && days > 0;

  return (
    <div
      className={`animate-fade-up rounded-xl border p-6 transition-[border-color,background-color] ${
        isUrgent
          ? "border-rose-200 bg-rose-50/30 dark:border-rose-900/60 dark:bg-rose-950/20"
          : "border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      }`}
      style={{ animationDelay: `${Math.min(index * 0.08, 0.6)}s` }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{sale.saleName}</h3>
          <p className="mt-1 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {cleanScrapedDescription(sale.description)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isUrgent && (
            <Badge className="bg-rose-500 text-white hover:bg-rose-600">
              残り{days}日
            </Badge>
          )}
          {sale.isActive && (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
              開催中
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5">
            <Calendar className="h-3 w-3" />
            セール期間
          </div>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {formatDate(sale.startDate)} 〜 {formatDate(sale.endDate)}
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5">
            <Clock className="h-3 w-3" />
            予約期限
          </div>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {formatDate(sale.bookingDeadline)}
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5">
            <Plane className="h-3 w-3" />
            搭乗期間
          </div>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {formatDate(sale.travelPeriodStart)} 〜
          </span>
        </div>
        <div className="rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/60">
          <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5">
            <TrendingDown className="h-3 w-3" />
            対象路線
          </div>
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {sale.routes.length}路線
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
          対象路線・運賃
        </span>
        <div className="divide-y divide-zinc-100 overflow-hidden rounded-lg border border-zinc-100 dark:divide-zinc-800 dark:border-zinc-800">
          {/* 行の価格は実スクレイプの sale.routes 由来 (実データ)。
              リンク先は自サイトの路線ページ (/routes/{O}-{D})。価格推移と
              予約導線がありモバイルの回遊起点になる。以前は mock-deals の
              架空詳細に飛ばしていた時期があり、その反省で実ページのみに繋ぐ */}
          {sale.routes.map((route, i) => {
            const Row = (
              <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      <span className="truncate">{cityNameJa(route.originCode)}</span>
                      <Plane className="h-3 w-3 flex-shrink-0 rotate-45 text-zinc-300 dark:text-zinc-600" />
                      <span className="truncate">{cityNameJa(route.destinationCode)}</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-0.5">
                      {route.originCode}→{route.destinationCode}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] flex-shrink-0">
                    {route.cabin}
                  </Badge>
                  {route.seatsRemaining !== undefined &&
                    route.seatsRemaining <= 10 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-600">
                        <Users className="h-3 w-3" />
                        残{route.seatsRemaining}席
                      </span>
                    )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden sm:inline text-xs text-zinc-400 line-through">
                    ¥{formatPrice(route.originalPrice)}
                  </span>
                  <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    ¥{formatPrice(route.price)}
                  </span>
                  <span className="text-xs font-bold text-rose-500">
                    -{route.discount}%
                  </span>
                  <ChevronRight
                    className="h-4 w-4 text-zinc-300 dark:text-zinc-600"
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
            return (
              <Link
                key={i}
                href={`/routes/${route.originCode}-${route.destinationCode}`}
                aria-label={`${cityNameJa(route.originCode)}発${cityNameJa(route.destinationCode)}行きの路線ページを見る`}
              >
                {Row}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <a
          href={sale.sourceUrl}
          target="_blank"
          // sale.sourceUrl は通常 航空会社の公式ページだが、提携経路（A8等）に
          // 切り替わる可能性があるため安全側で sponsored も付与（ステマ規制対応）
          rel="sponsored noopener noreferrer"
          className="flex items-center gap-1 text-xs text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          公式サイトで確認
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
