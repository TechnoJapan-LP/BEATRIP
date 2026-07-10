import { NextRequest } from "next/server";

/**
 * /api/hotel-photo — Google Places Photo Media のサーバーサイド proxy
 *
 * 目的: Google Places Photo Media URL は
 *   https://places.googleapis.com/v1/{photoName}/media?key=XXX
 * の形式で API key がクエリに乗るため、そのままクライアントに出すと
 * HTML / JS に key 文字列が露出する。本 route はサーバー側で
 * GOOGLE_PLACES_API_KEY を付与して取得し、画像バイナリだけをクライアントへ
 * ストリーム返却することで key 露出を防ぐ。
 *
 * GET /api/hotel-photo?ref={photoName}&w={maxWidthPx}
 *   ref … "places/XXX/photos/YYY" 形式の photo name (必須, SSRF 対策で形式検証)
 *   w   … 取得幅 px (任意, default 640, 100〜1600 にクランプ)
 *
 * レスポンス: image/jpeg を 30 日 immutable CDN キャッシュ。
 * 期限切れ後も stale-while-revalidate で即時表示しつつ裏で再取得。
 * key 未設定時は 404 (ページ側は tier グラデーション fallback に倒れる)。
 */

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PHOTO_BASE_URL = "https://places.googleapis.com/v1";

// SSRF 対策: places/{id}/photos/{id} 形式のみ許可。
// id は英数 / -, _ のみ (Google の place/photo reference 文字種)。
const PHOTO_NAME_RE = /^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/;

function getApiKey(): string | null {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key || key.trim() === "") return null;
  return key.trim();
}

function clampWidth(raw: string | null): number {
  const n = Number(raw);
  // default は hotel-image-url.ts の HOTEL_PHOTO_WIDTH.DEFAULT と整合させる
  if (!Number.isFinite(n)) return 640;
  return Math.min(1600, Math.max(100, Math.round(n)));
}

/**
 * photo reference の期限切れ等で Google が 404 を返した場合のフォールバック。
 * 404 をそのまま返すと <img> が壊れアイコン + alt テキスト表示になり
 * カードの見た目が崩れるため、ニュートラルなグラデ SVG を 200 で返す
 * (特定ホテルの写真と誤認させない無地表現 = 誠実なプレースホルダ)。
 * 期限切れ reference が復活することはまず無いので 1 日キャッシュ。
 */
function fallbackSvg(): Response {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 5"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f3f46"/><stop offset="1" stop-color="#18181b"/></linearGradient></defs><rect width="8" height="5" fill="url(#g)"/></svg>`;
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control":
        "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const ref = sp.get("ref");
  if (!ref || !PHOTO_NAME_RE.test(ref)) {
    // 不正入力のみ 400 (自前コード以外からの呼び出し)。
    return new Response("invalid photo reference", { status: 400 });
  }

  const apiKey = getApiKey();
  if (!apiKey) {
    return fallbackSvg();
  }

  const width = clampWidth(sp.get("w"));

  // photoName は検証済みなので path セグメントとして安全に埋め込める。
  const upstream = `${PHOTO_BASE_URL}/${ref}/media?key=${apiKey}&maxWidthPx=${width}`;

  let res: Response;
  try {
    res = await fetch(upstream, {
      // Google Places photo は不変。Next の data cache は使わず CDN ヘッダで制御。
      cache: "no-store",
      redirect: "follow",
    });
  } catch {
    return fallbackSvg();
  }

  if (!res.ok || !res.body) {
    // photo reference の期限切れ (Google 側 404) — 壊れアイコンを出さない
    return fallbackSvg();
  }

  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  if (!contentType.startsWith("image/")) {
    // 想定外 (HTML エラーページ等) は流さない。
    return fallbackSvg();
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      // 30 日 immutable。Vercel CDN が長期キャッシュし、以後は origin を叩かない。
      // 期限切れ後 7 日間は stale-while-revalidate で stale を即時返しつつ
      // 裏で再取得する (expiry 直後の白画像フラッシュ防止)。
      "Cache-Control":
        "public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800, immutable",
    },
  });
}
