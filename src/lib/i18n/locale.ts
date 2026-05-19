export type Locale = "ja" | "en";

/** localeに応じてリンク先にプレフィックスを付ける（ja は無印、en は /en） */
export function localizeHref(href: string, locale: Locale): string {
  if (locale === "ja") return href;
  if (href.startsWith("#") || /^https?:\/\//.test(href)) return href;
  if (href === "/") return "/en";
  if (href.startsWith("/#")) return `/en${href.slice(1)}`;
  if (href === "/en" || href.startsWith("/en/")) return href;
  return `/en${href}`;
}
