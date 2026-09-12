import { ImageResponse } from "next/og"

import { SITE_NAME } from "@/lib/site"

export const alt = "ログイン不要ですぐに使えるYouTubeショート特化リサーチツール"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const OG_TITLE = "YouTubeショート リサーチ ＋ AI分析"
const OG_SUBTITLE = "ログイン不要ですぐに使えるショート動画特化ツール"
const OG_NOTE = "※ブラウザ上で安全に完結します"

async function loadJapaneseFont(text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500;700&text=${encodeURIComponent(text)}`
  const css = await fetch(cssUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
    },
  }).then((res) => res.text())
  const match = css.match(/src: url\((.+?)\) format\('(opentype|truetype|woff2|woff)'\)/)
  if (!match?.[1]) {
    throw new Error("日本語フォントのURLを取得できませんでした。")
  }
  const fontRes = await fetch(match[1])
  if (!fontRes.ok) {
    throw new Error("日本語フォントの読み込みに失敗しました。")
  }
  return fontRes.arrayBuffer()
}

export default async function OpenGraphImage() {
  const fontText = `${SITE_NAME}${OG_TITLE}${OG_SUBTITLE}${OG_NOTE}`
  const fontData = await loadJapaneseFont(fontText)

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
          fontFamily: '"Noto Sans JP"',
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
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em" }}>
            {SITE_NAME}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.25,
              maxWidth: 1000,
            }}
          >
            {OG_TITLE}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#a3a3a3",
              lineHeight: 1.5,
              maxWidth: 920,
              fontWeight: 500,
            }}
          >
            {OG_SUBTITLE}
          </div>
        </div>
        <div style={{ fontSize: 18, color: "#737373", fontWeight: 500 }}>{OG_NOTE}</div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Noto Sans JP",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    }
  )
}
