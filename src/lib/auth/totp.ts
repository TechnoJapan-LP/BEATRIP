/**
 * TOTP (RFC 6238) — Web Crypto API ベースの最小実装。
 *
 * - 外部 npm dep ゼロ (Node / Edge / Web Workers すべてで動作)
 * - HMAC-SHA1 (Google Authenticator / Authy 互換)
 * - 30 秒 step、6 桁
 * - 検証時は ±1 step の time-window 許容 (±30 秒、合計 90 秒幅)
 *
 * Secret は base32 文字列 (RFC 4648) で受け取る。
 * (Authenticator 系アプリの標準フォーマット)
 *
 * セキュリティ注意:
 *   - 同一コードの即時再利用 (replay) は呼び出し側で記録して防ぐべきだが、
 *     本プロジェクトでは admin 1 ユーザー想定なので未実装。必要なら KV に
 *     直近成功 step を保存し reject する。
 *   - secret は env 経由で渡し、log に出さない。
 */

const STEP_SECONDS = 30;
const DIGITS = 6;
const WINDOW = 1; // ±1 step (= ±30 秒)
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** base32 → Uint8Array (RFC 4648、padding は許容) */
export function base32Decode(input: string): Uint8Array {
  const cleaned = input.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  if (!/^[A-Z2-7]*$/.test(cleaned)) {
    throw new Error("Invalid base32 character");
  }
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of cleaned) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) throw new Error("Invalid base32 character");
    buffer = (buffer << 5) | v;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

/** Uint8Array → base32 文字列 (padding 付与) */
export function base32Encode(bytes: Uint8Array): string {
  let buffer = 0;
  let bits = 0;
  let out = "";
  for (const byte of bytes) {
    buffer = (buffer << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += ALPHABET[(buffer >> bits) & 0x1f];
    }
  }
  if (bits > 0) {
    out += ALPHABET[(buffer << (5 - bits)) & 0x1f];
  }
  while (out.length % 8 !== 0) out += "=";
  return out;
}

function counterToBytes(counter: number): Uint8Array {
  // 8 バイトの big-endian カウンタ (RFC 4226)
  const buf = new Uint8Array(8);
  // JavaScript の number は 2^53 まで安全。実カウンタは Date.now()/30 で十分小さい。
  let n = counter;
  for (let i = 7; i >= 0; i--) {
    buf[i] = n & 0xff;
    n = Math.floor(n / 256);
  }
  return buf;
}

async function hotp(secret: Uint8Array, counter: number): Promise<string> {
  // Web Crypto は厳格な ArrayBuffer (not SharedArrayBuffer) を要求するため
  // 新規 ArrayBuffer に確実にコピーする。
  const secretBuf = new ArrayBuffer(secret.byteLength);
  new Uint8Array(secretBuf).set(secret);
  const key = await crypto.subtle.importKey(
    "raw",
    secretBuf,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const counterBytes = counterToBytes(counter);
  const counterBuf = new ArrayBuffer(counterBytes.byteLength);
  new Uint8Array(counterBuf).set(counterBytes);
  const sigBuf = await crypto.subtle.sign("HMAC", key, counterBuf);
  const sig = new Uint8Array(sigBuf);
  const offset = sig[sig.length - 1] & 0x0f;
  const code =
    (((sig[offset] & 0x7f) << 24) |
      ((sig[offset + 1] & 0xff) << 16) |
      ((sig[offset + 2] & 0xff) << 8) |
      (sig[offset + 3] & 0xff)) %
    10 ** DIGITS;
  return String(code).padStart(DIGITS, "0");
}

/** 現在時刻に対する TOTP を生成 (debug / setup 用) */
export async function generateTotp(secretBase32: string, now = Date.now()): Promise<string> {
  const counter = Math.floor(now / 1000 / STEP_SECONDS);
  return hotp(base32Decode(secretBase32), counter);
}

/**
 * 受信した 6 桁コードを検証する。±1 step (= ±30 秒) を許容。
 * 一致したら true、それ以外 false。
 */
export async function verifyTotp(
  secretBase32: string,
  code: string,
  now = Date.now()
): Promise<boolean> {
  if (typeof code !== "string") return false;
  const normalized = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  let secret: Uint8Array;
  try {
    secret = base32Decode(secretBase32);
  } catch {
    return false;
  }
  if (secret.length === 0) return false;
  const currentCounter = Math.floor(now / 1000 / STEP_SECONDS);
  for (let w = -WINDOW; w <= WINDOW; w++) {
    const candidate = await hotp(secret, currentCounter + w);
    if (constantTimeEqual(candidate, normalized)) return true;
  }
  return false;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * otpauth:// URL を生成 (QR コードに埋め込む用)
 *
 * 例: otpauth://totp/BEATRIP:admin?secret=XXX&issuer=BEATRIP&algorithm=SHA1&digits=6&period=30
 */
export function buildOtpAuthUrl(opts: {
  secretBase32: string;
  label?: string;
  issuer?: string;
}): string {
  const label = encodeURIComponent(opts.label ?? "admin");
  const issuer = encodeURIComponent(opts.issuer ?? "BEATRIP");
  const params = new URLSearchParams({
    secret: opts.secretBase32.replace(/=+$/g, ""),
    issuer: opts.issuer ?? "BEATRIP",
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${issuer}:${label}?${params.toString()}`;
}

/** ランダムな base32 secret を生成 (20 バイト = 160 bit、RFC 推奨) */
export function generateSecret(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
}

/**
 * 2FA セッション cookie 用の HMAC 署名付き token を生成・検証する。
 * Cookie 値は `${expMs}.${hmac}` 形式。expMs は ms epoch。
 * HMAC キーは ADMIN_API_KEY と TOTP secret を結合した値。
 */
export async function signSessionToken(
  hmacKey: string,
  expiresAtMs: number
): Promise<string> {
  const enc = new TextEncoder();
  const keyBytes = enc.encode(hmacKey);
  const keyBuf = new ArrayBuffer(keyBytes.byteLength);
  new Uint8Array(keyBuf).set(keyBytes);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuf,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const msgBytes = enc.encode(String(expiresAtMs));
  const msgBuf = new ArrayBuffer(msgBytes.byteLength);
  new Uint8Array(msgBuf).set(msgBytes);
  const sig = await crypto.subtle.sign("HMAC", key, msgBuf);
  const hex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${expiresAtMs}.${hex}`;
}

export async function verifySessionToken(
  hmacKey: string,
  token: string,
  now = Date.now()
): Promise<boolean> {
  if (typeof token !== "string") return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expStr] = parts;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < now) return false;
  const expected = await signSessionToken(hmacKey, exp);
  return constantTimeEqual(expected, token);
}
