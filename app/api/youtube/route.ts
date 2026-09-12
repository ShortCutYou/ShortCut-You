import { NextResponse } from "next/server"

import {
  MISSING_YOUTUBE_KEY_MESSAGE,
  resolveYoutubeApiKey,
} from "@/lib/api-keys"
import {
  isYoutubeVideoId,
  loadYoutubeResearch,
  parseYoutubeUrls,
  YOUTUBE_VIDEOS_LIST_MAX_IDS,
} from "@/lib/youtube"

export const dynamic = "force-dynamic"

function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status })
}

function apiKeyOrError(request: Request) {
  const apiKey = resolveYoutubeApiKey(request)
  if (!apiKey) {
    return { error: jsonError(MISSING_YOUTUBE_KEY_MESSAGE, 500) }
  }
  return { apiKey }
}

async function researchByVideoIds(
  videoIds: string[],
  apiKey: string,
  invalidUrls: string[] = []
) {
  const { items } = await loadYoutubeResearch(videoIds, apiKey)
  const returnedIds = new Set(items.map((item) => item.id))
  const notFoundIds = videoIds.filter((id) => !returnedIds.has(id))

  return NextResponse.json({
    items,
    requestedCount: videoIds.length,
    invalidUrls,
    notFoundIds,
  })
}

function handleYoutubeError(error: unknown) {
  const status =
    error instanceof Error && "status" in error && typeof error.status === "number"
      ? error.status
      : 502
  const message =
    error instanceof Error ? error.message : "YouTube Data API の呼び出しに失敗しました。"

  return jsonError(message, status)
}

export async function GET(request: Request) {
  const auth = apiKeyOrError(request)
  if ("error" in auth) return auth.error

  const id = new URL(request.url).searchParams.get("id")?.trim() ?? ""
  if (!isYoutubeVideoId(id)) {
    return jsonError("有効な動画 ID を指定してください。", 400)
  }

  try {
    return await researchByVideoIds([id], auth.apiKey)
  } catch (error) {
    return handleYoutubeError(error)
  }
}

export async function POST(request: Request) {
  const auth = apiKeyOrError(request)
  if ("error" in auth) return auth.error

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return jsonError("リクエストボディが不正な JSON です。", 400)
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    !("urls" in payload) ||
    !Array.isArray((payload as { urls: unknown }).urls)
  ) {
    return jsonError("urls は文字列の配列で指定してください。", 400)
  }

  const urls = (payload as { urls: unknown[] }).urls
  if (!urls.every((url): url is string => typeof url === "string")) {
    return jsonError("urls の各要素は文字列である必要があります。", 400)
  }

  if (urls.length === 0) {
    return jsonError("YouTube URL が指定されていません。", 400)
  }

  if (urls.length > YOUTUBE_VIDEOS_LIST_MAX_IDS) {
    return jsonError(
      `一度に解析できる URL は最大 ${YOUTUBE_VIDEOS_LIST_MAX_IDS} 件です。`,
      400
    )
  }

  const { videoIds, invalidUrls } = parseYoutubeUrls(urls)

  if (videoIds.length === 0) {
    return jsonError("有効な YouTube URL が含まれていません。", 400, {
      invalidUrls,
    })
  }

  try {
    return await researchByVideoIds(videoIds, auth.apiKey, invalidUrls)
  } catch (error) {
    return handleYoutubeError(error)
  }
}
