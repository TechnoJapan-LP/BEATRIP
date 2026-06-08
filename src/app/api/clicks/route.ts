import { NextResponse } from "next/server";
import {
  recordClick,
  loadAllClickStats,
  isValidDealId,
} from "@/lib/store/click-store";

const MAX_BODY_BYTES = 4 * 1024;
// affiliate_url は HTTPS の任意ドメインを許可 (アフィリエイトリンクは多様)。
// ただし javascript: / data: / file: 等を完全に排除するため URL parser で検証する。
const ALLOWED_URL_PROTOCOLS = new Set(["https:", "http:"]);
// affiliate_provider は表示・集計用識別子なので英数 + ハイフン/アンダースコアのみ。
const PROVIDER_RE = /^[a-zA-Z0-9_-]{1,32}$/;

export async function POST(req: Request) {
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { deal_id, affiliate_provider, affiliate_url } = body as {
    deal_id?: unknown;
    affiliate_provider?: unknown;
    affiliate_url?: unknown;
  };

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

  const referer = req.headers.get("referer") ?? "";
  const event = {
    deal_id,
    affiliate_provider: provider,
    affiliate_url,
    timestamp: new Date().toISOString(),
    // referrer はログ容量・PII 観点で長さを制限
    referrer: referer.slice(0, 512),
  };

  const log = await recordClick(event);

  return NextResponse.json({
    success: true,
    total_clicks: log.total_clicks,
  });
}

export async function GET() {
  const stats = await loadAllClickStats();
  return NextResponse.json({ stats });
}
