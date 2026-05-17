import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Bebas_Neue } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/sw-register";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://beatrip.jp"),
  title: {
    default: "BEATRIP — フライトディール ポータル",
    template: "%s | BEATRIP",
  },
  description:
    "最安値のフライトディールを見逃さない。セール予測AIが次のチャンスをお知らせ。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "BEATRIP — フライトディール ポータル",
    description: "最安値のフライトディールを見逃さない。",
    type: "website",
    siteName: "BEATRIP",
  },
  twitter: {
    card: "summary_large_image",
    title: "BEATRIP — フライトディール ポータル",
    description: "最安値のフライトディールを見逃さない。セール予測AIが次のチャンスをお知らせ。",
  },
  alternates: {
    canonical: "https://beatrip.jp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
