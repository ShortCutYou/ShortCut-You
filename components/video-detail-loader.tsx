"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { VideoDetailView } from "@/components/video-detail"
import { fetchWithClientApiKeys } from "@/lib/client-settings"
import type { YoutubeVideo, YoutubeVideosApiResponse } from "@/lib/youtube"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function VideoDetailLoader({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<YoutubeVideo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetchWithClientApiKeys(
          `/api/youtube?id=${encodeURIComponent(videoId)}`
        )
        let data: YoutubeVideosApiResponse = {
          items: [],
          requestedCount: 0,
          invalidUrls: [],
          notFoundIds: [],
        }
        try {
          data = (await response.json()) as YoutubeVideosApiResponse
        } catch {
          if (cancelled) return
          setVideo(null)
          setError("動画データの解析に失敗しました。")
          return
        }
        if (cancelled) return
        if (!response.ok) {
          setVideo(null)
          setError(data.error ?? "動画の取得に失敗しました。")
          return
        }
        const item = data.items?.[0] ?? null
        if (!item) {
          setVideo(null)
          setError("動画が見つかりませんでした。")
          return
        }
        setVideo(item)
      } catch {
        if (!cancelled) {
          setVideo(null)
          setError("通信に失敗しました。開発サーバーが起動しているか確認してください。")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [videoId])

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-5 lg:grid-cols-[minmax(240px,2fr)_minmax(0,3fr)]">
          <Skeleton className="aspect-[4/5] w-full rounded-xl lg:min-h-96" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !video) {
    return (
      <Card className="mx-auto w-full max-w-2xl">
        <CardHeader>
          <CardTitle>動画を読み込めませんでした</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex flex-wrap gap-2">
            <Link href="/" className={buttonVariants({ variant: "outline" })}>
              リサーチに戻る
            </Link>
            <Link href="/settings" className={buttonVariants()}>
              設定を開く
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <VideoDetailView video={video} />
}
