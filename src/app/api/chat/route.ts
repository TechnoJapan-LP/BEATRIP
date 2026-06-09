import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  clientId,
  isSameOriginRequest,
} from "@/lib/rate-limit";
import { isLikelyBot } from "@/lib/security/bot-detector";
import {
  CHAT_MAX_TOKENS,
  CHAT_MODEL,
  getAnthropicClient,
} from "@/lib/ai/anthropic-client";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

/**
 * AI チャット API (Anthropic Claude)。
 *
 * POST { message: string, history?: { role: "user"|"assistant", content: string }[] }
 *  → { reply: string } or { error, fallback }
 *
 * セキュリティ:
 * - same-origin 限定 (CSRF / 外部 abuse 防止)
 * - bot UA は弾く (Anthropic API は有料)
 * - 20 req/min/IP の rate-limit
 * - body サイズ上限 16 KB
 *
 * API キー未設定時 / 失敗時は 503 + フォールバック文字列を返し、UI 側で表示する。
 */

const MAX_BODY_BYTES = 16 * 1024;
const MAX_MESSAGE_LEN = 1000;
const MAX_HISTORY_LEN = 10;

// Edge ではなく Node.js runtime (Anthropic SDK は Node 想定)
export const runtime = "nodejs";
// 動的レスポンス (cache 無効)
export const dynamic = "force-dynamic";

const FALLBACK_MESSAGE =
  "ただいま混雑しています。少し時間をおいて再度お試しください。";

type HistoryItem = { role: "user" | "assistant"; content: string };

function sanitizeHistory(raw: unknown): HistoryItem[] {
  if (!Array.isArray(raw)) return [];
  const out: HistoryItem[] = [];
  for (const item of raw.slice(-MAX_HISTORY_LEN)) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: unknown }).role;
    const content = (item as { content?: unknown }).content;
    if (
      (role === "user" || role === "assistant") &&
      typeof content === "string" &&
      content.length > 0 &&
      content.length <= MAX_MESSAGE_LEN
    ) {
      out.push({ role, content });
    }
  }
  return out;
}

export async function POST(req: NextRequest) {
  // body size guard
  const contentLength = parseInt(req.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  // same-origin: 自サイトの fetch のみ
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // bot: 200 では返さず明示的に 403 (chat は明示 UI なので bot 由来は完全拒否で良い)
  if (isLikelyBot(req.headers.get("user-agent"))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // rate-limit: 20 req/min/IP
  const id = clientId(req);
  const limit = await checkRateLimit("chat", id);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Rate limited",
        fallback: "短時間に多くの質問を受けています。1 分ほど時間をおいてください。",
      },
      {
        status: 429,
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

  const message = body.message;
  if (
    typeof message !== "string" ||
    message.trim().length === 0 ||
    message.length > MAX_MESSAGE_LEN
  ) {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const history = sanitizeHistory(body.history);

  const client = getAnthropicClient();
  if (!client) {
    // API key 未設定 — 静かにフォールバック (本番では env を入れて有効化)
    return NextResponse.json(
      { error: "Chat unavailable", fallback: FALLBACK_MESSAGE },
      { status: 503 }
    );
  }

  try {
    const completion = await client.messages.create({
      model: CHAT_MODEL,
      max_tokens: CHAT_MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [
        ...history.map((h) => ({ role: h.role, content: h.content })),
        { role: "user" as const, content: message },
      ],
    });

    // content は text / tool_use 等の配列。text のみ連結。
    const reply = completion.content
      .filter((b): b is { type: "text"; text: string } & typeof b => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!reply) {
      return NextResponse.json(
        { error: "Empty response", fallback: FALLBACK_MESSAGE },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (e) {
    // SDK が throw する各種エラー (auth / rate / network) を一律フォールバック
    console.error("[api/chat] anthropic error", e);
    return NextResponse.json(
      { error: "Upstream error", fallback: FALLBACK_MESSAGE },
      { status: 502 }
    );
  }
}
