"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Columns3, X, Star } from "lucide-react";
import {
  clearComparison,
  removeFromComparison,
  useComparison,
} from "@/lib/comparison/use-comparison";
import { useLocalizedHref } from "@/components/i18n/locale-provider";
import { CURATED_HOTELS, type CuratedHotel } from "@/data/hotel-curated";
import { getHotelDestinationBySlug } from "@/data/hotel-destinations";

/**
 * 全ページ右下のフローティングボタン + 比較ドロワー。
 *
 * - 0 件 → 何も描画しない (ボタンも非表示)
 * - mobile では bottom-nav (56px) と RecentlyViewedDrawer の上に重ねる
 *   → RecentlyViewed: bottom: 64px / Comparison: bottom: 112px (= 64+48)
 * - desktop では右下、RecentlyViewed: 24px / Comparison: 72px
 * - 各列に「× 外す」ボタン
 *
 * 横並び比較カラムは tier / area / star / reviewScore / rooms / amenities /
 * price を出す。curated-only データなので CuratedHotel をルックアップして埋める。
 */
export function ComparisonDrawer() {
  const items = useComparison();
  const [open, setOpen] = useState(false);
  const lh = useLocalizedHref();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (items.length === 0) return null;

  const count = items.length;

  return (
    <>
      {/* フローティング起動ボタン。FAB スタック 2 段目 (--fab-2)、
          RecentlyViewed (--fab-1) の上に重ねる。z-30 で同階層。
          PC は sm:bottom-[72px]。offset は globals.css の共通トークン。 */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`比較中 ${count} 件を開く`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="fixed right-3 sm:right-6 bottom-[var(--fab-2)] sm:bottom-[72px] z-30 flex min-h-[44px] items-center gap-1.5 rounded-full bg-violet-600 px-3.5 py-2 text-white shadow-lg shadow-violet-600/30 transition-all hover:-translate-y-0.5 hover:shadow-xl active:scale-95 dark:bg-violet-500 dark:shadow-violet-500/20"
      >
        <Columns3 className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-bold">比較中 {count}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="ホテル比較"
          className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-zinc-950"
        >
          <header className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2">
              <Columns3 className="h-4 w-4 text-zinc-500" aria-hidden="true" />
              <h2 className="font-heading text-base tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
                ホテル比較 {count}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => clearComparison()}
                className="rounded-lg bg-zinc-100 px-3 py-1.5 text-xs font-bold text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                すべて外す
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="閉じる"
                className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </header>

          {/* 横並びテーブル風: 各列が hotel 1 件、行が属性。
              mobile は overflow-x-auto で横スクロール、PC は最大 4 列を flex 配置 */}
          <div className="flex-1 overflow-auto p-4">
            <div className="flex gap-3 min-w-fit">
              {items.map((it) => {
                const hotel = lookupHotel(it.citySlug, it.name);
                const dest = getHotelDestinationBySlug(it.citySlug);
                const price = hotel ? tierPriceRange(hotel.tier) : null;
                return (
                  <article
                    key={it.hotelSlug}
                    className="flex flex-col w-[280px] flex-shrink-0 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
                  >
                    {/* 画像 */}
                    <div className="relative aspect-[16/10] bg-zinc-100 dark:bg-zinc-800">
                      {it.imageUrl ? (
                        <Image
                          src={it.imageUrl}
                          alt={it.name}
                          fill
                          sizes="280px"
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className={`absolute inset-0 flex items-center justify-center bg-gradient-to-br ${tierGradient(it.tier)}`}
                          aria-hidden="true"
                        >
                          <span className="font-heading text-5xl font-bold text-white/90 drop-shadow">
                            {it.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromComparison(it.hotelSlug)}
                        aria-label={`${it.name} を外す`}
                        className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-zinc-700 shadow transition-colors hover:bg-white dark:bg-zinc-900/90 dark:text-zinc-200"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {/* 属性 */}
                    <div className="flex flex-col gap-2 p-3 text-xs">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        {it.name}
                      </h3>
                      <div>
                        <span
                          className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${tierBadge(it.tier)}`}
                        >
                          {it.tier}
                        </span>
                      </div>

                      <Row label="エリア">{hotel?.area ?? "—"}</Row>
                      <Row label="星評価">
                        {hotel?.star ? `${hotel.star} 星` : "—"}
                      </Row>
                      <Row label="レビュー">
                        {hotel?.reviewScore != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Star
                              className="h-3 w-3 fill-emerald-500 text-emerald-500"
                              aria-hidden="true"
                            />
                            <span className="font-bold text-emerald-700 dark:text-emerald-300">
                              {hotel.reviewScore.toFixed(1)}
                            </span>
                            {hotel.reviewCount != null && (
                              <span className="text-zinc-400">
                                ({hotel.reviewCount.toLocaleString()})
                              </span>
                            )}
                          </span>
                        ) : (
                          "—"
                        )}
                      </Row>
                      <Row label="客室数">
                        {hotel?.rooms ? `約 ${hotel.rooms} 室` : "—"}
                      </Row>
                      <Row label="アメニティ">
                        {hotel?.amenities && hotel.amenities.length > 0 ? (
                          <span className="flex flex-wrap gap-1">
                            {hotel.amenities.slice(0, 5).map((a) => (
                              <span
                                key={a}
                                className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-600 dark:text-zinc-300"
                              >
                                {AMENITY_LABEL[a] ?? a}
                              </span>
                            ))}
                          </span>
                        ) : (
                          "—"
                        )}
                      </Row>
                      <Row label="目安価格 / 泊">
                        {price ? (
                          <span className="font-mono">
                            ¥{price.low.toLocaleString()}〜¥
                            {price.high.toLocaleString()}
                          </span>
                        ) : (
                          "—"
                        )}
                      </Row>

                      <Link
                        href={lh(`/hotels/${it.citySlug}`)}
                        onClick={() => setOpen(false)}
                        className="mt-2 inline-flex items-center justify-center rounded-lg bg-zinc-900 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                      >
                        {dest?.nameJa ?? it.citySlug}の予約サイトを見る
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-t border-zinc-100 dark:border-zinc-800 pt-1.5">
      <span className="text-[10px] uppercase tracking-wider text-zinc-400">
        {label}
      </span>
      <span className="text-xs text-zinc-700 dark:text-zinc-200">
        {children}
      </span>
    </div>
  );
}

/** curated hotels から citySlug + name で 1 件ルックアップ */
function lookupHotel(citySlug: string, name: string): CuratedHotel | undefined {
  const list = CURATED_HOTELS[citySlug];
  if (!list) return undefined;
  return list.find((h) => h.name === name);
}

/** city page の tierPriceRange と同等。重複排除のため lib 切出しでも可だが
 *  当面ここに同居させる (1 箇所しか参照しないため) */
function tierPriceRange(tier: CuratedHotel["tier"]): {
  low: number;
  high: number;
} {
  switch (tier) {
    case "ラグジュアリー":
      return { low: 60000, high: 200000 };
    case "ハイクラス":
      return { low: 25000, high: 60000 };
    case "ミドル":
      return { low: 10000, high: 25000 };
    case "バジェット":
    default:
      return { low: 4000, high: 10000 };
  }
}

function tierGradient(tier: string): string {
  switch (tier) {
    case "ラグジュアリー":
      return "from-amber-400 via-rose-500 to-purple-600";
    case "ハイクラス":
      return "from-sky-400 to-indigo-600";
    case "ミドル":
      return "from-emerald-400 to-teal-600";
    default:
      return "from-zinc-400 to-zinc-600";
  }
}

function tierBadge(tier: string): string {
  switch (tier) {
    case "ラグジュアリー":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    case "ハイクラス":
      return "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300";
    case "ミドル":
      return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300";
    default:
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  }
}

/** amenity identifier → 日本語ラベル (HotelMetaRow と整合) */
const AMENITY_LABEL: Record<string, string> = {
  pool: "プール",
  spa: "スパ",
  gym: "ジム",
  restaurant: "レストラン",
  bar: "バー",
  "free-wifi": "Wi-Fi",
  parking: "駐車場",
  "airport-shuttle": "空港送迎",
  "kids-friendly": "ファミリー",
  "pet-friendly": "ペット可",
  onsen: "温泉",
  view: "眺望",
  breakfast: "朝食",
  concierge: "コンシェルジュ",
  business: "ビジネス",
};
