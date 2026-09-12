"use client"

import { AppShell } from "@/components/app-shell"
import { RouteErrorFallback } from "@/components/route-error-fallback"

export default function DetailError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <AppShell heading="動画詳細" subheading="読み込みエラー">
      <RouteErrorFallback
        title="このページを表示できませんでした"
        description="データの取得または画面の描画で問題が起きました。再読み込みするか、リサーチ画面へ戻ってください。"
        reset={reset}
      />
    </AppShell>
  )
}
