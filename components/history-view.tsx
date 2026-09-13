"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState, useEffect } from "react"
import { Clock, Trash2 } from "lucide-react"

import {
  clearResearchHistory,
  deleteResearchHistoryEntry,
  formatHistoryDate,
  readResearchHistory,
  type ResearchHistoryEntry,
} from "@/lib/research-history"
import { formatCountJa } from "@/lib/format-stats"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function HistoryView() {
  const router = useRouter()
  const [entries, setEntries] = useState<ResearchHistoryEntry[]>([])

  useEffect(() => {
    setEntries(readResearchHistory())
  }, [])

  const countLabel = useMemo(
    () => (entries.length === 0 ? "まだ履歴はありません" : `${entries.length} 件のリサーチ`),
    [entries.length]
  )

  function refresh() {
    setEntries(readResearchHistory())
  }

  function handleDelete(id: string) {
    deleteResearchHistoryEntry(id)
    refresh()
  }

  function handleClear() {
    if (!window.confirm("すべてのリサーチ履歴を削除しますか？")) return
    clearResearchHistory()
    refresh()
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-zinc-100 md:text-2xl">リサーチ履歴</h2>
          <p className="text-sm text-zinc-400">{countLabel}</p>
        </div>
        {entries.length > 0 ? (
          <Button type="button" variant="outline" size="sm" onClick={handleClear}>
            <Trash2 data-icon="inline-start" />
            すべて削除
          </Button>
        ) : null}
      </div>

      {entries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>履歴がありません</CardTitle>
            <CardDescription>
              トップの一括リサーチを実行すると、ここに日時と URL ごとの履歴が残ります。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">リサーチを始める</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => {
            const preview = entry.videos.slice(0, 3)
            return (
              <Card
                key={entry.id}
                className="cursor-pointer transition-colors hover:bg-zinc-800/40"
                onClick={() => router.push(`/history/${entry.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Clock className="size-4 text-muted-foreground" />
                        {formatHistoryDate(entry.createdAt)}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2 break-all">
                        {entry.queryLabel}
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleDelete(entry.id)
                      }}
                    >
                      <Trash2 data-icon="inline-start" />
                      削除
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-xs text-muted-foreground">
                    {entry.videos.length} 件の動画 / {entry.urls.length} 件の URL
                  </p>
                  <div className="flex flex-col gap-2">
                    {preview.map((video) => (
                      <div key={video.id} className="flex items-center gap-3">
                        <div className="h-12 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
                          {video.thumbnailUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={video.thumbnailUrl}
                              alt=""
                              className="size-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{video.title}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {video.channelName} · 再生 {formatCountJa(video.viewCount)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
