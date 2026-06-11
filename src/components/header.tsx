"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Plane,
  Globe,
  Menu,
  X,
  ChevronDown,
  TrendingDown,
  MapPin,
  Building2,
  BedDouble,
  Sparkles,
  Smartphone,
  Calendar,
  Anchor,
  Sun,
  Palmtree,
  Package,
  Wifi,
  CreditCard,
  ShieldCheck,
  Trophy,
  Coins,
  TrendingUp,
  BookOpen,
  BookA,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/search/global-search";
import { AIRPORTS } from "@/data/airports";
import { HOTEL_DESTINATIONS } from "@/data/hotel-destinations";
import { OTA_COMPARE_ARTICLES } from "@/lib/articles/static-articles";
import {
  useDictionary,
  useLocale,
  useLocalizedHref,
} from "@/components/i18n/locale-provider";
import { trackLanguageSwitch } from "@/components/analytics";

type MenuItem = {
  href: string;
  label: string;
  desc?: string;
  Icon?: typeof Plane;
};

type MenuGroup = {
  label: string;
  items: MenuItem[];
};

export function Header() {
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const nav = useDictionary<Record<string, string>>("nav");
  const locale = useLocale();
  const lh = useLocalizedHref();
  const pathname = usePathname();

  // メガメニュー: 3 グループ + 記事 (フラット)
  const menus: { key: string; label: string; groups: MenuGroup[] }[] = [
    {
      key: "flights",
      label: nav.flights,
      groups: [
        {
          label: nav.flights,
          items: [
            { href: "/", label: nav.flashDeals, desc: "今すぐ予約できる最安便", Icon: TrendingDown },
            { href: "/airlines", label: nav.airlineSales, desc: "ANA / JAL / Peach 等のセール", Icon: Plane },
            { href: "/local-flights", label: nav.localFlights, desc: "地方発の格安便特集", Icon: MapPin },
            { href: "/airports", label: nav.airports, desc: `全 ${AIRPORTS.length} 空港の発着セール`, Icon: Building2 },
          ],
        },
        {
          label: nav.salesCalendar,
          items: [
            { href: "/#calendar", label: nav.salesCalendar, desc: "次回セール時期予測", Icon: Calendar },
          ],
        },
        {
          label: "地方発から探す",
          items: [
            { href: "/local-flights/hokkaido", label: "北海道発", desc: "新千歳・函館・旭川 ほか", Icon: MapPin },
            { href: "/local-flights/tohoku", label: "東北発", desc: "仙台・福島・青森 ほか", Icon: MapPin },
            { href: "/local-flights/kyushu", label: "九州発", desc: "福岡・鹿児島・宮崎 ほか", Icon: MapPin },
            { href: "/local-flights/okinawa", label: "沖縄発", desc: "那覇・石垣・宮古", Icon: MapPin },
          ],
        },
      ],
    },
    {
      key: "stay",
      label: nav.stay,
      groups: [
        {
          label: nav.destinations,
          items: [
            { href: "/hotels", label: nav.hotels, desc: `全 ${HOTEL_DESTINATIONS.length} 都市のホテル一覧`, Icon: BedDouble },
          ],
        },
        {
          label: nav.features,
          items: [
            { href: "/hotels/tokyo/best-season", label: nav.bestSeason, desc: "月別おすすめ度カレンダー", Icon: Calendar },
            { href: "/hotels/tokyo/activities", label: nav.localActivities, desc: "現地ツアー比較", Icon: Sparkles },
            { href: "/esim", label: nav.esimGuide, desc: "海外通信を最安に", Icon: Smartphone },
          ],
        },
      ],
    },
    {
      key: "features",
      label: nav.features,
      groups: [
        {
          label: "目的地特集",
          items: [
            { href: "/hawaii", label: "ハワイ", desc: "オアフ・マウイ・ハワイ島", Icon: Sun },
            { href: "/okinawa", label: "沖縄", desc: "本島・離島・ベストシーズン", Icon: Palmtree },
            { href: "/cruise", label: "クルーズ", desc: "国内・海外発着の船旅", Icon: Anchor },
            { href: "/package-tour", label: "パッケージツアー", desc: "JTB / NEWT 等を比較", Icon: Package },
            { href: "/seasons", label: "シーズン特集", desc: "年末年始・GW・夏休みの攻略まとめ", Icon: Calendar },
          ],
        },
        {
          label: "お得・比較",
          items: [
            { href: "/articles/ota-compare", label: `OTA 比較 (${OTA_COMPARE_ARTICLES.length} 都市)`, desc: "都市別に最安ホテル予約サイトを比較", Icon: BedDouble },
            { href: "/ota-sales", label: "OTAセール比較", desc: "Booking / Trip / 楽天 / じゃらん 完全比較", Icon: BedDouble },
            { href: "/credit-cards", label: "クレカ比較", desc: "マイル・保険・ラウンジで選ぶ", Icon: CreditCard },
            { href: "/insurance", label: "海外旅行保険", desc: "クレカ付帯 vs ネット保険", Icon: ShieldCheck },
            { href: "/esim", label: "eSIM", desc: "海外通信ガイド", Icon: Wifi },
          ],
        },
        {
          label: "ランキング",
          items: [
            { href: "/articles/rankings/couples", label: "カップル向け TOP 10", desc: "二人旅・記念日に最適なホテル", Icon: Trophy },
            { href: "/articles/rankings/family", label: "ファミリー向け TOP 10", desc: "子連れに優しい設備・キッズ対応", Icon: Trophy },
            { href: "/articles/rankings/solo", label: "一人旅向け TOP 10", desc: "ソロ滞在で快適なホテル", Icon: Trophy },
          ],
        },
        {
          label: "ガイド・知識",
          items: [
            { href: "/articles/guides/lcc-tips", label: "LCC 活用の 10 のコツ", desc: "格安航空券で失敗しない使い方", Icon: BookOpen },
            { href: "/articles/guides/best-booking-timing", label: "航空券の最安タイミング", desc: "予約時期の考え方", Icon: BookOpen },
            { href: "/articles/guides/first-overseas-checklist", label: "初海外 準備チェックリスト", desc: "パスポートから出発まで", Icon: BookOpen },
            { href: "/articles/guides/miles-complete-guide", label: "マイル 完全ガイド", desc: "貯め方・使い方を基礎から", Icon: BookOpen },
            { href: "/articles/miles-booking-guide", label: "マイル予約ガイド", desc: "JAL/ANA マイルで予約 完全ガイド", Icon: Coins },
            { href: "/articles/sale-prediction-2027", label: "2027 セール予測", desc: "JAL/ANA/LCC のセール時期予測", Icon: TrendingUp },
            { href: "/glossary", label: "旅行用語集", desc: "航空・ホテル・予約の用語解説", Icon: BookA },
          ],
        },
      ],
    },
  ];

  // 言語トグルの相手側URL
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const toJa = stripped;
  const toEn = stripped === "/" ? "/en" : `/en${stripped}`;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <div
        className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6"
        onMouseLeave={() => setActiveMenu(null)}
      >
        <Link href={lh("/")} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Plane className="h-4 w-4" />
          </div>
          <span className="font-heading text-lg font-bold tracking-wide text-zinc-900 dark:text-zinc-100">
            BEATRIP
          </span>
        </Link>

        {/* PC グローバル検索: xl 以上で展開 (1280px 未満ではナビ優先で非表示) */}
        <div className="ml-4 hidden min-w-0 max-w-[240px] flex-1 xl:block 2xl:max-w-xs">
          <GlobalSearch compact placeholder="都市・空港・航空会社を検索" />
        </div>

        {/* PC ナビ: 3 メガメニュー + 記事 */}
        <nav className="hidden items-center gap-0.5 sm:flex xl:gap-1">
          {menus.map((menu) => (
            <div
              key={menu.key}
              className="relative"
              onMouseEnter={() => setActiveMenu(menu.key)}
            >
              <button
                type="button"
                onClick={() => setActiveMenu(activeMenu === menu.key ? null : menu.key)}
                aria-expanded={activeMenu === menu.key}
                aria-haspopup="true"
                className={`flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeMenu === menu.key
                    ? "text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                }`}
              >
                {menu.label}
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${activeMenu === menu.key ? "rotate-180" : ""}`}
                />
              </button>

              {activeMenu === menu.key && (
                <div
                  className={`absolute top-full mt-1 max-w-[calc(100vw-2rem)] rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl p-4 animate-fade-in z-50 ${
                    menu.groups.length >= 4
                      ? "right-0 w-[760px]"
                      : "left-0 min-w-[480px]"
                  }`}
                  onMouseEnter={() => setActiveMenu(menu.key)}
                >
                  <div
                    className={`grid gap-x-6 gap-y-2 ${
                      menu.groups.length >= 4 ? "grid-cols-3" : "grid-cols-2"
                    }`}
                  >
                    {menu.groups.map((group) => {
                      // 項目数が多いグループ (例: 特集) は全幅にして
                      // 内部を複数カラムに展開 → 1 列が縦に伸びすぎるのを防ぐ
                      const isWide = group.items.length > 6;
                      return (
                      <div
                        key={group.label}
                        className={isWide ? "col-span-full" : undefined}
                      >
                        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {group.label}
                        </p>
                        <div
                          className={
                            isWide
                              ? "grid grid-cols-2 gap-x-4 gap-y-1"
                              : "space-y-1"
                          }
                        >
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={lh(item.href)}
                              onClick={() => setActiveMenu(null)}
                              className="group flex items-start gap-2.5 rounded-lg px-2 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                            >
                              {item.Icon && (
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/40 group-hover:text-rose-700 dark:group-hover:text-rose-200 transition-colors">
                                  <item.Icon className="h-3.5 w-3.5" />
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                  {item.label}
                                </p>
                                {item.desc && (
                                  <p className="text-[11px] text-zinc-500 leading-snug mt-0.5">
                                    {item.desc}
                                  </p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* フラット: 記事 */}
          <Link
            href={lh("/articles")}
            className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
          >
            {nav.articles}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-1.5 text-xs sm:flex">
            <Globe className="h-3.5 w-3.5 text-zinc-400" />
            <Link
              href={toJa}
              onClick={() =>
                locale !== "ja" && trackLanguageSwitch({ from: locale, to: "ja" })
              }
              className={`font-mono transition-colors ${
                locale === "ja"
                  ? "text-zinc-900 dark:text-zinc-100 font-bold"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              JA
            </Link>
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <Link
              href={toEn}
              onClick={() =>
                locale !== "en" && trackLanguageSwitch({ from: locale, to: "en" })
              }
              className={`font-mono transition-colors ${
                locale === "en"
                  ? "text-zinc-900 dark:text-zinc-100 font-bold"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              EN
            </Link>
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-95 sm:hidden"
            aria-label={nav.menu}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* モバイル: アコーディオン */}
      {open && (
        <nav className="animate-fade-in border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2 pt-2 sm:hidden max-h-[calc(100vh-3.5rem)] overflow-y-auto" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}>
          <div className="px-1 pb-2">
            <GlobalSearch placeholder="都市・空港・航空会社を検索" />
          </div>
          {menus.map((menu) => {
            const isExpanded = mobileExpanded === menu.key;
            return (
              <div key={menu.key} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                <button
                  type="button"
                  onClick={() => setMobileExpanded(isExpanded ? null : menu.key)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100"
                >
                  {menu.label}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
                {isExpanded && (
                  <div className="pb-2 pl-2">
                    {menu.groups.map((group) => (
                      <div key={group.label} className="mb-2 last:mb-0">
                        <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          {group.label}
                        </p>
                        {group.items.map((item) => (
                          <Link
                            key={item.href}
                            href={lh(item.href)}
                            onClick={() => {
                              setOpen(false);
                              setMobileExpanded(null);
                            }}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                          >
                            {item.Icon && (
                              <item.Icon className="h-4 w-4 flex-shrink-0 text-zinc-400" />
                            )}
                            <span className="font-medium">{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <Link
            href={lh("/articles")}
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
          >
            {nav.articles}
          </Link>

          <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2.5">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {nav.themeToggle}
            </span>
            <ThemeToggle />
          </div>
          <div className="mt-1 flex items-center justify-between rounded-lg px-3 py-2.5">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              {nav.language}
            </span>
            <div className="flex items-center gap-2 text-sm font-mono">
              <Link
                href={toJa}
                onClick={() => {
                  if (locale !== "ja") trackLanguageSwitch({ from: locale, to: "ja" });
                  setOpen(false);
                }}
                className={`inline-block px-3 py-2 rounded-md ${
                  locale === "ja"
                    ? "font-bold text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400"
                }`}
              >
                JA
              </Link>
              <span className="text-zinc-300 dark:text-zinc-600">/</span>
              <Link
                href={toEn}
                onClick={() => {
                  if (locale !== "en") trackLanguageSwitch({ from: locale, to: "en" });
                  setOpen(false);
                }}
                className={`inline-block px-3 py-2 rounded-md ${
                  locale === "en"
                    ? "font-bold text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400"
                }`}
              >
                EN
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
