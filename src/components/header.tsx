"use client";

import { useState } from "react";
import Link from "next/link";
import { Plane, Globe, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/", label: "フラッシュディール" },
  { href: "/airlines", label: "航空会社セール" },
  { href: "/#calendar", label: "セール予測" },
  { href: "/articles", label: "記事" },
] as const;

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
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
                href={link.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-xs text-zinc-400 sm:flex">
            <Globe className="h-3.5 w-3.5" />
            <span className="font-mono">JP</span>
          </div>
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 sm:hidden"
            aria-label="メニュー"
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
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 dark:text-zinc-300 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            )
          )}
          <div className="mt-2 flex items-center justify-between rounded-lg px-3 py-2.5">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
              テーマ切替
            </span>
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}
