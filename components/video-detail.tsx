"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, MessageCircle, ThumbsUp, Users, Video } from "lucide-react"

import { AiBuzzAnalyzer } from "@/components/ai-buzz-analyzer"
import { ExportMenu } from "@/components/export-menu"
import { PerformanceScoreboard } from "@/components/performance-scoreboard"
import { SafeBoundary } from "@/components/safe-boundary"
import { ShareButton } from "@/components/share-button"
import type { BuzzAnalysis } from "@/lib/ai-analysis"
import { exportStamp } from "@/lib/export"
import { DETAIL_SHARE_TEXT } from "@/lib/share"

import {
  channelThumbnailUrl,
  formatCountJa,
  formatEngagementRate,
  formatIso8601Duration,
  formatLikeRate,
  formatPublishedAt,
  videoThumbnailUrl,
} from "@/lib/format-stats"
import type { YoutubeVideo } from "@/lib/youtube"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

function StatCard({
  label,
  value,
  icon,
  note,
}: {
  label: string
  value: string
  icon: ReactNode
  note?: string
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-3 py-3 shadow-sm shadow-black/20">
      <p className="flex items-center gap-1.5 text-[11px] tracking-wide text-zinc-400">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 text-lg font-semibold tabular-nums text-zinc-100">{value}</p>
      <AiStatNote text={note} />
    </div>
  )
}

function AiStatNote({ text }: { text?: string }) {
  if (!text) return null
  return (
    <p className="mt-1.5 text-xs leading-relaxed text-zinc-400 bg-zinc-900/50 px-2.5 py-1.5 rounded-md">
      {text}
    </p>
  )
}

