import { NextResponse } from "next/server";
import { getKV, KV_KEYS } from "@/lib/store/kv";

export const dynamic = "force-dynamic";

/**
 * KV接続診断（値は伏せ、キー名と接続可否のみ）
 * GET /api/sales/kv-status
 */
export async function GET() {
  // KV関連の環境変数名を列挙（値は出さない＝セキュリティ）
  const kvEnvNames = Object.keys(process.env).filter((k) =>
    /KV|UPSTASH|REDIS|STORAGE/i.test(k)
  );

  const kv = getKV();
  let pingOk = false;
  let writeReadOk = false;
  let error: string | undefined;

  if (kv) {
    try {
      await kv.set("beatrip:diag", { t: Date.now() });
      const v = await kv.get<{ t: number }>("beatrip:diag");
      writeReadOk = typeof v?.t === "number";
      pingOk = true;
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  let indexCount = 0;
  if (kv) {
    try {
      const idx = await kv.smembers(KV_KEYS.index);
      indexCount = idx.length;
    } catch {
      /* noop */
    }
  }

  return NextResponse.json({
    kvClientInitialized: kv !== null,
    kvEnvVarsPresent: kvEnvNames,
    pingOk,
    writeReadOk,
    salesIndexCount: indexCount,
    error,
  });
}
