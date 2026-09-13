import { formatEngagementRate, formatIso8601Duration, formatLikeRate } from "@/lib/format-stats"
import {
  parsePerformanceFromGemini,
  type PerformanceBoard,
} from "@/lib/performance-score"

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
  channelViewCount?: string
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
  performance?: PerformanceBoard
  statComments?: StatComments
  source: "gemini"
  model: string
}

export type StatComments = {
  views?: string
  likes?: string
  comments?: string
  engagement?: string
  likeRate?: string
  favorites?: string
  category?: string
  subscribers?: string
  videoCount?: string
  channelViews?: string
}

const ANALYSIS_JSON_SHAPE = `{
  "summary": "この動画のタイトル語句と再生数・EG率を結び、アルゴリズム上なぜ伸びたかを2-3文。抽象語禁止",
  "hook": {
    "headline": "冒頭で使っている具体ワード/ギャップを一言で",
    "analysis": "冒頭で置くギャップ/約束の型と、タイトル語句との対応。台本・秒割り禁止。要点1-2文"
  },
  "structure": {
    "secret": "この動画の構成テンプレ名（例: ギャップ提示→証拠の小出し→オチ逆転）。セリフ禁止",
    "beats": [
      { "label": "冒頭のフック構造", "detail": "最初に何のギャップ/約束を置く型か。要点1-2文。台本禁止" },
      { "label": "中盤のテンポ", "detail": "情報の出し方・切替えの型。要点1-2文。台本禁止" },
      { "label": "オチの抜け感", "detail": "回収・余韻・再視聴を誘う型。要点1-2文。台本禁止" },
      { "label": "ジャンル転用", "detail": "別ジャンルでも同じ骨格で回すときの置き換え方。1-2文" }
    ]
  },
  "whyItGrew": [
    "アルゴリズム観点（再視聴/コメント誘発/完走）を数値と結び1文",
    "心理学フックをタイトル語句から因果で1文",
    "尺と維持トリックの因果を1文"
  ],
  "copyablePoints": [
    "構成テンプレとして抜き出せる型を1つ、ジャンル非依存で",
    "中盤のテンポの型を自分の題材に置き換える要点",
    "オチ/余韻の型を転用するときの注意点"
  ],
  "creatorInsights": [
    "この骨格を自分のジャンルに当てはめるときの置換表（題材だけ変える）",
    "型を崩すと失う要素（フック/テンポ/抜け）",
    "次の企画で同じフレームワークを使う判断基準"
  ],
  "ideaTemplates": [
    {
      "title": "構成テンプレ名（例: 常識否定→根拠3拍→逆転）",
      "outline": "フック/中盤/オチの役割を3行以内の要点。セリフ・秒数台本は禁止。自分のジャンルへの当てはめ方を1文"
    },
    {
      "title": "別の切り口のテンプレ名",
      "outline": "同じ骨格の応用バリエーション。台本禁止、要点のみ"
    }
  ],
  "performance": {
    "buzzPotential": 0,
    "momentum": { "score": 0, "note": "初動の根拠を1文" },
    "retention": { "score": 0, "note": "視聴維持の根拠を1文" },
    "ctr": { "score": 0, "note": "タイトル/サムネのクリック率の根拠を1文" }
  },
  "statComments": {
    "views": "再生規模のひとこと(20-30字)",
    "likes": "高評価のひとこと(20-30字)",
    "comments": "コメントのひとこと(20-30字)",
    "engagement": "EG率のひとこと(20-30字)",
    "likeRate": "高評価率のひとこと(20-30字)",
    "favorites": "お気に入りのひとこと(20-30字)",
    "category": "カテゴリのひとこと(20-30字)",
    "subscribers": "登録者規模のひとこと(20-30字)",
    "videoCount": "投稿本数のひとこと(20-30字)",
    "channelViews": "チャンネル総再生のひとこと(20-30字)"
  }
}`

function asText(value: unknown) {
  if (typeof value === "string") return value.trim()
  if (typeof value === "number" || typeof value === "boolean") return String(value)
  return ""
}

function asShortComment(value: unknown) {
  const text = asText(value).replace(/\s+/g, " ")
  if (!text) return ""
  return text.length > 40 ? `${text.slice(0, 40)}…` : text
}

