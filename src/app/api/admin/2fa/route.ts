import { NextRequest, NextResponse } from "next/server";
import { verifyTotp, signSessionToken } from "@/lib/auth/totp";
import { writeAuditLog } from "@/lib/audit/audit-log";

/**
 * /api/admin/2fa — TOTP コード検証 + 2FA セッション cookie 発行
 *
 * 認証フロー:
 *   1. POST { token: ADMIN_API_KEY, code: "123456" }
 *   2. ADMIN_TOTP_SECRET と code を検証
 *   3. 成功 → cookie `beatrip_admin_2fa` を 10 分有効で Set-Cookie
 *
 * 失敗時は 401 を返す。監査ログには success / failure 双方を記録。
 */

const COOKIE_NAME = "beatrip_admin_2fa";
const TTL_MS = 10 * 60 * 1000; // 10 分

export async function POST(req: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  const totpSecret = process.env.ADMIN_TOTP_SECRET;

  if (!adminKey || !totpSecret) {
    return NextResponse.json(
      { error: "2FA not configured" },
      { status: 503 }
    );
  }

  let body: { token?: unknown; code?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (body.token !== adminKey) {
    await writeAuditLog(req, {
      action: "admin.2fa.fail",
      target: "/api/admin/2fa",
      metadata: { reason: "bad_admin_key" },
    });
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const ok = await verifyTotp(totpSecret, String(body.code ?? ""));
  if (!ok) {
    await writeAuditLog(req, {
      action: "admin.2fa.fail",
      target: "/api/admin/2fa",
      metadata: { reason: "bad_code" },
    });
    return NextResponse.json({ error: "invalid code" }, { status: 401 });
  }

  const expiresAt = Date.now() + TTL_MS;
  // HMAC キーは ADMIN_API_KEY + TOTP secret を結合 (key rotation で cookie 失効)
  const sessionToken = await signSessionToken(
    `${adminKey}:${totpSecret}`,
    expiresAt
  );

  await writeAuditLog(req, {
    action: "admin.2fa.success",
    target: "/api/admin/2fa",
  });

  const res = NextResponse.json({ success: true, expiresAt });
  res.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: Math.floor(TTL_MS / 1000),
  });
  return res;
}

export const dynamic = "force-dynamic";
