"use client";

import Link from "next/link";
import { Plane } from "lucide-react";
import { RecommendedBanner } from "@/components/deals/recommended-banner";
import { deals } from "@/data/mock-deals-v2";
import {
  useDictionary,
  useLocalizedHref,
} from "@/components/i18n/locale-provider";

export function SiteFooter() {
  const t = useDictionary<Record<string, string>>("footer");
  const common = useDictionary<Record<string, string>>("common");
  const lh = useLocalizedHref();

  // 5 カラム構成 (サイトマップ反映):
  //  1. 航空券  — フラッシュディール / 航空会社一覧 / 地方便 / 空港 / セール予測 / 記事
  //  2. ホテル  — ホテル一覧 / ベストシーズン / 現地ツアー / eSIM 比較
  //  3. 特集    — OTAセール比較 / ハワイ / 沖縄 / クルーズ / パッケージツアー
  //  4. 航空会社 — ANA / JAL / Peach / Jetstar / Skymark (代表 5 社)
  //  5. サイト  — about / FAQ / 利用規約 / プライバシー / 広告開示
  const footerNav = {
    flights: {
      title: t.flightsTitle ?? "航空券",
      links: [
        { href: "/", label: t.flashDeals },
        { href: "/airlines", label: t.airlineSales },
        { href: "/local-flights", label: t.localFlights ?? "地方便" },
        { href: "/airports", label: t.airports ?? "空港一覧" },
        { href: "/#calendar", label: t.saleCalendar },
        { href: "/articles", label: t.articles },
      ],
    },
    stay: {
      title: t.stayTitle ?? "ホテル・滞在",
      links: [
        { href: "/hotels", label: t.hotels ?? "ホテル" },
        { href: "/hotels/tokyo/best-season", label: t.bestSeason ?? "ベストシーズン" },
        { href: "/hotels/tokyo/activities", label: t.activities ?? "現地ツアー" },
        { href: "/hotels/honolulu/esim", label: t.esimGuide ?? "eSIM 比較" },
      ],
    },
    features: {
      title: t.featuresTitle ?? "特集",
      links: [
        { href: "/ota-sales", label: t.otaSales ?? "OTAセール比較" },
        { href: "/hawaii", label: t.hawaii ?? "ハワイ" },
        { href: "/okinawa", label: t.okinawa ?? "沖縄" },
        { href: "/cruise", label: t.cruise ?? "クルーズ" },
        { href: "/package-tour", label: t.packageTour ?? "パッケージツアー" },
        { href: "/esim", label: t.esimGuide ?? "eSIM 比較" },
      ],
    },
    airlines: {
      title: t.airlinesTitle,
      links: [
        { href: "/airlines/ANA", label: "ANA" },
        { href: "/airlines/JAL", label: "JAL" },
        { href: "/airlines/PCH", label: "Peach" },
        { href: "/airlines/JJP", label: "Jetstar Japan" },
        { href: "/airlines/SKY", label: "Skymark" },
      ],
    },
    about: {
      title: t.aboutTitle,
      links: [
        { href: "/about", label: t.about },
        { href: "/faq", label: t.faq },
        { href: "/terms", label: t.terms },
        { href: "/privacy", label: t.privacy },
        { href: "/disclosure", label: t.disclosure ?? "広告開示" },
      ],
    },
  };

  return (
    <>
      <RecommendedBanner deals={deals} />
      <footer className="border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Brand row (上段) + Nav (下段 5 カラム) */}
          <div className="mb-8">
            <Link href={lh("/")} className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                <Plane className="h-4 w-4" />
              </div>
              <span className="font-heading text-lg font-bold tracking-wide text-zinc-900 dark:text-zinc-100">
                BEATRIP
              </span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500 max-w-xl">
              {common.tagline}
            </p>
          </div>

          {/* Nav Grid - 5 columns on lg, 2-3 on smaller */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {Object.values(footerNav).map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  {section.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={lh(link.href)}
                        className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-10 rounded-lg bg-zinc-50 dark:bg-zinc-900 px-4 py-3">
            <p className="text-[10px] leading-relaxed text-zinc-400 dark:text-zinc-500">
              {t.disclaimer}
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-6 sm:flex-row">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              {t.copyright}
            </span>
            <div className="flex items-center gap-4">
              <Link
                href={lh("/terms")}
                className="text-[11px] text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {t.terms}
              </Link>
              <Link
                href={lh("/privacy")}
                className="text-[11px] text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {t.privacy}
              </Link>
              <Link
                href={lh("/disclosure")}
                className="text-[11px] text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                {t.disclosure ?? "広告開示"}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
