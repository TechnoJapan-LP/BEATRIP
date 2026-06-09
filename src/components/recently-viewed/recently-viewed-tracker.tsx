"use client";

import { useEffect } from "react";
import {
  addRecentlyViewed,
  type RecentItem,
} from "@/lib/recently-viewed/use-recently-viewed";

/**
 * 0-UI コンポーネント。
 * Server Component (deal/hotel ページ) に埋め込み、mount 時に
 * 当該ページを Recently Viewed に追加するためだけに存在する。
 *
 * NOTE: 同じ item で何度 mount しても dedupe される (head に移動するだけ)。
 */
export function RecentlyViewedTracker({
  item,
}: {
  item: Omit<RecentItem, "addedAt">;
}) {
  // item の identity が変わったときだけ追加 (再 mount や props 変更で追加し直す)
  const key = `${item.type}:${item.id}`;

  useEffect(() => {
    addRecentlyViewed(item);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
