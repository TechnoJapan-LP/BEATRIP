import { createHmac, timingSafeEqual } from "crypto";

/**
 * 配信停止リンク用のHMACトークン。
 * メールアドレスを秘密鍵で署名し、改ざん・総当たりを防ぐ。
 * 秘密鍵は NEWSLETTER_SECRET → CRON_SECRET の順で解決。
 *
 * セキュリティ: 予測可能なフォールバック値を許容すると署名そのものが
 * 無意味になるため、いずれの環境変数も未設定なら明示的に throw する。
 */
function secret(): string {
  const s = process.env.NEWSLETTER_SECRET ?? process.env.CRON_SECRET;
  if (!s || s.length < 16) {
    throw new Error(
      "NEWSLETTER_SECRET or CRON_SECRET must be set (>=16 chars) for unsubscribe token signing"
    );
  }
  return s;
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret())
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function verifyUnsubscribeToken(
  email: string,
  token: string
): boolean {
  const expected = unsubscribeToken(email);
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function unsubscribeUrl(email: string): string {
  const base = "https://beatrip.jp";
  const e = encodeURIComponent(email.trim().toLowerCase());
  const t = unsubscribeToken(email);
  return `${base}/api/newsletter/unsubscribe?e=${e}&t=${t}`;
}
