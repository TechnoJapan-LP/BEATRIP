import crypto from "crypto";
import type { AirlineSale } from "@/lib/scrapers/types";
import type { HotDeal } from "@/lib/deals/hot-deals";
import { cityNameJa } from "@/lib/airport-names";

/**
 * X (旧Twitter) 自動投稿クライアント
 *
 * X API v2 POST /2/tweets を OAuth 1.0a User Context で叩く。
 * SDK 不使用 (Node crypto で署名) のため追加依存なし。
 *
 * env (X Developer Portal の「Keys and tokens」で取得):
 *   X_API_KEY         Consumer Key (API Key)
 *   X_API_SECRET      Consumer Secret (API Key Secret)
 *   X_ACCESS_TOKEN    Access Token (アプリ権限は Read and Write)
 *   X_ACCESS_SECRET   Access Token Secret
 *
 * いずれか未設定なら no-op (戻り値 [])。
 * 投稿権限には X Developer の Free プラン以上が必要 (月の書き込み上限に注意)。
 */

const TWEET_ENDPOINT = "https://api.twitter.com/2/tweets";

type XCreds = {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
};

function getCreds(): XCreds | null {
  const apiKey = process.env.X_API_KEY;
  const apiSecret = process.env.X_API_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_SECRET;
  if (!apiKey || !apiSecret || !accessToken || !accessSecret) return null;
  return { apiKey, apiSecret, accessToken, accessSecret };
}

