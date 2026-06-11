"use client";

import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * 二段構えアナリティクス
 *
 * 1. Vercel Analytics  — PV / 訪問者数（Cookie不要・プライバシー重視）
 * 2. Vercel Speed Insights — Core Web Vitals 計測
 * 3. Google Analytics 4 — 詳細なイベント計測（環境変数 NEXT_PUBLIC_GA_ID 設定時のみ有効）
 *
 * GA4 を有効化するには Vercel の環境変数に
 *   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 * を追加して再デプロイする。未設定時は GA4 部分はスキップされる。
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <>
      <VercelAnalytics />
      <SpeedInsights />

      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}
    </>
  );
}

/**
 * 汎用 GA4 イベント送信ヘルパー。gtag未読込時はno-op。
 * クライアントコンポーネントから呼び出す。
 */
function track(eventName: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  const w = window as typeof window & {
    gtag?: (...args: unknown[]) => void;
  };
  if (typeof w.gtag !== "function") return;
  w.gtag("event", eventName, params);
}

/**
 * 配置位置 (placement) — どの導線が効くかを分析するための共通属性。
 * GA4 上で affiliate_click / hotel_click / partner_click を placement で
 * セグメントすることで、CTA 設計の PDCA を回せるようにする。
 *
 *  - hero        : ファーストビュー内の主要 CTA
 *  - pill        : チップ / pill 型のリンク群
 *  - highlight   : 同エリア代表ホテル等のハイライトブロック
 *  - sticky      : 画面下部固定の sticky CTA
 *  - exit-modal  : exit-intent / scroll-depth ポップアップ
 *  - cross-sell  : ホテル併売など本文内クロスセル
 *  - compare     : 比較表 / 比較記事内
 *  - email       : 価格アラート等メール内リンク (UTM 併用)
 *  - travel-goods: 記事内の物販 (旅行用品) ブロック
 */
export type AffiliatePlacement =
  | "hero"
  | "pill"
  | "highlight"
  | "sticky"
  | "exit-modal"
  | "cross-sell"
  | "compare"
  | "email"
  | "travel-goods";

/** 航空券アフィリエイトリンクのクリック（既存） */
export function trackAffiliateClick(params: {
  dealId: string;
  provider: string;
  price?: number;
  route?: string;
  /** 配置位置 (どの導線か)。未指定は "" でOK。 */
  placement?: AffiliatePlacement;
}) {
  track("affiliate_click", {
    deal_id: params.dealId,
    affiliate_provider: params.provider,
    value: params.price ?? 0,
    currency: "JPY",
    route: params.route ?? "",
    placement: params.placement ?? "",
  });
}

/** ホテル併売リンクのクリック（高料率アフィリエイト） */
export function trackHotelClick(params: {
  destinationCode: string;
  dealId?: string;
  /** OTA識別子（booking / trip / agoda / hotellook 等）。未指定はHotellook既定。 */
  provider?: string;
  /** 配置位置 (どの導線か)。未指定は "" でOK。 */
  placement?: AffiliatePlacement;
}) {
  track("hotel_click", {
    destination_code: params.destinationCode,
    deal_id: params.dealId ?? "",
    affiliate_provider: params.provider ?? "hotellook",
    placement: params.placement ?? "",
  });
}

/**
 * 高料率パートナー（eSIM / 空港送迎 / 海外旅行保険 / ホテル 等）のクリック計測。
 * hotel_click と分けることで、パートナーカテゴリ別の CTR / RPM を GA4 上で比較できる。
 */
export function trackPartnerClick(params: {
  /** Partner.id（airalo / kiwitaxi / insurance / booking / trip-hotel 等） */
  partnerId: string;
  /** Partner.category（esim / transfer / insurance / hotel / tour） */
  category: string;
  /** 起点となった目的地（IATAコード or 都市slug。なければ "" でOK） */
  destinationCode?: string;
  /** 起点ページ識別子（deal / route / hotel-city 等） */
  source?: string;
  /** 配置位置 (どの導線か)。未指定は "" でOK。 */
  placement?: AffiliatePlacement;
}) {
  track("partner_click", {
    partner_id: params.partnerId,
    partner_category: params.category,
    destination_code: params.destinationCode ?? "",
    source: params.source ?? "",
    placement: params.placement ?? "",
  });
}

/** ニュースレター登録完了 */
export function trackNewsletterSignup(params: { source?: string } = {}) {
  track("newsletter_signup", {
    source: params.source ?? "site",
  });
}

/** 価格アラート登録 */
export function trackPriceAlertSet(params: {
  routeKey: string;
  threshold: number;
}) {
  track("price_alert_set", {
    route: params.routeKey,
    threshold: params.threshold,
    currency: "JPY",
  });
}

/** 検索フォーム実行（ユーザー意図シグナル） */
export function trackSearchSubmit(params: {
  origin: string;
  destination: string;
  departDate?: string;
  returnDate?: string;
}) {
  track("search_submit", {
    origin: params.origin,
    destination: params.destination,
    depart_date: params.departDate ?? "",
    return_date: params.returnDate ?? "",
  });
}

/** 言語切替 */
export function trackLanguageSwitch(params: { from: string; to: string }) {
  track("language_switch", {
    from_locale: params.from,
    to_locale: params.to,
  });
}
