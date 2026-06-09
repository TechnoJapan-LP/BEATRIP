"use client";

import { useEffect, useState } from "react";

/**
 * Recently viewed トラッキング
 *
 * セッション深度を高めて滞在時間 + 戻り訪問 + クリック総数を増やすため、
 * 直近に閲覧した deal/hotel ページを localStorage に蓄積する。
 *
 * - storage key: beatrip:recentlyViewed
 * - 最大 5 件 (古いものから削除)
 * - 重複 id+type は配列 head に移動 (上書き)
 * - addedAt は ms epoch で自動付与
 */

export const RECENTLY_VIEWED_STORAGE_KEY = "beatrip:recentlyViewed";
export const RECENTLY_VIEWED_MAX = 5;
/** localStorage は same-tab で storage event を発火しない。
 * 同タブで add → drawer に即時反映させるため CustomEvent でブリッジ。 */
export const RECENTLY_VIEWED_EVENT = "beatrip:recently-viewed-changed";

export type RecentItemType = "deal" | "hotel";

export type RecentItem = {
  type: RecentItemType;
  id: string;
  label: string;
  sublabel?: string;
  href: string;
  imageUrl?: string;
  addedAt: number;
};

/** localStorage から安全に読む。SSR では空配列。 */
function readSafe(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    // 信頼できないストレージ値の最低限のバリデーション
    return parsed
      .filter(
        (it): it is RecentItem =>
          !!it &&
          typeof it === "object" &&
          typeof (it as RecentItem).id === "string" &&
          typeof (it as RecentItem).href === "string" &&
          typeof (it as RecentItem).label === "string" &&
          ((it as RecentItem).type === "deal" ||
            (it as RecentItem).type === "hotel")
      )
      .slice(0, RECENTLY_VIEWED_MAX);
  } catch {
    return [];
  }
}

function writeSafe(items: RecentItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      RECENTLY_VIEWED_STORAGE_KEY,
      JSON.stringify(items)
    );
    // 同タブのリスナー (drawer など) に通知
    window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT));
  } catch {
    // quota 等の例外は無視 (機能性は失われるが致命的ではない)
  }
}

/** 新しい item を先頭に追加。同 type+id は既存を除いて先頭に置き直す。 */
export function addRecentlyViewed(item: Omit<RecentItem, "addedAt">) {
  if (typeof window === "undefined") return;
  const next: RecentItem = { ...item, addedAt: Date.now() };
  const existing = readSafe();
  const deduped = existing.filter(
    (it) => !(it.type === next.type && it.id === next.id)
  );
  const merged = [next, ...deduped].slice(0, RECENTLY_VIEWED_MAX);
  writeSafe(merged);
}

/** 全削除 (drawer の「すべて削除」用) */
export function clearRecentlyViewed() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    window.dispatchEvent(new Event(RECENTLY_VIEWED_EVENT));
  } catch {
    // ignore
  }
}

/**
 * React hook — localStorage 値を購読する。
 *
 * - 初回 mount で読み込み (SSR は空配列 → CSR で hydrate)
 * - 他タブ更新は "storage" event
 * - 同タブ更新は CustomEvent (RECENTLY_VIEWED_EVENT)
 */
export function useRecentlyViewed(): RecentItem[] {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    setItems(readSafe());

    const refresh = () => setItems(readSafe());
    const onStorage = (e: StorageEvent) => {
      if (e.key === RECENTLY_VIEWED_STORAGE_KEY) refresh();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(RECENTLY_VIEWED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(RECENTLY_VIEWED_EVENT, refresh);
    };
  }, []);

  return items;
}
