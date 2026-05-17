"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AirlineProfile } from "@/lib/scrapers/types";

export function AirlineCarousel({ airlines }: { airlines: AirlineProfile[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  function updateScrollState() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }

  useEffect(() => {
    updateScrollState();
  }, []);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative group/carousel">
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-white dark:bg-zinc-800 shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all opacity-0 group-hover/carousel:opacity-100"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        className="flex gap-3 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1 sm:gap-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {airlines.map((a) => (
          <Link
            key={a.code}
            href={`/airlines/${a.code}`}
            className="group relative flex-shrink-0 w-[140px] rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-zinc-300 dark:hover:border-zinc-600 sm:w-[160px]"
          >
            {/* Colored accent bar */}
            <div
              className="h-1.5 w-full"
              style={{ backgroundColor: a.color || "#71717a" }}
            />

            <div className="flex flex-col items-center px-3 pt-4 pb-3 sm:px-4 sm:pt-5 sm:pb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 p-2 ring-1 ring-zinc-100 dark:ring-zinc-700 sm:h-16 sm:w-16">
                <img
                  src={a.logo}
                  alt={a.nameEn}
                  className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              <span className="mt-2.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 tracking-wide sm:text-sm">
                {a.nameEn}
              </span>
              <span className="mt-0.5 text-[10px] text-zinc-400 dark:text-zinc-500 sm:text-[11px]">
                セール情報を見る
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
