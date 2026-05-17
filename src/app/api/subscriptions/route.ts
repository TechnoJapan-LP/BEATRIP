import { NextRequest, NextResponse } from "next/server";
import {
  loadSubscriptions,
  addSubscription,
  removeSubscription,
} from "@/lib/notifications/subscriptions";

export async function GET() {
  const subs = await loadSubscriptions();
  return NextResponse.json(subs);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { route, type, webhookUrl } = body;

  if (!route || !type || !webhookUrl) {
    return NextResponse.json(
      { error: "route, type, webhookUrl are required" },
      { status: 400 }
    );
  }

  if (type !== "line" && type !== "x") {
    return NextResponse.json(
      { error: "type must be 'line' or 'x'" },
      { status: 400 }
    );
  }

  const sub = await addSubscription({ route, type, webhookUrl });
  return NextResponse.json(sub, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }
  const removed = await removeSubscription(id);
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
