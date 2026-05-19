import { NextRequest, NextResponse } from "next/server";
import { addSubscriber } from "@/lib/newsletter/store";
import { sendWelcomeEmail } from "@/lib/newsletter/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

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
