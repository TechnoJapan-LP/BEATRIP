import type { AirlineSale } from "@/lib/scrapers/types";
import { unsubscribeUrl } from "./token";
import { getResend, MAIL_FROM as FROM, SITE_URL as SITE } from "@/lib/email/client";
import { formatPrice } from "@/lib/format";
import { cityNameJa } from "@/lib/airport-names";

/**
 * 受信箱の件名の下に出るプレビュー文。開封率に効く数少ないレバーのひとつ。
 * 本文先頭に不可視で埋め込む (メールクライアントの標準的な手法)。
 */
function preheaderHtml(text: string): string {
  return `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${text}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>`;
}

/** 全セール横断の最安路線。件名に具体的な数字を出すために使う */
function cheapestRoute(
  sales: AirlineSale[]
): { airlineName: string; origin: string; dest: string; price: number } | null {
  let best: { airlineName: string; origin: string; dest: string; price: number } | null =
    null;
  for (const sale of sales) {
    for (const r of sale.routes) {
      if (r.price > 0 && (!best || r.price < best.price)) {
        best = {
          airlineName: sale.airlineName,
          origin: cityNameJa(r.originCode),
          dest: cityNameJa(r.destinationCode),
          price: r.price,
        };
      }
    }
  }
  return best;
}

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
      ${preheaderHtml("いま開催中のセールと、各社の次回セール予測はこちら")}
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#18181b">
        <h1 style="font-size:20px;letter-spacing:.05em;margin:0 0 16px">BEATRIP</h1>
        <p style="font-size:15px;line-height:1.7;margin:0 0 16px">
          ご登録ありがとうございます。<br>
          新しい航空券セールが始まったら、まとめてメールでお届けします
          (新着が貯まったタイミングで配信・多くても週1回)。
        </p>
        <a href="${SITE}" style="display:inline-block;background:#18181b;color:#fff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 24px;border-radius:10px">
          いま開催中のセールを見る
        </a>
        <p style="font-size:13px;color:#71717a;line-height:1.8;margin:24px 0 0">
          次のセールを待つ間に — 各社の開催実績と次回予測:<br>
          <a href="${SITE}/airlines/PCH/sales" style="color:#18181b">ピーチ</a> ·
          <a href="${SITE}/airlines/BC/sales" style="color:#18181b">スカイマーク</a> ·
          <a href="${SITE}/airlines/ZG/sales" style="color:#18181b">ZIPAIR</a> ·
          <a href="${SITE}/sale-calendar" style="color:#18181b">全社カレンダー</a>
        </p>
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
          <p style="font-size:12px;color:#71717a;margin:10px 0 0">
            予約期限: ${sale.bookingDeadline || "—"}
            <a href="${SITE}/airlines/${sale.airlineCode}/sales" style="color:#71717a;margin-left:10px">${sale.airlineName}のセール傾向 →</a>
          </p>
        </div>`;
    })
    .join("");
}

function digestHtml(sales: AirlineSale[], email: string): string {
  const unsub = unsubscribeUrl(email);
  // 全件並べると流し読みで終わる。割引率の高い順に5件へ絞り、残りはサイトへ
  // 誘導する (メールは「開く価値の証明」、詳細はサイトで見せる)
  const top = [...sales]
    .sort(
      (a, b) =>
        Math.max(...b.routes.map((r) => r.discount), 0) -
        Math.max(...a.routes.map((r) => r.discount), 0)
    )
    .slice(0, 5);
  const rest = sales.length - top.length;
  const best = cheapestRoute(sales);
  return `
    ${preheaderHtml(
      best
        ? `${best.airlineName} ${best.origin}→${best.dest} ¥${formatPrice(best.price)}〜 ほか`
        : "新着セールの一覧はこちら"
    )}
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#18181b;background:#fff">
      <h1 style="font-size:20px;letter-spacing:.05em;margin:0 0 4px">BEATRIP</h1>
      <p style="font-size:14px;color:#71717a;margin:0 0 24px">新着フライトセールのお知らせ</p>
      <p style="font-size:15px;line-height:1.7;margin:0 0 20px">
        新しいセールが <strong>${sales.length}件</strong> 始まりました。割引率の高い順にお届けします。タイムセールは数時間〜数日で終わることがあります。
      </p>
      ${saleRowsHtml(top)}
      ${rest > 0 ? `<p style="font-size:13px;color:#71717a;margin:0 0 8px">ほか ${rest} 件のセールはサイトでご覧いただけます。</p>` : ""}
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

  // 件名は抽象語 (「見逃さないで」) より具体的な数字が開封される。
  // 実測の最安路線をそのまま出す
  const best = cheapestRoute(sales);
  const subject = best
    ? `【BEATRIP】${best.airlineName} ${best.origin}→${best.dest} ¥${formatPrice(best.price)}〜 ほか新着${sales.length}件`
    : `【BEATRIP】新着セール ${sales.length}件`;
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
