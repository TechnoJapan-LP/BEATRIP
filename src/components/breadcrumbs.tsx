import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /**
   * 現在ページ (= 最後のパンくず) の locale 対応パス。例: "/hotels/tokyo" や
   * "/en/hotels/tokyo"。これを渡すと BreadcrumbList JSON-LD の最終要素にも
   * `item` (URL) が出力され、Search Console の「項目 item がありません」警告を
   * 解消できる。省略時は最終要素の item を省く (Google 的には許容されるが
   * GSC が警告を出すため、各ページで必ず渡すこと)。
   */
  currentPath?: string;
  /** Use "dark" for breadcrumbs on dark image overlays */
  variant?: "default" | "dark";
};

const BASE_URL = "https://beatrip.jp";

/** 相対パスを絶対 URL に。既に絶対 URL ならそのまま返す。 */
function toAbsoluteUrl(path: string): string {
  return /^https?:\/\//.test(path) ? path : `${BASE_URL}${path}`;
}

export function Breadcrumbs({
  items,
  currentPath,
  variant = "default",
}: BreadcrumbsProps) {
  const linkClass =
    variant === "dark"
      ? "text-white/60 hover:text-white transition-colors"
      : "text-zinc-400 hover:text-zinc-600 transition-colors";
  const currentClass =
    variant === "dark"
      ? "text-white/90 font-medium"
      : "text-zinc-600 font-medium";
  const separatorClass =
    variant === "dark" ? "text-white/30" : "text-zinc-300";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1;
      // href があればそれを、無ければ最終要素のみ currentPath を URL に採用。
      // これで全 ListItem に item が付き、GSC の「item がありません」を解消。
      const url = item.href ?? (isLast ? currentPath : undefined);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
        ...(url ? { item: toAbsoluteUrl(url) } : {}),
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex items-center gap-1.5 text-xs">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight
                    className={`h-3 w-3 flex-shrink-0 ${separatorClass}`}
                  />
                )}
                {isLast || !item.href ? (
                  <span className={currentClass}>{item.label}</span>
                ) : (
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
