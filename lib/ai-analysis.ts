import { formatEngagementRate, formatIso8601Duration, formatLikeRate } from "@/lib/format-stats"

export type AnalyzeVideoInput = {
  videoId: string
  title: string
  channelTitle: string
  description: string
  tags: string[]
  duration: string
  publishedAt: string
  viewCount?: string
  likeCount?: string
  commentCount?: string
  subscriberCount?: string
  channelVideoCount?: string
  hiddenSubscribers?: boolean
}

export type BuzzAnalysis = {
  summary: string
  hook: {
    headline: string
    analysis: string
  }
  structure: {
    secret: string
    beats: { label: string; detail: string }[]
  }
  whyItGrew: string[]
  copyablePoints: string[]
  creatorInsights: string[]
  ideaTemplates: { title: string; outline: string }[]
  source: "gemini"
  model: string
}

const ANALYSIS_JSON_SHAPE = `{
  "summary": "2-3文の総評",
  "hook": { "headline": "冒頭フックの一言", "analysis": "冒頭1-3秒の分析" },
  "structure": {
    "secret": "構成の秘密の総論",
    "beats": [{ "label": "0-3秒", "detail": "..." }, { "label": "中盤", "detail": "..." }, { "label": "結末", "detail": "..." }]
  },
  "whyItGrew": ["要因1", "要因2", "要因3"],
  "copyablePoints": ["真似できる点1", "真似できる点2"],
  "creatorInsights": ["示唆1", "示唆2", "示唆3"],
  "ideaTemplates": [{ "title": "企画名", "outline": "構成案" }]
}`

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function asTextList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.map((item) => asText(item)).filter(Boolean)
}

function extractJsonObject(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const raw = fenced?.[1] ?? text
  const start = raw.indexOf("{")
  const end = raw.lastIndexOf("}")
  if (start < 0 || end <= start) return null
  try {
    return JSON.parse(raw.slice(start, end + 1)) as Record<string, unknown>
  } catch {
    return null
  }
}

function normalizeAnalysis(parsed: Record<string, unknown>, model: string): BuzzAnalysis {
  const hook = (parsed.hook ?? {}) as Record<string, unknown>
  const structure = (parsed.structure ?? {}) as Record<string, unknown>
  const beats = Array.isArray(structure.beats)
    ? structure.beats
        .map((beat) => {
          const item = (beat ?? {}) as Record<string, unknown>
          return {
            label: asText(item.label),
            detail: asText(item.detail),
          }
        })
        .filter((beat) => beat.label || beat.detail)
    : []
  const ideaTemplates = Array.isArray(parsed.ideaTemplates)
    ? parsed.ideaTemplates
        .map((idea) => {
          const item = (idea ?? {}) as Record<string, unknown>
          return {
            title: asText(item.title),
            outline: asText(item.outline),
          }
        })
        .filter((idea) => idea.title || idea.outline)
    : []

  const analysis: BuzzAnalysis = {
    summary: asText(parsed.summary),
    hook: {
      headline: asText(hook.headline),
      analysis: asText(hook.analysis),
    },
    structure: {
      secret: asText(structure.secret),
      beats,
    },
    whyItGrew: asTextList(parsed.whyItGrew),
    copyablePoints: asTextList(parsed.copyablePoints),
    creatorInsights: asTextList(parsed.creatorInsights),
    ideaTemplates,
    source: "gemini",
    model,
  }

  if (
    !analysis.summary &&
    !analysis.hook.analysis &&
    analysis.whyItGrew.length === 0 &&
    analysis.creatorInsights.length === 0
  ) {
    throw new Error("Gemini の応答を解析できませんでした。")
  }

  return analysis
}

function buildPrompt(input: AnalyzeVideoInput) {
  const likeRate = formatLikeRate(input.likeCount, input.viewCount)
  const engagementRate = formatEngagementRate(
    input.likeCount,
    input.commentCount,
    input.viewCount
  )
  const duration = formatIso8601Duration(input.duration)
  const subscribers = input.hiddenSubscribers
    ? "非公開"
    : (input.subscriberCount ?? "-")

  return `あなたはYouTubeショート特化のリサーチアナリストです。
以下の実データを根拠に、この動画がなぜ伸びたかを日本語で具体的に分析してください。
一般論の使い回しではなく、タイトルと数値の関係に触れてください。

【必須で使う数値】
- タイトル: ${input.title}
- チャンネル名: ${input.channelTitle}
- 再生数: ${input.viewCount ?? "-"}
- 高評価数: ${input.likeCount ?? "-"}
- コメント数: ${input.commentCount ?? "-"}
- エンゲージメント率: ${engagementRate}
- 高評価率: ${likeRate}
- チャンネル登録者数: ${subscribers}
- チャンネル総動画数: ${input.channelVideoCount ?? "-"}
- 尺: ${duration}
- 公開日: ${input.publishedAt || "-"}
- タグ: ${(input.tags ?? []).slice(0, 12).join(", ") || "なし"}
- 説明文: ${(input.description ?? "").slice(0, 500) || "なし"}

次の4点を必ず含めてください。
1. 冒頭フックの分析
2. 構成の秘密
3. クリエイターへの示唆
4. なぜ伸びたのか

出力はJSONのみ。前置きやマークダウンは禁止。
${ANALYSIS_JSON_SHAPE}`
}

