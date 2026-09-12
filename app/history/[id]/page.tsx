import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { HistoryDetailView } from "@/components/history-detail-view"

export const metadata: Metadata = {
  title: "履歴詳細",
  description: "保存したリサーチ結果の復元",
}

export default function HistoryDetailPage() {
  return (
    <AppShell heading="履歴詳細" subheading="保存したリサーチ結果の復元">
      <HistoryDetailView />
    </AppShell>
  )
}
