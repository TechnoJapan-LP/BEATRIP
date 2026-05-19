"use client";

import { createContext, useContext } from "react";
import { localizeHref, type Locale } from "@/lib/i18n/locale";

export type { Locale };

type LocaleContextValue = {
  locale: Locale;
  dict: Record<string, unknown>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Record<string, unknown>;
  children: React.ReactNode;
}) {
  return (
    <LocaleContext.Provider value={{ locale, dict }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext)?.locale ?? "ja";
}

/**
 * 辞書セクションを取得する。例: useDictionary("nav")
 * Provider外（理論上発生しない）でも落ちないよう空オブジェクトを返す。
 */
export function useDictionary<T = Record<string, unknown>>(
  section: string
): T {
  const ctx = useContext(LocaleContext);
  return ((ctx?.dict?.[section] as T) ?? ({} as T));
}

/** localeに応じてリンク先にプレフィックスを付ける（ja は無印、en は /en） */
export function useLocalizedHref(): (href: string) => string {
  const locale = useLocale();
  return (href: string) => localizeHref(href, locale);
}
