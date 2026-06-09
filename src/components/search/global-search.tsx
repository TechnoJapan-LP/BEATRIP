"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Plane,
  Building2,
  MapPin,
  TrendingDown,
  Globe2,
  Clock,
} from "lucide-react";
import { HOTEL_DESTINATIONS } from "@/data/hotel-destinations";
import { AIRPORTS, type AirportRegion } from "@/data/airports";
import { airlines } from "@/data/airlines";
import { useLocalizedHref } from "@/components/i18n/locale-provider";

type EntryType = "city" | "airport" | "airline" | "deal" | "region";

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
  region: "エリア",
};

const TYPE_ICON: Record<EntryType, typeof Plane> = {
  city: MapPin,
  airport: Building2,
  airline: Plane,
  deal: TrendingDown,
  region: Globe2,
};

// region 名 → /local-flights/{slug} マッピング (page.tsx と整合)
const REGION_SLUGS: Record<AirportRegion, string> = {
  "北海道": "hokkaido",
  "東北": "tohoku",
  "関東": "kanto",
  "中部": "chubu",
  "近畿": "kinki",
  "中国": "chugoku",
  "四国": "shikoku",
  "九州": "kyushu",
  "沖縄": "okinawa",
};

const REGION_DESCRIPTIONS: Record<AirportRegion, string> = {
  "北海道": "新千歳・函館・旭川 発の最安便",
  "東北": "仙台・青森・秋田 発の最安便",
  "関東": "羽田・成田 発の最安便",
  "中部": "中部国際・小松 発の最安便",
  "近畿": "関西国際・伊丹・神戸 発の最安便",
  "中国": "広島・岡山 発の最安便",
  "四国": "松山・高松・高知 発の最安便",
  "九州": "福岡・鹿児島・熊本 発の最安便",
  "沖縄": "那覇・石垣・宮古 発の最安便",
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

  // 国内エリア (region) — 「関東発」「九州発」等の検索意図に応答
  const regions: AirportRegion[] = [
    "北海道",
    "東北",
    "関東",
    "中部",
    "近畿",
    "中国",
    "四国",
    "九州",
    "沖縄",
  ];
  for (const r of regions) {
    out.push({
      label: `${r}発の航空券`,
      sublabel: REGION_DESCRIPTIONS[r],
      href: `/local-flights/${REGION_SLUGS[r]}`,
      type: "region",
      haystack: [r, REGION_SLUGS[r], REGION_DESCRIPTIONS[r], "地方", "発"]
        .join(" ")
        .toLowerCase(),
    });
  }

  // 静的なディール エントリ
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

const RECENT_KEY = "beatrip:recent-search";
const RECENT_MAX = 5;

type RecentItem = Pick<Entry, "label" | "sublabel" | "href" | "type">;

function loadRecent(): RecentItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as RecentItem[];
    return Array.isArray(arr) ? arr.slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function pushRecent(item: RecentItem) {
  if (typeof window === "undefined") return;
  try {
    const cur = loadRecent().filter((r) => r.href !== item.href);
    const next = [item, ...cur].slice(0, RECENT_MAX);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage 不可 (Safari Private 等) は無視
  }
}

/**
 * 検索語に基づく label のハイライト。React 要素として返すため XSS 安全。
 */
function highlight(label: string, query: string) {
  const q = query.trim();
  if (!q) return label;
  const lc = label.toLowerCase();
  const lq = q.toLowerCase();
  const idx = lc.indexOf(lq);
  if (idx < 0) return label;
  return (
    <>
      {label.slice(0, idx)}
      <mark className="rounded-[2px] bg-amber-200/70 px-0.5 text-zinc-900 dark:bg-amber-300/80">
        {label.slice(idx, idx + q.length)}
      </mark>
      {label.slice(idx + q.length)}
    </>
  );
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
  const [recent, setRecent] = useState<RecentItem[]>([]);

  const index = useMemo(() => buildIndex(), []);

  // open 時に最新の recent を読み直す
  useEffect(() => {
    if (open) setRecent(loadRecent());
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as Entry[];
    const tokens = q.split(/\s+/).filter(Boolean);
    const matched = index.filter((e) =>
      tokens.every((t) => e.haystack.includes(t))
    );
    return matched.slice(0, 10);
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

  const navigate = useCallback(
    (entry: RecentItem) => {
      pushRecent({
        label: entry.label,
        sublabel: entry.sublabel,
        href: entry.href,
        type: entry.type,
      });
      setOpen(false);
      setQuery("");
      router.push(lh(entry.href));
    },
    [router, lh]
  );

  // 表示モード: query があれば results、無ければ recent (あれば)
  const showRecent = open && query.trim().length === 0 && recent.length > 0;
  const showResults = open && query.trim().length > 0;
  const showDropdown = showRecent || showResults;
  const activeList = showResults ? results : recent;

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      if (query) {
        setQuery("");
      } else {
        setOpen(false);
        inputRef.current?.blur();
      }
    } else if (e.key === "Enter") {
      if (activeList[activeIndex]) {
        e.preventDefault();
        navigate(activeList[activeIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) =>
        Math.min(i + 1, Math.max(0, activeList.length - 1))
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Tab" && showResults && activeList.length > 0) {
      // Tab: 現在 highlight 中のカテゴリと違う次カテゴリの先頭にジャンプ
      const cur = activeList[activeIndex]?.type;
      const nextIdx = activeList.findIndex(
        (r, i) => i > activeIndex && r.type !== cur
      );
      if (nextIdx >= 0) {
        e.preventDefault();
        setActiveIndex(nextIdx);
      }
    }
  }

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
        className={`flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 transition-colors focus-within:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:focus-within:border-zinc-500 ${
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
            showDropdown && activeList[activeIndex]
              ? `global-search-opt-${activeIndex}`
              : undefined
          }
          className="w-full min-w-0 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
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
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[60vh] overflow-y-auto rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-950"
        >
          {showRecent && (
            <li
              role="presentation"
              className="flex items-center justify-between px-3 pt-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400"
            >
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden />
                最近検索した
              </span>
              <button
                type="button"
                onClick={() => {
                  try {
                    window.localStorage.removeItem(RECENT_KEY);
                  } catch {
                    /* noop */
                  }
                  setRecent([]);
                }}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              >
                クリア
              </button>
            </li>
          )}

          {showResults && results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
              該当する結果が見つかりませんでした
            </li>
          ) : (
            activeList.map((r, i) => {
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
                        ? "bg-zinc-100 dark:bg-zinc-900"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    }`}
                  >
                    <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
                      <Icon className="h-3.5 w-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {showResults ? highlight(r.label, query) : r.label}
                        </span>
                        <span className="flex-shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                          {TYPE_LABEL[r.type]}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-zinc-500 dark:text-zinc-400">
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
