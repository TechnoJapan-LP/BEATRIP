/**
 * /articles/ota-compare — OTA 比較記事のハブ
 *
 * 13 都市の「Booking vs Agoda vs Trip.com vs Hotellook」比較記事を
 * 国内 / 海外でグルーピングして一覧する。
 * メガメニュー・フッター・/articles からの集約導線の受け皿。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BedDouble, Globe2, MapPin } from "lucide-react";
import { Header } from "@/components/header";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SiteFooter } from "@/components/site-footer";
import { OTA_COMPARE_ARTICLES } from "@/lib/articles/static-articles";
import { getHotelDestinationBySlug } from "@/data/hotel-destinations";
import { localizeHref, type Locale } from "@/lib/i18n/locale";

type Props = { params: Promise<{ lang: string }> };

// ISR: 21600 秒 (6 時間)
export const revalidate = 86400;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isEn = lang === "en";
  const count = OTA_COMPARE_ARTICLES.length;
  const title = isEn
    ? `Hotel booking site comparisons by city (${count} cities) — Booking vs Agoda vs Trip.com | BEATRIP`
    : `都市別 OTA 比較 (全 ${count} 都市) — Booking/Agoda/Trip.com どれが安い? | BEATRIP`;
  const description = isEn
    ? `City-by-city comparisons of the four major hotel OTAs (Booking.com, Agoda, Trip.com, Hotellook). Pick your destination — Tokyo, Osaka, Honolulu, Seoul, Bangkok and more — and see which site tends to be cheapest.`
    : `東京・大阪・ホノルル・ソウル・バンコクなど全 ${count} 都市の「ホテル予約サイトはどれが安い?」を都市別に比較。Booking.com / Agoda / Trip.com / Hotellook の在庫・価格傾向・キャンセル条件を編集部が整理。`;
  const path = isEn ? "/en/articles/ota-compare" : "/articles/ota-compare";
  return {
    title,
    description,
    openGraph: { title, description },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp/articles/ota-compare",
        en: "https://beatrip.jp/en/articles/ota-compare",
        "x-default": "https://beatrip.jp/articles/ota-compare",
      },
    },
  };
}

export default async function OtaCompareHubPage({ params }: Props) {
  const { lang } = await params;
  const locale: Locale = lang === "en" ? "en" : "ja";
  const lh = (href: string) => localizeHref(href, locale);

  // 国内 / 海外でグルーピング (HOTEL_DESTINATIONS の region に従う)
  const withRegion = OTA_COMPARE_ARTICLES.map((a) => {
    const dest = a.citySlug ? getHotelDestinationBySlug(a.citySlug) : undefined;
    return { article: a, domestic: dest?.region === "国内" };
  });
  const groups = [
    {
      key: "domestic",
      label: "国内の都市",
      Icon: MapPin,
      items: withRegion.filter((x) => x.domestic).map((x) => x.article),
    },
    {
      key: "overseas",
      label: "海外の都市",
      Icon: Globe2,
      items: withRegion.filter((x) => !x.domestic).map((x) => x.article),
    },
  ];

  return (
    <>
      <Header />

      <section className="border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-10">
          <Breadcrumbs
            items={[
              { label: "Home", href: lh("/") },
              { label: "記事", href: lh("/articles") },
              { label: "OTA 比較" },
            ]}
          />
          <h1 className="mt-4 font-heading text-2xl sm:text-3xl lg:text-4xl tracking-wide text-zinc-900 dark:text-zinc-100 leading-tight">
            都市別 OTA 比較
          </h1>
          <p className="mt-3 max-w-2xl text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            「この都市のホテル、結局どの予約サイトが安い?」に都市別で答える比較記事のまとめです。
            4 大 OTA (Booking.com / Agoda / Trip.com / Hotellook)
            の在庫量・価格傾向・キャンセル条件を、編集部が同じ基準で整理しています。
          </p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1 text-[11px] text-zinc-500 dark:text-zinc-400">
            <BedDouble className="h-3.5 w-3.5" aria-hidden="true" />
            全 {OTA_COMPARE_ARTICLES.length} 都市
          </p>
        </div>
      </section>

      <main
        id="main-content"
        className="mx-auto w-full max-w-5xl flex-1 px-4 sm:px-6 py-8 sm:py-10 space-y-10"
      >
        {groups.map((group) => (
          <section key={group.key}>
            <h2 className="mb-4 flex items-center gap-2 font-heading text-xl tracking-wide text-zinc-900 dark:text-zinc-100 uppercase">
              <group.Icon className="h-5 w-5 text-zinc-400" aria-hidden="true" />
              {group.label}
              <span className="text-sm font-normal normal-case text-zinc-400">
                {group.items.length} 都市
              </span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((a) => {
                const cityName = a.title.replace(/\s*OTA 比較$/, "");
                return (
                  <Link
                    key={a.slug}
                    href={lh(a.href)}
                    className="group rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 transition-colors hover:border-zinc-300 dark:hover:border-zinc-600"
                  >
                    <p className="flex items-center justify-between text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {cityName}
                      <ArrowRight
                        className="h-3.5 w-3.5 text-zinc-300 transition-transform group-hover:translate-x-0.5 group-hover:text-zinc-500"
                        aria-hidden="true"
                      />
                    </p>
                    <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {a.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <section className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 sm:p-6">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            国内 OTA (楽天トラベル・じゃらん等) も含めて比べたい方へ
          </h2>
          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            本シリーズはグローバル 4 大 OTA に絞った都市別比較です。楽天トラベル・じゃらん・Yahoo!トラベルなど国内
            OTA のセール時期も含めた横断比較は、OTA セール比較ページで扱っています。
          </p>
          <Link
            href={lh("/ota-sales")}
            className="group mt-3 inline-flex items-center gap-1 text-xs font-bold text-sky-700 dark:text-sky-300 hover:underline"
          >
            OTA セール比較を見る
            <ArrowRight
              className="h-3 w-3 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </section>
      </main>
      <SiteFooter lang={lang} />
    </>
  );
}