function parseStatComments(parsed: Record<string, unknown>): StatComments | undefined {
  const raw = parsed.statComments
  if (!raw || typeof raw !== "object") return undefined
  const source = raw as Record<string, unknown>
  const comments: StatComments = {
    views: asShortComment(source.views),
    likes: asShortComment(source.likes),
    comments: asShortComment(source.comments),
    engagement: asShortComment(source.engagement),
    likeRate: asShortComment(source.likeRate),
    favorites: asShortComment(source.favorites),
    category: asShortComment(source.category),
    subscribers: asShortComment(source.subscribers),
    videoCount: asShortComment(source.videoCount),
    channelViews: asShortComment(source.channelViews),
  }
  return Object.values(comments).some(Boolean) ? comments : undefined
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
    performance: (() => {
      try {
        return parsePerformanceFromGemini(parsed)
      } catch {
        return undefined
      }
    })(),
    statComments: parseStatComments(parsed),
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

  return `あなたはYouTubeショート特化のシニアグロースアナリストです。
視聴者心理と推薦アルゴリズムの両方に通じた専門家として、この1本だけを解剖してください。

【姿勢】
- 見たままの感想・一般論・テンプレ激励は禁止。
- 「共感を呼ぶ」「世界観が強い」「バズりやすい構成」など検証不能な抽象語は禁止。使うなら、構成の型の名前と役割で言い換える。
- 必ず因果を書く。タイトル語句と尺・EG率が、どの構成の型を支えているかを結びつける。
- ショート特有の観点を本文に必ず埋め込む:
  1) アルゴリズムハック（完走、ループ再視聴、保存、コメント誘発、セッション継続）
  2) 視聴維持のトリック（オープンループ、パターンインタラプト、情報の小出し、視覚的変化）
  3) 心理学的フック（好奇心ギャップ、認知不協和、社会的証明、損失回避、アイデンティティ）
- 「0-1秒: 画面〇〇、セリフ〇〇」のような台本・秒割り書き出しは禁止。構成は型と役割の要点まとめにする。
- 映像を直接は見ていない。タイトル・説明・タグ・尺・公開数値から推論し、根拠を数値か語句で示す。

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
- チャンネル総再生数: ${input.channelViewCount ?? "-"}
- 尺: ${duration}
- 公開日: ${input.publishedAt || "-"}
- タグ: ${(input.tags ?? []).slice(0, 12).join(", ") || "なし"}
- 説明文: ${(input.description ?? "").slice(0, 500) || "なし"}

出力はJSONのみ。前置きやコードフェンスは禁止。
JSONの外にMarkdownを書かないこと。

【強調（必須・拾い読み用）】
各文字列（1つの段落、または配列の1要素）につき、Markdown の **太字** は **最も核心のキーワード1箇所だけ**。
秒数・セリフ・アルゴリズム用語が複数あっても、一番のポイント1語（または最短フレーズ）だけを囲む。
2箇所以上の太字は禁止。全部を太字にしない。囲まない部分は通常の文章のまま。

【フィールド別の深さ】
- hook.analysis: 冒頭で置くギャップ/約束の型。秒割り台本は書かない。
- structure.beats: 4拍。labelは「冒頭のフック構造」「中盤のテンポ」「オチの抜け感」「ジャンル転用」。detailは要点1-2文。セリフ禁止。
- whyItGrew: 3件以上。うち1件はアルゴリズム、1件は心理フック、1件は構成の型。
- copyablePoints: 3件以上。撮影台本ではなく、構成テンプレの抜き出しと転用手順。
- creatorInsights: 自分のジャンルへ骨格を当てはめる置換の仕方。心構えだけの文は不可。
- ideaTemplates: 2件。titleはテンプレ名。outlineはフック/中盤/オチの役割と転用の要点のみ。台本・秒数書き出し禁止。
- performance と statComments: 実数に触れ、ショートとしての良し悪しを短く。

次の6点を必ず含めてください。
1. 冒頭フックの分析（構造の型）
2. 構成のフレームワーク（フック/テンポ/オチ/転用）
3. クリエイターへの示唆（ジャンル転用）
4. なぜ伸びたのか（アルゴリズム×心理×型）
5. performance スコア（0-100の整数）
   - buzzPotential / momentum / retention / ctr
   各scoreのnoteはこの動画の数値に触れる。
6. statComments（各20〜30文字、実数に触れる）
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
