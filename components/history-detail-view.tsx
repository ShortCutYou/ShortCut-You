"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react"

import {
  deleteResearchHistoryEntry,
  formatHistoryDate,
  getResearchHistoryEntry,
  toYoutubeVideos,
  type ResearchHistoryEntry,
} from "@/lib/research-history"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ResearchResultsTable } from "@/components/research-results-table"
import { ExportMenu } from "@/components/export-menu"

export function HistoryDetailView() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [entry, setEntry] = useState<ResearchHistoryEntry | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const id = typeof params.id === "string" ? params.id : ""
    setEntry(id ? getResearchHistoryEntry(id) : null)
    setReady(true)
  }, [params.id])

  if (!ready) {
    return <p className="text-sm text-muted-foreground">読み込み中...</p>
  }

  if (!entry) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <p className="text-sm text-muted-foreground">この履歴は見つかりませんでした。</p>
        <Button variant="outline" asChild>
          <Link href="/history">履歴一覧へ</Link>
        </Button>
      </div>
    )
  }

  const entryId = entry.id

  function handleDelete() {
    deleteResearchHistoryEntry(entryId)
    router.push("/history")
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/history">
            <ArrowLeft data-icon="inline-start" />
            履歴一覧
          </Link>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/?run=${entry.id}`}>
              <RotateCcw data-icon="inline-start" />
              リサーチ画面で開く
            </Link>
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleDelete}>
            <Trash2 data-icon="inline-start" />
            この履歴を削除
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
          {formatHistoryDate(entry.createdAt)}
        </h2>
        <p className="mt-1 break-all text-sm text-muted-foreground">{entry.queryLabel}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>当時のリサーチ結果</CardTitle>
          <CardDescription>
            {entry.videos.length} 件。行をクリックすると各動画の詳細ページへ移動します。
          </CardDescription>
          {entry.videos.length > 0 ? (
            <CardAction>
              <ExportMenu
                videos={toYoutubeVideos(entry.videos)}
                reportTitle={`リサーチ履歴 ${formatHistoryDate(entry.createdAt)}`}
              />
            </CardAction>
          ) : null}
        </CardHeader>
        <CardContent>
          <ResearchResultsTable videos={toYoutubeVideos(entry.videos)} />
        </CardContent>
      </Card>
    </div>
  )
}
