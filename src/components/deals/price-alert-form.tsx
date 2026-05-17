"use client";

import { useState, useEffect, useCallback } from "react";
import { BellRing, Check, X } from "lucide-react";

type PriceAlert = {
  dealId: string;
  routeKey: string;
  threshold: number;
  createdAt: string;
};

const STORAGE_KEY = "beatrip-price-alerts";

function getAlerts(): PriceAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAlerts(alerts: PriceAlert[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

type Props = {
  routeKey: string;
  currentPrice: number;
  dealId: string;
};

export function PriceAlertForm({ routeKey, currentPrice, dealId }: Props) {
  const defaultThreshold = Math.round(currentPrice * 0.8);
  const [threshold, setThreshold] = useState(defaultThreshold);
  const [isSet, setIsSet] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const alerts = getAlerts();
    const existing = alerts.find((a) => a.dealId === dealId);
    if (existing) {
      setThreshold(existing.threshold);
      setIsSet(true);
    }
  }, [dealId]);

  const handleEnable = useCallback(() => {
    const alerts = getAlerts().filter((a) => a.dealId !== dealId);
    alerts.push({
      dealId,
      routeKey,
      threshold,
      createdAt: new Date().toISOString(),
    });
    saveAlerts(alerts);
    setIsSet(true);
    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 2500);
  }, [dealId, routeKey, threshold]);

  const handleRemove = useCallback(() => {
    const alerts = getAlerts().filter((a) => a.dealId !== dealId);
    saveAlerts(alerts);
    setIsSet(false);
    setThreshold(defaultThreshold);
  }, [dealId, defaultThreshold]);

  return (
    <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
      <div className="flex items-center gap-2 mb-1">
        <BellRing className="h-4 w-4 text-zinc-500" />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">価格アラート</h3>
      </div>
      <p className="text-[11px] text-zinc-400 mb-4">
        この路線が指定価格以下になったら通知
      </p>

      {showConfirm ? (
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5">
          <Check className="h-4 w-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-700">
            アラートを設定しました
          </span>
        </div>
      ) : isSet ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2.5">
            <span className="text-xs text-zinc-500">通知価格</span>
            <span className="text-sm font-mono font-bold text-zinc-800">
              ¥{threshold.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-700"
          >
            <X className="h-3 w-3" />
            アラートを解除
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label
              htmlFor="price-threshold"
              className="text-[11px] text-zinc-400 mb-1 block"
            >
              通知価格（以下になったら通知）
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
                ¥
              </span>
              <input
                id="price-threshold"
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-7 pr-3 text-sm font-mono text-zinc-800 outline-none transition-colors focus:border-zinc-400 focus:bg-white"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleEnable}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-3 py-2.5 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
          >
            <BellRing className="h-3.5 w-3.5" />
            アラートを設定
          </button>
        </div>
      )}
    </div>
  );
}
