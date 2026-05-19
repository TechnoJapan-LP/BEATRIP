import { Resend } from "resend";

/**
 * Resend クライアント。RESEND_API_KEY 未設定時は null を返し、
 * 呼び出し側はメール送信をスキップ（購読保存のみ）する。
 */
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

const FROM = process.env.RESEND_FROM ?? "BEATRIP <onboarding@resend.dev>";

export async function sendWelcomeEmail(to: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("[newsletter] RESEND_API_KEY 未設定のためメール送信をスキップ");
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: "BEATRIP セール通知の登録が完了しました",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#18181b">
        <h1 style="font-size:20px;letter-spacing:.05em;margin:0 0 16px">BEATRIP</h1>
        <p style="font-size:15px;line-height:1.7;margin:0 0 16px">
          ご登録ありがとうございます。<br>
          航空会社のセール開始を、いち早くメールでお知らせします。
        </p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 24px">
          最安値のタイミングを逃さず、おトクな旅を。
        </p>
        <a href="https://beatrip.jp" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 24px;border-radius:10px">
          今のセールを見る
        </a>
        <p style="font-size:11px;color:#a1a1aa;margin:32px 0 0">
          このメールに心当たりがない場合は破棄してください。配信停止は今後のメール内のリンクから行えます。
        </p>
      </div>
    `,
  });
}
