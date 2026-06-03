import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Analytics } from "@/components/analytics";
import { LocaleProvider } from "@/components/i18n/locale-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { getDictionary, hasLocale, LOCALES } from "./dictionaries";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#18181b",
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

const META = {
  ja: {
    title: "BEATRIP — フライトディール ポータル",
    description:
      "最安値のフライトディールを見逃さない。セール予測AIが次のチャンスをお知らせ。",
  },
  en: {
    title: "BEATRIP — Flight Deal Portal",
    description:
      "Never miss the lowest flight deals. Our sale-forecast AI tells you when the next chance is coming.",
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
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 pb-14 sm:pb-0">
        {/* Skip to content (a11y): キーボードユーザー最初の Tab で表示 */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-zinc-900 focus:text-white focus:px-3 focus:py-2 focus:text-sm focus:font-bold focus:outline-none focus:ring-2 focus:ring-zinc-400"
        >
          メインコンテンツへスキップ
        </a>
        <LocaleProvider locale={lang} dict={dict}>
          <ServiceWorkerRegister />
          <ScrollToTop />
          {children}
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
