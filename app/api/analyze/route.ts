import { NextResponse } from "next/server"

import {
  generateBuzzAnalysis,
  USER_BUSY_MESSAGE,
  USER_RETRY_MESSAGE,
  type AnalyzeVideoInput,
} from "@/lib/ai-analysis"
import { resolveGeminiApiKey } from "@/lib/api-keys"

export const dynamic = "force-dynamic"
export const maxDuration = 120

function asString(value: unknown) {
  return typeof value === "string" ? value : ""
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string")
}

function parseInput(payload: unknown): AnalyzeVideoInput | null {
  if (!payload || typeof payload !== "object") return null
  const body = payload as Record<string, unknown>
  const videoId = asString(body.videoId).trim()
  const title = asString(body.title).trim()
  if (!videoId || !title) return null

  return {
    videoId,
    title,
    channelTitle: asString(body.channelTitle),
    description: asString(body.description).slice(0, 800),
    tags: asStringArray(body.tags).slice(0, 20),
    duration: asString(body.duration),
    publishedAt: asString(body.publishedAt),
    viewCount: asString(body.viewCount) || undefined,
    likeCount: asString(body.likeCount) || undefined,
    commentCount: asString(body.commentCount) || undefined,
    subscriberCount: asString(body.subscriberCount) || undefined,
    channelVideoCount: asString(body.channelVideoCount) || undefined,
    hiddenSubscribers: body.hiddenSubscribers === true,
  }
}

export async function POST(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "リクエストボディが不正な JSON です。" }, { status: 400 })
  }

  const input = parseInput(payload)
  if (!input) {
    return NextResponse.json(
      { error: "videoId と title は必須です。" },
      { status: 400 }
    )
  }

  try {
    const analysis = await generateBuzzAnalysis(input, resolveGeminiApiKey(request))
    return NextResponse.json({ analysis })
  } catch (error) {
    const statusCode =
      error instanceof Error && "status" in error && typeof error.status === "number"
        ? error.status
        : 503
    const timedOut = statusCode === 504
    const busy = statusCode === 429 || statusCode === 503
    const message = timedOut
      ? USER_RETRY_MESSAGE
      : busy
        ? USER_BUSY_MESSAGE
        : error instanceof Error
          ? error.message
          : USER_BUSY_MESSAGE
    return NextResponse.json({ error: message }, { status: timedOut ? 504 : statusCode })
  }
}
