import Link from "next/link";
import { Wifi, ShieldCheck, Sparkles, ArrowUpRight } from "lucide-react";
import type { DealSchema } from "@/data/deal-schema";
import { getHotelSlugByIata } from "@/data/hotel-destinations";

/**
 * 行先別の「旅の必需品」コンパクト CTA。
 *
 * フライトディール詳細ページに掲示し、出発前に揃えたい高料率カテゴリ
 * （eSIM / 保険 / 現地アクティビティ）へ送客する。
 * 国内便と海外便で文言・行き先を切替：
 *  - 海外便: eSIM / 海外旅行保険 / 現地アクティビティ
 *  - 国内便: ポケット Wi-Fi / 旅行保険 / 現地アクティビティ
 *
 * リンク優先順位:
 *  - 行先がホテル登録対象都市なら /hotels/{slug}/esim や /hotels/{slug}/activities
 *    （都市別の最適化されたコンテンツが既に存在する）
 *  - そうでなければ /esim や /package-tour など汎用ランディングへ
 */

// 国内便判定 — deals/[id]/page.tsx で使われているのと同じ日本主要空港の IATA
const JP_IATAS = new Set([
  "NRT", "HND", "KIX", "ITM", "NGO", "CTS", "FUK", "OKA",
  "KOJ", "HIJ", "SDJ", "KMQ", "NGS", "OIT", "MYJ", "KCZ",
  "TAK", "TKS", "KMJ", "AOJ", "AKJ", "MMB", "OBO", "HKD",
  "GAJ", "SHM", "UBJ", "IZO", "TTJ", "KMI", "ASJ", "ISG", "MMY",
  "OKD", "IBR", "KUH", "WKJ", "AXT", "HNA", "FKS",
  "NKM", "KIJ", "TOY", "FSZ", "HHE", "UKB", "OKJ", "YGJ",
]);

type CtaItem = {
  Icon: typeof Wifi;
  title: string;
  desc: string;
  href: string;
  accent: string; // tailwind text color class
  ring: string;   // tailwind ring color class
  external?: boolean;
};

export function TravelEssentialsCta({ deal }: { deal: DealSchema }) {
  const isInternational =
    JP_IATAS.has(deal.origin_code) && !JP_IATAS.has(deal.destination_code);

  const citySlug = getHotelSlugByIata(deal.destination_code);
  const destName = deal.destination;

  // eSIM サブページは海外都市のみ generateStaticParams される。
  // 国内便では汎用 /esim へフォールバック。
  const esimHref =
    citySlug && isInternational ? `/hotels/${citySlug}/esim` : "/esim";
  const activitiesHref = citySlug
    ? `/hotels/${citySlug}/activities`
    : "/package-tour";
  // 保険専用ページは未実装。都市別ガイド経由で TravelCompanions 内の保険 ASP に着地させる
  const insuranceHref = citySlug ? `/hotels/${citySlug}` : "/package-tour";

  // 海外/国内で 3 CTA を切替
  const items: CtaItem[] = isInternational
    ? [
        {
          Icon: Wifi,
          title: `${destName}で使える eSIM 比較`,
          desc: "Airalo / 楽天モバイル等を一括比較",
          href: esimHref,
          accent: "text-sky-500",
          ring: "ring-sky-100 dark:ring-sky-900/40",
        },
        {
          Icon: ShieldCheck,
          title: `${destName}向け海外旅行保険`,
          desc: "出発当日加入も可能・主要会社を比較",
          href: insuranceHref,
          accent: "text-emerald-500",
          ring: "ring-emerald-100 dark:ring-emerald-900/40",
        },
        {
          Icon: Sparkles,
          title: `${destName}の現地アクティビティ予約`,
          desc: "KKday / Klook 等を横断検索",
          href: activitiesHref,
          accent: "text-amber-500",
          ring: "ring-amber-100 dark:ring-amber-900/40",
        },
      ]
    : [
        {
          Icon: Wifi,
          title: "国内向けポケット Wi-Fi / eSIM",
          desc: "短期レンタル・空港受取も対応",
          href: esimHref,
          accent: "text-sky-500",
          ring: "ring-sky-100 dark:ring-sky-900/40",
        },
        {
          Icon: ShieldCheck,
          title: "国内旅行保険",
          desc: "短期型・スキー/ゴルフ特約も",
          href: insuranceHref,
          accent: "text-emerald-500",
          ring: "ring-emerald-100 dark:ring-emerald-900/40",
        },
        {
          Icon: Sparkles,
          title: `${destName}の現地アクティビティ予約`,
          desc: "アソビュー / じゃらん遊び・体験 等",
          href: activitiesHref,
          accent: "text-amber-500",
          ring: "ring-amber-100 dark:ring-amber-900/40",
        },
      ];

  return (
    <div className="rounded-xl border border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="font-heading text-lg tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
          Travel Essentials
        </h2>
        <span className="text-[11px] text-zinc-400">出発前に揃えたい必需品</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {items.map((it) => (
          <Link
            key={it.title}
            href={it.href}
            className={`group flex items-start gap-3 rounded-lg ring-1 ${it.ring} bg-zinc-50 dark:bg-zinc-800/40 p-3 transition-all hover:-translate-y-0.5 hover:bg-white dark:hover:bg-zinc-800`}
          >
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-white dark:bg-zinc-900 shadow-sm">
              <it.Icon className={`h-4 w-4 ${it.accent}`} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                {it.title}
              </h3>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                {it.desc}
              </p>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 flex-shrink-0 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
