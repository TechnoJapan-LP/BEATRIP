import { NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) return false;
  const hash = crypto
    .createHmac("SHA256", secret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

async function replyMessage(replyToken: string, text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return;

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }],
    }),
  });
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-line-signature") ?? "";

  // LINE_CHANNEL_SECRET は本番必須。未設定なら fail-safe で 500 を返す。
  if (!process.env.LINE_CHANNEL_SECRET) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Server misconfigured: LINE_CHANNEL_SECRET required" },
        { status: 500 }
      );
    }
  } else if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  let data: { events?: unknown[] };
  try {
    data = JSON.parse(body);
  } catch (e) {
    console.error("[LINE webhook] malformed JSON body", e);
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  for (const event of (data.events ?? []) as Array<Record<string, unknown> & { type: string; message?: { type?: string; text?: string }; replyToken?: string }>) {
    if (!event.replyToken) continue;
    if (event.type === "follow") {
      await replyMessage(
        event.replyToken,
        "BEATRIPへようこそ！✈️\n\n航空会社のセール情報をリアルタイムでお届けします。\n新しいセールが開始されると自動で通知が届きます。\n\n🔗 https://beatrip.jp"
      );
    }

    if (event.type === "message" && event.message?.type === "text") {
      const text = event.message.text ?? "";
      if (text.includes("セール") || text.includes("deal")) {
        await replyMessage(
          event.replyToken,
          "最新のフライトセール情報はこちらからチェック！\n🔗 https://beatrip.jp"
        );
      }
    }
  }

  return NextResponse.json({ ok: true });
}
