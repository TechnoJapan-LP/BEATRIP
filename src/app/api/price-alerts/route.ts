import { NextRequest, NextResponse } from "next/server";
import { addAlert, removeAlertByEmailDeal } from "@/lib/price-alerts/store";
import {
  checkRateLimit,
  clientId,
  isHoneypotTripped,
} from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  // レート制限（IP単位、1時間に20回まで）
  const id = clientId(request);
  const limit = await checkRateLimit("priceAlerts", id);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "リクエストが多すぎます。しばらくしてからお試しください。" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((limit.reset - Date.now()) / 1000))
          ),
        },
      }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Bot対策ハニーポット
  if (isHoneypotTripped(body)) {
    return NextResponse.json({ success: true, id: "ok" });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const dealId = typeof body.dealId === "string" ? body.dealId : "";
  const routeKey = typeof body.routeKey === "string" ? body.routeKey : "";
  const threshold = Number(body.threshold);

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "有効なメールアドレスを入力してください" },
      { status: 400 }
    );
  }
  if (!dealId || !routeKey || !Number.isFinite(threshold) || threshold <= 0) {
    return NextResponse.json({ error: "入力が不正です" }, { status: 400 });
  }

  // routeKey "NRT→BKK" を分解
  const [originCode, destinationCode] = routeKey.split("→");
  if (!originCode || !destinationCode) {
    return NextResponse.json({ error: "路線が不正です" }, { status: 400 });
  }

  try {
    const alert = await addAlert({
      email,
      routeKey,
      originCode,
      destinationCode,
      threshold: Math.round(threshold),
      dealId,
    });
    return NextResponse.json({ success: true, id: alert.id });
  } catch (e) {
    console.error("[price-alerts] 保存に失敗:", e);
    return NextResponse.json(
      { error: "登録に失敗しました。もう一度お試しください。" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const email = sp.get("email");
  const dealId = sp.get("dealId");
  if (!email || !dealId) {
    return NextResponse.json(
      { error: "email and dealId required" },
      { status: 400 }
    );
  }
  try {
    await removeAlertByEmailDeal(email, dealId);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[price-alerts] 削除に失敗:", e);
    return NextResponse.json({ error: "削除に失敗しました" }, { status: 500 });
  }
}
