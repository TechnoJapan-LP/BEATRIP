import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // X-Powered-By ヘッダを抑止（Next.js 利用のフィンガープリント漏洩を防ぐ）
  poweredByHeader: false,
  // ── バンドル最適化 ──
  // 大きい lib (lucide-react: 2800+ icons, @base-ui/react 等) を per-icon /
  // per-export tree-shake させる。Turbopack が compile 時に解決し、未参照
  // export を初期バンドルから除外する。
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@base-ui/react",
      "class-variance-authority",
      "@vercel/analytics",
      "@vercel/speed-insights",
      "date-fns",
    ],
  },
  images: {
    // 配信元を許可（Unsplash の都市背景 / Wikimedia の代表画像 = ホテル建物実写）
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
    // AVIF/WebP で配信（JPEG比で大幅軽量化）
    formats: ["image/avif", "image/webp"],
    // モバイル〜デスクトップの代表幅 (384 = iPhone 14 Pro Max / Pixel 8 Pro)
    deviceSizes: [320, 384, 420, 640, 768, 1024, 1280],
    imageSizes: [16, 24, 48, 64, 96, 160, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 日 (Vercel CDN がより長く保持)
  },
  // 本番ソースマップ無効でJSを軽量化（gzip/brotliはVercelが自動）
  productionBrowserSourceMaps: false,
  // ── セキュリティヘッダ ──
  // クリックジャッキング・MIME sniffing・リファラー漏洩等を防ぐ。
  // CSP は Next.js のインラインスクリプト＋複数の第三者(GA/Vercel等)との
  // 兼ね合いがあるため、必要なドメインを明示的に許可している。
  // 許可している外部接続先:
  //   - GA4: https://www.googletagmanager.com / https://www.google-analytics.com
  //   - Vercel Analytics / Speed Insights: https://va.vercel-scripts.com / https://vitals.vercel-insights.com
  async headers() {
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: https:",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
      "frame-ancestors 'self'",
      // Flash / プラグイン経由のコード実行を完全に禁止
      "object-src 'none'",
      // <base href> による相対 URL の乗っ取りを防ぐ
      "base-uri 'self'",
      // フォーム送信先を自サイトに限定 (CSRF / フィッシング対策)
      "form-action 'self'",
      // HTTP からのサブリソースを自動で HTTPS にアップグレード
      "upgrade-insecure-requests",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          // HTTPS強制（既にHTTPSなのを継続。Vercelが自動TLS）
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // iframe埋め込みは同一オリジンのみ許可（CSP frame-ancestors とも整合）
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // MIME sniffing 無効化
          { key: "X-Content-Type-Options", value: "nosniff" },
          // 外部遷移時のリファラを抑制
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // ブラウザ機能の自動許可を最小化
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Content Security Policy
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      // sitemap.xml / robots.txt は静的に近いので CDN/ブラウザでキャッシュ可
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, s-maxage=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
