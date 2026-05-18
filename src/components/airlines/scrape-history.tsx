"use client";

import { CheckCircle, XCircle, History } from "lucide-react";
import type { ScrapeLogEntry } from "@/lib/store/sale-store";

export function ScrapeHistory({ history }: { history: ScrapeLogEntry[] }) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <History className="h-4 w-4 text-zinc-400" />
        <h2 className="font-bold text-zinc-900 text-sm">取得履歴</h2>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white overflow-hidden">
        <div className="divide-y divide-zinc-50">
          {history.slice(0, 10).map((entry, i) => (
            <div
              key={entry.timestamp}
              className="flex items-center justify-between px-4 py-3 animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className="flex items-center gap-3">
                {entry.success ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-rose-500" />
                )}
                <div>
                  <span className="text-xs font-mono text-zinc-500">
                    {new Date(entry.timestamp).toLocaleString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                  {entry.error && (
                    <span className="ml-2 text-[10px] text-rose-400">
                      {entry.error}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">
                  {entry.salesCount}件
                </span>
                {entry.newSales.length > 0 && (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600">
                    +{entry.newSales.length} 新規
                  </span>
                )}
                {entry.endedSales.length > 0 && (
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                    -{entry.endedSales.length} 終了
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
