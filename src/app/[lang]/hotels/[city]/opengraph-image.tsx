import { ImageResponse } from "next/og";
import { getHotelDestinationBySlug } from "@/data/hotel-destinations";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BEATRIP ホテル特集";

export default async function OGImage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city } = await params;
  const d = getHotelDestinationBySlug(city);

  if (!d) {
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

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          background: "#18181b",
          fontFamily: "sans-serif",
        }}
      >
        {/* 背景画像（city image を全面） */}
        {d.image && (
          <img
            src={d.image}
            alt=""
            width={1200}
            height={630}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}
        {/* グラデーションオーバーレイ */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.85) 100%)",
          }}
        />
        {/* テキスト */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-start",
            padding: 64,
            color: "white",
            width: "100%",
            height: "100%",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
              backdropFilter: "blur(8px)",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 3,
            }}
          >
            ✈ HOTELS
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 110,
              fontWeight: 900,
              letterSpacing: 4,
              lineHeight: 1,
              textTransform: "uppercase",
            }}
          >
            {d.nameJa}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              fontWeight: 400,
              opacity: 0.9,
              maxWidth: 1000,
            }}
          >
            {d.tagline}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 18,
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {d.priceFromJpy && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "10px 18px",
                  borderRadius: 14,
                  background: "white",
                  color: "#18181b",
                }}
              >
                ホテル ¥{d.priceFromJpy.toLocaleString()}〜
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                fontSize: 20,
                opacity: 0.7,
                letterSpacing: 2,
              }}
            >
              BEATRIP.JP
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
