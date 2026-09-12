import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { SettingsView } from "@/components/settings-view"

export const metadata: Metadata = {
  title: "設定",
  description: "APIキーと表示・データの管理",
}

export default function SettingsPage() {
  return (
    <AppShell heading="設定" subheading="API キーと表示・データの管理">
      <SettingsView />
    </AppShell>
  )
}
