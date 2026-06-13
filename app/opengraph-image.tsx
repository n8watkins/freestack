import { ImageResponse } from "next/og";
import data from "@/data/services.json";

export const alt = "FreeStack — Compare free developer tiers side-by-side";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Og() {
  const count = (data as { count: number }).count;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#f8faf9",
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(5,150,105,0.12) 1px, transparent 0)",
          backgroundSize: "36px 36px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 60,
              height: 60,
              borderRadius: 16,
              background: "#059669",
            }}
          />
          <div style={{ display: "flex", fontSize: 42, fontWeight: 800 }}>
            <span style={{ color: "#0f1f1a" }}>Free</span>
            <span style={{ color: "#059669" }}>Stack</span>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontSize: 68,
            fontWeight: 800,
            color: "#0f1f1a",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}
        >
          Every free developer tier,&nbsp;
          <span style={{ color: "#059669" }}>searchable</span>
          &nbsp;— and side-by-side.
        </div>

        {/* Stat row */}
        <div
          style={{
            marginTop: 44,
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              background: "#d1fae5",
              color: "#047857",
              padding: "10px 22px",
              borderRadius: 999,
              fontWeight: 700,
            }}
          >
            {count.toLocaleString()} free tiers
          </div>
          <div style={{ display: "flex", color: "#5b6b65" }}>
            Compare hosting · databases · APIs · CI/CD
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
