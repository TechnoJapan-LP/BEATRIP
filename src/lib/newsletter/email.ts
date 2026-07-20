import type { AirlineSale } from "@/lib/scrapers/types";
import { unsubscribeUrl } from "./token";
import { getResend, MAIL_FROM as FROM, SITE_URL as SITE } from "@/lib/email/client";
import { formatPrice } from "@/lib/format";

export async function sendWelcomeEmail(to: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("[newsletter] RESEND_API_KEY 未設定のためメール送信をスキップ");
    return;
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: "BEATRIP セール通知の登録が完了しました",
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#18181b">
        <h1 style="font-size:20px;letter-spacing:.05em;margin:0 0 16px">BEATRIP</h1>
        <p style="font-size:15px;line-height:1.7;margin:0 0 16px">
          ご登録ありがとうございます。<br>
          航空会社のセール開始を、いち早くメールでお知らせします。
        </p>
        <p style="font-size:15px;line-height:1.7;margin:0 0 24px">
          最安値のタイミングを逃さず、おトクな旅を。
        </p>
        <a href="${SITE}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 24px;border-radius:10px">
          今のセールを見る
        </a>
        <p style="font-size:11px;color:#a1a1aa;margin:32px 0 0">
          このメールに心当たりがない場合は破棄してください。配信停止は今後のメール内のリンクから行えます。
        </p>
      </div>
    `,
  });
}


function saleRowsHtml(sales: AirlineSale[]): string {
  return sales
    .map((sale) => {
      const routes = sale.routes
        .slice(0, 4)
        .map(
          (r) =>
            `<tr>
              <td style="padding:4px 0;font-size:13px;color:#3f3f46">${r.originCode} → ${r.destinationCode}</td>
              <td style="padding:4px 0;font-size:13px;color:#18181b;font-weight:bold;text-align:right">¥${formatPrice(r.price)} <span style="color:#e11d48">(-${r.discount}%)</span></td>
            </tr>`
        )
        .join("");
      const more =
        sale.routes.length > 4
          ? `<p style="font-size:12px;color:#a1a1aa;margin:6px 0 0">ほか ${sale.routes.length - 4} 路線</p>`
          : "";
      return `
        <div style="border:1px solid #e4e4e7;border-radius:12px;padding:18px;margin:0 0 14px">
          <p style="font-size:12px;color:#71717a;margin:0 0 4px">${sale.airlineName}</p>
          <h3 style="font-size:16px;color:#18181b;margin:0 0 10px">${sale.saleName}</h3>
          <table style="width:100%;border-collapse:collapse">${routes}</table>
          ${more}
          <p style="font-size:12px;color:#71717a;margin:10px 0 0">予約期限: ${sale.bookingDeadline || "—"}</p>
        </div>`;
    })
    .join("");
}

function digestHtml(sales: AirlineSale[], email: string): string {
  const unsub = unsubscribeUrl(email);
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#18181b;background:#fff">
      <h1 style="font-size:20px;letter-spacing:.05em;margin:0 0 4px">BEATRIP</h1>
      <p style="font-size:14px;color:#71717a;margin:0 0 24px">新着フライトセールのお知らせ</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 20px">
        新しいセールが <strong>${sales.length}件</strong> 始まりました。最安値のタイミングを逃さずチェックしてください。
      </p>
      ${saleRowsHtml(sales)}
      <div style="text-align:center;margin:24px 0 8px">
        <a href="${SITE}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:10px">
          すべてのセールを見る
        </a>
      </div>
      <p style="font-size:11px;color:#a1a1aa;line-height:1.6;margin:28px 0 0;border-top:1px solid #f4f4f5;padding-top:16px">
        掲載価格は取得時点のものです。最新価格・空席は各航空会社の公式サイトでご確認ください。<br>
        このメールの配信を停止する場合は
        <a href="${unsub}" style="color:#a1a1aa">こちら</a>。
      </p>
    </div>`;
}

/**
 * 新着セールのまとめメールを全購読者へ配信。
 * Resend の batch API で最大100件ずつ送信。受信者ごとに
 * 配信停止リンクを埋め込み、List-Unsubscribe ヘッダも付与。
 * 送信できた件数を返す（RESEND_API_KEY 未設定や購読者ゼロなら 0）。
 */
export async function sendSaleDigest(
  subscribers: string[],
  sales: AirlineSale[]
): Promise<number> {
  const resend = getResend();
  if (!resend) {
    console.warn("[newsletter] RESEND_API_KEY 未設定のため digest をスキップ");
    return 0;
  }
  if (subscribers.length === 0 || sales.length === 0) return 0;

  const subject = `【BEATRIP】新着セール ${sales.length}件 — 最安値を見逃さないで`;
  let sent = 0;

  for (let i = 0; i < subscribers.length; i += 100) {
    const chunk = subscribers.slice(i, i + 100);
    const batch = chunk.map((email) => ({
      from: FROM,
      to: email,
      subject,
      html: digestHtml(sales, email),
      headers: {
        "List-Unsubscribe": `<${unsubscribeUrl(email)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }));

    try {
      await resend.batch.send(batch);
      sent += chunk.length;
    } catch (e) {
      console.error("[newsletter] digest バッチ送信に失敗:", e);
    }
  }

  return sent;
}
