import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BEATRIP — ホテル予約・最安値検索";

export default function HotelsOGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #1c1917 0%, #44403c 50%, #1c1917 100%)",
          fontFamily: "sans-serif",
          gap: 28,
          padding: 60,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            opacity: 0.85,
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
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            ✈
          </div>
          <span
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "white",
              letterSpacing: 4,
            }}
          >
            BEATRIP
          </span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            letterSpacing: 2,
            textAlign: "center",
          }}
        >
          Hotels
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "rgba(255,255,255,0.78)",
            letterSpacing: 1,
            textAlign: "center",
          }}
        >
          目的地別のホテルを最安値で検索
        </div>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["東京", "バンコク", "ソウル", "ホノルル", "パリ"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.85)",
                fontSize: 20,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
