/**
 * Anthropic Claude API クライアントのシングルトン。
 *
 * - サーバーサイドのみで利用 (API ルート内)。client side import 禁止。
 * - API キー未設定時は `null` を返し、呼び出し側でフォールバック表示する。
 * - model は `claude-haiku-4-5` (コスト最適 / 短い回答想定)。
 */

import Anthropic from "@anthropic-ai/sdk";

let cachedClient: Anthropic | null | undefined;

/** 利用モデル. コストとレイテンシを優先。 */
export const CHAT_MODEL = "claude-haiku-4-5" as const;

/** 1 回答あたりの最大 token. 短く保つ. */
export const CHAT_MAX_TOKENS = 600 as const;

/**
 * API キー設定済みかを返す (server-only)。
 * client 側からは public env を直接見ること。
 */
export function hasAnthropicApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/**
 * Anthropic SDK クライアント。未設定なら null。
 * シングルトンとしてキャッシュ (Lambda cold start 後の再生成コスト抑制)。
 */
export function getAnthropicClient(): Anthropic | null {
  if (cachedClient !== undefined) return cachedClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    cachedClient = null;
    return null;
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}
