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

/**
 * 直近の投稿結果 (プラットフォーム別)。
 *
 * 作った理由: 投稿の失敗は console.error に出るだけで、外から一切見えなかった。
 * health は xConfigured / blueskyConfigured を返すが、これは **env の有無**しか
 * 見ておらず「認証は通るが残高ゼロで 402」のような状態を検知できない。
 * サイトは「検出すると X と Bluesky に即速報します」と説明しているので、
 * 黙って失敗し続けるのは利用者への説明と食い違う。
 *
 * 保持するのは件数と直近のエラー文言だけで、投稿本文や認証情報は入れない。
 */
export type PostOutcome = {
  at: string;
  attempted: number;
  succeeded: number;
  lastError?: string;
};

const OUTCOME_KEY = (p: Platform) => `beatrip:social:outcome:${p}`;

export async function recordPostOutcome(
  platform: Platform,
  outcome: PostOutcome
): Promise<void> {
  const kv = getKV();
  if (!kv) return; // dev (KV 無し) では記録しない。観測用途のため落とさない
  try {
    await kv.set(OUTCOME_KEY(platform), outcome);
  } catch {
    // 記録の失敗で本処理を巻き込まない
  }
}

export async function loadPostOutcome(
  platform: Platform
): Promise<PostOutcome | null> {
  const kv = getKV();
  if (!kv) return null;
  try {
    return (await kv.get<PostOutcome>(OUTCOME_KEY(platform))) ?? null;
  } catch {
    return null;
  }
}
