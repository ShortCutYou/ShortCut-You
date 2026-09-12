import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          borderRadius: 40,
          color: "#f5f5f5",
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: "-0.06em",
        }}
      >
        S
      </div>
    ),
    size
  )
}
