"use client"

import { AppShell } from "@/components/app-shell"
import { RouteErrorFallback } from "@/components/route-error-fallback"

export default function HistoryDetailError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <AppShell heading="履歴詳細" subheading="読み込みエラー">
      <RouteErrorFallback
        title="この履歴を表示できませんでした"
        description="履歴データの読み込みで問題が起きました。再読み込みするか、履歴一覧へ戻ってください。"
        reset={reset}
        homeHref="/history"
        homeLabel="履歴一覧へ"
      />
    </AppShell>
  )
}
