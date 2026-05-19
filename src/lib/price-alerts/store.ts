import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { getKV } from "@/lib/store/kv";

/**
 * 価格アラート ストア
 *
 * 本番は Upstash Redis、KV未設定のローカルはファイルにフォールバック。
 * Cron が全件走査して現在価格と照合するため、全件を1キーに保持する。
 */

export type PriceAlert = {
  id: string;
  email: string;
  routeKey: string; // 例: "NRT→BKK"
  originCode: string;
  destinationCode: string;
  threshold: number;
  dealId: string;
  createdAt: string;
};

const KV_KEY = "beatrip:pricealerts";
const MAX_ALERTS = 5000;

const WRITE_BASE =
  process.env.VERCEL === "1" ? "/tmp/beatrip" : join(process.cwd(), "data");
const FILE = join(WRITE_BASE, "price-alerts.json");

async function readFileList(): Promise<PriceAlert[]> {
  try {
    return JSON.parse(await readFile(FILE, "utf-8"));
  } catch {
    return [];
  }
}

async function writeAll(list: PriceAlert[]): Promise<void> {
  const kv = getKV();
  if (kv) {
    await kv.set(KV_KEY, list);
    return;
  }
  await mkdir(WRITE_BASE, { recursive: true });
  await writeFile(FILE, JSON.stringify(list));
}

export async function listAlerts(): Promise<PriceAlert[]> {
  const kv = getKV();
  if (kv) {
    return (await kv.get<PriceAlert[]>(KV_KEY)) ?? [];
  }
  return readFileList();
}

/**
 * アラートを追加。同一 email × dealId は上書き（しきい値の付け替え）。
 * 作成された/更新されたアラートを返す。
 */
export async function addAlert(
  input: Omit<PriceAlert, "id" | "createdAt">
): Promise<PriceAlert> {
  const list = await listAlerts();
  const email = input.email.trim().toLowerCase();
  const filtered = list.filter(
    (a) => !(a.email === email && a.dealId === input.dealId)
  );
  const alert: PriceAlert = {
    ...input,
    email,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  filtered.push(alert);
  await writeAll(filtered.slice(-MAX_ALERTS));
  return alert;
}

export async function removeAlertById(id: string): Promise<boolean> {
  const list = await listAlerts();
  const next = list.filter((a) => a.id !== id);
  if (next.length === list.length) return false;
  await writeAll(next);
  return true;
}

export async function removeAlertsByIds(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const idSet = new Set(ids);
  const list = await listAlerts();
  await writeAll(list.filter((a) => !idSet.has(a.id)));
}

export async function removeAlertByEmailDeal(
  email: string,
  dealId: string
): Promise<boolean> {
  const norm = email.trim().toLowerCase();
  const list = await listAlerts();
  const next = list.filter(
    (a) => !(a.email === norm && a.dealId === dealId)
  );
  if (next.length === list.length) return false;
  await writeAll(next);
  return true;
}
