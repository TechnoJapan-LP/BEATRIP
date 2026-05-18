import { Redis } from "@upstash/redis";

/**
 * 永続ストア（Redis）アダプタ
 *
 * Vercelサーバーレスは /tmp 以外への書き込みが揮発するため、Cronの
 * スクレイプ結果を永続化するには外部KVが必要。Upstash Redis (RESTベース)
 * を使う。サーバーレス/エッジで接続プール問題が起きない。
 *
 * 対応環境変数（どちらでも可）:
 *   - Vercel KV 統合:   KV_REST_API_URL / KV_REST_API_TOKEN
 *   - Upstash 直接:      UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 *
 * 未設定時は null を返し、呼び出し側はファイルシステムにフォールバックする
 * （ローカル開発・KV未導入環境では従来通り動作）。
 */

let cached: Redis | null | undefined;

export function getKV(): Redis | null {
  if (cached !== undefined) return cached;

  const url =
    process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    cached = null;
    return null;
  }

  try {
    cached = new Redis({ url, token });
  } catch (e) {
    console.warn("[KV] Failed to init Redis client:", e);
    cached = null;
  }
  return cached;
}

export function isKVEnabled(): boolean {
  return getKV() !== null;
}

// セールデータのキー設計
export const KV_KEYS = {
  sale: (code: string) => `beatrip:sales:${code.toUpperCase()}`,
  index: "beatrip:sales:index",
};
