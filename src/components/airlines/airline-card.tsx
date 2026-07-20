// Server component: 純表示用 (useClient 不要)

import { ExternalLink, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AirlineProfile } from "@/lib/scrapers/types";
import type { AirlineSale } from "@/lib/scrapers/types";
import type { SaleEvent } from "@/data/mock-deals";
import Link from "next/link";
import { formatPrice } from "@/lib/format";


function daysLeft(endDate: string) {
  const diff = Math.ceil(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

function daysUntil(dateStr: string) {
  return Math.ceil(
    (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
}

export function AirlineCard({
  airline,
  sales,
  index,
  upcomingEvents = [],
}: {
  airline: AirlineProfile;
  sales: AirlineSale[];
  index: number;
  upcomingEvents?: SaleEvent[];
}) {
  const activeSales = sales.filter((s) => s.isActive);
  const activeRoutes = activeSales.flatMap((s) => s.routes);
  // routes が空 (active だが路線未設定) でも ¥∞ を出さないようガード。
  const hasActiveRoutes = activeRoutes.length > 0;
  const lowestPrice = activeRoutes.reduce(
    (min, r) => Math.min(min, r.price),
    Infinity
  );
  const maxDiscount = activeRoutes.reduce(
    (max, r) => Math.max(max, r.discount),
    0
  );

  const maxItems = 2;
  const activeToShow = activeSales.slice(0, maxItems);
  const remainingSlots = maxItems - activeToShow.length;
  const upcomingToShow = upcomingEvents.slice(0, remainingSlots);

  return (
    <div
      className="animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 0.06, 0.6)}s` }}
    >
      <Link
        href={`/airlines/${airline.code}`}
        className="group block rounded-xl border border-zinc-100 bg-white overflow-hidden transition-[box-shadow,border-color,transform] duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-zinc-200"
      >
        <div
          className="relative h-16 flex items-center justify-between px-5"
          style={{
            background: `linear-gradient(135deg, ${airline.color}20 0%, ${airline.color}08 100%)`,
            borderBottom: `2px solid ${airline.color}30`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden shadow-sm"
              style={{ backgroundColor: "white", border: `1.5px solid ${airline.color}30` }}
            >
              {/* 隣の h3 が airline 名を読み上げるため装飾扱い */}
              <img src={airline.logo} alt="" className="h-7 w-7 object-contain" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm leading-tight">
                {airline.name}
              </h3>
              <span className="text-xs text-zinc-400">{airline.nameEn}</span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`text-[10px] ${
              airline.type === "LCC"
                ? "bg-orange-50 text-orange-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            {airline.type}
          </Badge>
        </div>
        <div className="p-5 pt-4">

        {activeToShow.length > 0 || upcomingToShow.length > 0 ? (
          <>
            <div className="space-y-2 mb-4">
              {activeToShow.map((sale) => {
                const days = daysLeft(sale.endDate);
                return (
                  <div
                    key={sale.id}
                    className="rounded-lg bg-zinc-50 px-3 py-2"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-700 truncate mr-2">
                        {sale.saleName}
                      </span>
                      {days <= 3 && days > 0 ? (
                        <Badge className="bg-rose-500 text-white text-[9px] hover:bg-rose-600">
                          残{days}日
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500 text-white text-[9px] hover:bg-emerald-600">
                          販売中
                        </Badge>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {sale.routes.length}路線対象 ·{" "}
                      {sale.travelPeriodStart.slice(5)}〜
                    </div>
                  </div>
                );
              })}
              {upcomingToShow.map((event) => {
                const days = daysUntil(event.predictedDate);
                return (
                  <div
                    key={event.id}
                    className="rounded-lg bg-violet-50/60 px-3 py-2 border border-dashed border-violet-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-zinc-600 truncate mr-2">
                        {event.saleName}
                      </span>
                      <Badge className="bg-violet-500 text-white text-[9px] hover:bg-violet-600">
                        {days > 0 ? `${days}日後` : "SOON"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {event.routes.length}路線予測 · 確率{event.probability}%
                    </div>
                  </div>
                );
              })}
            </div>

            {activeSales.length > 0 && hasActiveRoutes && (
              <div className="flex items-center justify-between border-t border-zinc-100 pt-3">
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-emerald-500" />
                  <span className="text-xs text-zinc-500">
                    最安{" "}
                    <span className="font-bold text-emerald-600">
                      ¥{formatPrice(lowestPrice)}
                    </span>
                  </span>
                </div>
                <span className="text-xs font-bold text-rose-500">
                  最大-{maxDiscount}%
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-lg bg-zinc-50 px-3 py-4 text-center">
            <span className="text-xs text-zinc-400">
              現在開催中のセールはありません
            </span>
          </div>
        )}

        <div className="mt-3 flex items-center justify-end gap-1 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>詳細を見る</span>
          <ExternalLink className="h-3 w-3" />
        </div>
        </div>
      </Link>
    </div>
  );
}
