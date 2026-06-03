import { BedDouble, Signal, Car, Shield, ArrowUpRight, Plane } from "lucide-react";
import {
  PARTNERS,
  buildPartnerUrl,
  isPartnerEnabled,
  type Partner,
  type PartnerCategory,
  type PartnerContext,
} from "@/lib/affiliate/partners";
import { PartnerCardLink } from "./partner-card-link";

/**
 * 旅の周辺商品（高料率）アフィリエイトブロック
 * env で有効なパートナーだけ表示。1つも無ければ何も描画しない（リンク
 * 切れ防止）。
 *
 * env (TRAVELPAYOUTS_MARKER / TP_*_PROGRAM_ID) はサーバー側でしか読めないので
 * サーバーコンポーネントのまま保持し、クリック計測の onClick だけクライアント
 * 子コンポーネント（PartnerCardLink）に分離している。
 */

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  BedDouble,
  Signal,
  Car,
  Shield,
  Plane,
};

export function TravelCompanions({
  ctx,
  title = "旅の準備にあわせて",
  subtitle = "高料率パートナーの厳選サービス",
  /** カテゴリ絞り込み（省略時は全部） */
  categories,
  /** カードの最大数（多い時の trim） */
  maxItems = 8,
  /** GA4 partner_click イベントの `source` 値（呼び出しページ識別） */
  source,
}: {
  ctx: PartnerContext;
  title?: string;
  subtitle?: string;
  categories?: PartnerCategory[];
  maxItems?: number;
  source?: string;
}) {
  const partners = PARTNERS.filter((p) => isPartnerEnabled(p))
    .filter((p) => !categories || categories.includes(p.category))
    .slice(0, maxItems);

  if (partners.length === 0) return null;

  return (
    <section>
      <div className="mb-3">
        <h2 className="font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
          {title}
        </h2>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
          {subtitle}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {partners.map((p) => (
          <PartnerCard
            key={p.id}
            partner={p}
            ctx={ctx}
            source={source}
          />
        ))}
      </div>
    </section>
  );
}

function PartnerCard({
  partner,
  ctx,
  source,
}: {
  partner: Partner;
  ctx: PartnerContext;
  source?: string;
}) {
  const url = buildPartnerUrl(partner, ctx);
  if (!url) return null;
  const Icon = ICONS[partner.iconKey] ?? BedDouble;

  return (
    <PartnerCardLink
      url={url}
      rel={partner.rel ?? "sponsored noopener noreferrer"}
      partnerId={partner.id}
      category={partner.category}
      destinationCode={ctx.destinationIata ?? ctx.cityNameEn}
      source={source}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mb-0.5">
          {partner.name}
        </div>
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
          {partner.ctaLabel(ctx)}
        </h3>
        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
          {partner.description}
        </p>
      </div>
      <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </PartnerCardLink>
  );
}
