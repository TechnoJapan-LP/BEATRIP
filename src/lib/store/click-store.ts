import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { ClickEvent } from "@/data/deal-schema";
import { getKV } from "./kv";

/**
 * クリック計測ストア
 *
 * KV (Upstash Redis) が有効ならそちらを優先。クリック数は INCR (atomic) で
 * 加算するため、並列リクエスト下でも read-modify-write race condition が発生
 * しない。直近イベントは LPUSH + LTRIM で固定長リストとして保持。
 *
 * KV 未設定時は従来通り JSON ファイル (Vercel 本番は /tmp) にフォールバック。
 * FS パスは並列書き込み時のロストカウントが残るが、開発用途のため許容する。
 */

// Vercel本番では /tmp に書き込む（クリック分析はGAなど外部サービスへの移行を推奨）
const READ_DIR = join(process.cwd(), "data", "clicks");
const WRITE_DIR =
  process.env.VERCEL === "1" ? "/tmp/beatrip-clicks" : READ_DIR;

// deal_id 用 allowlist。a-z A-Z 0-9 と `-` `_` のみ、最大 64 文字。
// パストラバーサル (../) / 絶対パス (/) / NULバイト等を完全に排除する。
const DEAL_ID_RE = /^[a-zA-Z0-9_-]{1,64}$/;

export function isValidDealId(id: unknown): id is string {
  return typeof id === "string" && DEAL_ID_RE.test(id);
}

const KV_EVENT_LIMIT = 500;

function kvCountKey(dealId: string): string {
  return `beatrip:clicks:count:${dealId}`;
}
function kvEventsKey(dealId: string): string {
  return `beatrip:clicks:events:${dealId}`;
}
const KV_INDEX_KEY = "beatrip:clicks:index";

type ClickLog = {
  total_clicks: number;
  events: ClickEvent[];
};

async function ensureDir() {
  await mkdir(WRITE_DIR, { recursive: true });
}

function parseEventList(raw: (ClickEvent | string)[] | null): ClickEvent[] {
  if (!raw) return [];
  return raw
    .map((e) => {
      if (typeof e !== "string") return e;
      try {
        return JSON.parse(e) as ClickEvent;
      } catch {
        return null;
      }
    })
    .filter((e): e is ClickEvent => e !== null);
}

async function loadClicksFromKV(dealId: string): Promise<ClickLog | null> {
  const kv = getKV();
  if (!kv) return null;
  try {
    const [countRaw, eventsRaw] = await Promise.all([
      kv.get<number | string>(kvCountKey(dealId)),
      kv.lrange<ClickEvent | string>(
        kvEventsKey(dealId),
        0,
        KV_EVENT_LIMIT - 1
      ),
    ]);
    const total =
      typeof countRaw === "string" ? parseInt(countRaw, 10) : countRaw ?? 0;
    return {
      total_clicks: Number.isFinite(total) ? Number(total) : 0,
      events: parseEventList(eventsRaw),
    };
  } catch (e) {
    console.warn("[ClickStore] KV load failed:", e);
    return null;
  }
}

export async function loadClicks(dealId: string): Promise<ClickLog> {
  // 内部からの呼び出しでも必ず deal_id を検証 (defense-in-depth)
  if (!isValidDealId(dealId)) {
    return { total_clicks: 0, events: [] };
  }

  // 1) KV を優先
  const kvLog = await loadClicksFromKV(dealId);
  if (kvLog) return kvLog;

  // 2) FS フォールバック
  for (const dir of [WRITE_DIR, READ_DIR]) {
    try {
      const raw = await readFile(join(dir, `${dealId}.json`), "utf-8");
      return JSON.parse(raw);
    } catch {
      // フォールバック
    }
  }
  return { total_clicks: 0, events: [] };
}

