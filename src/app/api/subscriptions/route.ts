import { NextRequest, NextResponse } from "next/server";
import {
  loadSubscriptions,
  addSubscription,
  removeSubscription,
} from "@/lib/notifications/subscriptions";
import {
  checkRateLimit,
  clientId,
  isSameOriginRequest,
} from "@/lib/rate-limit";
import { isLikelyBot } from "@/lib/security/bot-detector";

const MAX_BODY_BYTES = 4 * 1024;
// LINE / X (旧 Twitter) の通知 webhook を想定したホスト allowlist。
// SSRF / 内部メタデータ (169.254.169.254) を防ぐため動的 URL は許可しない。
const ALLOWED_WEBHOOK_HOSTS = new Set<string>([
  "api.line.me",
  "notify-api.line.me",
  "api.twitter.com",
  "api.x.com",
]);

function isValidWebhookUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return ALLOWED_WEBHOOK_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

// GET は webhook URL を含む購読データを返すため一般公開不可。ADMIN_API_KEY 必須。
function isAdmin(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${adminKey}`;
}

// webhookUrl はトークン等を含み得るためレスポンスではホストのみ残してマスクする。
// 例: https://api.line.me/v2/xxx → https://api.line.me/***
function maskWebhookUrl(url: string): string {
  try {
    return `${new URL(url).origin}/***`;
  } catch {
    return "***";
  }
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const subs = await loadSubscriptions();
  return NextResponse.json(
    subs.map((s) => ({ ...s, webhookUrl: maskWebhookUrl(s.webhookUrl) }))
  );
}

export async function POST(request: NextRequest) {
  // CSRF 対策: 自サイトからの POST 以外は拒否
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Bot / 自動化ツール由来の subscribe を拒否 (二重防御)
  if (isLikelyBot(request.headers.get("user-agent"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentLength = parseInt(
    request.headers.get("content-length") ?? "0",
    10
  );
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  // レート制限 (IP単位 / 1時間 10回)
  const id = clientId(request);
  const limit = await checkRateLimit("subscriptions", id);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))
          ),
        },
      }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { route, type, webhookUrl } = body as {
    route?: unknown;
    type?: unknown;
    webhookUrl?: unknown;
  };

  if (
    typeof route !== "string" ||
    route.length === 0 ||
    route.length > 64 ||
    typeof type !== "string" ||
    typeof webhookUrl !== "string"
  ) {
    return NextResponse.json(
      { error: "route, type, webhookUrl are required" },
      { status: 400 }
    );
  }

  if (type !== "line" && type !== "x") {
    return NextResponse.json(
      { error: "type must be 'line' or 'x'" },
      { status: 400 }
    );
  }

  // SSRF / 任意 URL 投げ込み防止のため allowlist 検証
  if (!isValidWebhookUrl(webhookUrl)) {
    return NextResponse.json(
      { error: "webhookUrl host not allowed" },
      { status: 400 }
    );
  }

  // 重複登録チェック (同一 route + type + webhookUrl は 409)
  const existing = await loadSubscriptions();
  const dup = existing.find(
    (s) =>
      s.route === route && s.type === type && s.webhookUrl === webhookUrl
  );
  if (dup) {
    return NextResponse.json(
      { error: "Already subscribed", id: dup.id },
      { status: 409 }
    );
  }

  const sub = await addSubscription({ route, type, webhookUrl });
  return NextResponse.json(sub, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const removed = await removeSubscription(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
