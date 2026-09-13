"use client"

import { useState } from "react"
import {
  Clapperboard,
  Lightbulb,
  LoaderCircle,
  Sparkles,
  Target,
} from "lucide-react"

import type { AnalyzeVideoInput, BuzzAnalysis } from "@/lib/ai-analysis"
import { fetchWithClientApiKeys } from "@/lib/client-settings"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AnalysisText } from "@/components/analysis-text"
import { SafeBoundary } from "@/components/safe-boundary"

const loadingHints = [
  "冒頭3秒のフックを分解しています…",
  "再生数と高評価のバランスを読み解いています…",
  "真似できる型を抽出しています…",
]

function asStringList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => (typeof item === "string" ? item : item == null ? "" : String(item)))
    .filter(Boolean)
}

function NumberedInsightList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2.5 text-sm leading-relaxed">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[11px] font-semibold tabular-nums text-white">
            {index + 1}
          </span>
          <span className="min-w-0 pt-0.5">
            <AnalysisText text={item} />
          </span>
        </li>
      ))}
    </ol>
  )
}

function AnalysisResults({ analysis }: { analysis: BuzzAnalysis }) {
  const beats = Array.isArray(analysis.structure?.beats) ? analysis.structure.beats : []
  const insights = asStringList(analysis.creatorInsights)
  const whyItGrew = asStringList(analysis.whyItGrew)
  const copyablePoints = asStringList(analysis.copyablePoints)
  const ideaTemplates = Array.isArray(analysis.ideaTemplates) ? analysis.ideaTemplates : []

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          総評
        </p>
        <AnalysisText
          as="p"
          className="text-sm leading-relaxed text-foreground"
          text={analysis.summary}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card size="sm" className="border-zinc-800 bg-zinc-950/70">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              冒頭フックの分析
            </CardDescription>
            <CardTitle className="text-base leading-snug">
              <AnalysisText text={analysis.hook?.headline ?? "-"} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnalysisText
              as="p"
              className="text-sm leading-relaxed text-muted-foreground"
              text={analysis.hook?.analysis ?? "-"}
            />
          </CardContent>
        </Card>

        <Card size="sm" className="border-zinc-800 bg-zinc-950/70">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Clapperboard className="size-3.5" />
              構成の型
            </CardDescription>
            <CardTitle className="text-base leading-snug">
              <AnalysisText text={analysis.structure?.secret ?? "-"} />
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {beats.map((beat, index) => (
              <div key={`${beat?.label ?? "beat"}-${index}`} className="rounded-lg bg-muted/60 px-3 py-2">
                <p className="text-[11px] font-medium tracking-wide text-zinc-500">
                  {beat?.label || "要点"}
                </p>
                <p className="text-sm">
                  <AnalysisText text={beat?.detail} />
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card size="sm" className="border-zinc-800 bg-zinc-950/70">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Lightbulb className="size-3.5" />
              クリエイターへの示唆
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {insights.map((insight, index) => (
                <li
                  key={`${insight}-${index}`}
                  className="rounded-lg bg-muted/60 px-3 py-2 text-sm leading-relaxed"
                >
                  <AnalysisText text={insight} />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card size="sm" className="border-zinc-800 bg-zinc-950/70">
          <CardHeader>
            <CardTitle className="text-sm">なぜ伸びたのか</CardTitle>
          </CardHeader>
          <CardContent>
            <NumberedInsightList items={whyItGrew} />
          </CardContent>
        </Card>
        <Card size="sm" className="border-zinc-800 bg-zinc-950/70">
          <CardHeader>
            <CardTitle className="text-sm">真似できるポイント</CardTitle>
          </CardHeader>
          <CardContent>
            <NumberedInsightList items={copyablePoints} />
          </CardContent>
        </Card>
      </div>

      <Card size="sm" className="border-zinc-800 bg-zinc-950/70">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Target className="size-3.5" />
            構成のフレームワーク
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {ideaTemplates.map((idea, index) => (
            <div
              key={`${idea?.title ?? "idea"}-${index}`}
              className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3"
            >
              <p className="text-[11px] font-medium tracking-wide text-zinc-500">
                構成テンプレ {index + 1}
              </p>
              <p className="mt-1 font-medium text-zinc-100">
                <AnalysisText text={idea?.title} />
              </p>
              <p className="mt-2 text-[11px] font-medium text-zinc-500">転用の要点</p>
              <AnalysisText
                as="p"
                className="mt-1 text-sm leading-relaxed text-zinc-400"
                text={idea?.outline}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export function AiBuzzAnalyzer({
  input,
  onAnalysisChange,
}: {
  input: AnalyzeVideoInput
  onAnalysisChange?: (analysis: BuzzAnalysis | null) => void
}) {
  const [analysis, setAnalysis] = useState<BuzzAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hintIndex, setHintIndex] = useState(0)

  async function runAnalysis() {
    setIsLoading(true)
    setError(null)
    setHintIndex(0)
    const timer = window.setInterval(() => {
      setHintIndex((current) => (current + 1) % loadingHints.length)
    }, 900)

    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), 120_000)

    try {
      const response = await fetchWithClientApiKeys("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      })
      const data = (await response.json()) as {
        analysis?: BuzzAnalysis
        error?: string
      }
      if (!response.ok || !data.analysis) {
        setError(data.error ?? "AI分析に失敗しました。もう一度お試しください。")
        return
      }
      try {
        setAnalysis(data.analysis)
        onAnalysisChange?.(data.analysis)
      } catch {
        setError("分析結果の表示に失敗しました。もう一度お試しください。")
      }
    } catch (error) {
      const timedOut =
        error instanceof Error && error.name === "AbortError"
      setError(
        timedOut
          ? "AI分析が時間切れになりました。もう一度お試しください。"
          : "通信に失敗しました。もう一度お試しください。"
      )
    } finally {
      window.clearTimeout(timeoutId)
      window.clearInterval(timer)
      setIsLoading(false)
    }
  }

  return (
    <Card className="relative overflow-hidden border-zinc-800 bg-zinc-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgb(37_99_235_/_0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgb(24_24_27_/_0.8),transparent_40%)]" />
      <CardHeader className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-300 ring-1 ring-blue-500/30">
                <Sparkles className="size-4" />
              </span>
              AIバズ要因アナライザー
            </CardTitle>
            <CardDescription>
              数値とメタデータから、伸びた理由・構成・次に真似すべき型を言語化します。
            </CardDescription>
          </div>
          <Button type="button" onClick={runAnalysis} disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <>
                <Sparkles data-icon="inline-start" />
                {analysis ? "再分析する" : "AI分析を実行する"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10">
            <LoaderCircle className="size-6 animate-spin text-blue-400" />
            <p className="text-sm text-blue-300">{loadingHints[hintIndex]}</p>
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-destructive">{error}</p>
            <p className="text-xs text-muted-foreground">
              混雑しているときは、数秒待って「再分析する」を押すか、ページを再読み込みしてください。
            </p>
          </div>
        ) : null}

        {!isLoading && !analysis && !error ? (
          <p className="text-sm text-muted-foreground">
            ボタンを押すと Gemini が、冒頭フック・構成・クリエイターへの示唆を生成します。
          </p>
        ) : null}

        {!isLoading && analysis ? (
          <SafeBoundary>
            <AnalysisResults analysis={analysis} />
          </SafeBoundary>
        ) : null}
      </CardContent>
    </Card>
  )
}
