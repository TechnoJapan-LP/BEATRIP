/**
 * IndexNow — 新規/更新 URL を Bing 系検索エンジンへ即時通知する。
 *
 * 対象は Bing とそのインデックスを使う検索面 (Microsoft Copilot、
 * ChatGPT search 等)。Google と、Google のエンジンを使う Yahoo! JAPAN には
 * 効果が無い (そちらは sitemap + 通常クロール)。
 * GA4 で copilot.com / openai 経由の流入が観測されており、セール情報は
 * 鮮度が価値なので、検出から掲載までの遅延を Bing 側だけでも潰す。
 *
 * キーは「自サイトの URL を提出できる」だけの公開値で、サイトルートに
 * 平文で置く仕様のため秘匿情報ではない (public/{key}.txt と対で管理)。
 */

const INDEXNOW_KEY = "ab56d851241e5c9218bcbbf1e510b773";
const HOST = "beatrip.jp";
const ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * パス配列 (例: ["/airlines/PCH/sales", "/"]) を IndexNow に送信する。
 * cron から呼ばれる前提で、失敗しても throw しない (本処理を止めない)。
 */
export async function submitToIndexNow(
  paths: string[]
): Promise<{ submitted: number; ok: boolean; error?: string }> {
  const urlList = [...new Set(paths)]
    .filter((p) => p.startsWith("/"))
    .slice(0, 100)
    .map((p) => `https://${HOST}${p}`);
  if (urlList.length === 0) return { submitted: 0, ok: true };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(5000),
      cache: "no-store",
    });
    // 200/202 = 受理。それ以外はエラー内容を summary で観測できるよう返す
    return {
      submitted: urlList.length,
      ok: res.ok,
      ...(res.ok ? {} : { error: `HTTP ${res.status}` }),
    };
  } catch (e) {
    return {
      submitted: urlList.length,
      ok: false,
      error: e instanceof Error ? e.message : "unknown",
    };
  }
}
