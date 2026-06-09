/**
 * User-Agent ベースの簡易 bot 検出。
 *
 * 目的: アフィリエイトクリック計測の不正カウント (bot / scraper / HTTP CLI)
 * を排除し、ASP からのコミッション凍結リスクを下げる。
 *
 * 限界: UA は容易に偽装可能なので「ザル」レベル。本格的な不正対策は
 * Cloudflare Turnstile / hCaptcha 等を別途導入する必要がある。
 * ここでは「明らかに人間ではないトラフィック」のみブロックする。
 */

const BOT_UA_PATTERNS: RegExp[] = [
  // 一般的な検索エンジン / クローラー
  /bot/i,
  /spider/i,
  /crawler/i,
  /slurp/i,
  /scrapy/i,
  // ヘッドレスブラウザ / 自動化フレームワーク
  /headless/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  // HTTP CLI / SDK
  /\bcurl\b/i,
  /\bwget\b/i,
  /python-requests/i,
  /python-urllib/i,
  /go-http-client/i,
  /node-fetch/i,
  /axios\//i,
  /okhttp/i,
  /java\//i,
  /libwww-perl/i,
  /ruby/i,
];

/**
 * 与えられた User-Agent が bot / 自動化ツール由来かを判定する。
 *
 * - `null` / 空文字 / 極端に短い文字列は bot とみなす
 *   (実ブラウザは必ず "Mozilla/5.0 ..." で始まる長文)
 * - パターンに 1 つでもマッチすれば bot
 */
export function isLikelyBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  const ua = userAgent.trim();
  if (ua.length < 5) return true;
  return BOT_UA_PATTERNS.some((p) => p.test(ua));
}
