"use client";

import type { ReactNode } from "react";
import { trackPartnerClick } from "@/components/analytics";

/**
 * TravelCompanions のカード本体（クライアント側）。
 * onClick で GA4 `partner_click` イベントを送信するためだけにクライアント化。
 * env (TRAVELPAYOUTS_MARKER / TP_*_PROGRAM_ID) の判定は親（サーバー）で済ませる。
 */
export function PartnerCardLink({
  url,
  rel,
  partnerId,
  category,
  destinationCode,
  source,
  children,
}: {
  url: string;
  rel: string;
  partnerId: string;
  category: string;
  destinationCode?: string;
  source?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel={rel}
      onClick={() =>
        trackPartnerClick({
          partnerId,
          category,
          destinationCode,
          source,
        })
      }
      className="group flex items-center gap-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-colors hover:border-zinc-200 dark:hover:border-zinc-700"
    >
      {children}
    </a>
  );
}
