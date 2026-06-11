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

type LimiterKey =
  | "newsletter"
  | "priceAlerts"
  | "subscriptions"
  | "alerts"
  | "clicks"
  | "chat"
  | "2fa";

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
    // 通知 webhook 購読は誰でも POST 可能だが本来は管理者操作。乱用防止に絞る。
    subscriptions: { tokens: 10, window: "1 h" },
    // push 通知用 alerts。ブラウザからの subscribe 操作 → 5 回 / hour で十分。
    alerts: { tokens: 5, window: "1 h" },
    // affiliate click 計測。実ユーザーの click 頻度を超えない上限。
    // ASP コミッション凍結リスク低減のため bot / 連打を弾く。
    clicks: { tokens: 10, window: "1 m" },
    // AI チャット (Anthropic API)。1 req = 有料 token 消費なので低く抑える。
    // 通常の対話頻度を超える 20 req/min で abuse をブロック。
    chat: { tokens: 20, window: "1 m" },
    // 管理者 TOTP 検証。brute force (6 桁 = 100 万通り) を実質不可能にする。
    "2fa": { tokens: 5, window: "10 m" },
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

/** IPv4 / IPv6 の概形チェック (偽装対策: 不正なフォーマットを弾く) */
function isValidIp(s: string): boolean {
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(s)) {
    return s.split(".").every((n) => {
      const v = parseInt(n, 10);
      return v >= 0 && v <= 255;
    });
  }
  // IPv6 (簡易)
  return /^[0-9a-fA-F:]+$/.test(s) && s.includes(":");
}

/**
 * リクエストの識別子（IP）を取得。Vercel の前段プロキシは X-Forwarded-For
 * の "client, proxy1, proxy2" 形式で先頭が信頼できる client IP。
 * 末尾を取ると spoofing 可能なので必ず **先頭** を取る。
 */
export function clientId(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first && isValidIp(first)) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  if (real && isValidIp(real)) return real;
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

// 自サイトからの fetch のみ許可するホスト allowlist。
// 本番ドメイン + ローカル開発のみ固定で許可する。
// `*.vercel.app` のワイルドカード許可は「攻撃者が任意の evil.vercel.app を
// デプロイして CSRF できる」ため廃止。preview デプロイで必要な場合は
// env ALLOWED_PREVIEW_HOST にホスト名を **完全一致** で設定する。
const ALLOWED_ORIGIN_HOSTS = new Set<string>([
  "beatrip.jp",
  "www.beatrip.jp",
  "localhost",
  "127.0.0.1",
]);

/**
 * CSRF / 第三者からの POST を防ぐため Origin / Referer ヘッダで自サイト
 * 由来かを確認する。Origin が無い場合は Referer に fallback。
 * どちらも無い (curl 等) は false 扱い。
 */
export function isSameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin ?? referer;
  if (!candidate) return false;
  try {
    const { hostname } = new URL(candidate);
    if (ALLOWED_ORIGIN_HOSTS.has(hostname)) return true;
    // Vercel preview 用: env で指定された単一ホストのみ完全一致で許可
    const previewHost = process.env.ALLOWED_PREVIEW_HOST;
    return Boolean(previewHost) && hostname === previewHost;
  } catch {
    return false;
  }
}
