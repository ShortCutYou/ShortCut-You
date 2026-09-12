import type { YoutubeVideo } from "@/lib/youtube"
import { channelThumbnailUrl } from "@/lib/format-stats"

export const RESEARCH_HISTORY_KEY = "shortcutyou.research-history"
const MAX_HISTORY_ENTRIES = 40

export type HistoryVideo = {
  id: string
  title: string
  channelName: string
  channelIcon?: string
  thumbnailUrl?: string
  viewCount?: string
  likeCount?: string
  commentCount?: string
  subscriberCount?: string
  hiddenSubscribers?: boolean
  duration?: string
  detailPath: string
}

export type ResearchHistoryEntry = {
  id: string
  createdAt: string
  urls: string[]
  queryLabel: string
  videos: HistoryVideo[]
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined"
}

export function toHistoryVideos(videos: YoutubeVideo[]): HistoryVideo[] {
  return videos.map((video) => {
    const channelName =
      video.channel?.snippet?.title ?? video.snippet?.channelTitle ?? "-"
    return {
      id: video.id,
      title: video.snippet?.title ?? "(無題)",
      channelName,
      channelIcon: channelThumbnailUrl(video.channel?.snippet?.thumbnails),
      thumbnailUrl:
        video.snippet?.thumbnails?.medium?.url ??
        video.snippet?.thumbnails?.high?.url ??
        video.snippet?.thumbnails?.default?.url,
      viewCount: video.statistics?.viewCount,
      likeCount: video.statistics?.likeCount,
      commentCount: video.statistics?.commentCount,
      subscriberCount: video.channel?.statistics?.subscriberCount,
      hiddenSubscribers: video.channel?.statistics?.hiddenSubscriberCount === true,
      duration: video.contentDetails?.duration,
      detailPath: `/detail/${video.id}`,
    }
  })
}

export function toYoutubeVideos(videos: HistoryVideo[]): YoutubeVideo[] {
  return videos.map((video) => ({
    id: video.id,
    snippet: {
      title: video.title,
      channelTitle: video.channelName,
      thumbnails: {
        medium: video.thumbnailUrl ? { url: video.thumbnailUrl } : undefined,
      },
    },
    statistics: {
      viewCount: video.viewCount,
      likeCount: video.likeCount,
      commentCount: video.commentCount,
    },
    contentDetails: {
      duration: video.duration,
    },
    channel: {
      id: video.id,
      snippet: {
        title: video.channelName,
        thumbnails: {
          default: video.channelIcon ? { url: video.channelIcon } : undefined,
        },
      },
      statistics: {
        subscriberCount: video.subscriberCount,
        hiddenSubscriberCount: video.hiddenSubscribers,
      },
    },
  }))
}

export function readResearchHistory(): ResearchHistoryEntry[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.localStorage.getItem(RESEARCH_HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as ResearchHistoryEntry[]
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function writeResearchHistory(entries: ResearchHistoryEntry[]) {
  if (!canUseStorage()) return
  window.localStorage.setItem(RESEARCH_HISTORY_KEY, JSON.stringify(entries))
}

export function saveResearchHistory(urls: string[], videos: YoutubeVideo[]) {
  const entry: ResearchHistoryEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    urls,
    queryLabel: urls.length === 1 ? urls[0] : `${urls.length} 件の URL`,
    videos: toHistoryVideos(videos),
  }
  const next = [entry, ...readResearchHistory()].slice(0, MAX_HISTORY_ENTRIES)
  writeResearchHistory(next)
  return entry
}

export function getResearchHistoryEntry(id: string) {
  return readResearchHistory().find((entry) => entry.id === id) ?? null
}

export function deleteResearchHistoryEntry(id: string) {
  writeResearchHistory(readResearchHistory().filter((entry) => entry.id !== id))
}

export function clearResearchHistory() {
  writeResearchHistory([])
}

export function formatHistoryDate(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}
