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
  BookOpen,
  BookA,
  Sparkles,
} from "lucide-react";
import { HOTEL_DESTINATIONS } from "@/data/hotel-destinations";
import { AIRPORTS, type AirportRegion } from "@/data/airports";
import { airlines } from "@/data/airlines";
import {
  STATIC_ARTICLES,
  STATIC_ARTICLE_CATEGORY_LABEL,
} from "@/lib/articles/static-articles";
import { useLocalizedHref } from "@/components/i18n/locale-provider";

type EntryType =
  | "city"
  | "airport"
  | "airline"
  | "deal"
  | "region"
  | "article"
  | "feature"
  | "term";

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
  article: "記事",
  feature: "特集",
  term: "用語",
};

/**
 * 検索結果の type 優先度 (小さいほど上位)。
 * 同名都市が複数 type で当たったとき「行き先セール意図 > 都市ホテル > ... > 出発地 (local-flights)」
 * の順に並ぶようにする。
 */
const TYPE_PRIORITY: Record<EntryType, number> = {
  deal: 0,
  city: 1,
  feature: 2,
  airport: 3,
  airline: 4,
  article: 5,
  term: 6,
  region: 7,
};

const TYPE_ICON: Record<EntryType, typeof Plane> = {
  city: MapPin,
  airport: Building2,
  airline: Plane,
  deal: TrendingDown,
  region: Globe2,
  article: BookOpen,
  feature: Sparkles,
  term: BookA,
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

  // 「{都市}行きの航空券セール」 — 行き先意図に応答 (/deals 一覧を都市名で絞り込み)
  for (const h of HOTEL_DESTINATIONS) {
    out.push({
      label: `${h.nameJa}行きの航空券セール`,
      sublabel: `${h.nameJa} (${h.nameEn}) 行きのセールを一覧で確認`,
      href: `/deals?q=${encodeURIComponent(h.nameJa)}`,
      type: "deal",
      haystack: [
        h.nameJa,
        h.nameEn,
        h.slug,
        ...h.iataCodes,
        "行き 航空券 セール 格安 フライト",
      ]
        .join(" ")
        .toLowerCase(),
    });
  }

  // 空港 (AIRPORTS) — href は canonical に合わせ大文字 IATA で統一
  for (const a of AIRPORTS) {
    out.push({
      label: `${a.fullNameJa} (${a.iata})`,
      sublabel: `${a.nameEn} · ${a.region} · ${a.prefecture}`,
      href: `/airports/${a.iata}`,
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

  // 航空会社 — getAirlineByCode は大文字コード完全一致のため
  // 必ず al.code そのまま (大文字) で生成する (小文字だと 404)
  for (const al of airlines) {
    out.push({
      label: al.name,
      sublabel: `${al.nameEn} · ${al.type} · ${al.code}`,
      href: `/airlines/${al.code}`,
      type: "airline",
      haystack: [al.code, al.name, al.nameEn, al.type].join(" ").toLowerCase(),
    });
  }

  // 静的記事レジストリ (ガイド / OTA 比較 / ランキング / シーズン / 特集)
  for (const sa of STATIC_ARTICLES) {
    out.push({
      label: sa.title,
      sublabel: `${STATIC_ARTICLE_CATEGORY_LABEL[sa.category]} · ${sa.description}`,
      href: sa.href,
      type: "article",
      haystack: [
        sa.title,
        sa.description,
        sa.slug,
        STATIC_ARTICLE_CATEGORY_LABEL[sa.category],
        ...(sa.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase(),
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

  // 特集 LP・ハブページ
  out.push(
    {
      label: "都市別 OTA 比較 (13 都市)",
      sublabel: "Booking / Agoda / Trip.com / Hotellook を都市別に比較",
      href: "/articles/ota-compare",
      type: "feature",
      haystack:
        "ota 比較 ホテル 予約サイト booking agoda trip hotellook 都市別 最安 ハブ",
    },
    {
      label: "シーズン特集一覧",
      sublabel: "年末年始・GW・夏休み・季節特集のまとめ",
      href: "/seasons",
      type: "feature",
      haystack:
        "シーズン 季節 連休 年末年始 ゴールデンウィーク gw 夏休み お盆 秋 冬 特集",
    },
    {
      label: "ハワイ特集",
      sublabel: "オアフ・マウイ・ハワイ島の旅行ガイド",
      href: "/hawaii",
      type: "feature",
      haystack: "ハワイ hawaii ホノルル オアフ マウイ ワイキキ リゾート",
    },
    {
      label: "沖縄特集",
      sublabel: "本島・離島・ベストシーズン",
      href: "/okinawa",
      type: "feature",
      haystack: "沖縄 okinawa 那覇 石垣 宮古 離島 リゾート",
    },
    {
      label: "クルーズ特集",
      sublabel: "国内・海外発着の船旅",
      href: "/cruise",
      type: "feature",
      haystack: "クルーズ cruise 船旅 客船",
    },
    {
      label: "パッケージツアー比較",
      sublabel: "JTB / NEWT 等を比較",
      href: "/package-tour",
      type: "feature",
      haystack: "パッケージツアー package tour jtb newt ツアー 比較",
    },
    {
      label: "クレジットカード比較",
      sublabel: "マイル・付帯保険・ラウンジで選ぶ",
      href: "/credit-cards",
      type: "feature",
      haystack:
        "クレジットカード クレカ credit card マイル 保険 ラウンジ 比較",
    },
    {
      label: "海外旅行保険 比較",
      sublabel: "クレカ付帯 vs ネット保険",
      href: "/insurance",
      type: "feature",
      haystack: "海外旅行保険 保険 insurance クレカ付帯 比較",
    },
    {
      label: "eSIM 比較",
      sublabel: "海外通信を最安にするガイド",
      href: "/esim",
      type: "feature",
      haystack: "esim sim 海外通信 ローミング wifi 比較",
    },
    {
      label: "旅行用語集",
      sublabel: "航空・ホテル・予約の用語解説",
      href: "/glossary",
      type: "feature",
      haystack: "用語集 用語 glossary 意味 とは 解説",
    }
  );

  // 用語集の主要用語 — /glossary#{slug} のアンカーへ直接誘導
  // (slug は glossary/page.tsx の Term.slug と同一規約)
  const glossaryTerms: { term: string; slug: string; sub: string; kw: string }[] = [
    { term: "LCC", slug: "lcc", sub: "格安航空会社 (Low Cost Carrier)", kw: "格安航空 ローコスト peach jetstar" },
    { term: "FSC", slug: "fsc", sub: "フルサービスキャリア", kw: "フルサービス ana jal" },
    { term: "OTA", slug: "ota", sub: "オンライン旅行会社 (予約サイト)", kw: "online travel agency 予約サイト booking" },
    { term: "マイレージ", slug: "mileage", sub: "航空会社のポイントプログラム", kw: "マイル mileage ポイント" },
    { term: "特典航空券", slug: "award-ticket", sub: "マイルで交換する航空券", kw: "マイル 無料 award" },
    { term: "トランジット", slug: "transit", sub: "乗り継ぎ・経由", kw: "乗り継ぎ 経由 transit レイオーバー" },
    { term: "オープンジョー", slug: "open-jaw", sub: "往路と復路で発着地が異なる旅程", kw: "open jaw 周遊" },
    { term: "ストップオーバー", slug: "stopover", sub: "24 時間以上の途中滞在", kw: "stopover 途中降機" },
    { term: "無料キャンセル", slug: "free-cancellation", sub: "ホテル予約のキャンセル無料プラン", kw: "キャンセル free cancellation 返金" },
    { term: "ベストレート", slug: "best-rate", sub: "公式サイト最安値保証", kw: "best rate 最安値保証 公式" },
    { term: "コードシェア", slug: "code-share", sub: "複数社が共同販売する便", kw: "code share 共同運航 運航会社" },
    { term: "ノーショー", slug: "no-show", sub: "連絡なしの予約不履行", kw: "no show 不泊 キャンセル料" },
    { term: "オーバーブッキング", slug: "overbooking", sub: "座席数を超える予約受付", kw: "overbooking 振替 補償" },
    { term: "返金不可レート", slug: "non-refundable", sub: "キャンセル不可の割安プラン", kw: "non refundable 返金不可 キャンセル不可" },
    { term: "ダイナミックプライシング", slug: "dynamic-pricing", sub: "需要で変動する価格設定", kw: "dynamic pricing 変動価格 値段が変わる" },
    { term: "メタサーチ", slug: "metasearch", sub: "予約サイト横断の価格比較", kw: "metasearch 横断検索 比較サイト" },
    { term: "受託手荷物", slug: "checked-baggage", sub: "カウンターで預ける荷物", kw: "預け荷物 checked baggage 重量制限" },
    { term: "機内持ち込み手荷物", slug: "carry-on-baggage", sub: "座席に持ち込む荷物", kw: "持ち込み carry on 手荷物 サイズ" },
    { term: "早割", slug: "early-bird", sub: "早期予約の割引運賃", kw: "早期予約 割引 early bird 先得" },
    { term: "海外旅行保険", slug: "travel-insurance", sub: "渡航中のトラブルに備える保険", kw: "保険 insurance クレカ付帯 補償" },
  ];
  for (const g of glossaryTerms) {
    out.push({
      label: g.term,
      sublabel: `${g.sub} — 旅行用語集`,
      href: `/glossary#${g.slug}`,
      type: "term",
      haystack: [g.term, g.sub, g.kw, "用語 とは 意味"].join(" ").toLowerCase(),
    });
  }

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
    // type 優先度で安定ソート (同 type 内は index 構築順を維持)
    matched.sort((a, b) => TYPE_PRIORITY[a.type] - TYPE_PRIORITY[b.type]);
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
            <li className="px-4 py-6 text-center">
              <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Search className="h-4 w-4 text-zinc-400" aria-hidden />
              </span>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                該当する結果が見つかりませんでした
              </p>
              <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
                都市名・空港コード・航空会社名で検索できます
              </p>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                  router.push(lh("/"));
                }}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-1.5 text-xs font-bold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
              >
                最新のセールを見る
              </button>
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
