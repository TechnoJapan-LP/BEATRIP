import { getResend, MAIL_FROM as FROM, SITE_URL as SITE } from "@/lib/email/client";
import { getAirportByCode } from "@/data/airports";
import { alertCancelUrl } from "./token";
import { formatPrice } from "@/lib/format";

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


/**
 * メール内リンクに UTM を付与。utm_source=price_alert / utm_medium=email 固定。
 * 内部ランディング (deal / route / esim / insurance / hotels) に付与し、
 * GA4 で価格アラートメール経由の流入とコンバージョンを計測できるようにする。
 */
function withUtm(path: string, campaign: string): string {
  const sep = path.includes("?") ? "&" : "?";
  return `${SITE}${path}${sep}utm_source=price_alert&utm_medium=email&utm_campaign=${campaign}`;
}

/**
 * 目的地が海外か (= 日本の空港リストに無い) を判定。
 * 海外 → eSIM / 海外旅行保険、国内 → 国内ホテルを上位に出し分ける (文脈マッチング)。
 */
function isOverseasDestination(destinationCode: string): boolean {
  return getAirportByCode(destinationCode) === undefined;
}

/** メール下部のアフィリエイト誘導ブロック (UTM 付き)。 */
function affiliateBlock(m: AlertMatch): string {
  const overseas = isOverseasDestination(m.destinationCode);

  // 文脈マッチング: 海外なら eSIM + 海外旅行保険、国内なら国内ホテル。
  const items = overseas
    ? [
        {
          href: withUtm("/esim", "alert_esim"),
          title: "現地で使える eSIM を比較",
          desc: "海外でもアプリだけでネット接続。空港 Wi-Fi 不要に。",
        },
        {
          href: withUtm("/insurance", "alert_insurance"),
          title: "海外旅行保険を比較",
          desc: "出発当日まで申込可。ネット完結で割安に。",
        },
      ]
    : [
        {
          href: withUtm("/hotels", "alert_hotel"),
          title: "目的地のホテルを比較",
          desc: "複数サイトの料金をまとめて比較し最安値を見つける。",
        },
      ];

  const rows = items
    .map(
      (it) => `
        <a href="${it.href}" style="display:block;text-decoration:none;border:1px solid #e4e4e7;border-radius:10px;padding:12px 14px;margin:0 0 8px">
          <span style="display:block;font-size:13px;font-weight:bold;color:#18181b">${it.title} →</span>
          <span style="display:block;font-size:12px;color:#71717a;margin-top:2px">${it.desc}</span>
        </a>`
    )
    .join("");

  return `
      <div style="margin:24px 0 0">
        <p style="font-size:11px;font-weight:bold;letter-spacing:.05em;text-transform:uppercase;color:#a1a1aa;margin:0 0 10px">
          この旅行の準備に
        </p>
        ${rows}
      </div>`;
}

function html(m: AlertMatch): string {
  const cancel = alertCancelUrl(m.alertId);
  const dealUrl = withUtm(`/deals/${encodeURIComponent(m.dealId)}`, "alert_deal");
  const routeUrl = withUtm(
    `/routes/${m.originCode}-${m.destinationCode}`,
    "alert_route"
  );
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
              <td style="font-size:13px;color:#3f3f46;text-align:right;padding:4px 0">¥${formatPrice(m.threshold)} 以下</td></tr>
          <tr><td style="font-size:13px;color:#71717a;padding:4px 0">現在の最安値</td>
              <td style="font-size:18px;color:#e11d48;font-weight:bold;text-align:right;padding:4px 0">¥${formatPrice(m.price)}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:0 0 8px">
        <a href="${dealUrl}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 28px;border-radius:10px">
          今が底値 — 予約に進む
        </a>
      </div>
      <p style="font-size:11px;color:#71717a;text-align:center;margin:6px 0 0">
        価格は変動します。空席が埋まる前にお早めにご確認ください。
      </p>
      <p style="font-size:12px;color:#a1a1aa;text-align:center;margin:8px 0 0">
        <a href="${routeUrl}" style="color:#a1a1aa">この路線の全セールを見る</a>
      </p>
      ${affiliateBlock(m)}
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
      subject: `【BEATRIP】${m.routeKey} が¥${formatPrice(m.price)}に — 価格アラート`,
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
