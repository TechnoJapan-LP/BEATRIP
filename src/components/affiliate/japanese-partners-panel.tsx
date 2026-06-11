// Server Component:
// 以前は trackPartnerClick の onClick だけのために "use client" 化していたが、
// その結果 process.env.a8mat_* が client で undefined となり panel 全体が消える事故
// が発生しうる。クリック計測は TrackedPartnerLink (小さな client wrapper) に切り出し、
// パネル本体はサーバーで env を読んでレンダリングする。

import { Star } from "lucide-react";
import {
  getActiveAspPartners,
  getAspPartnerUrl,
  type AspCategory,
  type AspPartner,
} from "@/lib/affiliate/asp-partners";
import { TrackedPartnerLink } from "@/components/affiliate/tracked-partner-link";
import { PrNotice } from "@/components/compliance/pr-notice";

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
  "credit-card": "旅行系カード",
  "transfer": "空港送迎",
  "cruise": "クルーズ",
  "airline-direct": "航空会社直販",
};

export function JapanesePartnersPanel({
  title = "BEATRIP 厳選パートナー",
  subtitle = "信頼できる日本の旅行サービスから比較・予約",
  categories,
  destinationCode,
  source,
  compact = false,
  maxChips,
}: {
  title?: string;
  subtitle?: string;
  /** 表示するカテゴリ (順序通りにグループ化) */
  categories: AspCategory[];
  /** GA4 計測用の都市コード */
  destinationCode?: string;
  /** GA4 計測用の起点ページ識別子 */
  source?: string;
  /** コンパクト mode (chip 数を絞る + grouping 廃止) */
  compact?: boolean;
  /** 表示 chip の上限 (compact 時のデフォルト 6) */
  maxChips?: number;
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

  // compact mode: グループを潰して priority 順で chip を maxChips 件に絞る
  if (compact) {
    const limit = maxChips ?? 6;
    const flat = groups
      .flatMap((g) =>
        g.partners.map((p) => ({ partner: p, category: g.category }))
      )
      .sort((a, b) => a.partner.priority - b.partner.priority)
      .slice(0, limit);

    if (flat.length === 0) return null;

    return (
      <aside className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <header className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-3">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
            {title}
            <PrNotice variant="badge" />
          </h3>
          <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>
        </header>
        <div className="px-5 py-3 flex flex-wrap gap-1.5 items-center">
          {flat.map(({ partner, category }) => {
            const href = getAspPartnerUrl(partner);
            if (!href) return null;
            return (
              <PartnerChipWithBadge
                key={partner.id}
                partner={partner}
                category={category}
                href={href}
                destinationCode={destinationCode}
                source={source}
              />
            );
          })}
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <header className="border-b border-zinc-100 dark:border-zinc-800 px-5 py-3">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
          {title}
          <PrNotice variant="badge" />
        </h3>
        <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>
      </header>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {groups.map(({ category, partners }) => (
          <section key={category} className="px-5 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {partners.map((p) => {
                const href = getAspPartnerUrl(p);
                if (!href) return null;
                return (
                  <PartnerChipWithBadge
                    key={p.id}
                    partner={p}
                    category={category}
                    href={href}
                    destinationCode={destinationCode}
                    source={source}
                  />
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}

/**
 * 1 件分の partner chip。priority=1 の場合は「おすすめ」バッジ付きで wrap。
 * チップ本体のスタイルは既存 TrackedPartnerLink を維持し、バッジは
 * 周囲を inline-flex で包んだ装飾のみで CLS を最小化する。
 */
function PartnerChipWithBadge({
  partner,
  category,
  href,
  destinationCode,
  source,
}: {
  partner: AspPartner;
  category: AspCategory;
  href: string;
  destinationCode?: string;
  source?: string;
}) {
  const link = (
    <TrackedPartnerLink
      href={href}
      partnerId={partner.id}
      category={category}
      destinationCode={destinationCode}
      source={source}
      label={partner.label}
      accent={partner.accent}
      title={partner.tagline}
    />
  );

  if (partner.priority !== 1) return link;

  return (
    <span className="relative inline-flex items-center">
      {link}
      <span
        className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-200"
        title="BEATRIP おすすめ"
      >
        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
        おすすめ
      </span>
    </span>
  );
}
