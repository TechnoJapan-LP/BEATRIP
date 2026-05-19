import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getKV } from "@/lib/store/kv";
import type { AirlineSale } from "@/lib/scrapers/types";

/**
 * 週次ダイジェストの状態管理
 *
 * - pending: 前回配信以降に検出した新着セールを累積（持ち越し）
 * - lastDigestAt: 最後にダイジェストを配信した時刻（ms epoch）
 *
 * 配信条件: 前回配信から7日以上経過 かつ pending が3件超（=4件以上）。
 * 条件未達なら pending を保持し続け、翌週以降に持ち越す。
 *
 * 本番は Upstash Redis、KV未設定のローカルはファイルにフォールバック。
 */

const PENDING_KEY = "beatrip:newsletter:pending";
const LAST_KEY = "beatrip:newsletter:lastDigestAt";

const WRITE_BASE = process.env.VERCEL === "1" ? "/tmp/beatrip" : join(process.cwd(), "data");
const PENDING_FILE = join(WRITE_BASE, "newsletter-pending.json");
const LAST_FILE = join(WRITE_BASE, "newsletter-last-digest.json");

// 累積上限（メール肥大・ストレージ肥大の防止）
const MAX_PENDING = 60;

type FileState = { sales: AirlineSale[]; lastDigestAt: number | null };

async function readFileState(): Promise<FileState> {
  let sales: AirlineSale[] = [];
  let lastDigestAt: number | null = null;
  try {
    sales = JSON.parse(await readFile(PENDING_FILE, "utf-8"));
  } catch {
    /* none */
  }
  try {
    lastDigestAt = JSON.parse(await readFile(LAST_FILE, "utf-8")).lastDigestAt;
  } catch {
    /* none */
  }
  return { sales, lastDigestAt };
}

async function writeFilePending(sales: AirlineSale[]): Promise<void> {
  await mkdir(WRITE_BASE, { recursive: true });
  await writeFile(PENDING_FILE, JSON.stringify(sales));
}

async function writeFileLast(lastDigestAt: number | null): Promise<void> {
  await mkdir(WRITE_BASE, { recursive: true });
  await writeFile(LAST_FILE, JSON.stringify({ lastDigestAt }));
}

export async function getPendingSales(): Promise<AirlineSale[]> {
  const kv = getKV();
  if (kv) {
    return (await kv.get<AirlineSale[]>(PENDING_KEY)) ?? [];
  }
  return (await readFileState()).sales;
}

export async function getLastDigestAt(): Promise<number | null> {
  const kv = getKV();
  if (kv) {
    return (await kv.get<number>(LAST_KEY)) ?? null;
  }
  return (await readFileState()).lastDigestAt;
}

/** 新着セールを pending に追加（sale.id で重複排除、上限あり）。 */
export async function appendPendingSales(
  sales: AirlineSale[]
): Promise<void> {
  if (sales.length === 0) return;
  const current = await getPendingSales();
  const seen = new Set(current.map((s) => s.id));
  const merged = [...current];
  for (const s of sales) {
    if (!seen.has(s.id)) {
      seen.add(s.id);
      merged.push(s);
    }
  }
  const trimmed = merged.slice(-MAX_PENDING);

  const kv = getKV();
  if (kv) {
    await kv.set(PENDING_KEY, trimmed);
  } else {
    await writeFilePending(trimmed);
  }
}

/** 配信完了を記録: lastDigestAt を更新し pending をクリア。 */
export async function markDigestSent(now: number): Promise<void> {
  const kv = getKV();
  if (kv) {
    await kv.set(LAST_KEY, now);
    await kv.set(PENDING_KEY, []);
  } else {
    await writeFileLast(now);
    await writeFilePending([]);
  }
}

/** 初回のみ: lastDigestAt 未設定なら now でアンカー（週次の起点を確立）。 */
export async function ensureAnchor(now: number): Promise<boolean> {
  const last = await getLastDigestAt();
  if (last !== null) return false;
  const kv = getKV();
  if (kv) {
    await kv.set(LAST_KEY, now);
  } else {
    await writeFileLast(now);
  }
  return true;
}

// 週次間隔。日次Cronの実行時刻ゆらぎを吸収するため7日からやや短く取る。
export const MIN_DIGEST_INTERVAL_MS = 6.5 * 24 * 60 * 60 * 1000;
export const DIGEST_MIN_SALES = 3; // これを「超える」= 4件以上で配信
