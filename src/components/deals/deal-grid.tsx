"use client";

import { useState, useMemo, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { DealCard } from "./deal-card";
import { UpcomingDealCard } from "./upcoming-deal-card";
import { DealFilters, type FlightType } from "@/components/filters/deal-filters";
import type { DealSchema } from "@/data/deal-schema";
import type { SaleEvent } from "@/data/mock-deals";

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

export function DealGrid({
  deals,
  upcomingSales = [],
}: {
  deals: DealSchema[];
  upcomingSales?: SaleEvent[];
}) {
  const [flightType, setFlightType] = useState<FlightType>("all");
  const [showTotalCost, setShowTotalCost] = useState(false);
  const [showNiche, setShowNiche] = useState(false);
  const [showHiddenGem, setShowHiddenGem] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    function onSearch(e: Event) {
      const query = (e as CustomEvent).detail as string;
      setSearchQuery(query);
    }
    window.addEventListener("beatrip:search", onSearch);
    return () => window.removeEventListener("beatrip:search", onSearch);
  }, []);

  const filteredDeals = useMemo(() => {
    let result = deals;
    if (flightType === "domestic") result = result.filter(isDomesticDeal);
    if (flightType === "international") result = result.filter((d) => !isDomesticDeal(d));
    if (showNiche) result = result.filter((d) => d.is_niche_lcc);
    if (showHiddenGem) result = result.filter((d) => d.is_hidden_gem);
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
  }, [deals, flightType, showNiche, showHiddenGem, searchQuery]);

  const visibleUpcoming = useMemo(() => {
    const cols = 4;
    const remainder = filteredDeals.length % cols;
    const slotsToFill = remainder === 0 ? 0 : cols - remainder;
    return [...upcomingSales]
      .sort((a, b) => b.probability - a.probability)
      .slice(0, Math.max(slotsToFill, 0));
  }, [filteredDeals.length, upcomingSales]);

  return (
    <div>
      <DealFilters
        flightType={flightType}
        onFlightTypeChange={setFlightType}
        showTotalCost={showTotalCost}
        onToggleTotalCost={setShowTotalCost}
        showNiche={showNiche}
        onToggleNiche={setShowNiche}
        showHiddenGem={showHiddenGem}
        onToggleHiddenGem={setShowHiddenGem}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${flightType}-${showNiche}-${showHiddenGem}-${searchQuery}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4"
        >
          {filteredDeals.map((deal, i) => (
            <DealCard
              key={deal.id}
              deal={deal}
              showTotalCost={showTotalCost}
              index={i}
            />
          ))}
          {visibleUpcoming.map((event, i) => (
            <UpcomingDealCard
              key={event.id}
              event={event}
              index={filteredDeals.length + i}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {filteredDeals.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-lg text-zinc-400 dark:text-zinc-500">
            該当するディールが見つかりませんでした
          </p>
          <p className="text-sm mt-1 text-zinc-400 dark:text-zinc-500">
            フィルターを変更してお試しください
          </p>

          {/* 人気ディール提案 */}
          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4">
              人気のディール
            </p>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
              {deals
                .sort((a, b) => b.discount_percent - a.discount_percent)
                .slice(0, 4)
                .map((deal, i) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    showTotalCost={showTotalCost}
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
