import { createHmac, timingSafeEqual } from "crypto";
import { SITE_URL } from "@/lib/email/client";

/**
 * 価格アラート解除リンク用のHMACトークン。
 * アラートIDを秘密鍵で署名し改ざんを防ぐ。
 */
function secret(): string {
  return (
    process.env.NEWSLETTER_SECRET ??
    process.env.CRON_SECRET ??
    "beatrip-newsletter-fallback-secret"
  );
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
