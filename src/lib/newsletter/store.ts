import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getKV } from "@/lib/store/kv";

/**
 * ニュースレター購読者ストア
 *
 * 本番では Upstash Redis の Set に保存（サーバーレスで永続化される）。
 * KV未設定のローカル環境ではファイルにフォールバックする。
 */

const KV_KEY = "beatrip:newsletter";

const READ_BASE = join(process.cwd(), "data");
const WRITE_BASE = process.env.VERCEL === "1" ? "/tmp/beatrip" : READ_BASE;
const FILE = join(WRITE_BASE, "newsletter.json");
const FILE_RO = join(READ_BASE, "newsletter.json");

async function readFileList(): Promise<string[]> {
  for (const p of [FILE, FILE_RO]) {
    try {
      return JSON.parse(await readFile(p, "utf-8"));
    } catch {
      // 次のパスを試す
    }
  }
  return [];
}

/** 購読者を追加。既に存在していれば false、新規追加なら true を返す。 */
export async function addSubscriber(email: string): Promise<boolean> {
  const normalized = email.trim().toLowerCase();

  const kv = getKV();
  if (kv) {
    const added = await kv.sadd(KV_KEY, normalized);
    return added === 1;
  }

  const list = await readFileList();
  if (list.includes(normalized)) return false;
  list.push(normalized);
  await mkdir(WRITE_BASE, { recursive: true });
  await writeFile(FILE, JSON.stringify(list, null, 2));
  return true;
}

export async function listSubscribers(): Promise<string[]> {
  const kv = getKV();
  if (kv) {
    return await kv.smembers(KV_KEY);
  }
  return readFileList();
}
