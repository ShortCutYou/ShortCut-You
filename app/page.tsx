import { Suspense } from "react"
import { AppShell } from "@/components/app-shell"
import { ResearchWorkspace } from "@/components/research-workspace"

export default function Page() {
  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-100 md:text-2xl">
            ショート動画リサーチ
          </h1>
          <p className="text-sm text-zinc-400">
            競合や参考動画の URL をまとめて入力し、伸びている理由を一括で可視化しましょう。
          </p>
        </div>
        <Suspense fallback={<p className="text-sm text-zinc-400">読み込み中...</p>}>
          <ResearchWorkspace />
        </Suspense>
      </div>
    </AppShell>
  )
}
