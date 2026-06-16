import { NextRequest, NextResponse } from "next/server";
import { postTestTweet } from "@/lib/social/x";

/**
 * X (旧Twitter) 認証＆投稿のスモークテスト用エンドポイント
 *
 * 認証: CRON_SECRET（既存の管理APIと共通）
 * 動作: 1回限りの確認ツイートを投稿し、結果を返す
 * 用途: X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_SECRET が
 *       正しく設定され、アプリ権限が Read and Write かを即確認するため
 *
 * 推奨: 設定直後の手動チェックのみ。連打しないこと (投稿が積もる + API上限)。
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await postTestTweet();
  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error ?? "failed" },
      { status: result.error === "X_* env が未設定" ? 400 : 500 }
    );
  }
  return NextResponse.json({
    success: true,
    tip: "X のプロフィールでテスト投稿を確認してください",
  });
}
