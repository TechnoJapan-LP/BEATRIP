import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** Use "dark" for breadcrumbs on dark image overlays */
  variant?: "default" | "dark";
};

export function Breadcrumbs({ items, variant = "default" }: BreadcrumbsProps) {
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
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? { item: `https://beatrip.jp${item.href}` }
        : {}),
    })),
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
