import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "BEATRIP — 航空券セール情報ポータル";

export default function OGImage() {
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
            "linear-gradient(135deg, #18181b 0%, #27272a 50%, #18181b 100%)",
          fontFamily: "sans-serif",
          gap: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "white",
              color: "#18181b",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            ✈
          </div>
          <span
            style={{
              fontSize: 84,
              fontWeight: 700,
              color: "white",
              letterSpacing: 8,
            }}
          >
            BEATRIP
          </span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: 2,
          }}
        >
          航空券セール情報を自動収集・価格推移・セール時期予測
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 12,
          }}
        >
          {["フラッシュディール", "セール予測", "価格推移"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.85)",
                fontSize: 22,
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
