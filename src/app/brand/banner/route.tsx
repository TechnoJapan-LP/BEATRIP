import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-static";

/**
 * BEATRIP ブランドバナー（1500×500 PNG）
 *
 * 用途: SNSのヘッダー/バナー画像。
 * X (Twitter) は1500×500、Bluesky 推奨は3000×1000（同アスペクト）。
 * Bluesky 等の自動リサイズで綺麗に収まる構図。
 */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(120deg, #18181b 0%, #1f1d2b 35%, #2a1830 70%, #f43f5e 130%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* グリッド風の薄い装飾 */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 80% 50%, rgba(244,63,94,0.35), transparent 45%), radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08), transparent 40%)",
          }}
        />
        {/* 飛行機ライン（左から斜めに流れる） */}
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 80,
            width: 800,
            height: 2,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.5) 40%, rgba(255,255,255,0.85) 80%, rgba(244,63,94,1) 100%)",
            transform: "rotate(-12deg)",
            transformOrigin: "left center",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 240,
            left: 880,
            color: "white",
            fontSize: 60,
            transform: "rotate(-12deg) translateY(-30px)",
          }}
        >
          ✈
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 100px",
            color: "white",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: 5,
              color: "rgba(255,255,255,0.8)",
              marginBottom: 14,
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: 8,
                background: "#f43f5e",
              }}
            />
            Flight Deal Portal
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 220,
              fontWeight: 900,
              letterSpacing: 8,
              lineHeight: 1,
            }}
          >
            BEATRIP
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 32,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
            }}
          >
            最安値のフライトを見逃さない。
          </div>
        </div>

        {/* 右下 ドメイン */}
        <div
          style={{
            position: "absolute",
            right: 60,
            bottom: 40,
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 4,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          BEATRIP.JP
        </div>
      </div>
    ),
    { width: 1500, height: 500 }
  );
}
