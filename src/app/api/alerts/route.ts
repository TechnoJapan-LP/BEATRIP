import { NextRequest, NextResponse } from "next/server";
import {
  loadAlerts,
  addAlert,
  removeAlert,
  type AlertChannel,
} from "@/lib/notifications/subscriptions";
import {
  checkRateLimit,
  clientId,
  isSameOriginRequest,
} from "@/lib/rate-limit";
import { isLikelyBot } from "@/lib/security/bot-detector";

const MAX_BODY_BYTES = 8 * 1024;
const ALLOWED_WEBHOOK_HOSTS = new Set<string>([
  "hooks.slack.com",
  "discord.com",
  "discordapp.com",
  "api.line.me",
  "notify-api.line.me",
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

// Web Push の endpoint は各ブラウザベンダーのプッシュサービスのみ許可。
// 任意 URL を許すと SSRF / 内部リソースへのリクエスト誘発につながる。
const ALLOWED_PUSH_HOSTS_SUFFIX = [
  ".push.apple.com",
  ".googleapis.com",
  ".mozilla.com",
  ".windows.com",
  ".notify.windows.com",
];

function isValidPushSubscription(s: unknown): s is {
  endpoint: string;
  keys: { p256dh: string; auth: string };
} {
  if (!s || typeof s !== "object") return false;
  const obj = s as Record<string, unknown>;
  if (typeof obj.endpoint !== "string") return false;
  if (!obj.keys || typeof obj.keys !== "object") return false;
  const keys = obj.keys as Record<string, unknown>;
  if (typeof keys.p256dh !== "string" || typeof keys.auth !== "string") {
    return false;
  }
  try {
    const u = new URL(obj.endpoint);
    if (u.protocol !== "https:") return false;
    return ALLOWED_PUSH_HOSTS_SUFFIX.some((suffix) =>
      u.hostname.endsWith(suffix)
    );
  } catch {
    return false;
  }
}

// GET は登録済 push endpoint を含むため一般公開不可。ADMIN_API_KEY 必須。
function isAdmin(request: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${adminKey}`;
}

export async function GET(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const alerts = await loadAlerts();
  return NextResponse.json({ alerts, count: alerts.length });
}

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Bot / 自動化ツール由来の alert 登録を拒否
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

  const id = clientId(request);
  const limit = await checkRateLimit("alerts", id);
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

  const { target, targetType, channels, pushSubscription, webhookUrl } =
    body as {
      target?: unknown;
      targetType?: unknown;
      channels?: unknown;
      pushSubscription?: unknown;
      webhookUrl?: unknown;
    };

  if (
    typeof target !== "string" ||
    target.length === 0 ||
    target.length > 64 ||
    typeof targetType !== "string" ||
    !Array.isArray(channels)
  ) {
    return NextResponse.json(
      { error: "target, targetType, channels are required" },
      { status: 400 }
    );
  }

  if (targetType !== "route" && targetType !== "airline") {
    return NextResponse.json(
      { error: "targetType must be 'route' or 'airline'" },
      { status: 400 }
    );
  }

  const validChannels: AlertChannel[] = ["push", "line", "slack", "webhook"];
  const channelList = channels as AlertChannel[];
  if (
    channelList.length === 0 ||
    channelList.length > validChannels.length ||
    !channelList.every((c: AlertChannel) => validChannels.includes(c))
  ) {
    return NextResponse.json(
      { error: `channels must be: ${validChannels.join(", ")}` },
      { status: 400 }
    );
  }

  let validatedPushSub:
    | { endpoint: string; keys: { p256dh: string; auth: string } }
    | undefined;
  if (channelList.includes("push")) {
    if (!isValidPushSubscription(pushSubscription)) {
      return NextResponse.json(
        { error: "Valid pushSubscription required for push channel" },
        { status: 400 }
      );
    }
    validatedPushSub = pushSubscription;
  }

  let validatedWebhookUrl: string | undefined;
  if (channelList.includes("slack") || channelList.includes("webhook")) {
    if (typeof webhookUrl !== "string" || !isValidWebhookUrl(webhookUrl)) {
      return NextResponse.json(
        { error: "Valid webhookUrl required for slack/webhook channels" },
        { status: 400 }
      );
    }
    validatedWebhookUrl = webhookUrl;
  }

  // pushSubscription.endpoint はユーザー固有の秘密に近い識別子のため
  // 一切ログに出さない (PII / セキュリティ)。
  const alert = await addAlert({
    target,
    targetType,
    channels: channelList,
    pushSubscription: validatedPushSub,
    webhookUrl: validatedWebhookUrl,
  });

  return NextResponse.json(alert, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const removed = await removeAlert(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
