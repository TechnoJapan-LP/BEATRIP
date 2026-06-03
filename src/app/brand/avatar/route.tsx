import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-static";

/**
 * BEATRIP ブランドアバター（1000×1000 PNG）
 *
 * 用途: SNSプロフィール画像（Bluesky / Threads / X / LINE 等）。
 * アクセス: https://beatrip.jp/brand/avatar
 * 右クリック保存して各SNSにアップロードする。
 */
export async function GET() {
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
            "linear-gradient(135deg, #fb7185 0%, #f43f5e 35%, #18181b 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 微細な放射状ハイライト */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18), transparent 55%)",
          }}
        />
        {/* 飛行機アイコン */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 380,
            height: 380,
            borderRadius: 88,
            background: "white",
            color: "#18181b",
            marginBottom: 24,
            boxShadow: "0 30px 60px rgba(0,0,0,0.35)",
            position: "relative",
          }}
        >
          {/* 単純化した飛行機シンボル（svg path がエッジで描画される） */}
          <svg
            width="220"
            height="220"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#18181b"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
          </svg>
        </div>
        {/* ワードマーク */}
        <div
          style={{
            display: "flex",
            fontSize: 144,
            fontWeight: 900,
            color: "white",
            letterSpacing: 6,
            lineHeight: 1,
          }}
        >
          BEATRIP
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 12,
            fontSize: 28,
            fontWeight: 600,
            color: "rgba(255,255,255,0.75)",
            letterSpacing: 5,
            textTransform: "uppercase",
          }}
        >
          Flight × Hotel Deals
        </div>
      </div>
    ),
    { width: 1000, height: 1000 }
  );
}
