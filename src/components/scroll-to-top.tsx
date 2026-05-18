"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ルート遷移時にスクロール位置を最上部へリセットする。
 *
 * App Router では、一覧ページを下までスクロールした状態でカードを
 * クリックすると、遷移先で意図せず下方に表示されることがある
 * （プログレッシブレンダリング/レイアウトシフトに起因）。
 * pathname の変化を検知して確実に先頭へ戻す。
 *
 * ただし `/#calendar` のようなハッシュ付きアンカー遷移のときは
 * その要素までスクロールさせたいので、ハッシュがある場合はスキップ。
 */
export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash) return; // アンカー遷移は尊重
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}
