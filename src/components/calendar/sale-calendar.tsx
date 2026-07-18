// Server component: 純表示用 (useClient 不要)

import Link from "next/link";
import { CalendarDays, TrendingUp, Zap } from "lucide-react";
import type { SaleEvent } from "@/data/mock-deals";

function ProbabilityMeter({ value }: { value: number }) {
  const color =
    value >= 80
      ? "bg-emerald-500"
      : value >= 60
        ? "bg-amber-500"
        : "bg-zinc-400";

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full animate-grow-w ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
        {value}%
      </span>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function daysUntil(dateStr: string) {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = Math.ceil(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return diff;
}

const airlineCodeMap: Record<string, string> = {
  ANA: "ANA",
  JAL: "JAL",
  Peach: "PCH",
  "Jetstar Japan": "JJP",
  "Spring Japan": "SJO",
  "T'way Air": "TW",
  VietJet: "VJ",
  Emirates: "EK",
  "Singapore Airlines": "SQ",
  "Cathay Pacific": "CX",
  スクート: "JJP",
};

export function SaleCalendar({
  events,
  /** 呼び出し側が独自見出しを持つ場合 (TOP の SectionHeading) は内部見出しを消す */
  hideHeader = false,
}: {
  events: SaleEvent[];
  hideHeader?: boolean;
}) {
  // 予測開催日から30日以上過ぎた予測は「外れた/終わった」ものなので出さない
  // (5月予測のカードが7月に並ぶと鮮度と信頼を落とす)
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const sorted = [...events]
    .filter((e) => new Date(e.predictedDate).getTime() >= cutoff)
    .sort((a, b) => b.probability - a.probability);

  if (sorted.length === 0) return null;

  return (
    <section className={hideHeader ? "" : "mt-16"}>
      {!hideHeader && (
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <CalendarDays className="h-4.5 w-4.5" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              セール予測カレンダー
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              過去のセールパターンからAIが次回開催を予測
            </p>
          </div>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible xl:grid-cols-5">
        {sorted.map((event, i) => {
          const days = daysUntil(event.predictedDate);
          const isImminent = days <= 7 && days > 0;

          const airlineCode = airlineCodeMap[event.airline] ?? "ANA";

          return (
            <div
              key={event.id}
              className="animate-fade-up"
              style={{ animationDelay: `${Math.min(i * 0.08, 0.6)}s` }}
            >
            <Link
              href={`/airlines/${airlineCode}/sales`}
              className={`block min-w-[75vw] snap-start rounded-xl border p-4 transition-[box-shadow,transform] duration-200 hover:shadow-md hover:-translate-y-0.5 sm:min-w-[260px] sm:p-5 lg:min-w-0 ${
                isImminent
                  ? "border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20"
                  : "border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    {event.airline}
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5 leading-tight">
                    {event.saleName}
                  </h3>
                </div>
                {isImminent && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                    <Zap className="h-3 w-3" />
                    間近
                  </div>
                )}
              </div>

              <div className="mb-3">
                <span className="text-xs text-zinc-400">予測開催日</span>
                <div className="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100">
                  {new Date(event.predictedDate).toLocaleDateString("ja-JP", {
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                {days > 0 && (
                  <span className="text-[10px] text-zinc-400">
                    あと{days}日
                  </span>
                )}
              </div>

              <div className="mb-3">
                <span className="text-xs text-zinc-400 block mb-1">
                  開催確率
                </span>
                <ProbabilityMeter value={event.probability} />
              </div>

              <div className="mb-3">
                <span className="text-xs text-zinc-400 block mb-1">
                  過去の開催日
                </span>
                <div className="flex flex-wrap gap-1">
                  {event.historicalDates.map((d) => (
                    <span
                      key={d}
                      className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400"
                    >
                      {formatDate(d)}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <div className="flex flex-wrap gap-1">
                  {event.routes.slice(0, 2).map((r) => (
                    <span
                      key={r}
                      className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono"
                    >
                      {r}
                    </span>
                  ))}
                  {event.routes.length > 2 && (
                    <span className="text-[10px] text-zinc-400">
                      +{event.routes.length - 2}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs font-bold">
                    -{event.avgDiscount}%
                  </span>
                </div>
              </div>
            </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
