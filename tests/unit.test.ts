/**
 * 純粋ロジックの単体テスト (node:test / 実行は `npm test`)。
 *
 * 対象は外部依存の無い関数に限定し、ネットワークは fetch のモックで代替する。
 * ここにあるのは「過去に実際に壊れた・壊れかけた」箇所の回帰テスト:
 *  - RSS 定型ノイズが画面に漏れた (2026-07-30 /airlines/SJO)
 *  - ロケールリライトでボトムナビの active が全滅した (2026-07-30)
 *  - IndexNow / スクレイパーの一時故障がスキャン全体を落とすリスク
 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { cleanScrapedDescription } from "../src/lib/scrapers/clean-description";
import { stripLocale } from "../src/lib/i18n/strip-locale";
import { submitToIndexNow } from "../src/lib/seo/indexnow";
import { AirlineScraper } from "../src/lib/scrapers/scraper-base";
import type { AirlineSale, ScrapeSource } from "../src/lib/scrapers/types";

// ---------------------------------------------------------------- clean-description

describe("cleanScrapedDescription", () => {
  test("Traicy RSS の日本語フッターを除去する (本番で実際に表示された文言)", () => {
    const input =
      "スプリング・ジャパンは、「スプリングフェア」を7月1日から21日まで開催している。 " +
      "空港施設使用料や諸税は別途必要。 […] 投稿 スプリング・ジャパン、「スプリングフェア」開催 " +
      "は TRAICY（トライシー） に最初に表示されました。";
    const out = cleanScrapedDescription(input);
    assert.ok(!out.includes("TRAICY"));
    assert.ok(!out.includes("最初に表示されました"));
    assert.ok(out.includes("スプリングフェア"));
    assert.ok(out.endsWith("…"));
  });

  test("英語版 WordPress フッター (The post ... appeared first on) を除去する", () => {
    const out = cleanScrapedDescription(
      "Sale info here. The post Some Title appeared first on TRAICY."
    );
    assert.equal(out, "Sale info here.");
  });

  test("[&hellip;] 実体参照のバリアントも除去する", () => {
    const out = cleanScrapedDescription(
      "本文です。 [&hellip;] 投稿 X は TRAICY に最初に表示されました。"
    );
    assert.equal(out, "本文です。…");
  });

  test("ノイズが無い文はそのまま返す", () => {
    assert.equal(cleanScrapedDescription("普通の説明文です。"), "普通の説明文です。");
  });
});

// ---------------------------------------------------------------- strip-locale

describe("stripLocale", () => {
  test("本番の内部パス /ja/... からロケールを剥がす", () => {
    assert.equal(stripLocale("/ja/airlines/BC/sales"), "/airlines/BC/sales");
  });
  test("/en プレフィックスも剥がす", () => {
    assert.equal(stripLocale("/en/deals"), "/deals");
  });
  test("ロケール単体はルートになる", () => {
    assert.equal(stripLocale("/ja"), "/");
  });
  test("dev の素のパスは変更しない", () => {
    assert.equal(stripLocale("/airlines/BC/sales"), "/airlines/BC/sales");
  });
  test("/japan のような偽プレフィックスは剥がさない", () => {
    assert.equal(stripLocale("/japan/foo"), "/japan/foo");
  });
});

// ---------------------------------------------------------------- indexnow

describe("submitToIndexNow (fetch をモック)", () => {
  const realFetch = globalThis.fetch;

  test("202 Accepted で ok:true・URL は https 絶対形に組み立てられる", async (t) => {
    let captured: { url: string; body: string } | null = null;
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      captured = { url: String(url), body: String(init?.body) };
      return new Response("", { status: 202 });
    }) as typeof fetch;
    t.after(() => (globalThis.fetch = realFetch));

    const res = await submitToIndexNow(["/airlines/PCH/sales", "/", "/airlines/PCH/sales"]);
    assert.deepEqual(res, { submitted: 2, ok: true }); // 重複は除去される
    assert.ok(captured);
    const body = JSON.parse(captured!.body);
    assert.equal(body.host, "beatrip.jp");
    assert.deepEqual(body.urlList, [
      "https://beatrip.jp/airlines/PCH/sales",
      "https://beatrip.jp/",
    ]);
  });

  test("HTTP 500 でも throw せず ok:false とエラー内容を返す (cron を止めない)", async (t) => {
    globalThis.fetch = (async () => new Response("", { status: 500 })) as typeof fetch;
    t.after(() => (globalThis.fetch = realFetch));
    const res = await submitToIndexNow(["/x"]);
    assert.equal(res.ok, false);
    assert.equal(res.error, "HTTP 500");
  });

  test("ネットワーク断でも throw しない", async (t) => {
    globalThis.fetch = (async () => {
      throw new Error("ECONNRESET");
    }) as typeof fetch;
    t.after(() => (globalThis.fetch = realFetch));
    const res = await submitToIndexNow(["/x"]);
    assert.equal(res.ok, false);
    assert.equal(res.error, "ECONNRESET");
  });

  test("スラッシュ始まり以外のパスは弾き、空なら送信しない", async (t) => {
    let called = 0;
    globalThis.fetch = (async () => {
      called++;
      return new Response("", { status: 202 });
    }) as typeof fetch;
    t.after(() => (globalThis.fetch = realFetch));
    const res = await submitToIndexNow(["javascript:alert(1)", "https://evil.example/"]);
    assert.deepEqual(res, { submitted: 0, ok: true });
    assert.equal(called, 0);
  });
});

// ---------------------------------------------------------------- fetchHtml リトライ

class TestScraper extends AirlineScraper {
  constructor() {
    super("TEST", [] as ScrapeSource[]);
  }
  protected async fetchSales(): Promise<AirlineSale[]> {
    return [];
  }
  // protected メソッドをテストから叩くための公開ラッパー
  fetchHtmlPublic(url: string, timeoutMs?: number) {
    return this.fetchHtml(url, timeoutMs);
  }
}

describe("AirlineScraper.fetchHtml のリトライ (fetch をモック)", () => {
  const realFetch = globalThis.fetch;

  test("一時的なネットワーク断は1回リトライして成功する", async (t) => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      if (calls === 1) throw new TypeError("fetch failed"); // 1回目: 瞬断
      return new Response("<html>ok</html>", { status: 200 });
    }) as typeof fetch;
    t.after(() => (globalThis.fetch = realFetch));

    const html = await new TestScraper().fetchHtmlPublic("https://example.com/rss");
    assert.equal(html, "<html>ok</html>");
    assert.equal(calls, 2);
  });

  test("5xx も一時故障としてリトライする", async (t) => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      return calls === 1
        ? new Response("", { status: 503 })
        : new Response("recovered", { status: 200 });
    }) as typeof fetch;
    t.after(() => (globalThis.fetch = realFetch));

    const html = await new TestScraper().fetchHtmlPublic("https://example.com/rss");
    assert.equal(html, "recovered");
    assert.equal(calls, 2);
  });

  test("404 は恒久エラーとしてリトライしない (fetch は1回だけ)", async (t) => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      return new Response("", { status: 404 });
    }) as typeof fetch;
    t.after(() => (globalThis.fetch = realFetch));

    await assert.rejects(
      () => new TestScraper().fetchHtmlPublic("https://example.com/gone"),
      /HTTP 404/
    );
    assert.equal(calls, 1);
  });

  test("2回連続で失敗したら諦めてエラーを伝播する", async (t) => {
    let calls = 0;
    globalThis.fetch = (async () => {
      calls++;
      throw new TypeError("fetch failed");
    }) as typeof fetch;
    t.after(() => (globalThis.fetch = realFetch));

    await assert.rejects(() =>
      new TestScraper().fetchHtmlPublic("https://example.com/down")
    );
    assert.equal(calls, 2);
  });
});
