"use client";

import { useEffect, useState } from "react";

const VISIT_KEY = "beatrip:pwa:visits";
const DISMISS_KEY = "beatrip:pwa:install-dismissed";
const VISIT_THRESHOLD = 3;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

/**
 * Mobile-only install snackbar. Listens for `beforeinstallprompt`, waits
 * until the user has visited >= 3 times, then surfaces an install action.
 * Dismissal is persisted in localStorage so we don't nag.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  // Bump visit count on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    try {
      const n = Number(localStorage.getItem(VISIT_KEY) ?? "0") + 1;
      localStorage.setItem(VISIT_KEY, String(n));
    } catch {
      // localStorage unavailable — silently ignore
    }
  }, []);

  // Capture the install event
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (!isMobile()) return;

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* noop */
    }
    if (dismissed) return;

    let visits = 0;
    try {
      visits = Number(localStorage.getItem(VISIT_KEY) ?? "0");
    } catch {
      /* noop */
    }
    if (visits < VISIT_THRESHOLD) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* noop */
    }
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* noop */
    } finally {
      setVisible(false);
      setDeferred(null);
      try {
        localStorage.setItem(DISMISS_KEY, "1");
      } catch {
        /* noop */
      }
    }
  };

  if (!visible || !deferred) return null;

  return (
    <div
      role="dialog"
      aria-label="アプリとしてインストール"
      className="fixed inset-x-3 z-40 sm:hidden bottom-[var(--bar-base)]"
    >
      <div className="rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900 px-4 py-3 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
            BEATRIP をホーム画面に追加
          </p>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            アプリのようにワンタップで起動できます
          </p>
        </div>
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-full bg-emerald-500 text-white text-xs font-bold px-3 py-2 min-h-[36px] hover:bg-emerald-600"
        >
          追加
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="閉じる"
          className="shrink-0 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-xs px-2 py-2"
        >
          ×
        </button>
      </div>
    </div>
  );
}
