import { NextRequest, NextResponse } from "next/server";
import { AtpAgent, RichText } from "@atproto/api";

/**
 * Bluesky 認証＆投稿のスモークテスト用エンドポイント
 *
 * 認証: CRON_SECRET（既存の管理APIと共通）
 * 動作: 1回限りの確認メッセージを Bluesky に投稿し、結果を返す
 * 用途: BLUESKY_HANDLE / BLUESKY_APP_PASSWORD が正しいか即確認するため
 *
 * 推奨利用: 設定直後の手動チェックのみ。安全に何度叩いてもOKだが、
 * 投稿が積もるので連打しないこと。
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const handle = process.env.BLUESKY_HANDLE;
  const password = process.env.BLUESKY_APP_PASSWORD;
  if (!handle || !password) {
    return NextResponse.json(
      {
        success: false,
        error: "BLUESKY_HANDLE / BLUESKY_APP_PASSWORD が未設定",
      },
      { status: 400 }
    );
  }

  try {
    const agent = new AtpAgent({ service: "https://bsky.social" });
    await agent.login({ identifier: handle, password });

    const text = `BEATRIP の自動投稿テストです 🛫\n航空券セール情報を毎日お届けします。\nhttps://beatrip.jp\n#BEATRIP #格安航空券`;
    const rt = new RichText({ text });
    await rt.detectFacets(agent);
    const res = await agent.post({
      text: rt.text,
      facets: rt.facets,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      uri: res.uri,
      handle,
      tip: `https://bsky.app/profile/${handle}`,
    });
  } catch (e) {
    // 実装詳細やヒントを外部に返さない（サーバ側ログに留める）
    console.error("[bluesky/test] login or post failed:", e);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication or post failed",
      },
      { status: 500 }
    );
  }
}
