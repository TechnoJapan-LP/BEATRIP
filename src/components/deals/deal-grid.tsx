"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { DealCard } from "./deal-card";
import { UpcomingDealCard } from "./upcoming-deal-card";
import {
  DealFilters,
  type FlightType,
  type PriceRange,
  type AreaFilter,
  type DiscountFilter,
  type BadgeFilter,
} from "@/components/filters/deal-filters";
import { useDictionary } from "@/components/i18n/locale-provider";
import type { DealSchema } from "@/data/deal-schema";
import type { SaleEvent } from "@/data/mock-deals";
import { HOTEL_DESTINATIONS } from "@/data/hotel-destinations";

// 日本国内の空港コード
const JP_AIRPORT_CODES = new Set([
  "NRT", "HND", "KIX", "ITM", "NGO", "CTS", "FUK", "OKA",
  "KOJ", "HIJ", "SDJ", "KMQ", "NGS", "OIT", "MYJ", "KCZ",
  "TAK", "TKS", "KMJ", "AOJ", "AKJ", "MMB", "OBO", "HKD",
  "GAJ", "SHM", "UBJ", "IZO", "TTJ", "KMI", "ASJ", "ISG", "MMY",
]);

function isDomesticDeal(deal: DealSchema): boolean {
  return JP_AIRPORT_CODES.has(deal.origin_code) && JP_AIRPORT_CODES.has(deal.destination_code);
}

// 目的地コード → エリア区分のマッピング (HOTEL_DESTINATIONS から生成)
// 国内: JP IATA / 海外: それ以外。アジア/欧米/オセアニアは HOTEL_DESTINATIONS の region から。
const DEST_TO_AREA = new Map<string, AreaFilter>();
for (const hd of HOTEL_DESTINATIONS) {
  let area: AreaFilter = "all";
  if (hd.region === "国内") area = "domestic";
  else if (hd.region === "アジア") area = "asia";
  else if (hd.region === "欧州" || hd.region === "米州") area = "europe-americas";
  else if (hd.region === "オセアニア・その他") area = "oceania-other";
  for (const code of hd.iataCodes) DEST_TO_AREA.set(code, area);
}

function getDealArea(deal: DealSchema): AreaFilter {
  // 国内便（出発・到着両方 JP）は domestic
  if (isDomesticDeal(deal)) return "domestic";
  // HOTEL_DESTINATIONS の region を優先
  const mapped = DEST_TO_AREA.get(deal.destination_code);
  if (mapped && mapped !== "domestic") return mapped;
  // 海外発着で region 不明 → "overseas" (= 全海外)
  if (!JP_AIRPORT_CODES.has(deal.destination_code)) return "overseas";
  return "domestic";
}

function priceMatchesRange(price: number, range: PriceRange): boolean {
  switch (range) {
    case "lt30k": return price < 30_000;
    case "30k-80k": return price >= 30_000 && price < 80_000;
    case "80k-150k": return price >= 80_000 && price < 150_000;
    case "gte150k": return price >= 150_000;
    case "all":
    default: return true;
  }
}

function discountMatches(percent: number, filter: DiscountFilter): boolean {
  switch (filter) {
    case "gte30": return percent >= 30;
    case "gte50": return percent >= 50;
    case "gte70": return percent >= 70;
    case "all":
    default: return true;
  }
}

function areaMatches(deal: DealSchema, filter: AreaFilter): boolean {
  if (filter === "all") return true;
  const dealArea = getDealArea(deal);
  if (filter === "domestic") return dealArea === "domestic";
  if (filter === "overseas") return dealArea !== "domestic";
  // overseas のサブカテゴリ
  return dealArea === filter;
}

// URL クエリパラメータ用 helper
const VALID_PRICE: PriceRange[] = ["all", "lt30k", "30k-80k", "80k-150k", "gte150k"];
const VALID_AREA: AreaFilter[] = ["all", "domestic", "overseas", "asia", "europe-americas", "oceania-other"];
const VALID_DISCOUNT: DiscountFilter[] = ["all", "gte30", "gte50", "gte70"];
const VALID_BADGE: BadgeFilter[] = ["all", "NEW", "ENDING_SOON", "LOWEST_IN_2_YEARS"];
const VALID_FLIGHT_TYPE: FlightType[] = ["all", "domestic", "international"];

