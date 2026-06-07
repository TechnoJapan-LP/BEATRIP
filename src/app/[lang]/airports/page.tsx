import type { Metadata } from "next";
import Link from "next/link";
import { Plane, ArrowRight } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { AIRPORTS, type AirportRegion } from "@/data/airports";

// ISR: 21600秒 (6時間)
export const revalidate = 21600;

export const metadata: Metadata = {
  title: "日本国内の全空港一覧 | 主要空港〜地方空港の航空券セール | BEATRIP",
  description:
    "羽田・成田・関空などの主要空港から、松山・旭川・石垣などの地方・離島空港まで、日本国内45空港の発着セール情報を集約。お住まいのエリアから最安便を探せます。",
  keywords: [
    "空港一覧",
    "国内空港",
    "地方空港",
    "空港 セール",
    "格安航空券 空港",
    "離島 空港",
  ],
  alternates: {
    canonical: "https://beatrip.jp/airports",
    languages: {
      ja: "https://beatrip.jp/airports",
      en: "https://beatrip.jp/en/airports",
      "x-default": "https://beatrip.jp/airports",
    },
  },
};

const REGION_ORDER: AirportRegion[] = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州",
  "沖縄",
];

const SIZE_BADGE: Record<string, { label: string; cls: string }> = {
  major: { label: "主要", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200" },
  regional: { label: "地方拠点", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200" },
  minor: { label: "離島・地方", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200" },
};

export default function AirportsIndexPage() {
  const grouped = REGION_ORDER.map((region) => ({
    region,
    airports: AIRPORTS.filter((a) => a.region === region).sort((a, b) => {
      const sizeOrder = { major: 0, regional: 1, minor: 2 };
      return sizeOrder[a.size] - sizeOrder[b.size];
    }),
  })).filter((g) => g.airports.length > 0);

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "日本国内の空港一覧",
    itemListElement: AIRPORTS.map((a, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://beatrip.jp/airports/${a.iata}`,
      name: a.fullNameJa,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Header />

      <section className="relative bg-gradient-to-br from-sky-900 via-sky-700 to-cyan-600 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-10">
          <Breadcrumbs
            variant="dark"
            items={[
              { label: "Home", href: "/" },
              { label: "空港" },
            ]}
          />
          <div className="mt-6 flex items-center gap-3 mb-2">
            <Plane className="h-7 w-7" />
            <p className="text-[11px] font-bold tracking-widest uppercase opacity-90">
              Airports of Japan
            </p>
          </div>
          <h1 className="font-heading text-4xl tracking-wide uppercase sm:text-5xl lg:text-6xl">
            日本国内の空港一覧
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/90 max-w-2xl">
            主要空港から地方・離島まで全 {AIRPORTS.length} 空港。
            お住まいのエリアから最安便を探せます。
          </p>
        </div>
      </section>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <div className="space-y-10">
          {grouped.map(({ region, airports }) => (
            <section key={region}>
              <h2 className="font-heading text-2xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase mb-4 sm:text-3xl">
                {region}
                <span className="ml-3 text-sm font-mono text-zinc-400">
                  {airports.length}空港
                </span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {airports.map((a) => {
                  const badge = SIZE_BADGE[a.size];
                  return (
                    <Link
                      key={a.iata}
                      href={`/airports/${a.iata}`}
                      className="group rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:underline">
                            {a.fullNameJa}
                          </h3>
                          <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                            {a.iata} · {a.prefecture}
                          </p>
                        </div>
                        <span className={`flex-shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${badge.cls}`}>
                          {badge.label}
                        </span>
                      </div>
                      {a.tagline && (
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed mb-2">
                          {a.tagline}
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                        <span className="truncate">
                          就航: {a.airlines.slice(0, 3).join(", ")}
                          {a.airlines.length > 3 && " 他"}
                        </span>
                        <ArrowRight className="h-3 w-3 text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
