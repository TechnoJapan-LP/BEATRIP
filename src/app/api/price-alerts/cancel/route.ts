import { NextRequest, NextResponse } from "next/server";
import { removeAlertById } from "@/lib/price-alerts/store";
import { verifyAlertToken } from "@/lib/price-alerts/token";

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
    { status, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

async function handle(id: string | null, token: string | null) {
  if (!id || !token || !verifyAlertToken(id, token)) {
    return page(
      "リンクが無効です",
      "解除リンクが無効か、有効期限が切れています。",
      400
    );
  }
  try {
    await removeAlertById(id);
  } catch (e) {
    console.error("[price-alerts] 解除に失敗:", e);
    return page(
      "エラー",
      "処理中にエラーが発生しました。しばらくしてからお試しください。",
      500
    );
  }
  return page(
    "アラートを解除しました",
    "価格アラートを解除しました。",
    200
  );
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return handle(sp.get("id"), sp.get("t"));
}

export async function POST(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  return handle(sp.get("id"), sp.get("t"));
}