function parseEnum<T extends string>(
  value: string | null,
  valid: readonly T[],
  fallback: T
): T {
  if (!value) return fallback;
  return (valid as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function DealGrid({
  deals,
  upcomingSales = [],
}: {
  deals: DealSchema[];
  upcomingSales?: SaleEvent[];
}) {
  const t = useDictionary<Record<string, string>>("filters");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL 初期値から復元
  const [flightType, setFlightType] = useState<FlightType>(() =>
    parseEnum(searchParams.get("type"), VALID_FLIGHT_TYPE, "all")
  );
  const [showNew, setShowNew] = useState(() => searchParams.get("new") === "1");
  const [showEnding, setShowEnding] = useState(() => searchParams.get("ending") === "1");
  const [showNiche, setShowNiche] = useState(() => searchParams.get("niche") === "1");
  const [showHiddenGem, setShowHiddenGem] = useState(() => searchParams.get("gem") === "1");
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [priceRange, setPriceRange] = useState<PriceRange>(() =>
    parseEnum(searchParams.get("price"), VALID_PRICE, "all")
  );
  const [area, setArea] = useState<AreaFilter>(() =>
    parseEnum(searchParams.get("area"), VALID_AREA, "all")
  );
  const [discount, setDiscount] = useState<DiscountFilter>(() =>
    parseEnum(searchParams.get("discount"), VALID_DISCOUNT, "all")
  );
  const [airlineFilter, setAirlineFilter] = useState<string>(
    () => searchParams.get("airline") ?? "all"
  );
  const [badge, setBadge] = useState<BadgeFilter>(() =>
    parseEnum(searchParams.get("badge"), VALID_BADGE, "all")
  );

  useEffect(() => {
    function onSearch(e: Event) {
      const query = (e as CustomEvent).detail as string;
      setSearchQuery(query);
    }
    window.addEventListener("beatrip:search", onSearch);
    return () => window.removeEventListener("beatrip:search", onSearch);
  }, []);

  // URL クエリ同期 (state → URL)。replace で履歴汚染を防ぐ。
  useEffect(() => {
    const params = new URLSearchParams();
    if (flightType !== "all") params.set("type", flightType);
    if (showNew) params.set("new", "1");
    if (showEnding) params.set("ending", "1");
    if (showNiche) params.set("niche", "1");
    if (showHiddenGem) params.set("gem", "1");
    if (searchQuery) params.set("q", searchQuery);
    if (priceRange !== "all") params.set("price", priceRange);
    if (area !== "all") params.set("area", area);
    if (discount !== "all") params.set("discount", discount);
    if (airlineFilter !== "all") params.set("airline", airlineFilter);
    if (badge !== "all") params.set("badge", badge);

    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    // 現在の URL と同じならスキップ (無限ループ防止)
    const currentQs = searchParams.toString();
    if (qs !== currentQs) {
      router.replace(url, { scroll: false });
    }
    // pathname/searchParams は意図的に依存に含めない (state 変化のみで URL を更新)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    flightType,
    showNew,
    showEnding,
    showNiche,
    showHiddenGem,
    searchQuery,
    priceRange,
    area,
    discount,
    airlineFilter,
    badge,
  ]);

  // 航空会社オプション: 現在の deal 集合から抽出
  const availableAirlines = useMemo(() => {
    const set = new Set<string>();
    for (const d of deals) set.add(d.airline_name);
    return Array.from(set).sort();
  }, [deals]);

  const filteredDeals = useMemo(() => {
    let result = deals;
    if (flightType === "domestic") result = result.filter(isDomesticDeal);
    if (flightType === "international") result = result.filter((d) => !isDomesticDeal(d));
    if (showNew) result = result.filter((d) => d.badge === "NEW");
    if (showEnding) result = result.filter((d) => d.badge === "ENDING_SOON");
    if (showNiche) result = result.filter((d) => d.is_niche_lcc);
    if (showHiddenGem) result = result.filter((d) => d.is_hidden_gem);
    if (priceRange !== "all") result = result.filter((d) => priceMatchesRange(d.sale_price, priceRange));
    if (area !== "all") result = result.filter((d) => areaMatches(d, area));
    if (discount !== "all") result = result.filter((d) => discountMatches(d.discount_percent, discount));
    if (airlineFilter !== "all") result = result.filter((d) => d.airline_name === airlineFilter);
    if (badge !== "all") result = result.filter((d) => d.badge === badge);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.destination.toLowerCase().includes(q) ||
          d.destination_code.toLowerCase().includes(q) ||
          d.origin.toLowerCase().includes(q) ||
          d.origin_code.toLowerCase().includes(q) ||
          d.airline_name.toLowerCase().includes(q)
      );
    }
    return result;
  }, [
    deals,
    flightType,
    showNew,
    showEnding,
    showNiche,
    showHiddenGem,
    searchQuery,
    priceRange,
    area,
    discount,
    airlineFilter,
    badge,
  ]);

  // 目的地ごとに常時グルーピング: 最安便を代表として、他便数と出発空港をメタ情報として保持
  type DisplayDeal = { deal: DealSchema; variantCount: number; variantOriginCodes: string[] };
  const displayDeals = useMemo<DisplayDeal[]>(() => {
    // 目的地コード + キャビン でグループ化
    const groups = new Map<string, DealSchema[]>();
    for (const d of filteredDeals) {
      const key = `${d.destination_code}-${d.cabin}`;
      const arr = groups.get(key) ?? [];
      arr.push(d);
      groups.set(key, arr);
    }

    // 各グループの最安便を選択 + 他便の出発空港コードを集計
    const result: DisplayDeal[] = [];
    for (const dealsInGroup of groups.values()) {
      const sorted = [...dealsInGroup].sort((a, b) => a.sale_price - b.sale_price);
      const cheapest = sorted[0];
      const otherOrigins = sorted
        .slice(1)
        .map((d) => d.origin_code)
        .filter((c, i, arr) => arr.indexOf(c) === i);
      result.push({
        deal: cheapest,
        variantCount: sorted.length,
        variantOriginCodes: otherOrigins,
      });
    }

    // 表示順: 割引率の高い順
    return result.sort((a, b) => b.deal.discount_percent - a.deal.discount_percent);
  }, [filteredDeals]);

  const visibleUpcoming = useMemo(() => {
    const cols = 4;
    const remainder = displayDeals.length % cols;
    const slotsToFill = remainder === 0 ? 0 : cols - remainder;
    return [...upcomingSales]
      .sort((a, b) => b.probability - a.probability)
      .slice(0, Math.max(slotsToFill, 0));
  }, [displayDeals.length, upcomingSales]);

  // 詳細フィルタの有効数 (バッジ表示)
  const activeAdvancedCount = useMemo(() => {
    let n = 0;
    if (priceRange !== "all") n++;
    if (area !== "all") n++;
    if (discount !== "all") n++;
    if (airlineFilter !== "all") n++;
    if (badge !== "all") n++;
    return n;
  }, [priceRange, area, discount, airlineFilter, badge]);

  const resetAdvanced = useCallback(() => {
    setPriceRange("all");
    setArea("all");
    setDiscount("all");
    setAirlineFilter("all");
    setBadge("all");
  }, []);

  const clearAll = useCallback(() => {
    setFlightType("all");
    setShowNew(false);
    setShowEnding(false);
    setShowNiche(false);
    setShowHiddenGem(false);
    setSearchQuery("");
    resetAdvanced();
  }, [resetAdvanced]);

  return (
    <div>
      <DealFilters
        flightType={flightType}
        onFlightTypeChange={setFlightType}
        showNew={showNew}
        onToggleNew={setShowNew}
        showEnding={showEnding}
        onToggleEnding={setShowEnding}
        showNiche={showNiche}
        onToggleNiche={setShowNiche}
        showHiddenGem={showHiddenGem}
        onToggleHiddenGem={setShowHiddenGem}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        area={area}
        onAreaChange={setArea}
        discount={discount}
        onDiscountChange={setDiscount}
        airline={airlineFilter}
        onAirlineChange={setAirlineFilter}
        availableAirlines={availableAirlines}
        badge={badge}
        onBadgeChange={setBadge}
        activeAdvancedCount={activeAdvancedCount}
        onResetAdvanced={resetAdvanced}
        resultCount={displayDeals.length}
        totalCount={deals.length}
        onClearAll={clearAll}
      />

      <div
        key={`${flightType}-${showNew}-${showEnding}-${showNiche}-${showHiddenGem}-${searchQuery}-${priceRange}-${area}-${discount}-${airlineFilter}-${badge}`}
        className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in"
      >
          {displayDeals.map(({ deal, variantOriginCodes }, i) => (
            <DealCard
              key={deal.id}
              deal={deal}
              index={i}
              variantOriginCodes={variantOriginCodes}
            />
          ))}
          {visibleUpcoming.map((event, i) => (
            <UpcomingDealCard
              key={event.id}
              event={event}
              index={displayDeals.length + i}
            />
          ))}
      </div>

      {displayDeals.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-zinc-400 dark:text-zinc-500">
            {t.noResults}
          </p>
          <p className="text-sm mt-1 text-zinc-400 dark:text-zinc-500">
            {t.noResultsHint}
          </p>

          <button
            type="button"
            onClick={clearAll}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            すべて表示
          </button>

          {/* 人気ディール提案 */}
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              {t.popularSuggestion}
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {deals
                .sort((a, b) => b.discount_percent - a.discount_percent)
                .slice(0, 4)
                .map((deal, i) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    index={i}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
