import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 配信元を許可（Unsplash の写真 / Wikimedia の都市代表画像）
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
    // モバイル〜デスクトップの代表幅に絞る
    deviceSizes: [320, 420, 640, 768, 1024, 1280],
    imageSizes: [16, 24, 48, 64, 96, 160, 256],
    minimumCacheTTL: 86400,
  },
  // 本番ソースマップ無効でJSを軽量化（gzip/brotliはVercelが自動）
  productionBrowserSourceMaps: false,
};

export default nextConfig;
