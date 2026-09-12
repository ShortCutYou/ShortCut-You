export const GLOBAL_SHARE_TEXT =
  "ログイン不要・YouTubeショート特化リサーチツール「ShortCutYou」を使ってみました"
export const DETAIL_SHARE_TEXT =
  "ShortCutYouでこのYouTubeショート動画のバズ要因をAI分析しました。"

export function canUseWebShare() {
  return typeof navigator !== "undefined" && typeof navigator.share === "function"
}

export function getShareUrl(mode: "origin" | "current") {
  if (typeof window === "undefined") return ""
  return mode === "origin" ? window.location.origin : window.location.href
}

export function tweetIntentUrl(text: string, url: string) {
  const params = new URLSearchParams({ text, url })
  return `https://twitter.com/intent/tweet?${params.toString()}`
}

export async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const area = document.createElement("textarea")
  area.value = value
  area.setAttribute("readonly", "")
  area.style.position = "fixed"
  area.style.left = "-9999px"
  document.body.append(area)
  area.select()
  document.execCommand("copy")
  area.remove()
}
