import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { localizeHref, type Locale } from "@/lib/i18n/locale";

/**
 * フルワイド・ビジュアル Hero (ホーム第一印象)。
 *
 * - 現在の月 (UTC) に応じて season を決定し、コピーとグラデーション色を出し分け。
 * - 既存 HeroDeal の上に表示するインスピレーション枠。
 * - サーバーコンポーネント (Date は build / revalidate ごとに 1 度評価)。
 * - LCP 影響を抑えるため <img> は使わず、CSS グラデーションのみで描画。
 */

type Season = "spring" | "summer" | "autumn" | "winter";

type SeasonCopy = {
  keyword: string;
  title: string;
  subtitle: string;
  gradient: string; // tailwind class chain
  ringTone: string;
};

const SEASON_COPY: Record<Season, SeasonCopy> = {
  summer: {
    keyword: "SUMMER",
    title: "夏の航空券を、最安値で。",
    subtitle:
      "ANA・JAL・Peach・Jetstar の夏セールを毎日自動収集。お盆も離島も、最安タイミングで予約。",
    gradient:
      "bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500",
    ringTone: "ring-amber-200/40",
  },
  autumn: {
    keyword: "AUTUMN",
    title: "秋の航空券を、最安値で。",
    subtitle:
      "紅葉・温泉・グルメ。航空券セールと宿の最安値で、秋の連休をもっと自由に。",
    gradient:
      "bg-gradient-to-br from-rose-500 via-amber-500 to-orange-600",
    ringTone: "ring-rose-200/40",
  },
  winter: {
    keyword: "WINTER",
    title: "冬の航空券を、最安値で。",
    subtitle:
      "雪国・温泉地・南国リゾート。冬限定セールを横断して、最安値で予約準備を。",
    gradient:
      "bg-gradient-to-br from-blue-500 via-indigo-600 to-sky-700",
    ringTone: "ring-sky-200/40",
  },
  spring: {
    keyword: "SPRING",
    title: "春の航空券を、最安値で。",
    subtitle:
      "桜前線とゴールデンウィーク。早割と航空会社セールを毎日チェックして、最安で予約。",
    gradient:
      "bg-gradient-to-br from-pink-400 via-rose-500 to-fuchsia-600",
    ringTone: "ring-pink-200/40",
  },
};

function currentSeason(): Season {
  const month = new Date().getUTCMonth() + 1; // 1-12
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  if (month === 12 || month <= 2) return "winter";
  return "spring";
}

export function SeasonalHero({ locale }: { locale: Locale }) {
  const season = currentSeason();
  const copy = SEASON_COPY[season];
  const lh = (href: string) => localizeHref(href, locale);

  return (
    <section
      aria-labelledby="seasonal-hero-title"
      className="relative mb-6 overflow-hidden rounded-2xl ring-1 ring-zinc-200/60 dark:ring-zinc-800"
    >
      {/* 背景: グラデのみ — 外部 img を使わないので LCP 影響なし */}
      <div className={`absolute inset-0 ${copy.gradient}`} aria-hidden />
      {/* 質感: 微細な光のレイヤー */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top right, rgba(255,255,255,0.5), transparent 60%), radial-gradient(ellipse at bottom left, rgba(0,0,0,0.35), transparent 55%)",
        }}
      />
      <div className="relative px-5 py-10 sm:px-10 sm:py-16 lg:py-20">
        <div className="max-w-3xl">
          <span
            className={`inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white ring-1 ${copy.ringTone} backdrop-blur-sm`}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full bg-white animate-soft-pulse"
            />
            {copy.keyword} ・ {new Date().getUTCFullYear()}
          </span>
          <h1
            id="seasonal-hero-title"
            // text-wrap:balance で「最安値\nで。」のような不格好な行折返しを防ぐ
            className="mt-4 font-heading text-4xl leading-[0.95] tracking-wide text-white drop-shadow-sm [text-wrap:balance] sm:text-6xl lg:text-7xl"
          >
            {copy.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
            {copy.subtitle}
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <a
              href="#beatrip-search"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-zinc-900 shadow-lg ring-1 ring-white/40 transition-transform hover:-translate-y-0.5 hover:bg-zinc-100"
            >
              <Search className="h-4 w-4" aria-hidden />
              都市・空港・路線を検索
            </a>
            <Link
              href={lh("/#deals")}
              className="inline-flex min-h-[48px] items-center justify-center gap-1.5 rounded-full bg-zinc-900/30 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/30 backdrop-blur-sm transition-colors hover:bg-zinc-900/45"
            >
              今週のディール一覧
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
