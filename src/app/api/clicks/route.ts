import { NextResponse } from "next/server";
import { recordClick, loadAllClickStats } from "@/lib/store/click-store";

export async function POST(req: Request) {
  const body = await req.json();
  const { deal_id, affiliate_provider, affiliate_url } = body;

  if (!deal_id || !affiliate_url) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const event = {
    deal_id,
    affiliate_provider: affiliate_provider ?? "unknown",
    affiliate_url,
    timestamp: new Date().toISOString(),
    referrer: req.headers.get("referer") ?? "",
  };

  const log = await recordClick(event);

  return NextResponse.json({
    success: true,
    total_clicks: log.total_clicks,
  });
}

export async function GET() {
  const stats = await loadAllClickStats();
  return NextResponse.json({ stats });
}
