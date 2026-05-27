import { Ratelimit } from "@upstash/ratelimit";
import type { NextRequest } from "next/server";
import { getKV } from "@/lib/store/kv";

/**
 * Upstash Ratelimit ベースのAPIレート制限
 *
 * - Upstash Redis（既に稼働中）にカウンタを保存するためサーバーレスでも
 *   インスタンス横断で正しく動作する
 * - KV未設定（ローカル）では制限を無効化（許可ありの結果を返す）
 *
 * 用途別に名前付きで limiter を返す。
 */

type LimiterKey = "newsletter" | "priceAlerts";

const limiters = new Map<LimiterKey, Ratelimit | null>();

function getLimiter(name: LimiterKey): Ratelimit | null {
  if (limiters.has(name)) return limiters.get(name) ?? null;

  const kv = getKV();
  if (!kv) {
    limiters.set(name, null);
    return null;
  }

  // エンドポイント別の上限：
  // newsletter は登録1人で十分なので非常に厳しめ
  // priceAlerts は複数路線設定し得るのでやや緩め
  const config: Record<LimiterKey, { tokens: number; window: `${number} ${"s" | "m" | "h" | "d"}` }> = {
    newsletter: { tokens: 5, window: "1 h" },
    priceAlerts: { tokens: 20, window: "1 h" },
  };

  const c = config[name];
  const limiter = new Ratelimit({
    redis: kv,
    limiter: Ratelimit.slidingWindow(c.tokens, c.window),
    prefix: `beatrip:ratelimit:${name}`,
    analytics: false,
  });
  limiters.set(name, limiter);
  return limiter;
}

/** リクエストの識別子（IP）を取得。プロキシ後ろなのでヘッダ優先。 */
export function clientId(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export type LimitResult = {
  allowed: boolean;
  remaining: number;
  reset: number; // epoch ms
};

/**
 * レート制限チェック。KV未設定環境では常に allowed を返す（dev用）。
 */
export async function checkRateLimit(
  name: LimiterKey,
  identifier: string
): Promise<LimitResult> {
  const limiter = getLimiter(name);
  if (!limiter) {
    return { allowed: true, remaining: Infinity, reset: 0 };
  }
  const r = await limiter.limit(identifier);
  return {
    allowed: r.success,
    remaining: r.remaining,
    reset: r.reset,
  };
}

/**
 * ハニーポット検証。フォームに「人間には非表示・Botは埋める」隠しフィールド
 * `website` を仕込み、空でなければBotとして拒否する。
 */
export function isHoneypotTripped(body: Record<string, unknown>): boolean {
  const v = body["website"];
  return typeof v === "string" && v.trim().length > 0;
}
