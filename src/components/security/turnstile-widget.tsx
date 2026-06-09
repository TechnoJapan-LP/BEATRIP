"use client";

/**
 * Cloudflare Turnstile invisible widget.
 *
 * - script を lazy load (初回 mount 時のみ)
 * - invisible mode で実行 → token を onToken に渡す
 * - NEXT_PUBLIC_TURNSTILE_SITE_KEY 未設定なら何もしない (フォールバック互換)
 *
 * 用途: /api/clicks の bot 対策。1 つの widget で複数の sendBeacon に
 * 同じ token を再利用するのは Turnstile の設計外なので、必要な箇所では
 * 個別に render することを想定。本プロジェクトでは「初回マウント時に
 * token を取得しておき、クリック時に渡す」運用とする。
 *
 * 注意: 厳密な bot 防御を目指すなら 1 click につき 1 token が望ましいが、
 * INP / UX 観点で本実装は「ページロード時 1 トークン」方式 (server 側で
 * verify は毎回行う)。Turnstile の siteverify は同 token の再利用を
 * 拒否するため、再 render が必要になった場合は execute を再度呼ぶ。
 */
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: {
          sitekey: string;
          size?: "normal" | "compact" | "invisible";
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          execution?: "render" | "execute";
        }
      ) => string;
      execute: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src^="${SCRIPT_SRC.split("?")[0]}"]`
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile load failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile load failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export function TurnstileWidget({
  onToken,
  siteKey,
}: {
  onToken: (token: string) => void;
  /** 明示指定がなければ NEXT_PUBLIC_TURNSTILE_SITE_KEY を使う */
  siteKey?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const key = siteKey ?? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
    if (!key) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        widgetIdRef.current = window.turnstile.render(ref.current, {
          sitekey: key,
          size: "invisible",
          execution: "render",
          callback: (token: string) => onToken(token),
          "error-callback": () => {
            // 失敗時は token なしで継続 (server 側でフォールバック扱い)
          },
          "expired-callback": () => {
            if (widgetIdRef.current && window.turnstile) {
              try {
                window.turnstile.reset(widgetIdRef.current);
              } catch {
                /* ignore */
              }
            }
          },
        });
      })
      .catch(() => {
        /* silent: ネットワーク失敗等 */
      });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null;
      }
    };
  }, [onToken, siteKey]);

  // invisible: 表示しない (Cloudflare の attribution は別 footer で表示する想定)
  return <div ref={ref} aria-hidden="true" style={{ display: "none" }} />;
}
