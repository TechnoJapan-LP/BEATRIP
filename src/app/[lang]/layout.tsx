import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import { RegisterSw } from "@/components/pwa/register-sw";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Analytics } from "@/components/analytics";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { FloatingWidgets } from "@/components/floating-widgets";
import { ExitIntent } from "@/components/conversion/exit-intent";
import { getDictionary, hasLocale, LOCALES } from "./dictionaries";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  // iOS のノッチ/セーフエリアを尊重しつつ、全画面に背景を流せるよう cover
  viewportFit: "cover",
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// title / description は「航空券 セール」「安い時期」等の実検索クエリを含める
const META = {
  ja: {
    title: "航空券セール速報・安い時期予測 | BEATRIP",
    description:
      "ANA・JAL・LCCの航空券セール情報を毎日自動収集。国内線・国際線の格安航空券の安い時期をAIが予測し、次のセールのチャンスをお知らせします。",
  },
  en: {
    title: "Flight Sale Alerts & Cheap Fare Timing | BEATRIP",
    description:
      "Daily-updated flight sale deals from Japan. Our AI predicts the cheapest time to buy airline tickets and alerts you before the next sale.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = hasLocale(lang) ? lang : "ja";
  const m = META[locale];
  const path = locale === "ja" ? "" : "/en";

  return {
    metadataBase: new URL("https://beatrip.jp"),
    title: {
      default: m.title,
      template: "%s | BEATRIP",
    },
    description: m.description,
    manifest: "/manifest.json",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
    },
    openGraph: {
      title: m.title,
      description: m.description,
      type: "website",
      siteName: "BEATRIP",
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: m.title,
      description: m.description,
    },
    alternates: {
      canonical: `https://beatrip.jp${path}`,
      languages: {
        ja: "https://beatrip.jp",
        en: "https://beatrip.jp/en",
        "x-default": "https://beatrip.jp",
      },
    },
    verification: {
      google: "s6hnkAAFeWkjZuSP1daeBLRLSeapRvFROY7ge_7wrdU",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 pb-[calc(56px+env(safe-area-inset-bottom,0px))] sm:pb-0">
        {/* Organization / WebSite 構造化データ — 全ページ共通 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://beatrip.jp/#organization",
                  name: "BEATRIP",
                  url: "https://beatrip.jp",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://beatrip.jp/icon.svg",
                  },
                  sameAs: [],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://beatrip.jp/#website",
                  url: "https://beatrip.jp",
                  name: "BEATRIP",
                  description:
                    "航空券セール情報を自動収集。フライトディール、セール時期予測、価格推移を提供。",
                  publisher: { "@id": "https://beatrip.jp/#organization" },
                  inLanguage: ["ja-JP", "en-US"],
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate:
                        "https://beatrip.jp/?q={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
        {/* Skip to content (a11y): キーボードユーザー最初の Tab で表示 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-zinc-900 focus:text-white focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          メインコンテンツへスキップ
        </a>
        <LocaleProvider locale={lang} dict={dict}>
          <ScrollToTop />
          {children}
          {/* RecentlyViewed / Comparison / Chat / InstallPrompt は
              初回ペイント時に何も描画しないため client 限定 (ssr:false) で
              個別 chunk に分離し、初期バンドルから切り離す。 */}
          <FloatingWidgets />
          {/* 離脱直前 (PC) / scroll-depth (モバイル) のコンバージョン強化モーダル。
              7 日間 dismiss を localStorage で記録するため、うっとうしくない頻度。 */}
          <ExitIntent />
          <RegisterSw />
          <MobileBottomNav />

          {/* アナリティクス: Vercel Analytics + Speed Insights + GA4 */}
          <Analytics />

          {/* TravelPayouts Drive (アフィリエイトトラッキング・コンバージョン計測)
              本番のみ読み込む。開発環境では不要かつ、Driveのcss preloadが
              Next devのエラーオーバーレイを誘発しプレビューを妨げるため除外。 */}
          {process.env.NODE_ENV === "production" && (
            <Script
              id="travelpayouts-drive"
              strategy="afterInteractive"
              src="https://emrld.ltd/NTMwMDgx.js?t=530081"
            />
          )}
        </LocaleProvider>
      </body>
    </html>
  );
}
