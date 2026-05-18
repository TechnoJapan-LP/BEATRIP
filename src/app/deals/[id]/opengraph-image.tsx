import { ImageResponse } from "next/og";
import { getDealById } from "@/lib/deals/deal-service";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BEATRIP フライトディール";

function formatPrice(price: number) {
  return new Intl.NumberFormat("ja-JP").format(price);
}

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deal = await getDealById(id);

  if (!deal) {
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
            fontSize: 48,
            fontFamily: "sans-serif",
          }}
        >
          BEATRIP
        </div>
      ),
      size
    );
  }

  const saving = deal.original_price - deal.sale_price;

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
        {/* Background image */}
        <img
          src={deal.image_url}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        {/* Dark overlay */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.75) 100%)",
          }}
        />

        {/* Content */}
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
          {/* Top: branding + badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
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
            {deal.badge && (
              <div
                style={{
                  display: "flex",
                  padding: "8px 20px",
                  borderRadius: 24,
                  background:
                    deal.badge === "NEW"
                      ? "#10b981"
                      : deal.badge === "ENDING_SOON"
                        ? "#f59e0b"
                        : "#ef4444",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: "uppercase" as const,
                }}
              >
                {deal.badge === "LOWEST_IN_2_YEARS"
                  ? "LOWEST IN 2 YEARS"
                  : deal.badge === "ENDING_SOON"
                    ? "ENDING SOON"
                    : "NEW"}
              </div>
            )}
          </div>

          {/* Middle: route + destination */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                color: "rgba(255,255,255,0.6)",
                fontSize: 22,
                letterSpacing: 3,
              }}
            >
              <span>{deal.origin_code}</span>
              <span>→</span>
              <span>{deal.destination_code}</span>
              <span style={{ marginLeft: 8, fontSize: 18 }}>
                {`${deal.airline_name} · ${deal.cabin}`}
              </span>
            </div>
            <div
              style={{
                fontSize: 96,
                fontWeight: 700,
                color: "white",
                letterSpacing: 4,
                lineHeight: 1,
                textTransform: "uppercase" as const,
              }}
            >
              {deal.destination}
            </div>
          </div>

          {/* Bottom: price section */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            {/* Left: price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
              <div
                style={{
                  display: "flex",
                  fontSize: 72,
                  fontWeight: 700,
                  color: "white",
                  lineHeight: 1,
                  letterSpacing: 2,
                }}
              >
                {`¥${formatPrice(deal.sale_price)}`}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  color: "rgba(255,255,255,0.4)",
                  textDecoration: "line-through",
                  lineHeight: 1,
                }}
              >
                {`¥${formatPrice(deal.original_price)}`}
              </div>
            </div>

            {/* Right: saving callout */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  padding: "10px 24px",
                  borderRadius: 16,
                  background: "rgba(239,68,68,0.9)",
                  color: "white",
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: 1,
                }}
              >
                {`-${deal.discount_percent}% OFF`}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 22,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                {`¥${formatPrice(saving)} おトク`}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
