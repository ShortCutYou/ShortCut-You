import { Suspense } from "react"
import { AppShell } from "@/components/app-shell"
import { ResearchWorkspace } from "@/components/research-workspace"

export default function Page() {
  return (
    <AppShell
      heading="リサーチ"
      subheading="YouTube ショートのバズ要因を AI が自動分析します"
      contentClassName="bg-slate-50/70 dark:bg-zinc-950/40"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            ショート動画リサーチ
          </h2>
          <p className="text-sm text-muted-foreground">
            競合や参考動画の URL をまとめて入力し、伸びている理由を一括で可視化しましょう。
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-muted-foreground">読み込み中...</p>}>
          <ResearchWorkspace />
        </Suspense>
      </div>
    </AppShell>
  )
}
