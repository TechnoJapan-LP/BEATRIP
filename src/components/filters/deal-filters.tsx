"use client";

import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Zap,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDictionary } from "@/components/i18n/locale-provider";

export type FlightType = "all" | "domestic" | "international";
export type PriceRange = "all" | "lt30k" | "30k-80k" | "80k-150k" | "gte150k";
export type AreaFilter =
  | "all"
  | "domestic"
  | "overseas"
  | "asia"
  | "europe-americas"
  | "oceania-other";
export type DiscountFilter = "all" | "gte30" | "gte50" | "gte70";
export type BadgeFilter = "all" | "NEW" | "ENDING_SOON" | "BIG_DISCOUNT";
export type SortOption = "discount" | "price" | "deadline";

type DealFiltersProps = {
  flightType: FlightType;
  onFlightTypeChange: (v: FlightType) => void;
  /** 各トグルの該当件数 (国内/国際タブ適用後)。0 のトグルは薄く表示し
      「押しても 0 件 = 壊れてる」という誤認を防ぐ */
  searchQuery: string;
  onSearchChange: (v: string) => void;
  // 詳細フィルタ (任意)
  priceRange?: PriceRange;
  onPriceRangeChange?: (v: PriceRange) => void;
  area?: AreaFilter;
  onAreaChange?: (v: AreaFilter) => void;
  discount?: DiscountFilter;
  onDiscountChange?: (v: DiscountFilter) => void;
  airline?: string;
  onAirlineChange?: (v: string) => void;
  availableAirlines?: string[];
  badge?: BadgeFilter;
  onBadgeChange?: (v: BadgeFilter) => void;
  // 並び替え (任意)
  sort?: SortOption;
  onSortChange?: (v: SortOption) => void;
  // 詳細フィルタの有効バッジ数 (UI 表示用)
  activeAdvancedCount?: number;
  onResetAdvanced?: () => void;
  // 結果カウント
  resultCount?: number;
  totalCount?: number;
  onClearAll?: () => void;
};

const PRICE_LABELS: Record<PriceRange, string> = {
  all: "すべての価格",
  lt30k: "～¥30,000",
  "30k-80k": "¥30,000 - ¥80,000",
  "80k-150k": "¥80,000 - ¥150,000",
  gte150k: "¥150,000+",
};

const AREA_LABELS: Record<AreaFilter, string> = {
  all: "すべてのエリア",
  domestic: "国内",
  overseas: "海外",
  asia: "アジア",
  "europe-americas": "欧米",
  "oceania-other": "オセアニア",
};

const DISCOUNT_LABELS: Record<DiscountFilter, string> = {
  all: "割引率指定なし",
  gte30: "30%+",
  gte50: "50%+",
  gte70: "70%+",
};

const BADGE_LABELS: Record<BadgeFilter, string> = {
  all: "すべて",
  NEW: "NEW",
  ENDING_SOON: "ENDING SOON",
  BIG_DISCOUNT: "50%+ OFF",
};

const SORT_LABELS: Record<SortOption, string> = {
  discount: "割引率が高い順",
  price: "価格が安い順",
  deadline: "締切が近い順",
};

