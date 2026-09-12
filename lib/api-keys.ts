import {
  GEMINI_API_KEY_HEADER,
  YOUTUBE_API_KEY_HEADER,
} from "@/lib/client-settings"

export const MISSING_YOUTUBE_KEY_MESSAGE =
  "YouTube Data API キーが設定されていません。設定ページでキーを保存するか、サーバーの .env.local に YOUTUBE_API_KEY を追加してください。"

export const MISSING_GEMINI_KEY_MESSAGE =
  "Google Gemini API キーが設定されていません。設定ページでキーを保存するか、サーバーの .env.local に GEMINI_API_KEY を追加してください。"

function headerOrEnvKey(headerValue: string | null, envValue: string | undefined) {
  const fromHeader = headerValue?.trim() ?? ""
  const fromEnv = envValue?.trim() ?? ""
  return fromHeader || fromEnv
}

export function resolveYoutubeApiKey(request: Request) {
  return headerOrEnvKey(request.headers.get(YOUTUBE_API_KEY_HEADER), process.env.YOUTUBE_API_KEY)
}

export function resolveGeminiApiKey(request: Request) {
  return headerOrEnvKey(
    request.headers.get(GEMINI_API_KEY_HEADER),
    process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  )
}
