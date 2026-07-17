import type { ChangeDetectionResult } from "@/lib/store/sale-store";
import { loadSubscriptions } from "./subscriptions";

export type NotificationPayload = {
  title: string;
  body: string;
  airlineCode: string;
  type: "new_sale" | "sale_ended" | "price_drop";
  routes?: string[];
};

function buildNotifications(change: ChangeDetectionResult): NotificationPayload[] {
  const notifications: NotificationPayload[] = [];

  for (const sale of change.newSales) {
    const routeList = sale.routes.map(
      (r) => `${r.originCode}→${r.destinationCode} ¥${r.price.toLocaleString()} (-${r.discount}%)`
    );
    notifications.push({
      title: `🆕 ${sale.airlineName} 新セール開始`,
      body: `${sale.saleName}\n${routeList.join("\n")}\n予約期限: ${sale.bookingDeadline}`,
      airlineCode: change.airlineCode,
      type: "new_sale",
      routes: sale.routes.map((r) => `${r.originCode}→${r.destinationCode}`),
    });
  }

  for (const sale of change.endedSales) {
    notifications.push({
      title: `⏰ ${sale.airlineName} セール終了`,
      body: `${sale.saleName} が終了しました`,
      airlineCode: change.airlineCode,
      type: "sale_ended",
    });
  }

  for (const pc of change.priceChanges) {
    if (pc.direction === "down") {
      notifications.push({
        title: `📉 値下げ検出: ${change.airlineCode}`,
        body: `${pc.saleName}\n${pc.routeKey}: ¥${pc.oldPrice.toLocaleString()} → ¥${pc.newPrice.toLocaleString()}`,
        airlineCode: change.airlineCode,
        type: "price_drop",
        routes: [pc.routeKey],
      });
    }
  }

  return notifications;
}

// SSRF guard: 外部 dispatch を許可するホストの allowlist。
// 動的 URL を fetch する関数では必ず通すこと。
const ALLOWED_DISPATCH_HOSTS = new Set<string>([
  "api.line.me",
  "notify-api.line.me",
  "api.twitter.com",
  "api.x.com",
  "hooks.slack.com",
  "discord.com",
  "discordapp.com",
]);

function isDispatchUrlAllowed(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:") return false;
    return ALLOWED_DISPATCH_HOSTS.has(u.hostname);
  } catch {
    return false;
  }
}

async function sendLine(webhookUrl: string, payload: NotificationPayload) {
  if (!isDispatchUrlAllowed(webhookUrl)) {
    console.warn("[Notifier] LINE webhook URL rejected by allowlist");
    return;
  }
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            type: "text",
            text: `${payload.title}\n\n${payload.body}`,
          },
        ],
      }),
    });
  } catch (e) {
    console.error(`LINE notification failed:`, e);
  }
}

export async function sendLineBroadcast(payload: NotificationPayload): Promise<boolean> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) return false;

  const dealUrl = payload.routes?.[0]
    ? `https://beatrip.jp`
    : "https://beatrip.jp";

  try {
    // fixed URL only — LINE Messaging API broadcast endpoint
    await fetch("https://api.line.me/v2/bot/message/broadcast", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: [
          {
            type: "flex",
            altText: payload.title,
            contents: {
              type: "bubble",
              header: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: "BEATRIP",
                    size: "xs",
                    color: "#999999",
                  },
                  {
                    type: "text",
                    text: payload.title,
                    weight: "bold",
                    size: "lg",
                    wrap: true,
                  },
                ],
              },
              body: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "text",
                    text: payload.body,
                    size: "sm",
                    color: "#666666",
                    wrap: true,
                  },
                ],
              },
              footer: {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "button",
                    action: {
                      type: "uri",
                      label: "セールを見る",
                      uri: dealUrl,
                    },
                    style: "primary",
                    color: "#18181B",
                  },
                ],
              },
            },
          },
        ],
      }),
    });
    return true;
  } catch (e) {
    console.error("LINE broadcast failed:", e);
    return false;
  }
}

async function sendX(webhookUrl: string, payload: NotificationPayload) {
  if (!isDispatchUrlAllowed(webhookUrl)) {
    console.warn("[Notifier] X webhook URL rejected by allowlist");
    return;
  }
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `${payload.title}\n${payload.body}`,
      }),
    });
  } catch (e) {
    console.error(`X notification failed:`, e);
  }
}

export async function dispatchNotifications(
  changes: ChangeDetectionResult[]
): Promise<{ sent: number; errors: number }> {
  const subscriptions = await loadSubscriptions();
  let sent = 0;
  let errors = 0;

  for (const change of changes) {
    if (!change.hasChanges) continue;
    const notifications = buildNotifications(change);

    for (const notification of notifications) {
      // ブロードキャスト (全友だち一斉配信) は新規セールのみ。
      // price_drop まで含めると TP 価格ウォッチの日常変動 (1スキャン数百件) が
      // そのまま全員配信になり、実際に1回のスキャンで443連投になった。
      // 大幅な急落の速報は hot-deals が閾値付きで担う。
      if (notification.type === "new_sale") {
        try {
          if (await sendLineBroadcast(notification)) sent++;
        } catch {
          errors++;
        }
      }

      const matchingSubs = subscriptions.filter((sub) => {
        if (!notification.routes) return true;
        return notification.routes.some((route) =>
          route.toLowerCase().includes(sub.route.toLowerCase()) ||
          sub.route.toLowerCase().includes(route.toLowerCase())
        );
      });

      for (const sub of matchingSubs) {
        try {
          if (sub.type === "line") {
            await sendLine(sub.webhookUrl, notification);
          } else {
            await sendX(sub.webhookUrl, notification);
          }
          sent++;
        } catch {
          errors++;
        }
      }
    }
  }

  return { sent, errors };
}
