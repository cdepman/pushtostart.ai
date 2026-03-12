import { ImageResponse } from "next/og";

export const runtime = "edge";

async function loadGoogleFont(family: string, weight: number) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&display=swap`,
    { headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36" } }
  ).then((res) => res.text());

  const match = css.match(/src:\s*url\(([^)]+)\)/);
  if (!match) throw new Error("Font URL not found");
  return fetch(match[1]).then((res) => res.arrayBuffer());
}

export async function GET() {
  const dmSansBold = await loadGoogleFont("DM+Sans", 700);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#06080d",
          position: "relative",
          overflow: "hidden",
          fontFamily: "DM Sans",
        }}
      >
        {/* Gradient orb — top right */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(99,102,241,0.05) 50%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Gradient orb — bottom left */}
        <div
          style={{
            position: "absolute",
            bottom: "-150px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 1,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "1px solid rgba(99,102,241,0.2)",
              background: "rgba(99,102,241,0.08)",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "16px",
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.05em",
              }}
            >
              CREATE &amp; SHARE
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              display: "flex",
              marginBottom: "8px",
            }}
          >
            PushToStart
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "28px",
              color: "rgba(255,255,255,0.5)",
              lineHeight: 1.4,
              display: "flex",
              gap: "12px",
            }}
          >
            <span>Create with Claude.</span>
            <span style={{ color: "#6366f1" }}>Share with the world.</span>
          </div>

          {/* URL bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "32px",
              padding: "10px 24px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: "#6366f1",
                display: "flex",
              }}
            />
            <span
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              yourapp
            </span>
            <span
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.2)",
              }}
            >
              .pushtostart.ai
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "DM Sans",
          data: dmSansBold,
          weight: 700,
          style: "normal",
        },
      ],
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    }
  );
}
