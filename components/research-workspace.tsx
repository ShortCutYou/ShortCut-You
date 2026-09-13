"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Inbox, Link2, Sparkles } from "lucide-react"

import { fetchWithClientApiKeys } from "@/lib/client-settings"
import { saveResearchHistory, getResearchHistoryEntry, toYoutubeVideos } from "@/lib/research-history"
import { formatCountJa } from "@/lib/format-stats"
import type { YoutubeVideo, YoutubeVideosApiResponse } from "@/lib/youtube"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ResearchResultsTable } from "@/components/research-results-table"
import { ExportMenu } from "@/components/export-menu"

const researchCardClass =
  "rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-sm shadow-black/40"

function splitUrls(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

function summarizeVideos(videos: YoutubeVideo[]) {
  let views = 0
  let likes = 0
  let comments = 0
  for (const video of videos) {
    views += Number(video.statistics?.viewCount) || 0
    likes += Number(video.statistics?.likeCount) || 0
    comments += Number(video.statistics?.commentCount) || 0
  }
  const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0
  return { count: videos.length, views, likes, engagement }
}

export function ResearchWorkspace() {
  const searchParams = useSearchParams()
  const [urlText, setUrlText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invalidUrls, setInvalidUrls] = useState<string[]>([])
  const [notFoundIds, setNotFoundIds] = useState<string[]>([])
  const [videos, setVideos] = useState<YoutubeVideo[] | null>(null)
  const [restored, setRestored] = useState(false)

  useEffect(() => {
    const runId = searchParams.get("run")
    if (!runId) return
    const entry = getResearchHistoryEntry(runId)
    if (!entry) return
    setUrlText(entry.urls.join("\n"))
    setVideos(toYoutubeVideos(entry.videos))
    setRestored(true)
  }, [searchParams])

  async function handleResearch() {
    const urls = splitUrls(urlText)
    if (urls.length === 0) {
      setError("YouTube URL を 1 件以上入力してください。")
      setVideos(null)
      return
    }

    setIsLoading(true)
    setError(null)
    setInvalidUrls([])
    setNotFoundIds([])

    try {
      const response = await fetchWithClientApiKeys("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      })
      const data = (await response.json()) as YoutubeVideosApiResponse

      if (!response.ok) {
        setVideos(null)
        setInvalidUrls(data.invalidUrls ?? [])
        setError(data.error ?? "リサーチに失敗しました。")
        return
      }

      setVideos(data.items ?? [])
      setInvalidUrls(data.invalidUrls ?? [])
      setNotFoundIds(data.notFoundIds ?? [])
      setRestored(false)
      if ((data.items ?? []).length > 0) {
        saveResearchHistory(urls, data.items)
      }
    } catch {
      setVideos(null)
      setError("通信に失敗しました。開発サーバーが起動しているか確認してください。")
    } finally {
      setIsLoading(false)
    }
  }

  const urlCount = splitUrls(urlText).length
  const summary = videos && videos.length > 0 ? summarizeVideos(videos) : null

  return (
    <>
      <Card className={researchCardClass}>
        <CardHeader>
          <CardTitle>一括リサーチ</CardTitle>
          <CardDescription>
            分析したい YouTube ショートの URL を貼り付けて、動画とチャンネルのメタデータを一括取得します。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="research-urls">
              YouTube URLを入力（改行で複数入力可・最大50件）
            </Label>
            <Textarea
              id="research-urls"
              value={urlText}
              onChange={(event) => setUrlText(event.target.value)}
              placeholder={
                "https://youtube.com/shorts/xxxxxxxxxxx\nhttps://youtube.com/shorts/yyyyyyyyyyy"
              }
              className="min-h-32 border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-500"
            />
            <p className="flex items-center gap-1.5 text-xs text-zinc-400">
              <Link2 className="size-3.5" />
              1行につき1つのURLを入力してください。
            </p>
          </div>
          <div>
            <Button
              type="button"
              onClick={handleResearch}
              disabled={isLoading || urlCount === 0}
              className="bg-blue-600 text-white transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:text-white hover:shadow-sm active:translate-y-0 disabled:translate-y-0 disabled:hover:shadow-none"
            >
              <Sparkles data-icon="inline-start" />
              {isLoading ? "取得中..." : "一括リサーチ開始"}
            </Button>
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {invalidUrls.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              無効な URL: {invalidUrls.join(" / ")}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className={researchCardClass}>
        <CardHeader>
          <CardTitle>分析結果</CardTitle>
          <CardDescription>
            {videos === null
              ? "URL を入力して「一括リサーチ開始」を押すと、ここに実データが表示されます。"
              : restored
                ? `履歴から ${videos.length} 件を復元しました。行をクリックすると詳細を開きます。`
                : videos.length > 0
                  ? `${videos.length} 件の動画を取得しました。行をクリックすると詳細を開きます。`
                  : "該当する動画データが見つかりませんでした。"}
          </CardDescription>
          {videos && videos.length > 0 ? (
            <CardAction>
              <ExportMenu
                videos={videos}
                reportTitle="YouTubeショート 一括リサーチレポート"
              />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          {notFoundIds.length > 0 ? (
            <p className="mb-3 text-sm text-zinc-400">
              見つからなかった ID: {notFoundIds.join(", ")}
            </p>
          ) : null}
          {videos && videos.length > 0 && summary ? (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 shadow-sm shadow-black/20">
                  <p className="text-xs text-zinc-400">取得件数</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">
                    {summary.count} 件
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 shadow-sm shadow-black/20">
                  <p className="text-xs text-zinc-400">合計再生数</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">
                    {formatCountJa(summary.views)}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 shadow-sm shadow-black/20">
                  <p className="text-xs text-zinc-400">合計高評価</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">
                    {formatCountJa(summary.likes)}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 shadow-sm shadow-black/20">
                  <p className="text-xs text-zinc-400">平均EG率</p>
                  <p className="mt-1 text-lg font-semibold text-zinc-100">
                    {summary.engagement.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-zinc-800">
                <ResearchResultsTable videos={videos} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/50 py-12 text-center">
                <Inbox className="size-5 text-zinc-400" />
                <p className="text-sm text-zinc-400">まだ結果はありません。</p>
              </div>
              <div className="hidden rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 py-12 md:flex md:flex-col md:items-center md:justify-center">
                <p className="text-sm text-zinc-500">スコアボードは分析後に表示されます</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
