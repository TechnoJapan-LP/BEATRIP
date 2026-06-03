import { createHmac, timingSafeEqual } from "crypto";
import { SITE_URL } from "@/lib/email/client";

/**
 * 価格アラート解除リンク用のHMACトークン。
 * アラートIDを秘密鍵で署名し改ざんを防ぐ。
 *
 * セキュリティ: フォールバック値を持たせると署名強度がゼロになるので、
 * 環境変数未設定なら明示的に throw する。
 */
function secret(): string {
  const s = process.env.NEWSLETTER_SECRET ?? process.env.CRON_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "NEWSLETTER_SECRET or CRON_SECRET must be set (>=16 chars) for alert token signing"
    );
  }
  return s;
}

export function alertToken(id: string): string {
  return createHmac("sha256", secret()).update(id).digest("hex");
}

export function verifyAlertToken(id: string, token: string): boolean {
  const expected = alertToken(id);
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function alertCancelUrl(id: string): string {
  const i = encodeURIComponent(id);
  const t = alertToken(id);
  return `${SITE_URL}/api/price-alerts/cancel?id=${i}&t=${t}`;
}
