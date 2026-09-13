import type { YoutubeVideo } from "@/lib/youtube"

export type PerformanceMetricKey = "momentum" | "retention" | "ctr"

export type PerformanceMetric = {
  key: PerformanceMetricKey
  label: string
  score: number
  note: string
}

export type PerformanceBoard = {
  buzzPotential: number
  metrics: PerformanceMetric[]
  source: "ai" | "estimated"
}

const METRIC_LABELS: Record<PerformanceMetricKey, string> = {
  momentum: "初動の良さ",
  retention: "視聴維持率の高さ",
  ctr: "サムネイルのクリック率",
}

export function clampScore(value: unknown) {
  const n = typeof value === "number" ? value : Number(value)
  if (!Number.isFinite(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function asNote(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function readMetric(
  source: Record<string, unknown> | undefined,
  key: PerformanceMetricKey
): { score: number; note: string } | null {
  if (!source) return null
  const nested = source[key]
  if (nested && typeof nested === "object") {
    const item = nested as Record<string, unknown>
    if (item.score == null && item.note == null) return null
    return { score: clampScore(item.score), note: asNote(item.note) }
  }
  const scoreKey = `${key}Score`
  if (source[scoreKey] == null && source[key] == null) return null
  const score = source[scoreKey] ?? source[key]
  const note = source[`${key}Note`]
  return { score: clampScore(score), note: asNote(note) }
}

export function parsePerformanceFromGemini(
  parsed: Record<string, unknown>
): PerformanceBoard | undefined {
  const raw = parsed.performance
  if (!raw || typeof raw !== "object") return undefined
  const source = raw as Record<string, unknown>
  const buzz = source.buzzPotential ?? source.score
  if (buzz == null && source.momentum == null && source.retention == null) {
    return undefined
  }

  const metrics: PerformanceMetric[] = (["momentum", "retention", "ctr"] as const).map(
    (key) => {
      const metric = readMetric(source, key)
      return {
        key,
        label: METRIC_LABELS[key],
        score: metric?.score ?? 0,
        note: metric?.note ?? "",
      }
    }
  )

  return {
    buzzPotential: clampScore(buzz ?? average(metrics.map((item) => item.score))),
    metrics,
    source: "ai",
  }
}

function average(values: number[]) {
  if (values.length === 0) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function rate(part: string | undefined, total: string | undefined) {
  const a = Number(part)
  const b = Number(total)
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= 0) return 0
  return (a / b) * 100
}

export function estimatePerformanceBoard(video: YoutubeVideo): PerformanceBoard {
  const views = Number(video.statistics?.viewCount) || 0
  const likes = Number(video.statistics?.likeCount) || 0
  const comments = Number(video.statistics?.commentCount) || 0
  const subs = Number(video.channel?.statistics?.subscriberCount) || 0
  const engagement = rate(
    String(likes + comments),
    video.statistics?.viewCount
  )
  const likeRate = rate(video.statistics?.likeCount, video.statistics?.viewCount)
  const viralRatio = subs > 0 ? views / subs : views > 0 ? 2 : 0
  const title = video.snippet?.title ?? ""
  const tagCount = video.snippet?.tags?.length ?? 0

  const momentum = clampScore(
    Math.min(100, engagement * 18 + Math.min(30, comments > 0 ? 18 : 0) + (likes > 0 ? 8 : 0))
  )
  const retention = clampScore(
    Math.min(100, likeRate * 22 + Math.min(28, engagement * 8) + (views > 10_000 ? 12 : 6))
  )
  const ctr = clampScore(
    Math.min(
      100,
      (title.length >= 8 && title.length <= 42 ? 38 : 22) +
        Math.min(24, tagCount * 3) +
        Math.min(30, viralRatio * 12)
    )
  )
  const buzzPotential = clampScore(
    momentum * 0.4 + retention * 0.3 + ctr * 0.3 + Math.min(12, viralRatio * 4)
  )

  return {
    buzzPotential,
    metrics: [
      {
        key: "momentum",
        label: METRIC_LABELS.momentum,
        score: momentum,
        note: "公開後の高評価・コメント密度から推定しています。",
      },
      {
        key: "retention",
        label: METRIC_LABELS.retention,
        score: retention,
        note: "高評価率とエンゲージメントから視聴の粘りを推定しています。",
      },
      {
        key: "ctr",
        label: METRIC_LABELS.ctr,
        score: ctr,
        note: "タイトル・タグと再生/登録者の伸びからクリック率を推定しています。",
      },
    ],
    source: "estimated",
  }
}

export function resolvePerformanceBoard(
  video: YoutubeVideo,
  analysis: { performance?: PerformanceBoard } | null
): PerformanceBoard {
  const estimated = estimatePerformanceBoard(video)
  const raw = analysis?.performance
  if (!raw || typeof raw !== "object") return estimated

  const metrics = Array.isArray(raw.metrics)
    ? raw.metrics
        .filter((metric): metric is PerformanceBoard["metrics"][number] => Boolean(metric))
        .map((metric, index) => {
          const key: PerformanceMetricKey =
            metric.key === "momentum" || metric.key === "retention" || metric.key === "ctr"
              ? metric.key
              : index === 0
                ? "momentum"
                : index === 1
                  ? "retention"
                  : "ctr"
          return {
            key,
            label: metric.label || METRIC_LABELS[key],
            score: clampScore(metric.score),
            note: typeof metric.note === "string" ? metric.note : "",
          }
        })
    : []

  if (metrics.length === 0) {
    return {
      ...estimated,
      buzzPotential: clampScore(raw.buzzPotential ?? estimated.buzzPotential),
      source: raw.source === "ai" ? "ai" : estimated.source,
    }
  }

  return {
    buzzPotential: clampScore(raw.buzzPotential ?? average(metrics.map((item) => item.score))),
    metrics,
    source: raw.source === "estimated" ? "estimated" : "ai",
  }
}

export function scoreTone(score: number) {
  if (score >= 75) return { label: "強い", bar: "bg-emerald-500", text: "text-emerald-400" }
  if (score >= 50) return { label: "標準", bar: "bg-amber-400", text: "text-amber-300" }
  return { label: "弱い", bar: "bg-red-500", text: "text-red-400" }
}
