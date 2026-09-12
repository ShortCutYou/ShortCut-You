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
import { Skeleton } from "@/components/ui/skeleton"

const loadingHints = [
  "冒頭3秒のフックを分解しています…",
  "再生数と高評価のバランスを読み解いています…",
  "真似できる型を抽出しています…",
]

function AnalysisResults({ analysis }: { analysis: BuzzAnalysis }) {
  const beats = analysis.structure?.beats ?? []
  const insights = analysis.creatorInsights ?? []
  const whyItGrew = analysis.whyItGrew ?? []
  const copyablePoints = analysis.copyablePoints ?? []
  const ideaTemplates = analysis.ideaTemplates ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl bg-background/60 p-4 ring-1 ring-foreground/10">
        <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          総評
        </p>
        <p className="text-sm leading-relaxed text-foreground">{analysis.summary}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Card size="sm" className="bg-background/70">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" />
              冒頭フックの分析
            </CardDescription>
            <CardTitle className="text-base leading-snug">
              {analysis.hook?.headline ?? "-"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {analysis.hook?.analysis ?? "-"}
            </p>
          </CardContent>
        </Card>

        <Card size="sm" className="bg-background/70">
          <CardHeader>
            <CardDescription className="flex items-center gap-1.5">
              <Clapperboard className="size-3.5" />
              構成の秘密
            </CardDescription>
            <CardTitle className="text-base leading-snug">
              {analysis.structure?.secret ?? "-"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {beats.map((beat, index) => (
              <div key={`${beat.label}-${index}`} className="rounded-lg bg-muted/60 px-3 py-2">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {beat.label}
                </p>
                <p className="text-sm">{beat.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card size="sm" className="bg-background/70">
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
                  {insight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">なぜ伸びたのか</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="flex flex-col gap-2">
              {whyItGrew.map((item, index) => (
                <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-relaxed">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardTitle className="text-sm">真似できるポイント</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2">
              {copyablePoints.map((item, index) => (
                <li
                  key={`${item}-${index}`}
                  className="flex gap-2 text-sm leading-relaxed before:mt-2 before:size-1.5 before:shrink-0 before:rounded-full before:bg-primary before:content-['']"
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card size="sm">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Target className="size-3.5" />
            企画の構成案
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {ideaTemplates.map((idea, index) => (
            <div
              key={`${idea.title}-${index}`}
              className="rounded-xl bg-muted/50 p-3 ring-1 ring-foreground/8"
            >
              <p className="font-medium">{idea.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {idea.outline}
              </p>
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
      setAnalysis(data.analysis)
      onAnalysisChange?.(data.analysis)
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
    <Card className="relative overflow-hidden ring-1 ring-violet-500/20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.7_0.18_300_/_0.16),transparent_42%),radial-gradient(circle_at_bottom_right,oklch(0.65_0.15_250_/_0.12),transparent_40%)]" />
      <CardHeader className="relative">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-8 items-center justify-center rounded-lg bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/30">
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
              <Sparkles data-icon="inline-start" />
            )}
            {isLoading ? "混雑時は自動で再試行します…" : analysis ? "再分析する" : "AI分析を実行する"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="relative">
        {isLoading ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-violet-200">
              <LoaderCircle className="size-4 animate-spin" />
              {loadingHints[hintIndex]}
            </div>
            <div className="grid gap-3 lg:grid-cols-3">
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
            </div>
            <Skeleton className="h-24" />
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

        {!isLoading && analysis ? <AnalysisResults analysis={analysis} /> : null}
      </CardContent>
    </Card>
  )
}
