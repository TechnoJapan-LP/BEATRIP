import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getKV } from "@/lib/store/kv";

/**
 * SNS投稿済みのセールID台帳
 *
 * 同じセールを複数回投稿しないようプラットフォーム別に Set で保持する。
 * Redis 優先、未設定環境はファイルへフォールバック（dev用）。
 */

type Platform = "bluesky" | "threads" | "x" | "line";

const KV_KEY = (p: Platform) => `beatrip:social:posted:${p}`;

const WRITE_BASE =
  process.env.VERCEL === "1" ? "/tmp/beatrip" : join(process.cwd(), "data");
const FILE = (p: Platform) => join(WRITE_BASE, `social-posted-${p}.json`);

async function readFsList(p: Platform): Promise<string[]> {
  try {
    return JSON.parse(await readFile(FILE(p), "utf-8"));
  } catch {
    return [];
  }
}

export async function getPostedIds(platform: Platform): Promise<Set<string>> {
  const kv = getKV();
  if (kv) {
    const list = (await kv.smembers(KV_KEY(platform))) as string[] | null;
    return new Set(list ?? []);
  }
  return new Set(await readFsList(platform));
}

export async function markPosted(
  platform: Platform,
  ids: string[]
): Promise<void> {
  if (ids.length === 0) return;
  const kv = getKV();
  if (kv) {
    await kv.sadd(KV_KEY(platform), ids[0], ...ids.slice(1));
    return;
  }
  const existing = await readFsList(platform);
  const next = Array.from(new Set([...existing, ...ids]));
  await mkdir(WRITE_BASE, { recursive: true });
  await writeFile(FILE(platform), JSON.stringify(next));
}
