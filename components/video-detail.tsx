"use client"

import type { ReactNode } from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Eye, MessageCircle, ThumbsUp, Users, Video } from "lucide-react"

import { AiBuzzAnalyzer } from "@/components/ai-buzz-analyzer"
import { ExportMenu } from "@/components/export-menu"
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
}: {
  label: string
  value: string
  icon: ReactNode
}) {
  return (
    <Card size="sm">
      <CardHeader className="pb-0">
        <CardDescription className="flex items-center gap-1.5">
          {icon}
          {label}
        </CardDescription>
        <CardTitle className="text-lg">{value}</CardTitle>
      </CardHeader>
    </Card>
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden py-0">
          <div className="aspect-video bg-muted">
            {thumb ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumb} alt="" className="size-full object-cover" />
            ) : null}
          </div>
        </Card>

        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
              {video.snippet?.title ?? "(無題)"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              公開日 {formatPublishedAt(video.snippet?.publishedAt)} / 尺{" "}
              {formatIso8601Duration(video.contentDetails?.duration)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
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
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="再生数"
          value={formatCountJa(video.statistics?.viewCount)}
          icon={<Eye className="size-3.5" />}
        />
        <StatCard
          label="高評価"
          value={formatCountJa(video.statistics?.likeCount)}
          icon={<ThumbsUp className="size-3.5" />}
        />
        <StatCard
          label="コメント"
          value={formatCountJa(video.statistics?.commentCount)}
          icon={<MessageCircle className="size-3.5" />}
        />
        <StatCard
          label="エンゲージメント率"
          value={formatEngagementRate(
            video.statistics?.likeCount,
            video.statistics?.commentCount,
            video.statistics?.viewCount
          )}
          icon={<Users className="size-3.5" />}
        />
      </div>

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
          hiddenSubscribers: channel?.statistics?.hiddenSubscriberCount === true,
        }}
        onAnalysisChange={setAnalysis}
      />

      <Card>
        <CardHeader>
          <CardTitle>深掘り指標</CardTitle>
          <CardDescription>再生数に対する反応の内訳です。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">高評価率</p>
            <p className="text-sm font-medium">
              {formatLikeRate(video.statistics?.likeCount, video.statistics?.viewCount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">お気に入り</p>
            <p className="text-sm font-medium">
              {formatCountJa(video.statistics?.favoriteCount)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">カテゴリ ID</p>
            <p className="text-sm font-medium">{video.snippet?.categoryId ?? "-"}</p>
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
              <p className="text-xs text-muted-foreground">
                {channel?.snippet?.customUrl ?? video.snippet?.channelId ?? "-"}
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                登録者数
              </p>
              <p className="text-sm font-medium">{subscribers}</p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Video className="size-3.5" />
                総動画数
              </p>
              <p className="text-sm font-medium">
                {formatCountJa(channel?.statistics?.videoCount)}
              </p>
            </div>
            <div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Eye className="size-3.5" />
                チャンネル総再生数
              </p>
              <p className="text-sm font-medium">
                {formatCountJa(channel?.statistics?.viewCount)}
              </p>
            </div>
          </div>
          {channel?.snippet?.description ? (
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
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
            <p className="text-xs text-muted-foreground">説明文</p>
            <p className="mt-1 whitespace-pre-wrap text-sm">
              {video.snippet?.description || "説明文はありません。"}
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-xs text-muted-foreground">タグ</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {video.snippet?.tags && video.snippet.tags.length > 0 ? (
                video.snippet.tags.map((tag, index) => (
                  <Badge key={`${tag}-${index}`} variant="secondary">
                    {tag}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">タグはありません。</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
