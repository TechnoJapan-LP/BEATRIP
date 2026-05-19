import { NextRequest, NextResponse } from "next/server";
import { removeSubscriber } from "@/lib/newsletter/store";
import { verifyUnsubscribeToken } from "@/lib/newsletter/token";

function page(title: string, body: string, status: number) {
  return new NextResponse(
    `<!doctype html><html lang="ja"><head><meta charset="utf-8">
     <meta name="viewport" content="width=device-width,initial-scale=1">
     <title>${title} | BEATRIP</title></head>
     <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#fafafa;color:#18181b;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0">
       <div style="max-width:420px;text-align:center;padding:40px 24px">
         <h1 style="font-size:20px;letter-spacing:.05em;margin:0 0 16px">BEATRIP</h1>
         <p style="font-size:15px;line-height:1.7;color:#3f3f46;margin:0 0 24px">${body}</p>
         <a href="https://beatrip.jp" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:10px">サイトへ戻る</a>
       </div>
     </body></html>`,
    {
      status,
      headers: { "content-type": "text/html; charset=utf-8" },
    }
  );
}

async function handle(email: string | null, token: string | null) {
  if (!email || !token || !verifyUnsubscribeToken(email, token)) {
    return page(
      "リンクが無効です",
      "配信停止リンクが無効か、有効期限が切れています。お手数ですが最新のメールのリンクからお試しください。",
      400
    );
  }

  try {
    await removeSubscriber(email);
  } catch (e) {
    console.error("[newsletter] 配信停止に失敗:", e);
    return page(
      "エラー",
      "処理中にエラーが発生しました。しばらくしてからもう一度お試しください。",
      500
    );
  }

  return page(
    "配信を停止しました",
    "セール通知メールの配信を停止しました。またのご利用をお待ちしています。",
    200
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return handle(sp.get("e"), sp.get("t"));
}

// メールクライアントのワンクリック配信停止（List-Unsubscribe-Post）対応
export async function POST(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return handle(sp.get("e"), sp.get("t"));
}
