"use client";

import { ArrowUpRight } from "lucide-react";
import {
  getActiveAspPartners,
  getAspPartnerUrl,
  type AspCategory,
  type AspPartner,
} from "@/lib/affiliate/asp-partners";
import { trackPartnerClick } from "@/components/analytics";

/**
 * 日本系 ASP (A8.net) 経由 partner の集約パネル。
 *
 * 指定された categories ごとに ENV 設定済みの partner を取得して
 * グループ別の chip リストとして表示。a8mat が未設定の partner は
 * 自動的に隠れる (収益が立たないリンクは出さない方針)。
 *
 * 配置例:
 *  - /hotels/[city] (国内): hotel-domestic, tour-package, rail-domestic 等
 *  - /hotels/[city] (海外): hotel-overseas, flight-overseas, esim-wifi, tour-local
 *  - /routes/[route] (国内): flight-domestic, tour-package, rental-car
 *  - /routes/[route] (海外): flight-overseas, esim-wifi, insurance
 *  - /deals/[id]: 関連カテゴリ
 */

const CATEGORY_LABELS: Record<AspCategory, string> = {
  "flight-domestic": "国内航空券",
  "flight-overseas": "海外航空券",
  "hotel-domestic": "国内ホテル",
  "hotel-overseas": "海外ホテル",
  "hotel-luxury": "高級ホテル",
  "hotel-glamping": "グランピング",
  "tour-package": "パッケージツアー",
  "tour-overseas": "海外ツアー",
  "tour-okinawa": "沖縄旅行",
  "tour-hawaii": "ハワイ旅行",
  "tour-local": "現地アクティビティ",
  "activity-domestic": "国内レジャー",
  "rental-car": "レンタカー",
  "rail-domestic": "新幹線・特急",
  "bus-domestic": "夜行・高速バス",
  "transport-europe": "欧州交通",
  "esim-wifi": "eSIM / Wi-Fi",
  "insurance": "海外旅行保険",
  "transfer": "空港送迎",
  "cruise": "クルーズ",
  "airline-direct": "航空会社直販",
};

const ACCENT_CLASS: Record<AspPartner["accent"], string> = {
  rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200",
  sky: "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-900/30 dark:text-sky-200",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200",
  violet: "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-900/30 dark:text-violet-200",
  amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200",
  blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-200",
  zinc: "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-200",
};

export function JapanesePartnersPanel({
  title = "BEATRIP 厳選パートナー",
  subtitle = "信頼できる日本の旅行サービスから比較・予約",
  categories,
  destinationCode,
  source,
}: {
  title?: string;
  subtitle?: string;
  /** 表示するカテゴリ (順序通りにグループ化) */
  categories: AspCategory[];
  /** GA4 計測用の都市コード */
  destinationCode?: string;
  /** GA4 計測用の起点ページ識別子 */
  source?: string;
}) {
  // カテゴリごとに有効 partner を取得 + 重複排除
  const seenIds = new Set<string>();
  const groups: Array<{ category: AspCategory; partners: AspPartner[] }> = [];

  for (const category of categories) {
    const partners = getActiveAspPartners(category).filter((p) => {
      if (seenIds.has(p.id)) return false;
      seenIds.add(p.id);
      return true;
    });
    if (partners.length > 0) {
      groups.push({ category, partners });
    }
  }

  // 1 つも有効 partner がなければ panel 自体を出さない
  if (groups.length === 0) return null;

  return (
    <aside className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <header className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {title}
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>
      </header>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {groups.map(({ category, partners }) => (
          <section key={category} className="px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {partners.map((p) => {
                const href = getAspPartnerUrl(p);
                if (!href) return null;
                return (
                  <a
                    key={p.id}
                    href={href}
                    target="_blank"
                    rel="sponsored noopener noreferrer nofollow"
                    onClick={() =>
                      trackPartnerClick({
                        partnerId: p.id,
                        category,
                        destinationCode,
                        source,
                      })
                    }
                    title={p.tagline}
                    className={`group inline-flex items-center gap-1 rounded-full border px-3 py-2 sm:py-1.5 text-sm sm:text-xs font-bold transition-colors ${ACCENT_CLASS[p.accent]}`}
                  >
                    {p.label}
                    <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