export function VideoDetailView({ video }: { video: YoutubeVideo }) {
  const [analysis, setAnalysis] = useState<BuzzAnalysis | null>(null)
  const channel = video.channel
  const channelName = channel?.snippet?.title ?? video.snippet?.channelTitle ?? "-"
  const channelIcon = channelThumbnailUrl(channel?.snippet?.thumbnails)
  const thumb = videoThumbnailUrl(video.snippet?.thumbnails)
  const subscribers = channel?.statistics?.hiddenSubscriberCount
    ? "非公開"
    : `${formatCountJa(channel?.statistics?.subscriberCount)}人`
  const keywords = channel?.brandingSettings?.channel?.keywords
    ?.split(/\s+/)
    .filter(Boolean)
    .slice(0, 16)
  const videoTags = (video.snippet?.tags ?? []).slice(0, 10)
  const comments = analysis?.statComments

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ArrowLeft data-icon="inline-start" />
          リサーチに戻る
        </Link>
        <div className="flex flex-wrap gap-2">
          <ExportMenu
            videos={[video]}
            analysis={analysis}
            csvFilename={`youtube-shorts-research-${video.id}-${exportStamp()}.csv`}
            reportTitle={video.snippet?.title ?? "動画詳細レポート"}
          />
          <ShareButton text={DETAIL_SHARE_TEXT} urlMode="current" />
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            YouTube で開く
          </a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(240px,2fr)_minmax(0,3fr)] lg:items-stretch">
        <Card className="h-full min-h-0 overflow-hidden border-zinc-800 bg-zinc-900 py-0">
          <div className="relative aspect-[4/5] min-h-64 flex-1 overflow-hidden bg-zinc-950 sm:min-h-80 lg:aspect-auto">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" className="absolute inset-0 size-full object-cover" />
            ) : null}
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-zinc-100 md:text-2xl">
              {video.snippet?.title ?? "(無題)"}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              公開日 {formatPublishedAt(video.snippet?.publishedAt)} / 尺{" "}
              {formatIso8601Duration(video.contentDetails?.duration)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Avatar size="sm">
              {channelIcon ? <AvatarImage src={channelIcon} alt="" /> : null}
              <AvatarFallback>{channelName.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">{channelName}</p>
              <p className="truncate text-xs text-zinc-400">登録者 {subscribers}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {video.contentDetails?.definition ? (
              <Badge variant="secondary">
                {video.contentDetails.definition.toUpperCase()}
              </Badge>
            ) : null}
            {video.contentDetails?.caption === "true" ? (
              <Badge variant="secondary">字幕あり</Badge>
            ) : (
              <Badge variant="outline">字幕なし</Badge>
            )}
            {video.contentDetails?.licensedContent ? (
              <Badge variant="secondary">ライセンス済み</Badge>
            ) : null}
            {videoTags.map((tag, index) => (
              <Badge key={`${tag}-${index}`} variant="outline" className="max-w-40 truncate">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
            <StatCard
              label="再生数"
              value={formatCountJa(video.statistics?.viewCount)}
              icon={<Eye className="size-3.5" />}
              note={comments?.views}
            />
            <StatCard
              label="高評価"
              value={formatCountJa(video.statistics?.likeCount)}
              icon={<ThumbsUp className="size-3.5" />}
              note={comments?.likes}
            />
            <StatCard
              label="コメント"
              value={formatCountJa(video.statistics?.commentCount)}
              icon={<MessageCircle className="size-3.5" />}
              note={comments?.comments}
            />
            <StatCard
              label="エンゲージメント率"
              value={formatEngagementRate(
                video.statistics?.likeCount,
                video.statistics?.commentCount,
                video.statistics?.viewCount
              )}
              icon={<Users className="size-3.5" />}
              note={comments?.engagement}
            />
          </div>

          <SafeBoundary>
            <PerformanceScoreboard video={video} analysis={analysis} />
          </SafeBoundary>
        </div>
      </div>

      <SafeBoundary>
        <AiBuzzAnalyzer
          input={{
            videoId: video.id,
            title: video.snippet?.title ?? "(無題)",
            channelTitle: channelName,
            description: video.snippet?.description ?? "",
            tags: video.snippet?.tags ?? [],
            duration: video.contentDetails?.duration ?? "",
            publishedAt: video.snippet?.publishedAt ?? "",
            viewCount: video.statistics?.viewCount,
            likeCount: video.statistics?.likeCount,
            commentCount: video.statistics?.commentCount,
          subscriberCount: channel?.statistics?.subscriberCount,
          channelVideoCount: channel?.statistics?.videoCount,
          channelViewCount: channel?.statistics?.viewCount,
            hiddenSubscribers: channel?.statistics?.hiddenSubscriberCount === true,
          }}
          onAnalysisChange={setAnalysis}
        />
      </SafeBoundary>

      <Card>
        <CardHeader>
          <CardTitle>深掘り指標</CardTitle>
          <CardDescription>再生数に対する反応の内訳です。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-zinc-400">高評価率</p>
            <p className="text-sm font-medium">
              {formatLikeRate(video.statistics?.likeCount, video.statistics?.viewCount)}
            </p>
            <AiStatNote text={comments?.likeRate} />
          </div>
          <div>
            <p className="text-xs text-zinc-400">お気に入り</p>
            <p className="text-sm font-medium">
              {formatCountJa(video.statistics?.favoriteCount)}
            </p>
            <AiStatNote text={comments?.favorites} />
          </div>
          <div>
            <p className="text-xs text-zinc-400">カテゴリ ID</p>
            <p className="text-sm font-medium">{video.snippet?.categoryId ?? "-"}</p>
            <AiStatNote text={comments?.category} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>チャンネル情報</CardTitle>
          <CardDescription>この動画に紐づくチャンネルのメタデータです。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              {channelIcon ? <AvatarImage src={channelIcon} alt="" /> : null}
              <AvatarFallback>{channelName.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium">{channelName}</p>
              <p className="text-xs text-zinc-400">
                {channel?.snippet?.customUrl ?? video.snippet?.channelId ?? "-"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1 text-xs text-zinc-400">
                <Users className="size-3.5" />
                登録者数
              </p>
              <p className="text-sm font-medium">{subscribers}</p>
              <AiStatNote text={comments?.subscribers} />
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-zinc-400">
                <Video className="size-3.5" />
                総動画数
              </p>
              <p className="text-sm font-medium">
                {formatCountJa(channel?.statistics?.videoCount)}
              </p>
              <AiStatNote text={comments?.videoCount} />
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-zinc-400">
                <Eye className="size-3.5" />
                チャンネル総再生数
              </p>
              <p className="text-sm font-medium">
                {formatCountJa(channel?.statistics?.viewCount)}
              </p>
              <AiStatNote text={comments?.channelViews} />
            </div>
          </div>
          {channel?.snippet?.description ? (
            <p className="whitespace-pre-wrap text-sm text-zinc-400">
              {channel.snippet.description}
            </p>
          ) : null}
          {keywords && keywords.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {keywords.map((keyword, index) => (
                <Badge key={`${keyword}-${index}`} variant="outline">
                  {keyword}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>動画メタデータ</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-zinc-400">説明文</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {video.snippet?.description || "説明文はありません。"}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-zinc-400">タグ</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {video.snippet?.tags && video.snippet.tags.length > 0 ? (
                video.snippet.tags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`} variant="secondary">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-zinc-400">タグはありません。</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
