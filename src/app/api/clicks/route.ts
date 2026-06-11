import { NextRequest, NextResponse } from "next/server";
import {
  recordClick,
  loadAllClickStats,
  isValidDealId,
} from "@/lib/store/click-store";
import { checkRateLimit, clientId } from "@/lib/rate-limit";
import { isLikelyBot } from "@/lib/security/bot-detector";
import {
  isTurnstileConfigured,
  verifyTurnstileToken,
} from "@/lib/security/turnstile";
import { extractIp } from "@/lib/audit/audit-log";

const MAX_BODY_BYTES = 4 * 1024;
// affiliate_url は HTTPS の任意ドメインを許可 (アフィリエイトリンクは多様)。
// ただし javascript: / data: / file: 等を完全に排除するため URL parser で検証する。
const ALLOWED_URL_PROTOCOLS = new Set(["https:", "http:"]);
// affiliate_provider は表示・集計用識別子なので英数 + ハイフン/アンダースコアのみ。
const PROVIDER_RE = /^[a-zA-Z0-9_-]{1,32}$/;
// placement は配置位置の集計キー。英数 + ハイフン/アンダースコアのみ (短い enum 想定)。
const PLACEMENT_RE = /^[a-zA-Z0-9_-]{1,32}$/;

export async function POST(req: NextRequest) {
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  // Bot 検出: 検索エンジンや scraper による click 計測汚染を排除。
  // sendBeacon の自動再試行を誘発しないよう 200 OK を返しつつ KV に書かない。
  const userAgent = req.headers.get("user-agent");
  if (isLikelyBot(userAgent)) {
    return NextResponse.json({ success: true, skipped: "bot" });
  }

  // レート制限: 同一 IP からの過剰 click を弾く (ASP コミッション凍結対策)。
  // 実ユーザーの click 頻度を超える 10 req/min を上限とする。
  const id = clientId(req);
  const limit = await checkRateLimit("clicks", id);
  if (!limit.allowed) {
    // sendBeacon の再試行回避のため 200 を返しつつ skip 扱い。
    // ヘッダで原因を伝えるが本文は success: true で返す。
    return NextResponse.json(
      { success: true, skipped: "rate_limited" },
      {
        status: 200,
        headers: {
          "X-RateLimit-Remaining": String(limit.remaining),
          "X-RateLimit-Reset": String(limit.reset),
        },
      }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { deal_id, affiliate_provider, affiliate_url, turnstile_token, placement } =
    body as {
      deal_id?: unknown;
      affiliate_provider?: unknown;
      affiliate_url?: unknown;
      turnstile_token?: unknown;
      placement?: unknown;
    };

  // Cloudflare Turnstile 検証: TURNSTILE_SECRET_KEY が設定されているときのみ実施。
  // 未設定なら既存挙動を維持 (skip)。検証失敗時は sendBeacon の再試行を誘発しないよう
  // 200 + skipped:"turnstile_failed" を返す。
  if (isTurnstileConfigured()) {
    const tokenStr = typeof turnstile_token === "string" ? turnstile_token : "";
    const verified = await verifyTurnstileToken(tokenStr, extractIp(req));
    if (!verified.ok) {
      return NextResponse.json(
        {
          success: true,
          skipped: "turnstile_failed",
          errorCodes: verified.configured ? verified.errorCodes ?? [] : [],
        },
        { status: 200 }
      );
    }
  }

  // deal_id の path traversal 対策: 厳格な allowlist 検証
  // (内部 file path に join されるため、`../` / `/` / NUL バイト等の混入は致命的)
  if (!isValidDealId(deal_id)) {
    return NextResponse.json(
      { error: "Invalid deal_id" },
      { status: 400 }
    );
  }

  if (typeof affiliate_url !== "string" || affiliate_url.length > 2048) {
    return NextResponse.json(
      { error: "Invalid affiliate_url" },
      { status: 400 }
    );
  }

  try {
    const parsed = new URL(affiliate_url);
    if (!ALLOWED_URL_PROTOCOLS.has(parsed.protocol)) {
      return NextResponse.json(
        { error: "Invalid affiliate_url protocol" },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Malformed affiliate_url" },
      { status: 400 }
    );
  }

  const provider =
    typeof affiliate_provider === "string" && PROVIDER_RE.test(affiliate_provider)
      ? affiliate_provider
      : "unknown";

  // placement は任意。allowlist に合致しなければ単に省略する (集計汚染を防ぐ)。
  const placementValue =
    typeof placement === "string" && PLACEMENT_RE.test(placement)
      ? placement
      : undefined;

  const referer = req.headers.get("referer") ?? "";
  const event = {
    deal_id,
    affiliate_provider: provider,
    affiliate_url,
    timestamp: new Date().toISOString(),
    // referrer はログ容量・PII 観点で長さを制限
    referrer: referer.slice(0, 512),
    ...(placementValue ? { placement: placementValue } : {}),
  };

  const log = await recordClick(event);

  return NextResponse.json({
    success: true,
    total_clicks: log.total_clicks,
  });
}

// GET (ディール別クリック統計) は事業情報のため一般公開不可。ADMIN_API_KEY 必須。
// POST (計測 beacon) は無認証のまま維持する。
function isAdmin(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${adminKey}`;
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stats = await loadAllClickStats();
  return NextResponse.json({ stats });
}
