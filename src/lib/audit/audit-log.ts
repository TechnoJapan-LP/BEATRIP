/**
 * 監査ログ (audit log) — admin 操作の追跡用。
 *
 * - KV key: `beatrip:audit:{YYYY-MM-DD}` に List として push
 * - 1 日あたり最大 10000 件保持 (LTRIM で古いものから削除)
 * - 30 日で自動 expire (容量爆発防止)
 * - KV 未設定時は console.warn + no-op (fail-open: 監査ログのため
 *   主処理を阻害しない)
 *
 * PII 観点:
 *   - IP は下位 octet をマスクして保存
 *   - User-Agent は先頭 120 字でトリム
 *   - email は domain part のみ
 */
import { getKV } from "@/lib/store/kv";

const KEY_PREFIX = "beatrip:audit:";
const MAX_ENTRIES_PER_DAY = 10000;
const TTL_SECONDS = 30 * 24 * 60 * 60;

export type AuditEntry = {
  timestamp: string;
  ip_masked: string;
  user_agent: string;
  action: string;
  target: string;
  metadata?: Record<string, string | number | boolean | null>;
};

function todayKey(): string {
  const d = new Date();
  return `${KEY_PREFIX}${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

/** IPv4: 末尾 octet を 0 に / IPv6: 末尾 64bit を ::0 に */
export function maskIp(ip: string | null | undefined): string {
  if (!ip) return "unknown";
  const trimmed = ip.split(",")[0]?.trim() ?? "";
  if (!trimmed) return "unknown";
  if (trimmed.includes(":")) {
    // IPv6
    const parts = trimmed.split(":");
    if (parts.length >= 4) return `${parts.slice(0, 4).join(":")}::0`;
    return "ipv6";
  }
  const parts = trimmed.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
  }
  return "unknown";
}

/** Request からクライアント IP を抽出 (Vercel/Cloudflare 互換) */
export function extractIp(req: Request): string {
  const h = req.headers;
  return (
    h.get("cf-connecting-ip") ??
    h.get("x-real-ip") ??
    h.get("x-forwarded-for") ??
    ""
  );
}

/**
 * 監査ログ 1 件を非同期に記録する。失敗しても呼び出し元には throw しない。
 */
export async function writeAuditLog(
  req: Request | null,
  entry: Pick<AuditEntry, "action" | "target"> &
    Partial<Pick<AuditEntry, "metadata">>
): Promise<void> {
  const kv = getKV();
  const record: AuditEntry = {
    timestamp: new Date().toISOString(),
    ip_masked: maskIp(req ? extractIp(req) : null),
    user_agent: (req?.headers.get("user-agent") ?? "").slice(0, 120),
    action: entry.action.slice(0, 64),
    target: entry.target.slice(0, 256),
    metadata: entry.metadata,
  };
  if (!kv) {
    console.warn("[audit]", JSON.stringify(record));
    return;
  }
  try {
    const key = todayKey();
    await kv.lpush(key, JSON.stringify(record));
    // 1 日あたり最大件数を超えないように先頭 (新しい順) を残して切り捨て
    await kv.ltrim(key, 0, MAX_ENTRIES_PER_DAY - 1);
    await kv.expire(key, TTL_SECONDS);
  } catch (e) {
    console.warn("[audit] write failed:", e);
  }
}

/**
 * 直近 N 日分の監査ログを新しい順で取得する (admin 表示用)。
 * limit を超えたら打ち切り。
 */
export async function listRecentAuditLogs(
  limit = 20,
  days = 7
): Promise<AuditEntry[]> {
  const kv = getKV();
  if (!kv) return [];
  const out: AuditEntry[] = [];
  const today = new Date();
  for (let i = 0; i < days && out.length < limit; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = `${KEY_PREFIX}${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    try {
      const remaining = limit - out.length;
      // lpush で新しい順に積んでいるので 0..remaining-1 が新しい順
      const items = await kv.lrange<string>(key, 0, remaining - 1);
      for (const raw of items) {
        try {
          // Upstash client は JSON 自動デコードする場合があるため両対応
          const parsed =
            typeof raw === "string" ? (JSON.parse(raw) as AuditEntry) : (raw as AuditEntry);
          out.push(parsed);
          if (out.length >= limit) break;
        } catch {
          /* skip malformed */
        }
      }
    } catch (e) {
      console.warn("[audit] list failed:", e);
    }
  }
  return out;
}
