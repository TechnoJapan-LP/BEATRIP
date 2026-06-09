"use client";

import { useEffect } from "react";

/**
 * Registers `/sw.js` on mount. Production-only — in dev the SW would
 * cache Next.js dev artifacts (HMR chunks, RSC payloads) and break
 * iteration. Failures are swallowed; PWA is a UX upgrade, not critical path.
 */
export function RegisterSw() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    };

    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
