import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" width={32} height={32}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>
        <rect width="80" height="80" rx="16" fill="#0a0a0a" />
        {/* k stem */}
        <rect x="8" y="6" width="10" height="40" rx="5" fill="url(#g)" />
        {/* k upper arm diagonal */}
        <path d="M18 24 L18 33 L49 6 L40 6 Z" fill="url(#g)" />
        {/* bar 1 – short */}
        <rect x="20" y="56" width="10" height="13" rx="4" fill="url(#g)" />
        {/* bar 2 – medium */}
        <rect x="33" y="46" width="10" height="23" rx="4" fill="url(#g)" />
        {/* bar 3 – tall */}
        <rect x="46" y="36" width="10" height="33" rx="4" fill="url(#g)" />
      </svg>
    ),
    { ...size }
  );
}
