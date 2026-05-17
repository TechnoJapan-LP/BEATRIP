import { NextRequest, NextResponse } from "next/server";
import {
  loadAlerts,
  addAlert,
  removeAlert,
  type AlertChannel,
} from "@/lib/notifications/subscriptions";

export async function GET() {
  const alerts = await loadAlerts();
  return NextResponse.json({ alerts, count: alerts.length });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { target, targetType, channels, pushSubscription, webhookUrl } = body;

  if (!target || !targetType || !channels) {
    return NextResponse.json(
      { error: "target, targetType, channels are required" },
      { status: 400 }
    );
  }

  if (targetType !== "route" && targetType !== "airline") {
    return NextResponse.json(
      { error: "targetType must be 'route' or 'airline'" },
      { status: 400 }
    );
  }

  const validChannels: AlertChannel[] = ["push", "line", "slack", "webhook"];
  const channelList = channels as AlertChannel[];
  if (!channelList.every((c: AlertChannel) => validChannels.includes(c))) {
    return NextResponse.json(
      { error: `channels must be: ${validChannels.join(", ")}` },
      { status: 400 }
    );
  }

  if (channelList.includes("push") && !pushSubscription) {
    return NextResponse.json(
      { error: "pushSubscription required for push channel" },
      { status: 400 }
    );
  }

  if (
    (channelList.includes("slack") || channelList.includes("webhook")) &&
    !webhookUrl
  ) {
    return NextResponse.json(
      { error: "webhookUrl required for slack/webhook channels" },
      { status: 400 }
    );
  }

  const alert = await addAlert({
    target,
    targetType,
    channels: channelList,
    pushSubscription,
    webhookUrl,
  });

  return NextResponse.json(alert, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const removed = await removeAlert(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
