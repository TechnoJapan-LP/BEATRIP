"use client";

import dynamic from "next/dynamic";

/**
 * 全ページ右下に常駐するフローティング系ウィジェットの遅延ロード境界。
 *
 * これらはいずれも「初回ペイント時には何も描画しない」性質を持つ:
 *   - RecentlyViewedDrawer / ComparisonDrawer → localStorage に項目が
 *     無ければ null を返す (ボタンも出ない)
 *   - ChatWidget → NEXT_PUBLIC_ENABLE_CHAT !== "1" なら null
 *   - InstallPrompt → beforeinstallprompt イベント受信まで null
 *
 * そのため `ssr: false` で client 限定にし、初期 HTML / クリティカル JS から
 * 切り離す。特に ComparisonDrawer は CURATED_HOTELS (全 64 都市の
 * キュレートデータ, ~1100 行) と next/image を取り込むため、静的 import の
 * ままだと全ページの初期バンドルを肥大化させていた。dynamic 化により
 * これらは個別 chunk となり、hydration 後にアイドルで取得される。
 *
 * 注: layout.tsx は Server Component のため `ssr: false` を直接書けない
 * (Next.js: "ssr: false is not allowed with next/dynamic in Server
 * Components")。この Client wrapper を 1 枚挟むことで回避する。
 */

const RecentlyViewedDrawer = dynamic(
  () =>
    import("@/components/recently-viewed/recently-viewed-drawer").then(
      (m) => m.RecentlyViewedDrawer
    ),
  { ssr: false }
);

const ComparisonDrawer = dynamic(
  () =>
    import("@/components/comparison/comparison-drawer").then(
      (m) => m.ComparisonDrawer
    ),
  { ssr: false }
);

const ChatWidget = dynamic(
  () => import("@/components/chat/chat-widget").then((m) => m.ChatWidget),
  { ssr: false }
);

const InstallPrompt = dynamic(
  () => import("@/components/pwa/install-prompt").then((m) => m.InstallPrompt),
  { ssr: false }
);

export function FloatingWidgets() {
  return (
    <>
      <RecentlyViewedDrawer />
      <ComparisonDrawer />
      <ChatWidget />
      <InstallPrompt />
    </>
  );
}
