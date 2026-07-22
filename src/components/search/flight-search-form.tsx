"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ChevronDown,
  Plane,
  ArrowRightLeft,
  X,
} from "lucide-react";
import type { DealSchema } from "@/data/deal-schema";
import { cityNameJa } from "@/lib/airport-names";
import { useDictionary } from "@/components/i18n/locale-provider";
import { trackSearchSubmit } from "@/components/analytics";

type Airport = { code: string; name: string };

const domesticAirports: Airport[] = [
  { code: "NRT", name: "東京 (成田)" },
  { code: "HND", name: "東京 (羽田)" },
  { code: "KIX", name: "大阪 (関西)" },
  { code: "NGO", name: "名古屋 (中部)" },
  { code: "FUK", name: "福岡" },
  { code: "CTS", name: "札幌 (新千歳)" },
  { code: "OKA", name: "沖縄 (那覇)" },
];

function getInternationalAirports(deals: DealSchema[]): Airport[] {
  const seen = new Set<string>();
  return deals
    .filter((d) => {
      if (seen.has(d.destination_code)) return false;
      seen.add(d.destination_code);
      return true;
    })
    // d.destination は TP ウォッチ由来だと IATA コード生値のことが多いため、
    // 共通マスタ (cityNameJa) を優先し、無ければ deal 側の名称にフォールバックする。
    .map((d) => ({
      code: d.destination_code,
      name: cityNameJa(d.destination_code) !== d.destination_code
        ? cityNameJa(d.destination_code)
        : d.destination,
    }));
}

type Props = {
  deals: DealSchema[];
  /** 指定時、ヘッダー右上に閉じる×ボタンを表示 */
  onClose?: () => void;
};

