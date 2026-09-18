import { ImageResponse } from "next/og";

export const alt = "NOIR ATELIER | Studio Clothing & Architectural Basics";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: "60px 75px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Luxury Gradient Ambient Glows */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "550px",
            height: "550px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "50px",
            width: "450px",
            height: "450px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)",
          }}
        />

        {/* Top Header: Monogram Brand Logo & Cash on Delivery Tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "54px",
                height: "54px",
                borderRadius: "14px",
                backgroundColor: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#0a0a0a",
                fontSize: "30px",
                fontWeight: 900,
                letterSpacing: "-1px",
              }}
            >
              N
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#ffffff",
                  letterSpacing: "-1px",
                  lineHeight: 1.1,
                }}
              >
                NOIR ATELIER
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#a3a3a3",
                  letterSpacing: "4px",
                  textTransform: "uppercase",
                }}
              >
                Studio Clothing
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "9999px",
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#34d399",
              fontSize: "15px",
              fontWeight: 700,
              letterSpacing: "0.5px",
            }}
          >
            <span style={{ color: "#34d399", marginRight: "4px" }}>●</span> Cash on Delivery Nationwide
          </div>
        </div>

        {/* Center Editorial Headlines */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              fontSize: "64px",
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.05,
              letterSpacing: "-3px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>ARCHITECTURAL BASICS.</span>
            <span
              style={{
                color: "#737373",
                fontWeight: 300,
                fontStyle: "italic",
              }}
            >
              240+ GSM HEAVYWEIGHTS.
            </span>
          </div>

          <p
            style={{
              fontSize: "22px",
              color: "#d4d4d4",
              maxWidth: "880px",
              lineHeight: 1.45,
              fontWeight: 400,
              margin: 0,
            }}
          >
            Sculpted boxy drape crafted from 100% organic combed cotton. Zero synthetic fillers. Delivered across all 64 districts in Bangladesh.
          </p>
        </div>

        {/* Bottom Feature Badges & Domain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#e5e5e5",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#34d399" }}>●</span> 100% Cash on Delivery
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#e5e5e5",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#38bdf8" }}>●</span> 3-Day Doorstep Size Swap
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: "#e5e5e5",
                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              <span style={{ color: "#fbbf24" }}>●</span> 240+ GSM Organic Knit
            </div>
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#a3a3a3",
              fontFamily: "monospace",
              letterSpacing: "1px",
            }}
          >
            noiratelier.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
