import Link from "next/link";
import { Plane } from "lucide-react";
import { RecommendedBanner } from "@/components/deals/recommended-banner";
import { deals } from "@/data/mock-deals-v2";

const footerNav = {
  deals: {
    title: "ディール",
    links: [
      { href: "/", label: "フラッシュディール" },
      { href: "/#calendar", label: "セール予測カレンダー" },
      { href: "/airlines", label: "航空会社セール" },
      { href: "/articles", label: "セール記事・攻略" },
    ],
  },
  airlines: {
    title: "航空会社",
    links: [
      { href: "/airlines/ANA", label: "ANA" },
      { href: "/airlines/JAL", label: "JAL" },
      { href: "/airlines/PCH", label: "Peach" },
      { href: "/airlines/JJP", label: "Jetstar Japan" },
      { href: "/airlines/SQC", label: "スクート" },
    ],
  },
  about: {
    title: "サイト情報",
    links: [
      { href: "/about", label: "BEATRIPについて" },
      { href: "/faq", label: "よくある質問" },
      { href: "/terms", label: "利用規約" },
      { href: "/privacy", label: "プライバシーポリシー" },
    ],
  },
} as const;

export function SiteFooter() {
  return (
    <>
      <RecommendedBanner deals={deals} />
      <footer className="border-t border-zinc-100 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {/* Nav Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <Link href="/" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
                  <Plane className="h-4 w-4" />
                </div>
                <span className="font-heading text-lg font-bold tracking-wide text-zinc-900 dark:text-zinc-100">
                  BEATRIP
                </span>
              </Link>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400 dark:text-zinc-500 max-w-xs">
                航空券セール情報を自動収集。フラッシュディール、セール時期予測、価格推移データで最安値のフライトを見逃さない。
              </p>
            </div>

            {/* Nav Columns */}
            {Object.values(footerNav).map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                  {section.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
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
              ※ 掲載されているセール情報は各航空会社の公式サイトより取得したものです。価格・空席状況は常に変動するため、ご予約の際は必ず航空会社公式サイトにて最新情報をご確認ください。当サイトは航空券の販売を行っておらず、情報提供のみを目的としています。
            </p>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-6 sm:flex-row">
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
              © 2026 BEATRIP. All rights reserved.
            </span>
            <div className="flex items-center gap-4">
              <Link
                href="/terms"
                className="text-[11px] text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                利用規約
              </Link>
              <Link
                href="/privacy"
                className="text-[11px] text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              >
                プライバシーポリシー
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
