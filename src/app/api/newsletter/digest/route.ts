import { NextRequest, NextResponse } from "next/server";
import { listSubscribers } from "@/lib/newsletter/store";
import { generateWeeklyDigest } from "@/lib/newsletter/digest-generator";
import { unsubscribeUrl } from "@/lib/newsletter/token";
import { getResend, MAIL_FROM as FROM } from "@/lib/email/client";
import { getKV } from "@/lib/store/kv";

/**
 * Weekly digest 配信エンドポイント (Wave 3-C3)
 *
 * 認証: `Authorization: Bearer ${ADMIN_API_KEY}` または同等の Bearer ${CRON_SECRET}
 *  - Vercel Cron (vercel.json) からの呼び出しは Bearer ${CRON_SECRET}
 *  - 管理画面手動送信は Bearer ${ADMIN_API_KEY}
 *
 * クエリ:
 *  - ?dryRun=1  ... 送信せず subject/html/text を JSON で返す (preview)
 *  - ?preview=html ... HTML 本文を直接返す (admin で iframe プレビュー用途)
 *  - ?force=1   ... 同日に既に送信済みの記録があっても送信する (緊急再送)
 *
 * 重複防止: KV `beatrip:newsletter:sent:{YYYY-MM-DD}` に送信件数を記録。
 */

const DAY_MS = 24 * 60 * 60 * 1000;
const SENT_KEY_PREFIX = "beatrip:newsletter:sent:";
// 在庫上限 (1 リクエストで配信する最大件数 — DoS / 課金事故ガード)
const MAX_RECIPIENTS_PER_RUN = 5000;

function isAuthorized(req: NextRequest): boolean {
  const adminKey = process.env.ADMIN_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const header = req.headers.get("authorization") ?? "";
  if (adminKey && header === `Bearer ${adminKey}`) return true;
  if (cronSecret && header === `Bearer ${cronSecret}`) return true;
  // Vercel Cron は `x-vercel-cron` ヘッダを付ける (検証用に許容)
  if (cronSecret && req.headers.get("x-vercel-cron") === "1") return true;
  // ?token=ADMIN_API_KEY クエリ認証 (HTML プレビュー用 — Bearer header を付けられない
  // ブラウザの新規タブ open リンク向け)。admin ページの referrer:no-referrer 設定で
  // Referer 漏れは防止済。token を URL に含めるリスクは admin 内に限定。
  if (adminKey && req.nextUrl.searchParams.get("token") === adminKey) return true;
  return false;
}

