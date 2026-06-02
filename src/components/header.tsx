"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane, Globe, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  useDictionary,
  useLocale,
  useLocalizedHref,
} from "@/components/i18n/locale-provider";
import { trackLanguageSwitch } from "@/components/analytics";

export function Header() {
  const [open, setOpen] = useState(false);
  const nav = useDictionary<Record<string, string>>("nav");
  const locale = useLocale();
  const lh = useLocalizedHref();
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: nav.flashDeals },
    { href: "/hotels", label: nav.hotels },
    { href: "/airlines", label: nav.airlineSales },
    { href: "/#calendar", label: nav.salePrediction },
    { href: "/articles", label: nav.articles },
  ];

  // 言語トグルの相手側URL（現在のパスを保ったまま言語だけ切替）
  const stripped = pathname.replace(/^\/en(?=\/|$)/, "") || "/";
  const toJa = stripped;
  const toEn = stripped === "/" ? "/en" : `/en${stripped}`;

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href={lh("/")} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Plane className="h-4 w-4" />
          </div>
          <span className="font-heading text-lg font-bold tracking-wide text-zinc-900 dark:text-zinc-100">
            BEATRIP
          </span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {navLinks.map((link) =>
            link.href.startsWith("/#") ? (
              <a
                key={link.href}
                href={lh(link.href)}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={lh(link.href)}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            )
          )}
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 sm:hidden"
            aria-label={nav.menu}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-fade-in border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 pb-4 pt-2 sm:hidden">
          {navLinks.map((link) =>
            link.href.startsWith("/#") ? (
              <a
                key={link.href}
                href={lh(link.href)}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={lh(link.href)}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            )
          )}
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
                className={
                  locale === "ja"
                    ? "font-bold text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400"
                }
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
                className={
                  locale === "en"
                    ? "font-bold text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400"
                }
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
