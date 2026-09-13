const YOUTUBE_KEY = "shortcutyou.youtubeApiKey"
const GEMINI_KEY = "shortcutyou.geminiApiKey"
const THEME_KEY = "shortcutyou.theme"

export const YOUTUBE_API_KEY_HEADER = "x-youtube-api-key"
export const GEMINI_API_KEY_HEADER = "x-gemini-api-key"

export type AppTheme = "dark" | "light"

function canUseStorage() {
  return typeof window !== "undefined"
}

export function getStoredYoutubeApiKey() {
  if (!canUseStorage()) return ""
  return window.localStorage.getItem(YOUTUBE_KEY) ?? ""
}

export function getStoredGeminiApiKey() {
  if (!canUseStorage()) return ""
  return window.localStorage.getItem(GEMINI_KEY) ?? ""
}

export function getStoredTheme(): AppTheme {
  return "dark"
}

export function saveApiKeys(youtubeApiKey: string, geminiApiKey: string) {
  if (!canUseStorage()) return
  window.localStorage.setItem(YOUTUBE_KEY, youtubeApiKey.trim())
  window.localStorage.setItem(GEMINI_KEY, geminiApiKey.trim())
}

export function applyTheme(_theme: AppTheme = "dark") {
  if (!canUseStorage()) return
  window.localStorage.setItem(THEME_KEY, "dark")
  document.documentElement.classList.add("dark")
}

export function clientApiHeaders() {
  const headers: Record<string, string> = {}
  const youtube = getStoredYoutubeApiKey().trim()
  const gemini = getStoredGeminiApiKey().trim()
  if (youtube) headers[YOUTUBE_API_KEY_HEADER] = youtube
  if (gemini) headers[GEMINI_API_KEY_HEADER] = gemini
  return headers
}

export function fetchWithClientApiKeys(input: RequestInfo | URL, init?: RequestInit) {
  const extra = clientApiHeaders()
  const merged = new Headers(init?.headers)
  for (const [key, value] of Object.entries(extra)) {
    if (!merged.has(key)) merged.set(key, value)
  }
  return fetch(input, { ...init, headers: merged })
}
