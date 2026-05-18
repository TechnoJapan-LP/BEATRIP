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
 * アフィリエイトクリックを GA4 イベントとして送信するヘルパー
 * （クライアントコンポーネントから呼び出す）
 */
export function trackAffiliateClick(params: {
  dealId: string;
  provider: string;
  price?: number;
  route?: string;
}) {
  if (typeof window === "undefined") return;
  const w = window as typeof window & {
    gtag?: (...args: unknown[]) => void;
  };
  if (typeof w.gtag !== "function") return;

  w.gtag("event", "affiliate_click", {
    deal_id: params.dealId,
    affiliate_provider: params.provider,
    value: params.price ?? 0,
    currency: "JPY",
    route: params.route ?? "",
  });
}
