"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Plane, Building2, MapPin, TrendingDown } from "lucide-react";
import { HOTEL_DESTINATIONS } from "@/data/hotel-destinations";
import { AIRPORTS } from "@/data/airports";
import { airlines } from "@/data/airlines";
import { useLocalizedHref } from "@/components/i18n/locale-provider";

type EntryType = "city" | "airport" | "airline" | "deal";

type Entry = {
  label: string;
  sublabel: string;
  href: string;
  type: EntryType;
  /** 検索用 (lower-case 化したラベル + sublabel + 別表記) */
  haystack: string;
};

const TYPE_LABEL: Record<EntryType, string> = {
  city: "都市",
  airport: "空港",
  airline: "航空会社",
  deal: "ディール",
};

const TYPE_ICON: Record<EntryType, typeof Plane> = {
  city: MapPin,
  airport: Building2,
  airline: Plane,
  deal: TrendingDown,
};

function buildIndex(): Entry[] {
  const out: Entry[] = [];

  // 都市 (HOTEL_DESTINATIONS)
  for (const h of HOTEL_DESTINATIONS) {
    out.push({
      label: h.nameJa,
      sublabel: `${h.nameEn} · ${h.region} · ${h.tagline}`,
      href: `/hotels/${h.slug}`,
      type: "city",
      haystack: [
        h.nameJa,
        h.nameEn,
        h.slug,
        h.region,
        h.tagline,
        ...h.iataCodes,
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  // 空港 (AIRPORTS)
  for (const a of AIRPORTS) {
    out.push({
      label: `${a.fullNameJa} (${a.iata})`,
      sublabel: `${a.nameEn} · ${a.region} · ${a.prefecture}`,
      href: `/airports/${a.iata.toLowerCase()}`,
      type: "airport",
      haystack: [
        a.iata,
        a.nameJa,
        a.nameEn,
        a.fullNameJa,
        a.region,
        a.prefecture,
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  // 航空会社
  for (const al of airlines) {
    out.push({
      label: al.name,
      sublabel: `${al.nameEn} · ${al.type} · ${al.code}`,
      href: `/airlines/${al.code.toLowerCase()}`,
      type: "airline",
      haystack: [al.code, al.name, al.nameEn, al.type].join(" ").toLowerCase(),
    });
  }

  // 静的なディール エントリ (active deals は SSR 側で日々変わるため、
  // 検索 UX としては "ディール一覧" / "セール時期予測" 等の代表的な
  // 動線を載せておく。フル deal 検索はファーストビューの CollapsibleSearch で)
  out.push(
    {
      label: "全ディール一覧",
      sublabel: "今週の航空券セール一覧",
      href: "/#deals",
      type: "deal",
      haystack: "deals deal セール 一覧 ディール ぜんぶ all",
    },
    {
      label: "セールカレンダー",
      sublabel: "次回セール時期の予測",
      href: "/#calendar",
      type: "deal",
      haystack: "calendar カレンダー セール 予測 schedule",
    },
    {
      label: "OTA セール比較",
      sublabel: "Booking / Trip.com / 楽天 / じゃらん",
      href: "/ota-sales",
      type: "deal",
      haystack: "ota booking trip rakuten jalan 比較 ホテル予約",
    }
  );

  return out;
}

export function GlobalSearch({
  placeholder,
  className,
  compact,
}: {
  placeholder?: string;
  className?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const lh = useLocalizedHref();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // mount 時にインデックス構築 (shallow object のみ、重い動作なし)
  const index = useMemo(() => buildIndex(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Entry[];
    const tokens = q.split(/\s+/).filter(Boolean);
    const matched = index.filter((e) =>
      tokens.every((t) => e.haystack.includes(t))
    );
    return matched.slice(0, 8);
  }, [index, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // outside click で close
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function navigate(entry: Entry) {
    setOpen(false);
    setQuery("");
    router.push(lh(entry.href));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (query) {
        setQuery("");
      } else {
        setOpen(false);
        inputRef.current?.blur();
      }
    } else if (e.key === "Enter") {
      if (results[activeIndex]) {
        e.preventDefault();
        navigate(results[activeIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
  }

  const showDropdown = open && query.trim().length > 0;

  return (
    <div
      ref={containerRef}
      className={`relative ${className ?? ""}`}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={showDropdown}
      aria-owns="global-search-listbox"
    >
      <div
        className={`flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 transition-colors focus-within:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:focus-within:border-zinc-600 ${
          compact ? "h-9" : "h-10"
        }`}
      >
        <Search className="h-4 w-4 flex-shrink-0 text-zinc-400" aria-hidden />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder ?? "都市・空港・航空会社を検索"}
          aria-label="サイト内検索"
          aria-controls="global-search-listbox"
          aria-activedescendant={
            showDropdown && results[activeIndex]
              ? `global-search-opt-${activeIndex}`
              : undefined
          }
          className="w-full min-w-0 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            aria-label="検索クエリを消去"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          id="global-search-listbox"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500">
              該当する結果が見つかりませんでした
            </li>
          ) : (
            results.map((r, i) => {
              const Icon = TYPE_ICON[r.type];
              const isActive = i === activeIndex;
              return (
                <li
                  key={`${r.type}-${r.href}-${i}`}
                  id={`global-search-opt-${i}`}
                  role="option"
                  aria-selected={isActive}
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => navigate(r)}
                    className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors ${
                      isActive
                        ? "bg-zinc-50 dark:bg-zinc-900"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {r.label}
                        </span>
                        <span className="flex-shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          {TYPE_LABEL[r.type]}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                        {r.sublabel}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
