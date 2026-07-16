import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { airlineServesAirport, getAirlineByCode } from "@/data/airlines";
import { AIRPORTS } from "@/data/airports";

// Next.js 16: Middleware is now "Proxy"。機能は同じ。
// 日本語はURL無印（内部リライトで [lang]=ja）、英語は /en を [lang]=en にマップ。
// これにより既存の日本語URL（インデックス済み）は一切変わらない。

const LOCALES = ["ja", "en"] as const;

// /airlines/{code}/airports/{iata} は 17社 × 45空港 = 最大765通りだが、
// 大半は就航していない組合せ。page 側の notFound() だけでは本文は 404 でも
// HTTP ステータスが 200 のまま (ストリーミング開始後はヘッダを変更できないため)。
// ステータスを 404 にできるのは本文が流れ始める前＝この proxy だけなので、
// ここで就航判定してリライトに 404 を乗せる。判定はメモリ上の静的データのみで
// 完結するため I/O は発生しない。
const AIRLINE_AIRPORT_PATH = /^\/(?:en\/)?airlines\/([^/]+)\/airports\/([^/]+)\/?$/;

// 未知の航空会社コード (/airlines/zzz, /airlines/zzz/sales) も同じ理由で
// ここでしか 404 にできない。airports 配下は AIRLINE_AIRPORT_PATH が見る。
const AIRLINE_PATH = /^\/(?:en\/)?airlines\/([^/]+)(?:\/sales)?\/?$/;

function isUnknownAirline(pathname: string): boolean {
  const match = AIRLINE_PATH.exec(pathname);
  if (!match) return false;

  return !getAirlineByCode(match[1]);
}

function isUnservedAirlineAirport(pathname: string): boolean {
  const match = AIRLINE_AIRPORT_PATH.exec(pathname);
  if (!match) return false;

  // 突き合わせは必ず alias 解決を通す。生の文字列一致で比較すると、別表記の社
  // (airports.ts は ICAO 系, airlines.ts は IATA) が実在の就航なのに 404 になる。
  const airline = getAirlineByCode(match[1]);
  const airport = AIRPORTS.find((a) => a.iata === match[2].toUpperCase());
  if (!airline || !airport) return true;

  return !airlineServesAirport(airline, airport);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const notFoundInit =
    isUnservedAirlineAirport(pathname) || isUnknownAirline(pathname)
      ? { status: 404 }
      : undefined;

  // /en または /en/... は [lang]=en として自然にマッチするのでそのまま
  const isEn =
    pathname === "/en" || pathname.startsWith("/en/");
  if (isEn) return NextResponse.next(notFoundInit);

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
  return NextResponse.rewrite(url, notFoundInit);
}

export const config = {
  // _next / api / 静的ファイル / メタデータ / ロケール非対象ルート(brand, admin) は除外
  matcher: [
    "/((?!_next/|api/|brand|admin|favicon.ico|sitemap.xml|robots.txt|manifest.json|opengraph-image|.*\\.[\\w]+$).*)",
  ],
};

export { LOCALES };
