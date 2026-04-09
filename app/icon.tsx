import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          gap: "4px",
          padding: "5px 5px 4px",
          borderRadius: "7px",
        }}
      >
        <div style={{ background: "white", width: "6px", height: "10px", borderRadius: "1px" }} />
        <div style={{ background: "white", width: "6px", height: "16px", borderRadius: "1px" }} />
        <div style={{ background: "white", width: "6px", height: "20px", borderRadius: "1px" }} />
      </div>
    ),
    { ...size }
  );
}
