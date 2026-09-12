"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Check, Eye, EyeOff, Moon, Sun, Trash2 } from "lucide-react"

import {
  applyTheme,
  getStoredGeminiApiKey,
  getStoredTheme,
  getStoredYoutubeApiKey,
  saveApiKeys,
  type AppTheme,
} from "@/lib/client-settings"
import { clearResearchHistory } from "@/lib/research-history"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function SecretField({
  id,
  label,
  hint,
  value,
  onChange,
}: {
  id: string
  label: string
  hint: string
  value: string
  onChange: (value: string) => void
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="未入力の場合はサーバーの .env.local を使います"
          className="pr-10"
        />
        <button
          type="button"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "キーを隠す" : "キーを表示"}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </div>
  )
}

export function SettingsView() {
  const [youtubeKey, setYoutubeKey] = useState("")
  const [geminiKey, setGeminiKey] = useState("")
  const [theme, setTheme] = useState<AppTheme>("dark")
  const [saved, setSaved] = useState(false)
  const [cacheMessage, setCacheMessage] = useState<string | null>(null)

  useEffect(() => {
    setYoutubeKey(getStoredYoutubeApiKey())
    setGeminiKey(getStoredGeminiApiKey())
    setTheme(getStoredTheme())
  }, [])

  function handleSave(event: FormEvent) {
    event.preventDefault()
    saveApiKeys(youtubeKey, geminiKey)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2800)
  }

  function handleTheme(next: AppTheme) {
    setTheme(next)
    applyTheme(next)
  }

  function handleClearHistory() {
    if (!window.confirm("このブラウザに保存したリサーチ履歴をすべて削除しますか？")) {
      return
    }
    clearResearchHistory()
    setCacheMessage("履歴データを削除しました。")
    window.setTimeout(() => setCacheMessage(null), 2800)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      {saved ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-500/30 dark:text-emerald-200"
        >
          <Check className="size-4" />
          設定を保存しました
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        API キーはこのブラウザにだけ保存されます。サーバーの環境変数より優先されます。
      </p>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API キー</CardTitle>
            <CardDescription>
              空欄のまま保存すると、サーバー側の `.env.local` にフォールバックします。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <SecretField
              id="youtube-api-key"
              label="YouTube Data API Key"
              hint="動画・チャンネル取得（videos.list / channels.list）に使います。"
              value={youtubeKey}
              onChange={setYoutubeKey}
            />
            <SecretField
              id="gemini-api-key"
              label="Google Gemini API Key"
              hint="詳細ページの AI バズ要因分析に使います。"
              value={geminiKey}
              onChange={setGeminiKey}
            />
            <div className="flex justify-end">
              <Button type="submit">保存する</Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>テーマ</CardTitle>
          <CardDescription>このブラウザだけの表示設定です。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => handleTheme("dark")}
          >
            <Moon data-icon="inline-start" />
            ダーク
          </Button>
          <Button
            type="button"
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => handleTheme("light")}
          >
            <Sun data-icon="inline-start" />
            ライト
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>データ管理</CardTitle>
          <CardDescription>このブラウザに保存したリサーチ履歴を削除します。API キーは消えません。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button type="button" variant="outline" onClick={handleClearHistory}>
            <Trash2 data-icon="inline-start" />
            履歴キャッシュをクリア
          </Button>
          {cacheMessage ? (
            <p className="text-sm text-muted-foreground">{cacheMessage}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
