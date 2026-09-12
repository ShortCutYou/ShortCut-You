export function formatCountJa(value: string | number | undefined) {
  const count = Number(value)
  if (!Number.isFinite(count)) return "-"
  if (count >= 10_000) {
    const man = count / 10_000
    const digits = man >= 10 ? 0 : 1
    return `${man.toFixed(digits).replace(/\.0$/, "")}万`
  }
  return count.toLocaleString("ja-JP")
}

export function formatLikeRate(
  likeCount: string | undefined,
  viewCount: string | undefined
) {
  const likes = Number(likeCount)
  const views = Number(viewCount)
  if (!Number.isFinite(likes) || !Number.isFinite(views) || views <= 0) {
    return "-"
  }
  return `${((likes / views) * 100).toFixed(1)}%`
}

export function formatEngagementRate(
  likeCount: string | undefined,
  commentCount: string | undefined,
  viewCount: string | undefined
) {
  const likes = Number(likeCount) || 0
  const comments = Number(commentCount) || 0
  const views = Number(viewCount)
  if (!Number.isFinite(views) || views <= 0) return "-"
  return `${(((likes + comments) / views) * 100).toFixed(2)}%`
}

export function formatIso8601Duration(iso: string | undefined) {
  if (!iso) return "-"
  const match = iso.match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/)
  if (!match) return "-"

  const hours = Number(match[1] ?? 0)
  const minutes = Number(match[2] ?? 0)
  const seconds = Number(match[3] ?? 0)

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`
}

export function formatPublishedAt(value: string | undefined) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

export function videoThumbnailUrl(thumbnails?: {
  maxres?: { url?: string }
  standard?: { url?: string }
  high?: { url?: string }
  medium?: { url?: string }
  default?: { url?: string }
}) {
  return (
    thumbnails?.maxres?.url ??
    thumbnails?.standard?.url ??
    thumbnails?.high?.url ??
    thumbnails?.medium?.url ??
    thumbnails?.default?.url
  )
}

export function channelThumbnailUrl(thumbnails?: {
  high?: { url?: string }
  medium?: { url?: string }
  default?: { url?: string }
}) {
  return thumbnails?.high?.url ?? thumbnails?.medium?.url ?? thumbnails?.default?.url
}