export function DealFilters({
  flightType,
  onFlightTypeChange,
  searchQuery,
  onSearchChange,
  priceRange = "all",
  onPriceRangeChange,
  area = "all",
  onAreaChange,
  discount = "all",
  onDiscountChange,
  airline = "all",
  onAirlineChange,
  availableAirlines = [],
  badge = "all",
  onBadgeChange,
  sort = "discount",
  onSortChange,
  activeAdvancedCount = 0,
  onResetAdvanced,
  resultCount,
  totalCount,
  onClearAll,
}: DealFiltersProps) {
  const t = useDictionary<Record<string, string>>("filters");
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // モバイル drawer 表示中のみ背面ページのスクロールをロックし、Esc で閉じる
  // (sm 以上では inline パネルなのでロックしない / 他 drawer と挙動を揃える)。
  useEffect(() => {
    if (!advancedOpen) return;
    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 639px)").matches;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAdvancedOpen(false);
    };
    window.addEventListener("keydown", onKey);
    if (!isMobile) {
      return () => window.removeEventListener("keydown", onKey);
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [advancedOpen]);

  const hasAdvanced =
    !!onPriceRangeChange ||
    !!onAreaChange ||
    !!onDiscountChange ||
    !!onAirlineChange ||
    !!onBadgeChange;

  const flightTabs: { value: FlightType; label: string }[] = [
    { value: "all", label: t.all },
    { value: "domestic", label: t.domestic },
    { value: "international", label: t.international },
  ];

  const advancedPanel = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* 価格帯 */}
      {onPriceRangeChange && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            価格帯
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(PRICE_LABELS) as PriceRange[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onPriceRangeChange(v)}
                aria-pressed={priceRange === v}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  priceRange === v
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {PRICE_LABELS[v]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* エリア */}
      {onAreaChange && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            エリア
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(AREA_LABELS) as AreaFilter[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onAreaChange(v)}
                aria-pressed={area === v}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  area === v
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {AREA_LABELS[v]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* 割引率 */}
      {onDiscountChange && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            割引率
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(DISCOUNT_LABELS) as DiscountFilter[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onDiscountChange(v)}
                aria-pressed={discount === v}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  discount === v
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {DISCOUNT_LABELS[v]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* バッジ */}
      {onBadgeChange && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            バッジ
          </legend>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(BADGE_LABELS) as BadgeFilter[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onBadgeChange(v)}
                aria-pressed={badge === v}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  badge === v
                    ? "bg-amber-500 text-white"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {BADGE_LABELS[v]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* 航空会社 */}
      {onAirlineChange && availableAirlines.length > 0 && (
        <fieldset className="flex flex-col gap-2 sm:col-span-2">
          <legend className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
            航空会社
          </legend>
          <select
            value={airline}
            onChange={(e) => onAirlineChange(e.target.value)}
            className="h-10 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-300"
          >
            <option value="all">すべての航空会社</option>
            {availableAirlines.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </fieldset>
      )}

      {onResetAdvanced && activeAdvancedCount > 0 && (
        <div className="sm:col-span-2 flex justify-end">
          <button
            type="button"
            onClick={onResetAdvanced}
            className="inline-flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <X className="h-3.5 w-3.5" />
            詳細フィルタをクリア
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:gap-4">
      {/* 国内/国外 タブ */}
      <div className="flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 p-1 w-fit">
        {flightTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onFlightTypeChange(tab.value)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
              flightType === tab.value
                ? "bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 検索 */}
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input
          data-search-input
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-300"
        />
      </div>

      {/* かつて 新着/締切間近/ニッチLCC/穴場 のクイックトグルがあったが、
          ストアの中心が TP 最安値ウォッチになって以降ほぼ常に 0 件で、
          「押しても何も出ないフィルタ」として不信感の元になっていたため削除。
          絞り込みは詳細フィルタに一本化。 */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2.5 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3">
        {/* 詳細フィルタ トグルボタン */}
        {hasAdvanced && (
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            aria-controls="deal-advanced-filters"
            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:col-auto"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            詳細フィルタ
            {activeAdvancedCount > 0 && (
              <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white">
                {activeAdvancedCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* 並び替え: 「とにかく安い順」需要に応えるソートセレクタ (chip UI) */}
      {onSortChange && (
        <div
          role="group"
          aria-label="並び替え"
          className="flex flex-wrap items-center gap-1.5"
        >
          <span className="mr-0.5 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <ArrowUpDown className="h-3.5 w-3.5" />
            並び替え
          </span>
          {(Object.keys(SORT_LABELS) as SortOption[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onSortChange(v)}
              aria-pressed={sort === v}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                sort === v
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
              }`}
            >
              {SORT_LABELS[v]}
            </button>
          ))}
        </div>
      )}

      {/* 詳細フィルタ パネル (desktop: collapsible / mobile: drawer) */}
      {hasAdvanced && advancedOpen && (
        <>
          {/* desktop: inline */}
          <div
            id="deal-advanced-filters"
            className="hidden sm:block rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 animate-fade-in"
          >
            {advancedPanel}
          </div>
          {/* mobile: drawer */}
          <div className="sm:hidden">
            <div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setAdvancedOpen(false)}
              aria-hidden
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-label="詳細フィルタ"
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl dark:bg-zinc-900"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  詳細フィルタ
                </h2>
                <button
                  type="button"
                  onClick={() => setAdvancedOpen(false)}
                  aria-label="閉じる"
                  className="rounded-full p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <X className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                </button>
              </div>
              {advancedPanel}
              <button
                type="button"
                onClick={() => setAdvancedOpen(false)}
                className="mt-5 w-full rounded-lg bg-zinc-900 py-3 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-900"
              >
                {resultCount != null
                  ? `${resultCount} 件のディールを見る`
                  : "適用"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* 結果カウント */}
      {typeof resultCount === "number" && (
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            <span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {resultCount}
              </span>{" "}
              件のディールが見つかりました
              {typeof totalCount === "number" && totalCount !== resultCount && (
                <span className="text-zinc-400"> / 全 {totalCount} 件</span>
              )}
            </span>
          </span>
          {onClearAll &&
            typeof totalCount === "number" &&
            resultCount !== totalCount && (
              <button
                type="button"
                onClick={onClearAll}
                className="font-medium text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                すべて表示
              </button>
            )}
        </div>
      )}
    </div>
  );
}
