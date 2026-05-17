"use client";

import { Search, Sparkles, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export type FlightType = "all" | "domestic" | "international";

type DealFiltersProps = {
  flightType: FlightType;
  onFlightTypeChange: (v: FlightType) => void;
  showTotalCost: boolean;
  onToggleTotalCost: (v: boolean) => void;
  showNiche: boolean;
  onToggleNiche: (v: boolean) => void;
  showHiddenGem: boolean;
  onToggleHiddenGem: (v: boolean) => void;
  searchQuery: string;
  onSearchChange: (v: string) => void;
};

const flightTabs: { value: FlightType; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "domestic", label: "国内線" },
  { value: "international", label: "国際線" },
];

export function DealFilters({
  flightType,
  onFlightTypeChange,
  showTotalCost,
  onToggleTotalCost,
  showNiche,
  onToggleNiche,
  showHiddenGem,
  onToggleHiddenGem,
  searchQuery,
  onSearchChange,
}: DealFiltersProps) {
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

      {/* 検索 + トグル */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            data-search-input
            placeholder="都市・空港・航空会社で検索..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-300"
          />
        </div>

        <div className="flex items-center gap-4 overflow-x-auto text-sm sm:gap-5">
          <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap sm:gap-2">
            <Switch
              checked={showTotalCost}
              onCheckedChange={onToggleTotalCost}
            />
            <span className="text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm">総額表示</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap sm:gap-2">
            <Switch checked={showNiche} onCheckedChange={onToggleNiche} />
            <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm">
              <Sparkles className="h-3.5 w-3.5" />
              ニッチLCC
            </span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap sm:gap-2">
            <Switch
              checked={showHiddenGem}
              onCheckedChange={onToggleHiddenGem}
            />
            <span className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-300 sm:text-sm">
              <MapPin className="h-3.5 w-3.5" />
              穴場
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