function today(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** マスク (admin レスポンス用) */
function maskEmail(e: string): string {
  return e.replace(/(.{2}).*(@.*)/, "$1***$2");
}

async function getSentRecord(date: string): Promise<number | null> {
  const kv = getKV();
  if (!kv) return null;
  try {
    return (await kv.get<number>(`${SENT_KEY_PREFIX}${date}`)) ?? null;
  } catch (e) {
    console.warn("[digest] sent record get failed:", e);
    return null;
  }
}

async function setSentRecord(date: string, count: number): Promise<void> {
  const kv = getKV();
  if (!kv) return;
  try {
    // 14 日で expire (履歴肥大防止)
    await kv.set(`${SENT_KEY_PREFIX}${date}`, count, {
      ex: 14 * 24 * 60 * 60,
    });
  } catch (e) {
    console.warn("[digest] sent record set failed:", e);
  }
}

async function handle(req: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const dryRun = sp.get("dryRun") === "1";
  const previewHtml = sp.get("preview") === "html";
  const force = sp.get("force") === "1";

  const startedAt = Date.now();
  const date = today();

  let payload;
  try {
    payload = await generateWeeklyDigest();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error("[digest] generation failed:", e);
    return NextResponse.json(
      { success: false, error: `Digest generation failed: ${msg}` },
      { status: 500 }
    );
  }

  // preview=html: ブラウザで直接プレビュー (admin で iframe にも使える)
  if (previewHtml) {
    const sample = "preview@example.com";
    let html: string;
    try {
      html = payload.html(sample);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      // NEWSLETTER_SECRET 未設定で unsubscribe url が throw する可能性あり
      html = `<pre style="padding:24px;font-family:monospace">${msg}\n\n${payload.text}</pre>`;
    }
    return new NextResponse(html, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  if (dryRun) {
    // 配信せず、本文情報のみ返す (admin プレビュー用途)
    let sampleHtml: string | null = null;
    try {
      sampleHtml = payload.html("preview@example.com");
    } catch {
      sampleHtml = null;
    }
    let subscribersCount = 0;
    try {
      subscribersCount = (await listSubscribers()).length;
    } catch {
      /* ignore */
    }
    return NextResponse.json({
      success: true,
      dryRun: true,
      subject: payload.subject,
      meta: payload.meta,
      subscribersCount,
      text: payload.text,
      sampleHtml,
    });
  }

  // 同日送信のガード (force=1 で上書き可)
  const alreadySent = await getSentRecord(date);
  if (alreadySent !== null && !force) {
    return NextResponse.json({
      success: true,
      skipped: "already_sent_today",
      date,
      previouslySent: alreadySent,
    });
  }

  // 購読者取得
  let subscribers: string[] = [];
  try {
    subscribers = await listSubscribers();
  } catch (e) {
    console.error("[digest] listSubscribers failed:", e);
    return NextResponse.json(
      { success: false, error: "subscribers fetch failed" },
      { status: 500 }
    );
  }

  if (subscribers.length === 0) {
    return NextResponse.json({
      success: true,
      sent: 0,
      skipped: "no_subscribers",
      meta: payload.meta,
    });
  }

  if (subscribers.length > MAX_RECIPIENTS_PER_RUN) {
    return NextResponse.json(
      {
        success: false,
        error: `recipients exceed safety cap (${subscribers.length} > ${MAX_RECIPIENTS_PER_RUN})`,
      },
      { status: 413 }
    );
  }

  const resend = getResend();
  if (!resend) {
    // RESEND_API_KEY 未設定: build/local では skip して 200 を返す
    return NextResponse.json({
      success: true,
      sent: 0,
      skipped: "resend_not_configured",
      subscribers: subscribers.length,
      meta: payload.meta,
    });
  }

  let sent = 0;
  const errors: string[] = [];

  // Resend batch は 100 件まで → chunked send
  for (let i = 0; i < subscribers.length; i += 100) {
    const chunk = subscribers.slice(i, i + 100);
    const batch = chunk.map((email) => {
      // unsubscribe URL 生成は NEWSLETTER_SECRET 必須 (throw する可能性あり)
      let body: string;
      let unsub: string | null = null;
      try {
        body = payload.html(email);
        unsub = unsubscribeUrl(email);
      } catch (e) {
        // secret 未設定 → このリクエスト全体を fail にする (途中まで送ると恒久的に重複送信になる)
        throw new Error(
          `unsubscribe token generation failed: ${e instanceof Error ? e.message : "unknown"}`
        );
      }
      return {
        from: FROM,
        to: email,
        subject: payload.subject,
        html: body,
        text: payload.text,
        headers: {
          "List-Unsubscribe": `<${unsub}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      };
    });

    try {
      await resend.batch.send(batch);
      sent += chunk.length;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "unknown";
      console.error("[digest] batch send failed:", msg);
      errors.push(`chunk ${i}: ${msg}`);
    }
  }

  if (sent > 0) {
    await setSentRecord(date, sent);
  }

  const elapsed = Date.now() - startedAt;
  return NextResponse.json({
    success: errors.length === 0,
    sent,
    failedChunks: errors.length,
    errors: errors.slice(0, 5),
    subscribers: subscribers.length,
    sample: subscribers.slice(0, 3).map(maskEmail),
    date,
    meta: payload.meta,
    elapsed: `${elapsed}ms`,
  });
}

export async function GET(req: NextRequest) {
  // Vercel Cron は GET で叩く (path だけ schedule に書く)
  return handle(req);
}

export async function POST(req: NextRequest) {
  // 管理画面・curl 経由の手動送信
  return handle(req);
}

// 大量配信時の関数タイムアウト余裕を確保 (vercel.json 側でも調整)
export const maxDuration = 60;
// 重複送信を防ぐためエッジキャッシュさせない (Cache-Control は headers 設定でも no-store)
export const dynamic = "force-dynamic";
// 参照: DAY_MS は将来日次集計拡張で使う想定 (現状は date キーで日別管理)
void DAY_MS;
