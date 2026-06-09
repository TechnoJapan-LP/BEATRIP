"use client";

import { useEffect, useState } from "react";

/**
 * Hotel comparison (横並び比較) — localStorage 永続。
 *
 * 目的: 比較対象を 4 件まで pin して横並びカード比較ドロワーで属性差を
 * 即座に把握 → 意思決定速度 / コンバージョン向上。
 *
 * - storage key: beatrip:comparison
 * - 最大 4 件 (4 列以上は modal の幅が破綻するため絶対上限)
 * - 5 件目を追加しようとしたら古いものから自動削除する FIFO
 * - 同 hotelSlug の重複は無視 (toggle 用の API は別関数)
 */

export const COMPARISON_STORAGE_KEY = "beatrip:comparison";
export const COMPARISON_MAX = 4;
/** 同タブ内更新通知用 (localStorage は same-tab で storage event を発火しない) */
export const COMPARISON_EVENT = "beatrip:comparison-changed";

export type ComparisonItem = {
  /** ホテル個体識別子 (curated は name しか持たないため citySlug:name から生成) */
  hotelSlug: string;
  citySlug: string;
  name: string;
  imageUrl?: string;
  tier: string;
};

// buildHotelSlug は server/client 両方から使うため別ファイル (hotel-slug.ts) に分離。
// 互換性のためここから re-export。
export { buildHotelSlug } from "./hotel-slug";

function readSafe(): ComparisonItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(COMPARISON_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (it): it is ComparisonItem =>
          !!it &&
          typeof it === "object" &&
          typeof (it as ComparisonItem).hotelSlug === "string" &&
          typeof (it as ComparisonItem).citySlug === "string" &&
          typeof (it as ComparisonItem).name === "string" &&
          typeof (it as ComparisonItem).tier === "string"
      )
      .slice(0, COMPARISON_MAX);
  } catch {
    return [];
  }
}

function writeSafe(items: ComparisonItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      COMPARISON_STORAGE_KEY,
      JSON.stringify(items)
    );
    window.dispatchEvent(new Event(COMPARISON_EVENT));
  } catch {
    // quota 等は無視
  }
}

/**
 * 比較対象に追加。既に存在する slug は no-op (idempotent)。
 * 4 件超過の場合は FIFO で先頭 (古いもの) を削除し末尾に追加。
 */
export function addToComparison(item: ComparisonItem) {
  if (typeof window === "undefined") return;
  const existing = readSafe();
  if (existing.some((it) => it.hotelSlug === item.hotelSlug)) return;
  const merged = [...existing, item];
  // 4 件超なら先頭から削除 (FIFO)
  while (merged.length > COMPARISON_MAX) merged.shift();
  writeSafe(merged);
}

/** slug 指定で削除 */
export function removeFromComparison(hotelSlug: string) {
  if (typeof window === "undefined") return;
  const existing = readSafe();
  const next = existing.filter((it) => it.hotelSlug !== hotelSlug);
  writeSafe(next);
}

/** 全削除 */
export function clearComparison() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(COMPARISON_STORAGE_KEY);
    window.dispatchEvent(new Event(COMPARISON_EVENT));
  } catch {
    // ignore
  }
}

/**
 * React hook — comparison localStorage を購読。
 * - 初回 mount で読み込み (SSR は空配列)
 * - 他タブ更新は "storage" event
 * - 同タブ更新は CustomEvent (COMPARISON_EVENT)
 */
export function useComparison(): ComparisonItem[] {
  const [items, setItems] = useState<ComparisonItem[]>([]);

  useEffect(() => {
    setItems(readSafe());

    const refresh = () => setItems(readSafe());
    const onStorage = (e: StorageEvent) => {
      if (e.key === COMPARISON_STORAGE_KEY) refresh();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(COMPARISON_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(COMPARISON_EVENT, refresh);
    };
  }, []);

  return items;
}
