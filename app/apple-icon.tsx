import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 108,
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#ffffff",
          fontWeight: 900,
          borderRadius: "38px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-4px",
          border: "2px solid rgba(255, 255, 255, 0.25)",
        }}
      >
        N
      </div>
    ),
    {
      ...size,
    }
  );
}