export function FlightSearchForm({ deals, onClose }: Props) {
  const router = useRouter();
  const t = useDictionary<Record<string, string>>("search");
  const internationalAirports = useMemo(
    () => getInternationalAirports(deals),
    [deals]
  );
  const allAirports = useMemo(
    () => [...domesticAirports, ...internationalAirports],
    [internationalAirports]
  );

  // 日付入力は 2026-07-21 に撤去した。収集が /v2/prices/latest (1路線につき
  // 最安の1日付ペアのみ) である以上、任意の日付で探せるデータは存在せず、
  // 「7/23 で検索したのに 7/29 発が出る」という壊れた約束になっていた
  // (実際にユーザー報告あり)。日付・片道往復の選択は実在庫を持つ遷移先
  // (Trip.com) の役割とし、ここは「セール路線を見つける」ことに特化する。
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [openDropdown, setOpenDropdown] = useState<
    "origin" | "dest" | null
  >(null);

  const originRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        openDropdown === "origin" &&
        originRef.current &&
        !originRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
      if (
        openDropdown === "dest" &&
        destRef.current &&
        !destRef.current.contains(target)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openDropdown]);

  function handleSearch() {
    trackSearchSubmit({
      origin,
      destination,
      departDate: "",
      returnDate: "",
    });
    const matched = deals.filter((d) => {
      if (origin && d.origin_code !== origin) return false;
      if (destination && d.destination_code !== destination) return false;
      return true;
    });

    // 出発地×行き先が揃っていて観測があるなら、路線ページ (セールのハブ) へ。
    // 以前は「一致1件なら deal 詳細へ直行」で、観測日と違う日付を検索した人が
    // 個別の観測結果 (例: 7/29発) にいきなり落ちて混乱していた。路線ページなら
    // その路線の全ディール・価格推移・予約導線 (日付は Trip.com 側で変更可能)
    // が揃っており、「この路線のセール状況」という検索意図に正しく応えられる。
    if (origin && destination && matched.length > 0) {
      router.push(`/routes/${origin}-${destination}`);
      return;
    }

    const destName = destination
      ? allAirports.find((a) => a.code === destination)?.name ?? destination
      : "";

    window.dispatchEvent(
      new CustomEvent("beatrip:search", { detail: destName })
    );

    const el = document.getElementById("deals");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  function handleSwap() {
    const prev = origin;
    setOrigin(destination);
    setDestination(prev);
  }

  const originDisplayName =
    allAirports.find((a) => a.code === origin)?.name ?? t.selectOrigin;
  const destDisplayName =
    allAirports.find((a) => a.code === destination)?.name ?? t.selectDestination;

  function renderDropdownList(
    selectedCode: string,
    onSelect: (code: string) => void
  ) {
    return (
      <div className="absolute left-0 top-full z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 py-1 shadow-lg">
        <button
          type="button"
          onClick={() => onSelect("")}
          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700"
        >
          {t.all}
        </button>
        <div className="px-3 pt-2 pb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-300 dark:text-zinc-500">
          {t.domestic}
        </div>
        {domesticAirports.map((a) => (
          <button
            key={a.code}
            type="button"
            onClick={() => onSelect(a.code)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 ${
              selectedCode === a.code
                ? "font-medium text-zinc-900 dark:text-zinc-100"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <span className="font-mono text-[10px] text-zinc-400">
              {a.code}
            </span>
            {a.name}
          </button>
        ))}
        <div className="px-3 pt-3 pb-1 text-[10px] font-medium uppercase tracking-wider text-zinc-300 dark:text-zinc-500">
          {t.international}
        </div>
        {internationalAirports.map((a) => (
          <button
            key={a.code}
            type="button"
            onClick={() => onSelect(a.code)}
            className={`flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 ${
              selectedCode === a.code
                ? "font-medium text-zinc-900 dark:text-zinc-100"
                : "text-zinc-600 dark:text-zinc-300"
            }`}
          >
            <span className="font-mono text-[10px] text-zinc-400">
              {a.code}
            </span>
            {a.name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div
      className="animate-fade-up rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4 shadow-sm sm:p-6"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Search className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-heading text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-2xl">
              {t.formTitle}
            </h2>
            <p className="text-[11px] text-zinc-400 sm:text-xs">
              {t.formSubtitle}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeAria}
            className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          >
            <X className="h-3.5 w-3.5" />
            {t.close}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:gap-2">
        {/* Origin */}
        <div ref={originRef} className="relative lg:col-span-3">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {t.origin}
          </label>
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === "origin" ? null : "origin")
            }
            className="flex h-11 w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 px-3 text-sm text-zinc-700 dark:text-zinc-200 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-zinc-400 focus:outline-none"
          >
            <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span
              className={`flex-1 text-left truncate ${!origin ? "text-zinc-400" : ""}`}
            >
              {originDisplayName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </button>
          {openDropdown === "origin" &&
            renderDropdownList(origin, (code) => {
              setOrigin(code);
              setOpenDropdown(null);
            })}
        </div>

        {/* Swap button */}
        <div className="hidden lg:flex lg:items-end lg:justify-center lg:col-span-1 lg:pb-1.5">
          <button
            type="button"
            onClick={handleSwap}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-400 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-600"
            aria-label={t.swapAria}
          >
            <ArrowRightLeft className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Destination */}
        <div ref={destRef} className="relative lg:col-span-3">
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            {t.destination}
          </label>
          <button
            type="button"
            onClick={() =>
              setOpenDropdown(openDropdown === "dest" ? null : "dest")
            }
            className="flex h-11 w-full items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 px-3 text-sm text-zinc-700 dark:text-zinc-200 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600 focus:border-zinc-400 focus:outline-none"
          >
            <Plane className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span
              className={`flex-1 text-left truncate ${!destination ? "text-zinc-400" : ""}`}
            >
              {destDisplayName}
            </span>
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          </button>
          {openDropdown === "dest" &&
            renderDropdownList(destination, (code) => {
              setDestination(code);
              setOpenDropdown(null);
            })}
        </div>

        {/* 観測日の注記: 日付入力の代わりに「観測ベース」であることを明示する。
            価格は観測時点の便のものであり、任意日付の検索はここでは提供しない */}
        <div className="flex items-center sm:col-span-2 lg:col-span-4 lg:items-end lg:pb-2">
          <p className="text-[11px] leading-relaxed text-zinc-400">
            {t.observedNote}
          </p>
        </div>

        {/* Search button */}
        <div className="flex items-end sm:col-span-2 lg:col-span-12">
          <button
            type="button"
            onClick={handleSearch}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 px-6 text-sm font-bold text-white dark:text-zinc-900 transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200 active:bg-zinc-950"
          >
            <Search className="h-4 w-4" />
            {t.submit}
          </button>
        </div>
      </div>

      {/* Quick destination chips */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="text-[10px] text-zinc-400 self-center mr-1">
          {t.popular}
        </span>
        {internationalAirports.slice(0, 6).map((d) => (
          <button
            key={d.code}
            type="button"
            onClick={() => {
              setDestination(d.code);
              setOpenDropdown(null);
            }}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              destination === d.code
                ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                : "border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200"
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}