function geminiKey() {
  return (
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    ""
  )
}

function geminiModels() {
  const preferred = process.env.AI_MODEL?.trim()
  return [...new Set(
    [preferred, "gemini-2.5-flash", "gemini-3.5-flash"].filter(
      (model): model is string => Boolean(model)
    )
  )]
}

type GeminiResponse = {
  error?: { message?: string; status?: string }
  candidates?: { content?: { parts?: { text?: string }[] } }[]
}

export const GEMINI_REQUEST_TIMEOUT_MS = 60_000
export const USER_RETRY_MESSAGE =
  "AI分析が時間切れになりました。ページを再読み込みするか、もう一度お試しください。"
export const USER_BUSY_MESSAGE =
  "ただいま混み合っています。少し待ってから、もう一度お試しください。"

function isTimeoutError(error: unknown) {
  if (!(error instanceof Error)) return false
  return (
    error.name === "TimeoutError" ||
    error.name === "AbortError" ||
    /aborted due to timeout|the operation was aborted|timeout/i.test(error.message)
  )
}

function isBusyGeminiError(message: string, status?: number) {
  if (status === 429 || status === 503) return true
  return /high demand|unavailable|try again|overloaded|resource exhausted|quota/i.test(
    message
  )
}

function toUserFacingError(error: Error, status?: number) {
  const wrapped = new Error(
    isTimeoutError(error) || status === 504
      ? USER_RETRY_MESSAGE
      : isBusyGeminiError(error.message, status)
        ? USER_BUSY_MESSAGE
        : error.message || USER_BUSY_MESSAGE
  ) as Error & { status?: number }
  wrapped.status = status ?? (isTimeoutError(error) ? 504 : 503)
  return wrapped
}

function isUnknownModelError(message: string, status?: number) {
  if (status === 404) return true
  return /not found|not supported|unknown model/i.test(message)
}

async function requestGemini(model: string, apiKey: string, prompt: string) {
  let response: Response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(GEMINI_REQUEST_TIMEOUT_MS),
      }
    )
  } catch (error) {
    if (isTimeoutError(error)) {
      const timeoutError = new Error(USER_RETRY_MESSAGE) as Error & { status?: number }
      timeoutError.status = 504
      throw timeoutError
    }
    throw error
  }

  const body = (await response.json()) as GeminiResponse
  if (!response.ok) {
    const error = new Error(
      body.error?.message ?? `Gemini API の呼び出しに失敗しました。（${model}）`
    ) as Error & { status?: number }
    error.status = response.status
    throw error
  }

  const text =
    body.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("") ?? ""
  if (!text) {
    throw new Error("Gemini から本文が返りませんでした。")
  }
  return text
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function generateBuzzAnalysis(
  input: AnalyzeVideoInput,
  apiKeyOverride?: string
): Promise<BuzzAnalysis> {
  const apiKey = apiKeyOverride?.trim() || geminiKey()
  if (!apiKey) {
    const error = new Error(
      "Google Gemini API キーが設定されていません。設定ページでキーを保存するか、.env.local に GEMINI_API_KEY を追加してください。"
    ) as Error & {
      status?: number
    }
    error.status = 500
    throw error
  }

  const prompt = buildPrompt(input)
  let lastError: Error | null = null
  const maxAttempts = 3

  for (const model of geminiModels()) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const text = await requestGemini(model, apiKey, prompt)
        const parsed = extractJsonObject(text)
        if (!parsed) {
          throw new Error("Gemini の応答が JSON ではありませんでした。")
        }
        return normalizeAnalysis(parsed, model)
      } catch (error) {
        if (isTimeoutError(error)) {
          throw toUserFacingError(
            error instanceof Error ? error : new Error(USER_RETRY_MESSAGE),
            504
          )
        }

        const failed = error instanceof Error ? error : new Error(USER_BUSY_MESSAGE)
        const status =
          "status" in failed && typeof failed.status === "number" ? failed.status : undefined
        lastError = toUserFacingError(failed, status)

        if (isUnknownModelError(failed.message, status)) {
          break
        }
        if (isBusyGeminiError(failed.message, status) && attempt < maxAttempts) {
          await wait(2000 * 2 ** (attempt - 1))
          continue
        }
        throw lastError
      }
    }
  }

  throw lastError ?? toUserFacingError(new Error(USER_BUSY_MESSAGE), 503)
}
