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
        disallow: [
          "/api/",
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
