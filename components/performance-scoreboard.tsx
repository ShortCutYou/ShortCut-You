"use client"

import { useEffect, useState } from "react"
import { MousePointerClick, Rocket, Timer } from "lucide-react"

import {
  resolvePerformanceBoard,
  scoreTone,
  type PerformanceBoard,
  type PerformanceMetricKey,
} from "@/lib/performance-score"
import type { BuzzAnalysis } from "@/lib/ai-analysis"
import type { YoutubeVideo } from "@/lib/youtube"
import { Badge } from "@/components/ui/badge"

const METRIC_ICONS: Record<PerformanceMetricKey, typeof Rocket> = {
  momentum: Rocket,
  retention: Timer,
  ctr: MousePointerClick,
}

function BuzzGauge({ score }: { score: number }) {
  const [shown, setShown] = useState(0)
  const size = 148
  const stroke = 12
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - shown / 100)
  const tone = scoreTone(score)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setShown(score))
    return () => window.cancelAnimationFrame(frame)
  }, [score])

  return (
    <div className="relative mx-auto size-[148px]">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <defs>
          <linearGradient id="buzz-gauge-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="45%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#27272a"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#buzz-gauge-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className={`text-3xl font-semibold tabular-nums ${tone.text}`}>{shown}</p>
        <p className="text-[11px] tracking-wide text-zinc-400">/ 100</p>
      </div>
    </div>
  )
}

function MetricRow({
  metric,
}: {
  metric: PerformanceBoard["metrics"][number]
}) {
  const Icon = METRIC_ICONS[metric?.key] ?? Rocket
  const tone = scoreTone(Number(metric?.score) || 0)
  const note = typeof metric?.note === "string" ? metric.note : ""

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300">
            <Icon className="size-3.5" />
          </span>
          <p className="truncate text-sm font-medium text-zinc-100">{metric?.label ?? "-"}</p>
        </div>
        <p className={`text-sm font-semibold tabular-nums ${tone.text}`}>
          {Number.isFinite(metric?.score) ? metric.score : 0}
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400 transition-[width] duration-1000 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, Number(metric?.score) || 0))}%` }}
        />
      </div>
      {note ? (
        <p className="text-xs leading-relaxed text-zinc-400">
          {note.replaceAll("クリック請求", "クリック率").replaceAll("クリック訴求", "クリック率")}
        </p>
      ) : null}
    </div>
  )
}

export function PerformanceScoreboard({
  video,
  analysis,
}: {
  video: YoutubeVideo
  analysis: BuzzAnalysis | null
}) {
  const board = resolvePerformanceBoard(video, analysis)

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-sm shadow-black/40">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-zinc-400 uppercase">
            パフォーマンス指標
          </p>
          <h3 className="mt-0.5 text-sm font-semibold text-zinc-100">
            バズ・ポテンシャルスコア
          </h3>
        </div>
        <Badge variant="outline" className="border-zinc-700 text-zinc-300">
          {board.source === "ai" ? "AI算出" : "数値から推定"}
        </Badge>
      </div>
      <div className="grid items-center gap-5 md:grid-cols-[auto_minmax(0,1fr)]">
        <div className="flex flex-col items-center gap-2">
          <BuzzGauge key={`${board.source}-${board.buzzPotential}`} score={board.buzzPotential} />
          <p className="text-xs text-zinc-400">ショートとしての伸びやすさ</p>
        </div>
        <div className="flex flex-col gap-4">
          {board.metrics?.map((metric) => (
            <MetricRow key={metric.key} metric={metric} />
          ))}
        </div>
      </div>
    </div>
  )
}
