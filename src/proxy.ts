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

  // 外部から /ja/... で直接アクセスされた場合は無印 URL へ 301 で正規化。
  // (/ja/hotels/tokyo と /hotels/tokyo の両方が 200 を返す duplicate content を防ぐ。
  //  内部 rewrite は proxy を再通過しないためループしない)
  if (pathname === "/ja" || pathname.startsWith("/ja/")) {
    const url = request.nextUrl.clone();
    const stripped = pathname.slice(3); // "/ja" を除去
    url.pathname = stripped === "" ? "/" : stripped;
    return NextResponse.redirect(url, 301);
  }

  // それ以外（無印）= 日本語。内部リライトで [lang]=ja に流す（URLは不変）
  const url = request.nextUrl.clone();
  url.pathname = `/ja${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // _next / api / 静的ファイル / メタデータ / ロケール非対象ルート(brand, admin) は除外
  matcher: [
    "/((?!_next/|api/|brand|admin|favicon.ico|sitemap.xml|robots.txt|manifest.json|opengraph-image|.*\\.[\\w]+$).*)",
  ],
};

export { LOCALES };
