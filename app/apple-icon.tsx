import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#2563eb",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          gap: "16px",
          padding: "28px 28px 26px",
          borderRadius: "40px",
        }}
      >
        <div style={{ background: "white", width: "28px", height: "60px", borderRadius: "5px" }} />
        <div style={{ background: "white", width: "28px", height: "90px", borderRadius: "5px" }} />
        <div style={{ background: "white", width: "28px", height: "112px", borderRadius: "5px" }} />
      </div>
    ),
    { ...size }
  );
}
