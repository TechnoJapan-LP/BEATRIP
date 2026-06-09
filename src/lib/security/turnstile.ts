/**
 * Cloudflare Turnstile server-side verifier.
 *
 * env:
 *   - TURNSTILE_SECRET_KEY (server only — siteverify 用)
 *
 * 未設定なら verify は { configured: false, ok: true } で「skip」扱い
 * (既存挙動の互換性維持)。
 *
 * 仕様: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

const SITEVERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileResult =
  | { configured: false; ok: true }
  | { configured: true; ok: boolean; errorCodes?: string[] };

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstileToken(
  token: string | null | undefined,
  remoteIp?: string | null
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return { configured: false, ok: true };

  if (!token || typeof token !== "string" || token.length > 2048) {
    return { configured: true, ok: false, errorCodes: ["missing-input-response"] };
  }

  const form = new URLSearchParams();
  form.set("secret", secret);
  form.set("response", token);
  if (remoteIp) form.set("remoteip", remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
      // siteverify は短時間で返るが、上流障害時に長時間ブロックしないよう保険
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return {
        configured: true,
        ok: false,
        errorCodes: [`http-${res.status}`],
      };
    }
    const json = (await res.json()) as {
      success?: boolean;
      "error-codes"?: string[];
    };
    return {
      configured: true,
      ok: Boolean(json.success),
      errorCodes: json["error-codes"],
    };
  } catch (e) {
    // ネットワーク or タイムアウト障害: fail-open は許容しない (bot 防御の意義が消える)
    return {
      configured: true,
      ok: false,
      errorCodes: [
        `fetch-error:${e instanceof Error ? e.message : "unknown"}`,
      ],
    };
  }
}
