import { getResend, MAIL_FROM as FROM, SITE_URL as SITE } from "@/lib/email/client";
import { alertCancelUrl } from "./token";

export type AlertMatch = {
  alertId: string;
  email: string;
  routeKey: string;
  originCode: string;
  destinationCode: string;
  threshold: number;
  price: number;
  dealId: string;
};

function yen(n: number): string {
  return new Intl.NumberFormat("ja-JP").format(n);
}

function html(m: AlertMatch): string {
  const cancel = alertCancelUrl(m.alertId);
  const dealUrl = `${SITE}/deals/${encodeURIComponent(m.dealId)}`;
  const routeUrl = `${SITE}/routes/${m.originCode}-${m.destinationCode}`;
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#18181b;background:#fff">
      <h1 style="font-size:20px;letter-spacing:.05em;margin:0 0 4px">BEATRIP</h1>
      <p style="font-size:14px;color:#71717a;margin:0 0 24px">価格アラート</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 12px">
        <strong>${m.routeKey}</strong> が設定価格を下回りました。
      </p>
      <div style="border:1px solid #e4e4e7;border-radius:12px;padding:18px;margin:0 0 20px">
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="font-size:13px;color:#71717a;padding:4px 0">設定価格</td>
              <td style="font-size:13px;color:#3f3f46;text-align:right;padding:4px 0">¥${yen(m.threshold)} 以下</td></tr>
          <tr><td style="font-size:13px;color:#71717a;padding:4px 0">現在の最安値</td>
              <td style="font-size:18px;color:#e11d48;font-weight:bold;text-align:right;padding:4px 0">¥${yen(m.price)}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:0 0 8px">
        <a href="${dealUrl}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:10px">
          このディールを見る
        </a>
      </div>
      <p style="font-size:12px;color:#a1a1aa;text-align:center;margin:8px 0 0">
        <a href="${routeUrl}" style="color:#a1a1aa">この路線の全セールを見る</a>
      </p>
      <p style="font-size:11px;color:#a1a1aa;line-height:1.6;margin:28px 0 0;border-top:1px solid #f4f4f5;padding-top:16px">
        掲載価格は取得時点のものです。空席状況により実際の価格と異なる場合があります。ご予約前に各航空会社の公式サイトでご確認ください。<br>
        このアラートを解除する場合は <a href="${cancel}" style="color:#a1a1aa">こちら</a>。
      </p>
    </div>`;
}

/**
 * 価格アラート通知を該当ユーザーへ送信。
 * Resend batch で最大100件ずつ。送信できた match を返す（呼び出し側で削除）。
 */
export async function sendPriceAlertEmails(
  matches: AlertMatch[]
): Promise<AlertMatch[]> {
  const resend = getResend();
  if (!resend) {
    console.warn("[price-alerts] RESEND_API_KEY 未設定のため送信スキップ");
    return [];
  }
  if (matches.length === 0) return [];

  const delivered: AlertMatch[] = [];
  for (let i = 0; i < matches.length; i += 100) {
    const chunk = matches.slice(i, i + 100);
    const batch = chunk.map((m) => ({
      from: FROM,
      to: m.email,
      subject: `【BEATRIP】${m.routeKey} が¥${yen(m.price)}に — 価格アラート`,
      html: html(m),
      headers: {
        "List-Unsubscribe": `<${alertCancelUrl(m.alertId)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    }));
    try {
      await resend.batch.send(batch);
      delivered.push(...chunk);
    } catch (e) {
      console.error("[price-alerts] バッチ送信に失敗:", e);
    }
  }
  return delivered;
}
