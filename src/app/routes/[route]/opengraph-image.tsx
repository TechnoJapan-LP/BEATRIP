import { ImageResponse } from "next/og";
import { getActiveDeals } from "@/lib/deals/deal-service";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BEATRIP 路線別格安航空券";

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

function parseRoute(slug: string) {
  const decoded = decodeURIComponent(slug);
  const match = decoded.match(/^([A-Z]{3})-([A-Z]{3})$/);
  if (!match) return null;
  return { origin: match[1], destination: match[2] };
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ route: string }>;
}) {
  const { route } = await params;
  const parsed = parseRoute(route);
  const deals = parsed ? await getActiveDeals() : [];
  const routeDeals = parsed
    ? deals.filter(
        (d) =>
          d.origin_code === parsed.origin &&
          d.destination_code === parsed.destination
      )
    : [];

  if (!parsed || routeDeals.length === 0) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "#18181b",
            color: "white",
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: 4,
            fontFamily: "sans-serif",
          }}
        >
          BEATRIP
        </div>
      ),
      size
    );
  }

  const cheapest = routeDeals.reduce((a, b) =>
    a.sale_price < b.sale_price ? a : b
  );
  const origin = cheapest.origin;
  const dest = cheapest.destination;
  const airlines = [...new Set(routeDeals.map((d) => d.airline_name))];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <img
          src={cheapest.image_url}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.8) 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "48px 56px",
            position: "relative",
          }}
        >
          {/* Top: branding */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 44,
                height: 44,
                borderRadius: 10,
                background: "white",
                color: "#18181b",
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              ✈
            </div>
            <span
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: "white",
                letterSpacing: 2,
              }}
            >
              BEATRIP
            </span>
          </div>

          {/* Middle: route */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                color: "rgba(255,255,255,0.65)",
                fontSize: 26,
                letterSpacing: 3,
              }}
            >
              <span>{parsed.origin}</span>
              <span>→</span>
              <span>{parsed.destination}</span>
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 88,
                fontWeight: 700,
                color: "white",
                letterSpacing: 3,
                lineHeight: 1.05,
              }}
            >
              {`${origin}→${dest}`}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "rgba(255,255,255,0.55)",
                marginTop: 4,
              }}
            >
              {airlines.slice(0, 4).join(" · ") +
                (airlines.length > 4 ? " ほか" : "")}
            </div>
          </div>

          {/* Bottom: price */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: 6 }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: "rgba(255,255,255,0.5)",
                  letterSpacing: 2,
                }}
              >
                {`この路線 ${routeDeals.length} 件のセール · 最安`}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  fontSize: 80,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1,
                  letterSpacing: 2,
                }}
              >
                <span>{`¥${formatPrice(cheapest.sale_price)}`}</span>
                <span style={{ fontSize: 30, fontWeight: 400 }}>〜</span>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                padding: "12px 28px",
                borderRadius: 16,
                background: "rgba(239,68,68,0.92)",
                color: "white",
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              {`最大-${Math.max(...routeDeals.map((d) => d.discount_percent))}%`}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
