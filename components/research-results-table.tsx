"use client"

import { useRouter } from "next/navigation"
import { Eye, MessageCircle, ThumbsUp, Users } from "lucide-react"

import {
  channelThumbnailUrl,
  formatCountJa,
  formatEngagementRate,
  formatIso8601Duration,
} from "@/lib/format-stats"
import type { YoutubeVideo } from "@/lib/youtube"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function videoThumb(video: YoutubeVideo) {
  return (
    video.snippet?.thumbnails?.medium?.url ??
    video.snippet?.thumbnails?.high?.url ??
    video.snippet?.thumbnails?.default?.url
  )
}

export function ResearchResultsTable({ videos }: { videos: YoutubeVideo[] }) {
  const router = useRouter()

  if (videos.length === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>動画情報</TableHead>
            <TableHead>チャンネル</TableHead>
            <TableHead>再生数</TableHead>
            <TableHead>高評価</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell colSpan={4} className="text-muted-foreground">
              結果がありません。
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>動画情報</TableHead>
          <TableHead>チャンネル</TableHead>
          <TableHead>登録者数</TableHead>
          <TableHead>再生数</TableHead>
          <TableHead>高評価</TableHead>
          <TableHead>コメント</TableHead>
          <TableHead>エンゲージメント率</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {videos.map((video) => {
          const thumb = videoThumb(video)
          const duration = formatIso8601Duration(video.contentDetails?.duration)
          const channel = video.channel
          const channelIcon = channelThumbnailUrl(channel?.snippet?.thumbnails)
          const channelName =
            channel?.snippet?.title ?? video.snippet?.channelTitle ?? "-"
          const subscribers = channel?.statistics?.hiddenSubscriberCount
            ? "非公開"
            : formatCountJa(channel?.statistics?.subscriberCount)

          return (
            <TableRow
              key={video.id}
              className="cursor-pointer"
              onClick={() => router.push(`/detail/${video.id}`)}
            >
              <TableCell className="whitespace-normal">
                <div className="flex min-w-56 items-center gap-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt="" className="size-full object-cover" />
                    ) : null}
                    <span className="absolute right-1 bottom-1 rounded bg-black/80 px-1 text-[10px] text-white">
                      {duration}
                    </span>
                  </div>
                  <p className="line-clamp-2 font-medium">
                    {video.snippet?.title ?? "(無題)"}
                  </p>
                </div>
              </TableCell>
              <TableCell className="whitespace-normal">
                <div className="flex min-w-40 items-center gap-2">
                  <Avatar size="sm">
                    {channelIcon ? <AvatarImage src={channelIcon} alt="" /> : null}
                    <AvatarFallback>{channelName.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm">{channelName}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  <Users className="size-3.5 text-muted-foreground" />
                  {subscribers}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  <Eye className="size-3.5 text-muted-foreground" />
                  {formatCountJa(video.statistics?.viewCount)}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  <ThumbsUp className="size-3.5 text-muted-foreground" />
                  {formatCountJa(video.statistics?.likeCount)}
                </span>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="size-3.5 text-muted-foreground" />
                  {formatCountJa(video.statistics?.commentCount)}
                </span>
              </TableCell>
              <TableCell>
                {formatEngagementRate(
                  video.statistics?.likeCount,
                  video.statistics?.commentCount,
                  video.statistics?.viewCount
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