/** RFC3986 準拠の percent-encode (OAuth1 が要求) */
function pctEncode(v: string): string {
  return encodeURIComponent(v).replace(
    /[!*'()]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

/**
 * OAuth 1.0a の Authorization ヘッダを生成。
 * POST /2/tweets の本文は JSON のため署名ベース文字列には含めない
 * (OAuth1 は application/x-www-form-urlencoded のボディのみ署名対象)。
 */
function buildAuthHeader(creds: XCreds): string {
  const oauth: Record<string, string> = {
    oauth_consumer_key: creds.apiKey,
    oauth_nonce: crypto.randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: creds.accessToken,
    oauth_version: "1.0",
  };

  const paramString = Object.keys(oauth)
    .sort()
    .map((k) => `${pctEncode(k)}=${pctEncode(oauth[k])}`)
    .join("&");

  const baseString = [
    "POST",
    pctEncode(TWEET_ENDPOINT),
    pctEncode(paramString),
  ].join("&");

  const signingKey = `${pctEncode(creds.apiSecret)}&${pctEncode(
    creds.accessSecret
  )}`;

  const signature = crypto
    .createHmac("sha1", signingKey)
    .update(baseString)
    .digest("base64");

  const header: Record<string, string> = {
    ...oauth,
    oauth_signature: signature,
  };
  return (
    "OAuth " +
    Object.keys(header)
      .sort()
      .map((k) => `${pctEncode(k)}="${pctEncode(header[k])}"`)
      .join(", ")
  );
}

function pickCheapestRoute(sale: AirlineSale) {
  if (sale.routes.length === 0) return null;
  return [...sale.routes].sort((a, b) => a.price - b.price)[0];
}

/**
 * 1セールを1ツイートに整形。X は日本語1文字=2 換算で上限280なので、
 * URL(23換算) + ハッシュタグ + 路線/価格を残せるよう航空会社+セール名を短めに。
 */
export function buildXText(sale: AirlineSale): string | null {
  const r = pickCheapestRoute(sale);
  if (!r) return null;
  const yen = new Intl.NumberFormat("ja-JP").format(r.price);
  const route = `${cityNameJa(r.originCode)}→${cityNameJa(r.destinationCode)}`;
  const discount = r.discount ? ` (-${r.discount}%)` : "";
  const url = `https://beatrip.jp/routes/${r.originCode}-${r.destinationCode}`;
  // 航空会社 + セール名は 30 文字程度に抑える (日本語 2 換算で安全側)
  let head = `${sale.airlineName} ${sale.saleName}`;
  if (head.length > 30) head = head.slice(0, 29) + "…";
  return `✈️ ${head}\n${route} ¥${yen}〜${discount}\n${url}\n#格安航空券 #航空券セール`;
}

type PostResult = { ok: boolean; status?: number; detail?: string };

async function postTweet(text: string, creds: XCreds): Promise<PostResult> {
  try {
    const res = await fetch(TWEET_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: buildAuthHeader(creds),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`[x] tweet failed ${res.status}:`, body.slice(0, 300));
      // X のエラー本文には自前の key/secret は含まれないため、切り詰めて返して
      // 設定ミス (Read-only 権限 / 重複投稿 / レート制限) を切り分けられるようにする
      return { ok: false, status: res.status, detail: body.slice(0, 200) };
    }
    return { ok: true };
  } catch (e) {
    console.error("[x] tweet request error:", e);
    return { ok: false, detail: e instanceof Error ? e.message : "request error" };
  }
}

/**
 * 認証＆投稿のスモークテスト。X_* env が正しいか確認用に1ツイートする。
 * クレデンシャル未設定なら success:false を返す。
 */
export async function postTestTweet(): Promise<{
  success: boolean;
  error?: string;
  /** 失敗時のみ: X API の HTTP ステータス (403=権限不足 / 429=レート等) */
  status?: number;
  /** 失敗時のみ: X API のエラー本文 (先頭200字。keyは含まれない) */
  detail?: string;
}> {
  const creds = getCreds();
  if (!creds) return { success: false, error: "X_* env が未設定" };
  // 同一本文の連投は X が duplicate として弾くため、末尾に時刻を入れて一意化する
  const stamp = new Date().toISOString().slice(11, 19);
  const text = `BEATRIP の自動投稿テストです ✈️\n航空券セール情報を毎日お届けします。\nhttps://beatrip.jp\n#BEATRIP #格安航空券 (${stamp})`;
  const res = await postTweet(text, creds);
  if (res.ok) return { success: true };
  return {
    success: false,
    error: `Post failed${res.status ? ` (HTTP ${res.status})` : ""}`,
    status: res.status,
    detail: res.detail,
  };
}

/**
 * 新着セールを X に投稿する。
 * - クレデンシャル未設定なら no-op (戻り値 [])
 * - 1セール1ツイート、レート保護のため 2 秒間隔
 * - 呼び出し側で dedup 済みのセールだけ渡すこと
 */
export async function postSalesToX(
  sales: AirlineSale[],
  maxPosts = 5
): Promise<string[]> {
  const creds = getCreds();
  if (!creds) return [];

  const posted: string[] = [];
  for (const sale of sales.slice(0, maxPosts)) {
    const text = buildXText(sale);
    if (!text) continue;
    const res = await postTweet(text, creds);
    if (res.ok) posted.push(sale.id);
    await new Promise((r) => setTimeout(r, 2000));
  }
  return posted;
}

/**
 * 超お買い得 (価格急落) を1件1ツイートに整形。
 * 「観測した」という事実ベース表現 (予約可能性は保証しない — 景表法配慮)。
 */
export function buildHotDealXText(h: HotDeal): string {
  const yen = new Intl.NumberFormat("ja-JP").format(h.price);
  const prevYen = new Intl.NumberFormat("ja-JP").format(h.previous_price);
  const route = `${cityNameJa(h.origin_code)}→${cityNameJa(h.destination_code)}`;
  const cabin = h.cabin === "Business" ? " ビジネスクラス" : "";
  const url = `https://beatrip.jp/routes/${h.origin_code}-${h.destination_code}`;
  return `⚡超お買い得を検出\n${route}${cabin} ¥${yen}\n直前の観測 ¥${prevYen} から -${h.drop_percent}%\n消える前にチェック👇\n${url}\n#格安航空券 #航空券セール`;
}

/** 新規検出の超お買い得を X に速報する。呼び出し側で dedup 済みのものだけ渡すこと。 */
export async function postHotDealsToX(
  hotDeals: HotDeal[],
  maxPosts = 3
): Promise<string[]> {
  const creds = getCreds();
  if (!creds) return [];

  const posted: string[] = [];
  for (const h of hotDeals.slice(0, maxPosts)) {
    const res = await postTweet(buildHotDealXText(h), creds);
    if (res.ok) posted.push(h.id);
    await new Promise((r) => setTimeout(r, 2000));
  }
  return posted;
}
