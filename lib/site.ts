export const SITE_NAME = "ShortCutYou"
export const SITE_TITLE =
  "ShortCutYou - YouTubeショート特化リサーチ & AI分析SaaS"
export const SITE_DESCRIPTION =
  "ログイン不要・APIキー保持型でプライバシーに配慮したYouTubeショート特化リサーチツール"

export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (explicit) return explicit.replace(/\/$/, "")

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim()
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "")}`
  }

  return "http://localhost:3000"
}
