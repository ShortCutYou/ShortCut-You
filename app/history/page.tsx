import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { HistoryView } from "@/components/history-view"

export const metadata: Metadata = {
  title: "履歴",
  description: "このブラウザに保存した一括リサーチの履歴",
}

export default function HistoryPage() {
  return (
    <AppShell heading="履歴" subheading="過去の一括リサーチ結果をこのブラウザに保存しています">
      <HistoryView />
    </AppShell>
  )
}
