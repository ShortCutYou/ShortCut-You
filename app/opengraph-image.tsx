import { ImageResponse } from "next/og"

import { SITE_NAME } from "@/lib/site"

export const alt = "ShortCutYou - YouTubeショート特化リサーチ & AI分析SaaS"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#111111",
          color: "#f5f5f5",
          padding: "64px 72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.16)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            S
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.04em" }}>
            {SITE_NAME}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            YouTube Shorts research + AI analysis
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#a3a3a3",
              lineHeight: 1.45,
              maxWidth: 900,
            }}
          >
            Privacy-first YouTube Shorts research. Your API keys stay in the browser.
          </div>
        </div>
        <div style={{ fontSize: 20, color: "#737373" }}>No login. API keys stay in your browser.</div>
      </div>
    ),
    size
  )
}
