import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next.js 16: Middleware is now "Proxy"。機能は同じ。
// 日本語はURL無印（内部リライトで [lang]=ja）、英語は /en を [lang]=en にマップ。
// これにより既存の日本語URL（インデックス済み）は一切変わらない。

const LOCALES = ["ja", "en"] as const;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /en または /en/... は [lang]=en として自然にマッチするのでそのまま
  const isEn =
    pathname === "/en" || pathname.startsWith("/en/");
  if (isEn) return NextResponse.next();

  // 既に /ja が付いている場合は無限ループ防止でそのまま
  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    return NextResponse.next();
  }

  // それ以外（無印）= 日本語。内部リライトで [lang]=ja に流す（URLは不変）
  const url = request.nextUrl.clone();
  url.pathname = `/ja${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // _next / api / 静的ファイル（拡張子付き）/ メタデータファイルは除外
  matcher: [
    "/((?!_next/|api/|favicon.ico|sitemap.xml|robots.txt|manifest.json|opengraph-image|.*\\.[\\w]+$).*)",
  ],
};

export { LOCALES };
