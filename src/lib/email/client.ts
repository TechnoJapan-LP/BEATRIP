import { Resend } from "resend";

/**
 * 共有 Resend クライアント。RESEND_API_KEY 未設定時は null。
 * 呼び出し側はメール送信をスキップする。
 */
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export const MAIL_FROM =
  process.env.RESEND_FROM ?? "BEATRIP <onboarding@resend.dev>";

export const SITE_URL = "https://beatrip.jp";
