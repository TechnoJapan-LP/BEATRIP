/**
 * クリックトラッキング用 Turnstile token のクライアント側ストア。
 *
 * - TurnstileWidget を 1 度マウントしておけば onToken でここに保存される
 * - sendBeacon / fetch で /api/clicks を叩く直前に取得して body に含める
 * - token はワンタイムなので、使用後は invalidate (= null クリア) → widget
 *   を reset する。本実装では一度取得した token を 1 回だけ使い、その後は
 *   widget が再 execute して新 token を発行するまで null。
 *
 * 環境変数 NEXT_PUBLIC_TURNSTILE_SITE_KEY 未設定なら getToken() は常に "" を返す。
 */

let currentToken: string | null = null;
let onConsumeCb: (() => void) | null = null;

export function setTurnstileToken(token: string): void {
  currentToken = token;
}

/** クリック直前に呼ぶ。返却した token は invalidate される。 */
export function consumeTurnstileToken(): string {
  const t = currentToken ?? "";
  currentToken = null;
  // 次回 click 用に widget を再 execute するため callback を発火
  if (onConsumeCb) {
    try { onConsumeCb(); } catch { /* noop */ }
  }
  return t;
}

/** 同サイト内で 1 度だけ呼ぶ — widget の reset を委譲 */
export function onTurnstileConsume(cb: () => void): void {
  onConsumeCb = cb;
}

export function isTurnstileEnabled(): boolean {
  return Boolean(
    typeof process !== "undefined" &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  );
}
