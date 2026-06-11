"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { trackHotelClick, trackAffiliateClick } from "@/components/analytics";
import { TurnstileWidget } from "@/components/security/turnstile-widget";
import {
  consumeTurnstileToken,
  isTurnstileEnabled,
  setTurnstileToken,
} from "@/lib/security/click-token";

/**
 * MobileStickyCta — モバイル限定の sticky CTA バー。
 *
 * - sm 未満のみ表示 (PC は CSS で非表示)
 * - bottom-nav (高さ約 56px + safe-area) の **直上** に配置 (z-30 / bottom-nav は z-30 共存OK)
 *   bottom-nav は z-30 だが、本バーは bottom-nav の上 (画面上方向) に配置するため z-index 競合しない。
 *   念のため bottom-nav と同じ z-30 として、視覚的に bottom-nav の手前に重ねないよう垂直 offset で逃がす。
 * - スクロール 50% 以上で fade-in (passive scroll listener + rAF throttle)
 * - クリック時に navigator.sendBeacon でクリックトラッキング (GA4 イベントも併発火)
 *
 * 設計判断:
 *   既存 src/components/deals/sticky-cta.tsx は deal 詳細専用 (price/discount 表示) のため
 *   重複を避けつつ汎用化。ホテル等の単純な「比較する」CTA をモバイルで強調するのが本コンポーネントの責務。
 */
export type MobileStickyCtaProps = {
  /** 左側のメイン文字列 (例: "最安値で予約" / "¥45,800 -32%") */
  label: string;
  /** 左側のサブ文字列 (例: "東京のホテル比較" / "NRT → BKK · Peach") */
  sublabel?: string;
  /** 遷移先 URL (アフィリエイト URL を渡す前提) */
  primaryHref: string;
  /** ボタン文字列 (例: "比較する →" / "今すぐ予約 →") */
  primaryLabel: string;
  /** アクセントカラー (デフォルト: emerald) */
  accent?: "rose" | "emerald" | "sky";
  /**
   * GA4 計測の分類。デフォルト "hotel"。
   * deal 用に "deal" を渡すと trackAffiliateClick を発火し payload に deal_id を載せる。
   */
  trackingKind?: "hotel" | "deal";
  /** 計測コンテキスト (任意) */
  trackingContext?: {
    destinationCode?: string;
    dealId?: string;
    provider?: string;
    price?: number;
    route?: string;
  };
  /**
   * bottom-nav が同ページに存在しない場合は false にして、画面下端に直接寄せる。
   * (例: /deals/[id] は mobile-bottom-nav が自身を非表示にするため false)
   * デフォルト true (= bottom-nav の直上に配置)
   */
  bottomNavOffset?: boolean;
};

const ACCENT_CLASSES: Record<NonNullable<MobileStickyCtaProps["accent"]>, string> = {
  rose: "bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white",
  emerald: "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white",
  sky: "bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white",
};

export function MobileStickyCta({
  label,
  sublabel,
  primaryHref,
  primaryLabel,
  accent = "emerald",
  trackingKind = "hotel",
  trackingContext,
  bottomNavOffset = true,
}: MobileStickyCtaProps) {
  const [visible, setVisible] = useState(false);
  const handleToken = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  useEffect(() => {
    let ticking = false;
    const compute = () => {
      ticking = false;
      const scrolled = window.scrollY;
      const total = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      // 50% スクロールで表示
      setVisible(scrolled / total >= 0.5);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(compute);
    };
    // 初回計算 (短いページは即表示になる)
    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // GA4 イベント (sticky 導線)
    if (trackingKind === "deal" && trackingContext?.dealId) {
      trackAffiliateClick({
        dealId: trackingContext.dealId,
        provider: trackingContext.provider ?? "partner",
        price: trackingContext.price,
        route: trackingContext.route,
        placement: "sticky",
      });
    } else {
      trackHotelClick({
        destinationCode: trackingContext?.destinationCode ?? "",
        dealId: trackingContext?.dealId,
        provider: trackingContext?.provider,
        placement: "sticky",
      });
    }

    // sendBeacon — navigation を妨げずに確実に届ける
    // /api/clicks の要求スキーマ (booking-button.tsx と同型):
    //   { deal_id (必須・/^[a-zA-Z0-9_-]{1,64}$/), affiliate_provider, affiliate_url (必須・URL), placement }
    // hotel kind は deal_id が存在しないため、destinationCode から合成 ID
    // `hotel_{code}` を採番する (isValidDealId を通る形式に sanitize)。
    try {
      const syntheticHotelId = `hotel_${(trackingContext?.destinationCode ?? "unknown")
        .toLowerCase()
        .replace(/[^a-zA-Z0-9_-]/g, "")}`.slice(0, 64);
      const dealId =
        trackingContext?.dealId && /^[a-zA-Z0-9_-]{1,64}$/.test(trackingContext.dealId)
          ? trackingContext.dealId
          : syntheticHotelId;
      const payload = JSON.stringify({
        deal_id: dealId,
        affiliate_provider: trackingContext?.provider ?? "unknown",
        affiliate_url: primaryHref,
        placement: "sticky",
        turnstile_token: consumeTurnstileToken(),
      });
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/clicks",
          new Blob([payload], { type: "application/json" }),
        );
      } else {
        fetch("/api/clicks", {
          method: "POST",
          keepalive: true,
          headers: { "Content-Type": "application/json" },
          body: payload,
        }).catch(() => undefined);
      }
    } catch {
      /* tracking 失敗は navigation を妨げない */
    }
    // 通常のリンク遷移に任せる (target=_blank で開く) — e を阻害しない
    void e;
  }

  return (
    <div
      aria-hidden={!visible}
      className={`fixed left-0 right-0 z-30 px-3 transition-all duration-300 sm:hidden ${
        visible
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 translate-y-2 pointer-events-none"
      }`}
      // bottom-nav 上の FAB スタックの更に上 (--bar-base) に全幅バーを配置。
      // bottomNavOffset=false (deal 詳細など nav 非表示) は画面下端寄せ。
      // offset は globals.css の共通トークンで FAB 群と一元管理 (重なり防止)。
      style={{
        bottom: bottomNavOffset
          ? "var(--bar-base)"
          : "calc(env(safe-area-inset-bottom, 0px) + 8px)",
      }}
    >
      {isTurnstileEnabled() && <TurnstileWidget onToken={handleToken} />}
      <div className="mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-zinc-200/70 bg-white/95 px-3 py-2.5 shadow-lg shadow-black/15 backdrop-blur-md dark:border-zinc-700/70 dark:bg-zinc-900/95">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {label}
          </p>
          {sublabel && (
            <p className="truncate text-[11px] text-zinc-500 dark:text-zinc-400">
              {sublabel}
            </p>
          )}
        </div>
        <a
          href={primaryHref}
          target="_blank"
          rel="sponsored noopener noreferrer"
          onClick={handleClick}
          className={`flex flex-shrink-0 items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors active:scale-[0.98] ${ACCENT_CLASSES[accent]}`}
        >
          <span className="whitespace-nowrap">{primaryLabel}</span>
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
