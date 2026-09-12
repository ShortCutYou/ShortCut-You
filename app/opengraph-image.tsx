import { ImageResponse } from "next/og"

import { SITE_NAME } from "@/lib/site"

export const alt = "ログイン不要ですぐに使えるYouTubeショート特化リサーチツール"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const OG_TITLE = "YouTubeショート リサーチ ＋ AI分析"
const OG_SUBTITLE = "ログイン不要ですぐに使えるショート動画特化ツール"

async function loadJapaneseFont(text: string) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(text)}`
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
  const fontText = `${SITE_NAME}${OG_TITLE}${OG_SUBTITLE}`
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
          padding: "52px 60px 48px",
          fontFamily: '"Noto Sans JP"',
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <div
            style={{
              width: 108,
              height: 108,
              borderRadius: 28,
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: "-0.06em",
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.06em",
              lineHeight: 1,
            }}
          >
            {SITE_NAME}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            maxWidth: 1080,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: 48,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.28,
            }}
          >
            {OG_TITLE}
          </div>
          <div
            style={{
              fontSize: 26,
              color: "#b4b4b4",
              lineHeight: 1.45,
              fontWeight: 700,
            }}
          >
            {OG_SUBTITLE}
          </div>
        </div>
        <div style={{ height: 28 }} />
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
