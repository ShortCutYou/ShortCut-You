const VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/
const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "youtube-nocookie.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
])

export const YOUTUBE_VIDEOS_LIST_MAX_IDS = 50
export const YOUTUBE_VIDEOS_LIST_PARTS = "snippet,statistics,contentDetails"
export const YOUTUBE_CHANNELS_LIST_PARTS = "snippet,statistics,brandingSettings"

export type YoutubeThumbnail = {
  url?: string
  width?: number
  height?: number
}

export type YoutubeThumbnails = {
  default?: YoutubeThumbnail
  medium?: YoutubeThumbnail
  high?: YoutubeThumbnail
}

export type YoutubeChannel = {
  id: string
  snippet?: {
    title?: string
    description?: string
    customUrl?: string
    publishedAt?: string
    country?: string
    thumbnails?: YoutubeThumbnails
  }
  statistics?: {
    viewCount?: string
    subscriberCount?: string
    hiddenSubscriberCount?: boolean
    videoCount?: string
  }
  brandingSettings?: {
    channel?: {
      title?: string
      description?: string
      keywords?: string
    }
  }
}

export type YoutubeVideo = {
  id: string
  snippet?: {
    publishedAt?: string
    channelId?: string
    title?: string
    description?: string
    channelTitle?: string
    tags?: string[]
    categoryId?: string
    defaultLanguage?: string
    defaultAudioLanguage?: string
    thumbnails?: YoutubeThumbnails & {
      standard?: YoutubeThumbnail
      maxres?: YoutubeThumbnail
    }
  }
  statistics?: {
    viewCount?: string
    likeCount?: string
    favoriteCount?: string
    commentCount?: string
  }
  contentDetails?: {
    duration?: string
    dimension?: string
    definition?: string
    caption?: string
    licensedContent?: boolean
    projection?: string
  }
  channel?: YoutubeChannel
}

export type YoutubeVideosApiResponse = {
  items: YoutubeVideo[]
  requestedCount: number
  invalidUrls: string[]
  notFoundIds: string[]
  error?: string
}

export type ParsedYoutubeUrls = {
  videoIds: string[]
  invalidUrls: string[]
}

export function isYoutubeVideoId(value: string) {
  return VIDEO_ID_PATTERN.test(value)
}

function normalizeHost(hostname: string) {
  return hostname.replace(/^www\./i, "").toLowerCase()
}

function asVideoId(value: string | undefined | null) {
  if (!value) return null
  const id = value.trim()
  return VIDEO_ID_PATTERN.test(id) ? id : null
}

export function extractYoutubeVideoId(raw: string): string | null {
  const input = raw.trim()
  if (!input) return null
  if (VIDEO_ID_PATTERN.test(input)) return input

  let url: URL
  try {
    url = new URL(input.includes("://") ? input : `https://${input}`)
  } catch {
    return null
  }

  const host = normalizeHost(url.hostname)
  if (!YOUTUBE_HOSTS.has(host)) {
    return null
  }

  const queryId = asVideoId(url.searchParams.get("v"))
  if (queryId) return queryId

  const segments = url.pathname.split("/").filter(Boolean)

  if (host === "youtu.be") {
    return asVideoId(segments[0])
  }

  const prefixed = ["shorts", "embed", "live", "v", "watch"]
  for (let i = 0; i < segments.length; i += 1) {
    if (prefixed.includes(segments[i].toLowerCase())) {
      const candidate = asVideoId(segments[i + 1])
      if (candidate) return candidate
    }
  }

  return null
}

export function parseYoutubeUrls(urls: string[]): ParsedYoutubeUrls {
  const seen = new Set<string>()
  const videoIds: string[] = []
  const invalidUrls: string[] = []

  for (const url of urls) {
    const trimmed = url.trim()
    if (!trimmed) {
      continue
    }

    const videoId = extractYoutubeVideoId(trimmed)
    if (!videoId) {
      invalidUrls.push(url)
      continue
    }

    if (!seen.has(videoId)) {
      seen.add(videoId)
      videoIds.push(videoId)
    }
  }

  return { videoIds, invalidUrls }
}

export function chunkIds(ids: string[], size = YOUTUBE_VIDEOS_LIST_MAX_IDS) {
  const chunks: string[][] = []
  for (let i = 0; i < ids.length; i += size) {
    chunks.push(ids.slice(i, i + size))
  }
  return chunks
}

type YoutubeApiErrorBody = {
  error?: {
    code?: number
    message?: string
  }
}

async function youtubeList<T extends { id?: string }>(
  resource: "videos" | "channels",
  part: string,
  ids: string[],
  apiKey: string
) {
  const items: T[] = []

  for (const batch of chunkIds(ids)) {
    const params = new URLSearchParams({
      part,
      id: batch.join(","),
      key: apiKey,
    })

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/${resource}?${params.toString()}`,
      { cache: "no-store" }
    )

    const body = (await response.json()) as YoutubeApiErrorBody & { items?: T[] }

    if (!response.ok) {
      const message = body.error?.message ?? "YouTube Data API の呼び出しに失敗しました。"
      const error = new Error(message) as Error & { status?: number }
      error.status = body.error?.code === 403 ? 429 : 502
      throw error
    }

    items.push(...(body.items ?? []))
  }

  return items
}

export function fetchYoutubeVideos(videoIds: string[], apiKey: string) {
  return youtubeList<YoutubeVideo>("videos", YOUTUBE_VIDEOS_LIST_PARTS, videoIds, apiKey)
}

export function fetchYoutubeChannels(channelIds: string[], apiKey: string) {
  if (channelIds.length === 0) return Promise.resolve([] as YoutubeChannel[])
  return youtubeList<YoutubeChannel>(
    "channels",
    YOUTUBE_CHANNELS_LIST_PARTS,
    channelIds,
    apiKey
  )
}

export async function loadYoutubeResearch(videoIds: string[], apiKey: string) {
  const videos = await fetchYoutubeVideos(videoIds, apiKey)
  const channelIds = [
    ...new Set(
      videos
        .map((video) => video.snippet?.channelId)
        .filter((id): id is string => Boolean(id))
    ),
  ]
  const channels = await fetchYoutubeChannels(channelIds, apiKey)
  const channelById = new Map(channels.map((channel) => [channel.id, channel]))

  const items = videos.map((video) => ({
    ...video,
    channel: video.snippet?.channelId
      ? channelById.get(video.snippet.channelId)
      : undefined,
  }))

  return { items, channels }
}