export async function recordClick(event: ClickEvent): Promise<ClickLog> {
  // route 側で検証済みでも、内部関数として fallback validation を入れる
  if (!isValidDealId(event.deal_id)) {
    console.warn("[ClickStore] Rejected invalid deal_id");
    return { total_clicks: 0, events: [] };
  }

  // 1) KV: INCR + LPUSH/LTRIM の atomic 系で race condition を排除
  const kv = getKV();
  if (kv) {
    try {
      const countKey = kvCountKey(event.deal_id);
      const eventsKey = kvEventsKey(event.deal_id);
      // INCR は単独で atomic。LPUSH と LTRIM はカウンタとは独立に進めるが、
      // 仮に LPUSH が失敗してもカウンタの整合性は崩れない (count > events.length
      // となる可能性のみ。集計には影響しない)。
      const [total] = await Promise.all([
        kv.incr(countKey),
        kv.lpush(eventsKey, JSON.stringify(event)),
        kv.sadd(KV_INDEX_KEY, event.deal_id),
      ]);
      await kv.ltrim(eventsKey, 0, KV_EVENT_LIMIT - 1);
      const eventsRaw = await kv.lrange<ClickEvent | string>(
        eventsKey,
        0,
        KV_EVENT_LIMIT - 1
      );
      return {
        total_clicks: total,
        events: parseEventList(eventsRaw),
      };
    } catch (e) {
      console.warn(
        "[ClickStore] KV recordClick failed, falling back to FS:",
        e
      );
      // fall through to FS
    }
  }

  // 2) FS フォールバック (開発用途; 並列書き込みでロストカウントの可能性あり)
  try {
    await ensureDir();
    const log = await loadClicks(event.deal_id);
    log.total_clicks += 1;
    log.events.push(event);
    if (log.events.length > KV_EVENT_LIMIT) {
      log.events = log.events.slice(-KV_EVENT_LIMIT);
    }
    await writeFile(
      join(WRITE_DIR, `${event.deal_id}.json`),
      JSON.stringify(log, null, 2)
    );
    return log;
  } catch (e) {
    console.warn("[ClickStore] Failed to record click:", e);
    return { total_clicks: 0, events: [] };
  }
}

/**
 * 直近 24 時間以内に発生した click 数を返す。
 *
 * 内訳:
 *   - events リスト (最大 KV_EVENT_LIMIT 件) のうち timestamp が
 *     now - 24h 以降のものをカウント。
 *   - events リストが空 / 古い場合は 0 を返す。
 *
 * KV / FS どちらでも loadClicks を経由するので両対応。
 * 社会的証明バッジ (「本日 N 人がチェック」) 用。
 */
export async function loadTodayClicks(dealId: string): Promise<number> {
  if (!isValidDealId(dealId)) return 0;
  const log = await loadClicks(dealId);
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  let count = 0;
  for (const ev of log.events) {
    const ts = new Date(ev.timestamp).getTime();
    if (Number.isFinite(ts) && ts >= cutoff) count++;
  }
  return count;
}

export async function loadAllClickStats(): Promise<
  { deal_id: string; total_clicks: number }[]
> {
  const ids = new Set<string>();

  // 1) KV index から ID を集める
  const kv = getKV();
  if (kv) {
    try {
      const members = (await kv.smembers(KV_INDEX_KEY)) ?? [];
      for (const m of members) {
        const id = String(m);
        if (isValidDealId(id)) ids.add(id);
      }
    } catch (e) {
      console.warn("[ClickStore] KV smembers failed:", e);
    }
  }

  // 2) FS 上の ID も拾う (KV 移行前データ / FS フォールバック)
  const { readdir } = await import("fs/promises");
  for (const dir of [WRITE_DIR, READ_DIR]) {
    try {
      const files = await readdir(dir);
      for (const f of files) {
        if (!f.endsWith(".json")) continue;
        const id = f.replace(".json", "");
        // ディスク上に過去の混入があっても許容しない
        if (isValidDealId(id)) ids.add(id);
      }
    } catch {
      // ディレクトリなし
    }
  }

  const stats: { deal_id: string; total_clicks: number }[] = [];
  for (const dealId of ids) {
    const log = await loadClicks(dealId);
    stats.push({ deal_id: dealId, total_clicks: log.total_clicks });
  }
  return stats;
}
