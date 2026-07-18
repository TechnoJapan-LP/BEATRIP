import { NextResponse } from "next/server";

/**
 * 「いま本番に載っているのはどのコミットか」を返すだけの軽量エンドポイント。
 *
 * 作った理由: push 後に変更が反映されたかを確かめる手段が無く、毎回
 * 「30秒待って curl して、まだかな、もう30秒」と当てずっぽうに待っていた。
 * 待ち時間の大半はこの空振りで、1回のデプロイ確認に4〜5分かけていた。
 * SHA を突き合わせれば「反映された瞬間」が確定するので、scripts/wait-deploy.sh
 * から叩いて待つ。
 *
 * 出すのは公開リポジトリのコミットSHAとブランチ名だけで、機密は含まない。
 * (トークン・環境変数の値・内部パスの類は絶対に足さないこと)
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(
    {
      // Vercel がビルド/実行時に注入するシステム環境変数。ローカルでは undefined
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      env: process.env.VERCEL_ENV ?? "local",
      // このレスポンスを生成した時刻 (force-dynamic なので常に現在時刻)
      now: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } }
  );
}
