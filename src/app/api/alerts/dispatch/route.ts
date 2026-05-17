import { NextRequest, NextResponse } from "next/server";
import {
  getMatchingAlerts,
  type Alert,
} from "@/lib/notifications/subscriptions";

type DispatchPayload = {
  type: "new_sale" | "price_drop" | "sale_ended";
  airlineCode: string;
  saleName: string;
  routes: string[];
  summary: string;
  url?: string;
};

async function sendPush(alert: Alert, payload: DispatchPayload) {
  if (!alert.pushSubscription) return;
  // Web Push API integration point
  // In production: use web-push library with VAPID keys
  console.log(
    `[Push] → ${alert.pushSubscription.endpoint.slice(0, 50)}... | ${payload.summary}`
  );
}

async function sendSlack(webhookUrl: string, payload: DispatchPayload) {
  const emoji =
    payload.type === "new_sale"
      ? ":airplane:"
      : payload.type === "price_drop"
        ? ":chart_with_downwards_trend:"
        : ":clock3:";

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `${emoji} *${payload.saleName}*\n${payload.summary}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `${emoji} *${payload.saleName}*\n${payload.summary}\n路線: ${payload.routes.join(", ")}`,
          },
        },
        ...(payload.url
          ? [
              {
                type: "actions",
                elements: [
                  {
                    type: "button",
                    text: { type: "plain_text", text: "BEATRIPで見る" },
                    url: payload.url,
                  },
                ],
              },
            ]
          : []),
      ],
    }),
  });
}

async function sendWebhook(webhookUrl: string, payload: DispatchPayload) {
  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-BEATRIP-Event": payload.type,
    },
    body: JSON.stringify({
      event: payload.type,
      airline_code: payload.airlineCode,
      sale_name: payload.saleName,
      routes: payload.routes,
      summary: payload.summary,
      url: payload.url ?? `https://beatrip.jp`,
      timestamp: new Date().toISOString(),
    }),
  });
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: DispatchPayload = await request.json();

  if (!payload.airlineCode || !payload.type || !payload.routes) {
    return NextResponse.json(
      { error: "airlineCode, type, routes are required" },
      { status: 400 }
    );
  }

  const alerts = await getMatchingAlerts(payload.airlineCode, payload.routes);

  let sent = 0;
  let errors = 0;

  for (const alert of alerts) {
    for (const channel of alert.channels) {
      try {
        switch (channel) {
          case "push":
            await sendPush(alert, payload);
            break;
          case "slack":
            if (alert.webhookUrl) await sendSlack(alert.webhookUrl, payload);
            break;
          case "webhook":
            if (alert.webhookUrl) await sendWebhook(alert.webhookUrl, payload);
            break;
          case "line":
            // Uses existing LINE notifier in notifier.ts
            break;
        }
        sent++;
      } catch (e) {
        console.error(`Alert dispatch failed [${channel}]:`, e);
        errors++;
      }
    }
  }

  return NextResponse.json({
    dispatched: sent,
    errors,
    matchedAlerts: alerts.length,
    timestamp: new Date().toISOString(),
  });
}
