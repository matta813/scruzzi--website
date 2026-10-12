import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#030303" }}>
        <svg width="110" height="96" viewBox="0 0 16 14">
          <path d="M8 1 15 13H1L8 1Z" fill="none" stroke="#9cf02e" strokeWidth="1.6" />
          <path d="M8 7.2 10.4 11H5.6L8 7.2Z" fill="#9cf02e" />
        </svg>
      </div>
    ),
    size,
  );
}
