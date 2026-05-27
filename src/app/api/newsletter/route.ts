import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/newsletter/store";
import { sendWelcomeEmail } from "@/lib/newsletter/email";
import {
  checkRateLimit,
  clientId,
  isHoneypotTripped,
} from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  // レート制限（IP単位、1時間に5回まで）
  const id = clientId(request);
  const limit = await checkRateLimit("newsletter", id);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらくしてからお試しください。" },
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

  // Bot対策ハニーポット: 人間には非表示の `website` が埋まっていれば拒否
  if (isHoneypotTripped(body)) {
    // 成功っぽく返してBotに気付かせない（保存は一切しない）
    return NextResponse.json({ success: true, alreadySubscribed: false });
  }

  const email = body.email;
  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { error: "有効なメールアドレスを入力してください" },
      { status: 400 }
    );
  }

  const normalized = email.trim().toLowerCase();

  let isNew: boolean;
  try {
    isNew = await addSubscriber(normalized);
  } catch (e) {
    console.error("[newsletter] 購読保存に失敗:", e);
    return NextResponse.json(
      { error: "登録に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }

  // 新規購読者のみウェルカムメールを送信。送信失敗は登録自体を妨げない。
  if (isNew) {
    try {
      await sendWelcomeEmail(normalized);
    } catch (e) {
      console.error("[newsletter] ウェルカムメール送信に失敗:", e);
    }
  }

  return NextResponse.json({ success: true, alreadySubscribed: !isNew });
}
