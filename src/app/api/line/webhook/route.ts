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

  if (process.env.LINE_CHANNEL_SECRET && !verifySignature(body, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const data = JSON.parse(body);

  for (const event of data.events ?? []) {
    if (event.type === "follow") {
      await replyMessage(
        event.replyToken,
        "BEATRIPへようこそ！✈️\n\n航空会社のセール情報をリアルタイムでお届けします。\n新しいセールが開始されると自動で通知が届きます。\n\n🔗 https://beatrip.jp"
      );
    }

    if (event.type === "message" && event.message?.type === "text") {
      const text = event.message.text;
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
