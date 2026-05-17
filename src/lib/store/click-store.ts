import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import type { ClickEvent } from "@/data/deal-schema";

// Vercel本番では /tmp に書き込む（クリック分析はGAなど外部サービスへの移行を推奨）
const READ_DIR = join(process.cwd(), "data", "clicks");
const WRITE_DIR =
  process.env.VERCEL === "1" ? "/tmp/beatrip-clicks" : READ_DIR;

type ClickLog = {
  total_clicks: number;
  events: ClickEvent[];
};

async function ensureDir() {
  await mkdir(WRITE_DIR, { recursive: true });
}

export async function loadClicks(dealId: string): Promise<ClickLog> {
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
  try {
    await ensureDir();
    const log = await loadClicks(event.deal_id);
    log.total_clicks += 1;
    log.events.push(event);
    if (log.events.length > 500) {
      log.events = log.events.slice(-500);
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

export async function loadAllClickStats(): Promise<
  { deal_id: string; total_clicks: number }[]
> {
  const { readdir } = await import("fs/promises");
  const ids = new Set<string>();
  for (const dir of [WRITE_DIR, READ_DIR]) {
    try {
      const files = await readdir(dir);
      for (const f of files) {
        if (f.endsWith(".json")) ids.add(f.replace(".json", ""));
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
