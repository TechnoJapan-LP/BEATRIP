import type { MetadataRoute } from "next";

// ISR: 86400秒キャッシュ (24時間)
export const revalidate = 86400;

/**
 * robots.txt — クローラー向け公開ポリシー。
 * - 全クローラーに全公開ページを許可
 * - /api/ は disallow（cron・rate-limit・購読者情報など機微なエンドポイント）
 * - sitemap を明示 + host を正規化（重複インデックス防止）
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 機微・管理系パスは多重に disallow（防御的な意思表示）
        // /api/clicks は計測用 (リダイレクト) のため allow のまま — indexable では無いが crawl block 不要。
        disallow: [
          "/admin",
          "/admin/",
          "/api/cron",
          "/api/admin",
          "/api/subscriptions",
          "/api/alerts",
          // 画像 proxy (Google Places 写真の key 非露出経由) — indexable 不要
          "/api/hotel-photo",
          "/.env",
          "/.env.",
          "/.well-known/",
        ],
      },
    ],
    sitemap: "https://beatrip.jp/sitemap.xml",
    host: "https://beatrip.jp",
  };
}
